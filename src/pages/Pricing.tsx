import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Copy, Check, MessageCircle, Send, Clock, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = 'pending' | 'approved' | 'rejected';

interface PaymentRequest {
  id: string;
  package_name: string;
  credits: number;
  amount: number;
  txid: string;
  status: PaymentStatus;
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const BKASH_NUMBER = "01328845972";

const PRICING_TIERS = [
  {
    name: "Starter",
    price: 199,
    credits: 100,
    description: "Best for trying the tools",
    badge: null,
    highlighted: false
  },
  {
    name: "Growth",
    price: 399,
    credits: 300,
    description: "Best value for regular sellers",
    badge: "BEST VALUE",
    highlighted: true
  },
  {
    name: "Business",
    price: 699,
    credits: 500,
    description: "For heavy users / agencies",
    badge: null,
    highlighted: false
  }
];

const FAQ_ITEMS = [
  {
    question: "How do credits work?",
    answer: "Each AI tool operation uses 1 credit. For example, enhancing a photo or generating a caption each costs 1 credit. Credits are added to your account after payment verification."
  },
  {
    question: "How long does approval take?",
    answer: "Manual bKash verification usually takes 5–30 minutes during business hours. We aim to process all requests as quickly as possible."
  },
  {
    question: "What if I send wrong amount?",
    answer: "Please contact us through the inbox chat with your transaction details. We'll help resolve any payment issues and adjust credits accordingly."
  },
  {
    question: "Do credits expire?",
    answer: "No, your credits never expire. Once added to your account, they remain available until you use them."
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<typeof PRICING_TIERS[0] | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [txid, setTxid] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userRequests, setUserRequests] = useState<PaymentRequest[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  useEffect(() => {
    if (activeRequest) {
      fetchChatMessages(activeRequest.id);
    }
  }, [activeRequest]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchUserRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setUserRequests(data as PaymentRequest[]);
    }
  };

  const fetchChatMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("payment_request_id", requestId)
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setChatMessages(data as ChatMessage[]);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    toast.success("bKash number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInboxClick = (tier: typeof PRICING_TIERS[0]) => {
    if (!user) {
      toast.error("Please sign in to purchase credits");
      navigate("/auth");
      return;
    }
    setSelectedPackage(tier);
    setShowChat(true);
    setMessage(`Hi, I want to buy: ${tier.name} (${tier.credits} credits for ${tier.price} Tk).\nI have sent payment via bKash.\nMy TxID: \nMy account email: ${user.email}`);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedPackage || !txid.trim()) {
      toast.error("Please enter your Transaction ID");
      return;
    }

    setSendingMessage(true);

    try {
      // Check duplicate TxID
      const { data: isDuplicate } = await supabase.rpc("check_duplicate_txid", { p_txid: txid.trim() });
      
      if (isDuplicate) {
        toast.error("This Transaction ID has already been used");
        setSendingMessage(false);
        return;
      }

      // Create payment request
      const { data: request, error: requestError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          package_name: selectedPackage.name,
          credits: selectedPackage.credits,
          amount: selectedPackage.price,
          txid: txid.trim()
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Send initial message
      const fullMessage = message.replace("My TxID: ", `My TxID: ${txid.trim()}`);
      
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          payment_request_id: request.id,
          sender_id: user.id,
          is_admin: false,
          message: fullMessage
        });

      if (messageError) throw messageError;

      setActiveRequest(request as PaymentRequest);
      await fetchChatMessages(request.id);
      await fetchUserRequests();
      setTxid("");
      toast.success("Payment request submitted! We'll verify and add credits soon.");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendFollowUp = async () => {
    if (!user || !activeRequest || !message.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          payment_request_id: activeRequest.id,
          sender_id: user.id,
          is_admin: false,
          message: message.trim()
        });

      if (error) throw error;
      
      setMessage("");
      await fetchChatMessages(activeRequest.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending Verification</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gold/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-cream/60 hover:text-gold px-2 sm:px-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <span className="font-serif text-base sm:text-xl text-cream">Credits & Pricing</span>
          </div>
          <div className="w-10 sm:w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Choose Your <span className="text-gold">Credit Package</span>
          </h1>
          <p className="text-cream/60 text-base sm:text-lg max-w-2xl mx-auto px-2">
            Power your content creation with AI credits. Pay via bKash and get credits added after quick verification.
          </p>
          <p className="text-cream/40 text-xs sm:text-sm mt-3 sm:mt-4">
            Manual bKash verification usually takes 5–30 minutes.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {PRICING_TIERS.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative overflow-hidden transition-all duration-300 active:scale-[0.98] sm:hover:scale-105 rounded-2xl sm:rounded-3xl ${
                tier.highlighted 
                  ? "border-gold shadow-lg shadow-gold/20 ring-2 ring-gold/30" 
                  : "hover:border-gold/30"
              }`}
            >
              {tier.badge && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-xl bg-gold text-background font-bold px-3 sm:px-4 py-1 text-xs sm:text-sm">
                    {tier.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-6 sm:pt-8">
                <CardTitle className="font-serif text-xl sm:text-2xl text-cream">{tier.name}</CardTitle>
                <CardDescription className="text-cream/50 text-sm">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6 p-5 sm:p-6">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-bold text-gold">{tier.price}</span>
                  <span className="text-cream/60 ml-2">Tk</span>
                  <p className="text-cream/70 mt-2 text-sm sm:text-base">{tier.credits} Credits</p>
                </div>

                {/* bKash Instructions */}
                <div className="bg-background/50 rounded-xl sm:rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-medium text-cream/80 flex items-center gap-2">
                    <span className="text-pink-500">bKash</span> Manual Payment
                  </p>
                  
                  <div className="flex items-center justify-between bg-card/50 rounded-xl p-3 sm:p-4 border border-gold/10">
                    <span className="font-mono text-base sm:text-lg text-gold">{BKASH_NUMBER}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="h-10 w-10 sm:h-8 sm:w-8 text-cream/60 hover:text-gold active:scale-95"
                    >
                      {copied ? <Check className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-400" /> : <Copy className="w-5 h-5 sm:w-4 sm:h-4" />}
                    </Button>
                  </div>

                  <ol className="text-xs text-cream/50 space-y-1.5 pl-4">
                    <li>1. Send <span className="text-gold">{tier.price} Tk</span> to this bKash number</li>
                    <li>2. Copy your Transaction ID (TxID)</li>
                    <li>3. Click Inbox and message us your TxID</li>
                    <li>4. We'll add credits after verification</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => handleInboxClick(tier)}
                  variant="gold"
                  className="w-full btn-glow h-12 sm:h-11 text-sm sm:text-base"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Inbox to Confirm Payment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User's Payment Requests */}
        {user && userRequests.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <h2 className="font-serif text-xl sm:text-2xl text-cream mb-4 sm:mb-6">Your Payment Requests</h2>
            <div className="grid gap-3 sm:gap-4">
              {userRequests.map((request) => (
                <Card 
                  key={request.id} 
                  className={`cursor-pointer transition-all active:scale-[0.98] hover:border-gold/30 rounded-xl sm:rounded-2xl ${
                    activeRequest?.id === request.id ? "border-gold" : ""
                  }`}
                  onClick={() => {
                    setActiveRequest(request);
                    setShowChat(true);
                    setSelectedPackage(PRICING_TIERS.find(t => t.name === request.package_name) || null);
                  }}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-cream">{request.package_name}</p>
                        <p className="text-xs sm:text-sm text-cream/50">TxID: {request.txid}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        {getStatusBadge(request.status)}
                        <span className="text-xs sm:text-sm text-cream/40">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl text-cream text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gold/10 rounded-xl sm:rounded-2xl bg-card/30 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-cream hover:text-gold text-left text-sm sm:text-base py-4 sm:py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-cream/60 text-sm pb-4 sm:pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[80vh] flex flex-col">
            <CardHeader className="border-b border-gold/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-cream font-serif">
                    {activeRequest ? "Payment Chat" : "Confirm Payment"}
                  </CardTitle>
                  {activeRequest && getStatusBadge(activeRequest.status)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowChat(false);
                    setActiveRequest(null);
                    setChatMessages([]);
                  }}
                  className="text-cream/60 hover:text-cream"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeRequest ? (
                <>
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-xl p-3 ${
                          msg.is_admin 
                            ? "bg-muted text-cream" 
                            : "bg-gold/20 text-cream border border-gold/30"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className="text-xs text-cream/40 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-cream/70">Package Selected</Label>
                    <p className="text-gold font-medium">{selectedPackage?.name} - {selectedPackage?.credits} credits ({selectedPackage?.price} Tk)</p>
                  </div>
                  <div>
                    <Label htmlFor="txid" className="text-cream/70">Transaction ID (TxID) *</Label>
                    <Input
                      id="txid"
                      value={txid}
                      onChange={(e) => setTxid(e.target.value)}
                      placeholder="Enter your bKash Transaction ID"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-cream/70">Message</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <div className="border-t border-gold/10 p-4 flex-shrink-0">
              {activeRequest ? (
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendFollowUp()}
                  />
                  <Button
                    onClick={handleSendFollowUp}
                    disabled={sendingMessage || !message.trim()}
                    variant="gold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !txid.trim()}
                  variant="gold"
                  className="w-full"
                >
                  {sendingMessage ? "Submitting..." : "Submit Payment Request"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Pricing;
