import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  MessageCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = 'pending' | 'approved' | 'rejected';

interface PaymentRequest {
  id: string;
  user_id: string;
  package_name: string;
  credits: number;
  amount: number;
  txid: string;
  status: PaymentStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  is_admin: boolean;
  sender_id: string;
  created_at: string;
}

export const PaymentInbox = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      fetchChatMessages(selectedRequest.id);
    }
  }, [selectedRequest]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch payment requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("payment_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user emails from profiles
      const userIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);

      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      const enrichedRequests = requestsData?.map(r => ({
        ...r,
        user_email: emailMap.get(r.user_id) || "Unknown"
      })) as PaymentRequest[];

      setRequests(enrichedRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load payment requests");
    } finally {
      setLoading(false);
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

  const handleApprove = async () => {
    if (!user || !selectedRequest) return;
    
    setProcessing(true);
    try {
      const { data: success, error } = await supabase.rpc("approve_payment", {
        p_admin_id: user.id,
        p_request_id: selectedRequest.id
      });

      if (error) throw error;

      if (success) {
        // Send approval message
        await supabase.from("chat_messages").insert({
          payment_request_id: selectedRequest.id,
          sender_id: user.id,
          is_admin: true,
          message: `✅ Payment approved! ${selectedRequest.credits} credits have been added to your account. Thank you for your purchase!`
        });

        toast.success(`Approved! ${selectedRequest.credits} credits added.`);
        await fetchRequests();
        await fetchChatMessages(selectedRequest.id);
        setSelectedRequest({ ...selectedRequest, status: "approved" });
      } else {
        toast.error("Could not approve payment. It may already be approved.");
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedRequest) return;

    setProcessing(true);
    try {
      const { error } = await supabase.rpc("reject_payment", {
        p_admin_id: user.id,
        p_request_id: selectedRequest.id,
        p_notes: rejectReason || null
      });

      if (error) throw error;

      // Send rejection message
      await supabase.from("chat_messages").insert({
        payment_request_id: selectedRequest.id,
        sender_id: user.id,
        is_admin: true,
        message: `❌ Payment rejected. ${rejectReason ? `Reason: ${rejectReason}` : "Please contact us for more details."}`
      });

      toast.success("Payment request rejected");
      setRejectReason("");
      await fetchRequests();
      await fetchChatMessages(selectedRequest.id);
      setSelectedRequest({ ...selectedRequest, status: "rejected" });
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Failed to reject payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedRequest || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from("chat_messages").insert({
        payment_request_id: selectedRequest.id,
        sender_id: user.id,
        is_admin: true,
        message: newMessage.trim()
      });

      if (error) throw error;

      setNewMessage("");
      await fetchChatMessages(selectedRequest.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const checkDuplicateTxid = async (txid: string): Promise<boolean> => {
    const { data } = await supabase.rpc("check_duplicate_txid", { p_txid: txid });
    return data === true;
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-gold" />
          <h2 className="font-serif text-2xl text-cream">Payment Inbox</h2>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              {pendingCount} pending
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-cream font-serif text-lg">Payment Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-cream/50">User</TableHead>
                    <TableHead className="text-cream/50">Package</TableHead>
                    <TableHead className="text-cream/50">Status</TableHead>
                    <TableHead className="text-cream/50">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow 
                      key={request.id}
                      className={`cursor-pointer hover:bg-gold/5 ${
                        selectedRequest?.id === request.id ? "bg-gold/10" : ""
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <TableCell className="text-cream/80 text-sm">
                        {request.user_email}
                      </TableCell>
                      <TableCell className="text-cream/80">
                        {request.package_name}
                        <span className="text-gold ml-1">({request.amount} Tk)</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-cream/50 text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-cream/50 py-8">
                        No payment requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat & Actions */}
        <Card>
          {selectedRequest ? (
            <>
              <CardHeader className="pb-3 border-b border-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-cream font-serif text-lg">
                      {selectedRequest.user_email}
                    </CardTitle>
                    <p className="text-sm text-cream/50 mt-1">
                      {selectedRequest.package_name} • {selectedRequest.credits} credits • {selectedRequest.amount} Tk
                    </p>
                    <p className="text-sm text-gold mt-1 font-mono">
                      TxID: {selectedRequest.txid}
                    </p>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[400px]">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-xl p-3 ${
                            msg.is_admin 
                              ? "bg-gold/20 text-cream border border-gold/30" 
                              : "bg-muted text-cream"
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
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="border-t border-gold/10 p-4 space-y-3">
                  {selectedRequest.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={processing}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve (+{selectedRequest.credits} credits)
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={processing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {selectedRequest.status === "pending" && (
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      rows={2}
                    />
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send a message..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      variant="gold"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[450px] text-cream/40">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a payment request to view details</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
