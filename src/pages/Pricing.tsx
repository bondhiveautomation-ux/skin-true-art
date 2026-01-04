import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePricingConfig } from "@/hooks/usePricingConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Copy, Check, MessageCircle, Send, Clock, CheckCircle, XCircle, Diamond, Zap, Crown, Sparkles, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { FEATURE_CATEGORIES } from "@/lib/gemCosts";

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

const FAQ_ITEMS = [
  {
    question: "How do Gems work?",
    answer: "Different features cost different amounts of Gems. High-impact features like Dress Change cost 15 Gems, Studio utilities cost 6 Gems, and Quick tools cost just 1 Gem."
  },
  {
    question: "How long does approval take?",
    answer: "Manual bKash verification usually takes 5–30 minutes during business hours. We aim to process all requests as quickly as possible."
  },
  {
    question: "What if I send wrong amount?",
    answer: "Please contact us through the inbox chat with your transaction details. We'll help resolve any payment issues and adjust gems accordingly."
  },
  {
    question: "Do Gems expire?",
    answer: "Regular top-up Gems never expire. Subscription Gems are valid for the subscription period (7 days for Weekly, 30 days for Monthly)."
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { packages, loading: pricingLoading } = usePricingConfig();
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; gems: number; price: number } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showEnterpriseChat, setShowEnterpriseChat] = useState(false);
  const [enterpriseMessage, setEnterpriseMessage] = useState("");
  const [sendingEnterprise, setSendingEnterprise] = useState(false);
  const [txid, setTxid] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeRequest, setActiveRequest] = useState<PaymentRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [userRequests, setUserRequests] = useState<PaymentRequest[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Split packages into subscriptions and top-ups
  const subscriptions = packages.filter(p => 
    p.package_key.includes('trial') || p.package_key.includes('starter') || p.package_key.includes('weekly') || p.package_key.includes('monthly')
  );
  const topups = packages.filter(p => p.package_key.includes('topup') || p.package_key === 'studio');

  useEffect(() => {
    if (user) fetchUserRequests();
  }, [user]);

  useEffect(() => {
    if (activeRequest) fetchChatMessages(activeRequest.id);
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
    if (!error && data) setUserRequests(data as PaymentRequest[]);
  };

  const fetchChatMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("payment_request_id", requestId)
      .order("created_at", { ascending: true });
    if (!error && data) setChatMessages(data as ChatMessage[]);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(BKASH_NUMBER);
    setCopied(true);
    toast.success("bKash number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePackageSelect = (pkg: { name: string; gems: number; price: number }) => {
    if (!user) {
      toast.error("Please sign in to purchase gems");
      navigate("/auth");
      return;
    }
    setSelectedPackage(pkg);
    setShowChat(true);
    setMessage(`Hi, I want to buy: ${pkg.name} (${pkg.gems} Gems for ৳${pkg.price}).\nI have sent payment via bKash.\nMy TxID: \nMy account email: ${user.email}`);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedPackage || !txid.trim()) {
      toast.error("Please enter your Transaction ID");
      return;
    }
    setSendingMessage(true);
    try {
      const { data: isDuplicate } = await supabase.rpc("check_duplicate_txid", { p_txid: txid.trim() });
      if (isDuplicate) {
        toast.error("This Transaction ID has already been used");
        setSendingMessage(false);
        return;
      }
      const { data: request, error: requestError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          package_name: selectedPackage.name,
          credits: selectedPackage.gems,
          amount: selectedPackage.price,
          txid: txid.trim()
        })
        .select()
        .single();
      if (requestError) throw requestError;
      const fullMessage = message.replace("My TxID: ", `My TxID: ${txid.trim()}`);
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({ payment_request_id: request.id, sender_id: user.id, is_admin: false, message: fullMessage });
      if (messageError) throw messageError;
      setActiveRequest(request as PaymentRequest);
      await fetchChatMessages(request.id);
      await fetchUserRequests();
      setTxid("");
      toast.success("Payment request submitted! We'll verify and add gems soon.");
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
        .insert({ payment_request_id: activeRequest.id, sender_id: user.id, is_admin: false, message: message.trim() });
      if (error) throw error;
      setMessage("");
      await fetchChatMessages(activeRequest.id);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEnterpriseSubmit = async () => {
    if (!user || !enterpriseMessage.trim()) {
      toast.error("Please enter your requirements");
      return;
    }
    setSendingEnterprise(true);
    try {
      const { error } = await supabase
        .from("admin_messages")
        .insert({
          user_id: user.id,
          sender_id: user.id,
          is_from_admin: false,
          message: `🏢 ENTERPRISE INQUIRY\n\n${enterpriseMessage.trim()}\n\nFrom: ${user.email}`
        });
      if (error) throw error;
      setEnterpriseMessage("");
      setShowEnterpriseChat(false);
      toast.success("Enterprise inquiry sent! We'll get back to you soon.");
    } catch (error) {
      console.error("Error sending enterprise inquiry:", error);
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setSendingEnterprise(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved": return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-purple-500/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-cream/60 hover:text-purple-400 px-2 sm:px-4" size="sm">
            <ArrowLeft className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">Back to Home</span>
          </Button>
          <div className="flex items-center gap-2">
            <Diamond className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <span className="font-serif text-base sm:text-xl text-cream">Gems & Pricing</span>
          </div>
          <div className="w-10 sm:w-24" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-cream mb-3 sm:mb-4">
            Power Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Creative Flow</span>
          </h1>
          <p className="text-cream/60 text-base sm:text-lg max-w-2xl mx-auto">Get Gems to unlock all AI features. Pay via bKash and get gems added after quick verification.</p>
        </div>

        {/* Gem Cost Info */}
        <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl sm:rounded-2xl border border-purple-500/20">
          <h3 className="text-base sm:text-lg font-serif text-cream mb-3 sm:mb-4 flex items-center gap-2"><Diamond className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />Gem Costs by Feature</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {Object.entries(FEATURE_CATEGORIES).map(([key, cat]) => (
              <div key={key} className="bg-background/50 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="text-lg sm:text-2xl font-bold text-purple-400">{cat.cost}</span>
                  <span className="text-cream/60 text-[10px] sm:text-sm">Gems</span>
                </div>
                <p className="text-[10px] sm:text-sm text-cream/70 line-clamp-2">{cat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <h2 className="font-serif text-2xl text-cream mb-6">Subscription Plans</h2>
        {pricingLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {subscriptions.map((plan, idx) => (
              <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 rounded-2xl ${idx === 1 ? "border-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30" : "hover:border-purple-500/30"}`}>
                {idx === 1 && <div className="absolute top-0 right-0"><Badge className="rounded-none rounded-bl-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-1">BEST VALUE</Badge></div>}
                <CardHeader className="text-center pb-2 pt-8">
                  <CardTitle className="font-serif text-2xl text-cream flex items-center justify-center gap-2">{idx === 0 ? <Zap className="w-5 h-5 text-yellow-400" /> : <Crown className="w-5 h-5 text-purple-400" />}{plan.package_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div className="text-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">৳{plan.price_bdt}</span>
                    <p className="text-cream/70 mt-2 flex items-center justify-center gap-2"><Diamond className="w-4 h-4 text-purple-400" />{plan.gems} Gems</p>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-cream/80 flex items-center gap-2"><span className="text-pink-500">bKash</span> Manual Payment</p>
                    <div className="flex items-center justify-between bg-card/50 rounded-xl p-3 border border-purple-500/10">
                      <span className="font-mono text-lg text-purple-400">{BKASH_NUMBER}</span>
                      <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-8 w-8 text-cream/60 hover:text-purple-400">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</Button>
                    </div>
                  </div>
                  <Button onClick={() => handlePackageSelect({ name: plan.package_name, gems: plan.gems, price: plan.price_bdt })} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold">
                    <MessageCircle className="w-4 h-4 mr-2" />Get {plan.package_name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <h2 className="font-serif text-2xl text-cream mb-6">Manual Power-Ups</h2>
        {pricingLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
        ) : topups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {topups.map((pkg) => (
              <Card key={pkg.id} className="relative overflow-hidden transition-all duration-300 rounded-2xl hover:border-purple-500/30">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg sm:text-xl text-cream">{pkg.package_name}</h3>
                    <Diamond className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-purple-400">৳{pkg.price_bdt}</span>
                    <p className="text-cream/60 text-sm flex items-center gap-1 mt-1"><Diamond className="w-3 h-3" />{pkg.gems} Gems</p>
                  </div>
                  <Button onClick={() => handlePackageSelect({ name: pkg.package_name, gems: pkg.gems, price: pkg.price_bdt })} variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                    <Sparkles className="w-4 h-4 mr-2" />Top-up Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-cream/50 text-center py-6 mb-8">No top-up packages available at the moment.</p>
        )}

        {/* Enterprise Option */}
        <Card className="mb-12 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl text-cream mb-1">Enterprise Plan</h3>
                  <p className="text-cream/60 text-sm sm:text-base">Need a custom package for your agency or studio? Let's talk!</p>
                  <p className="text-purple-400/80 text-xs sm:text-sm mt-2">✓ Custom gem volumes  ✓ Priority support  ✓ Bulk discounts</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (!user) {
                    toast.error("Please sign in first");
                    navigate("/auth");
                    return;
                  }
                  setShowEnterpriseChat(true);
                }} 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6"
              >
                <MessageCircle className="w-4 h-4 mr-2" />Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Requests */}
        {user && userRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-xl text-cream mb-4">Your Payment Requests</h2>
            <div className="grid gap-3">
              {userRequests.map((request) => (
                <Card key={request.id} className="cursor-pointer transition-all hover:border-purple-500/30 rounded-xl" onClick={() => { setActiveRequest(request); setShowChat(true); }}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div><p className="font-medium text-cream">{request.package_name}</p><p className="text-xs text-cream/50">TxID: {request.txid}</p></div>
                    <div className="flex items-center gap-3">{getStatusBadge(request.status)}<span className="text-xs text-cream/40">{new Date(request.created_at).toLocaleDateString()}</span></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-xl text-cream text-center mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-purple-500/10 rounded-xl bg-card/30 px-4">
                <AccordionTrigger className="text-cream hover:text-purple-400 text-left text-sm py-4">{item.question}</AccordionTrigger>
                <AccordionContent className="text-cream/60 text-sm pb-4">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl">
            <CardHeader className="border-b border-purple-500/10 flex-shrink-0 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-cream font-serif text-base sm:text-lg truncate">{activeRequest ? "Payment Chat" : "Confirm Payment"}</CardTitle>
                  {activeRequest && <div className="mt-1">{getStatusBadge(activeRequest.status)}</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setShowChat(false); setActiveRequest(null); setChatMessages([]); }} className="text-cream/60 hover:text-cream h-10 w-10 flex-shrink-0">×</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {activeRequest ? (
                <>{chatMessages.map((msg) => (<div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}><div className={`max-w-[80%] rounded-xl p-3 ${msg.is_admin ? "bg-muted text-cream" : "bg-purple-500/20 text-cream border border-purple-500/30"}`}><p className="text-sm whitespace-pre-wrap">{msg.message}</p><p className="text-xs text-cream/40 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p></div></div>))}<div ref={chatEndRef} /></>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                    <Label className="text-cream/70">Send Payment to bKash</Label>
                    <p className="text-pink-400 font-bold text-lg mt-1">01328845972</p>
                    <p className="text-cream/50 text-xs mt-1">Send the exact amount and note down your TxID</p>
                  </div>
                  <div><Label className="text-cream/70">Package Selected</Label><p className="text-purple-400 font-medium">{selectedPackage?.name} - {selectedPackage?.gems} Gems (৳{selectedPackage?.price})</p></div>
                  <div><Label htmlFor="txid" className="text-cream/70">Transaction ID (TxID) *</Label><Input id="txid" value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="Enter your bKash Transaction ID" className="mt-1" /></div>
                  <div><Label className="text-cream/70">Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="mt-1" /></div>
                </div>
              )}
            </CardContent>
            <div className="border-t border-purple-500/10 p-3 sm:p-4 flex-shrink-0 safe-area-bottom">
              {activeRequest ? (
                <div className="flex gap-2"><Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendFollowUp()} className="h-11" /><Button onClick={handleSendFollowUp} disabled={sendingMessage || !message.trim()} className="bg-purple-500 hover:bg-purple-600 h-11 w-11 sm:w-auto sm:px-4"><Send className="w-4 h-4" /></Button></div>
              ) : (
                <Button onClick={handleSendMessage} disabled={sendingMessage || !txid.trim()} className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">{sendingMessage ? "Submitting..." : "Submit Payment Request"}</Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Enterprise Modal */}
      {showEnterpriseChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Card className="w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-2xl">
            <CardHeader className="border-b border-purple-500/10 flex-shrink-0 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-cream font-serif text-base sm:text-lg">Enterprise Inquiry</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowEnterpriseChat(false)} className="text-cream/60 hover:text-cream h-10 w-10 flex-shrink-0">×</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-cream/80 text-sm">Tell us about your needs - how many gems you need monthly, your team size, or any custom requirements. We'll get back to you with a tailored offer!</p>
              </div>
              <div>
                <Label className="text-cream/70 mb-2 block">Your Requirements</Label>
                <Textarea 
                  value={enterpriseMessage} 
                  onChange={(e) => setEnterpriseMessage(e.target.value)} 
                  placeholder="e.g., I need around 10,000 gems per month for my fashion studio. We have a team of 5 people..."
                  rows={5} 
                  className="resize-none"
                />
              </div>
            </CardContent>
            <div className="border-t border-purple-500/10 p-4 sm:p-6">
              <Button 
                onClick={handleEnterpriseSubmit} 
                disabled={sendingEnterprise || !enterpriseMessage.trim()} 
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {sendingEnterprise ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send Inquiry</>}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Pricing;
