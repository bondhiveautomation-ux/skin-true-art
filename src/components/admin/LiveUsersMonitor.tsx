import { useState } from "react";
import { useLiveUsers } from "@/hooks/useLiveUsers";
import { useAdminMessaging } from "@/hooks/useAdminMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  RefreshCw,
  MessageCircle,
  Monitor,
  Smartphone,
  Send,
  Users,
  Radio,
} from "lucide-react";

const LiveUsersMonitor = () => {
  const { liveUsers, onlineUsers, loading, refetch } = useLiveUsers();
  const { conversations, sendAdminMessage, broadcastMessage, markUserMessagesAsRead } = useAdminMessaging();
  const { toast } = useToast();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastToOnline, setBroadcastToOnline] = useState(true);

  const displayUsers = showOnlineOnly ? onlineUsers : liveUsers;
  const selectedUser = liveUsers.find(u => u.user_id === selectedUserId);
  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageText.trim()) return;

    setSending(true);
    const success = await sendAdminMessage(selectedUserId, messageText.trim());

    if (success) {
      toast({ title: "Message sent" });
      setMessageText("");
    } else {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;

    const targetUsers = broadcastToOnline ? onlineUsers : liveUsers;
    if (targetUsers.length === 0) {
      toast({ title: "No users to broadcast to", variant: "destructive" });
      return;
    }

    setSending(true);
    const userIds = targetUsers.map(u => u.user_id);
    const success = await broadcastMessage(userIds, broadcastText.trim());

    if (success) {
      toast({ title: `Broadcast sent to ${userIds.length} users` });
      setBroadcastText("");
      setShowBroadcast(false);
    } else {
      toast({ title: "Failed to send broadcast", variant: "destructive" });
    }
    setSending(false);
  };

  const openChat = (userId: string) => {
    setSelectedUserId(userId);
    markUserMessagesAsRead(userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">{onlineUsers.length} Online</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>{liveUsers.length - onlineUsers.length} Offline</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="online-only"
              checked={showOnlineOnly}
              onCheckedChange={setShowOnlineOnly}
            />
            <Label htmlFor="online-only">Online only</Label>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowBroadcast(true)}>
            <Radio className="w-4 h-4 mr-2" />
            Broadcast
          </Button>

          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-gold/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50">
              <TableHead className="w-12">Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Current Page</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No users {showOnlineOnly ? "online" : "found"}
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => {
                const userConvo = conversations.find(c => c.user_id === user.user_id);
                const hasUnread = (userConvo?.unread_count || 0) > 0;

                return (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className={`w-3 h-3 rounded-full ${user.is_online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "—"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.current_page_name ? (
                        <Badge variant="secondary" className="font-normal">
                          {user.current_page_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.device_type === "mobile" ? (
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                      ) : user.device_type === "desktop" ? (
                        <Monitor className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatTime(user.last_active_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openChat(user.user_id)}
                        className="relative"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Chat Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gold" />
              Chat with {selectedUser?.full_name || selectedUser?.email || "User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-64 border rounded-lg p-3 bg-accent/20">
              {selectedConversation?.messages && selectedConversation.messages.length > 0 ? (
                <div className="space-y-3">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.is_from_admin
                            ? "bg-gold text-charcoal"
                            : "bg-card border"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.is_from_admin ? "text-charcoal/70" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              )}
            </ScrollArea>

            {/* Send Message */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                variant="gold"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog open={showBroadcast} onOpenChange={setShowBroadcast}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-gold" />
              Broadcast Message
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="broadcast-online"
                checked={broadcastToOnline}
                onCheckedChange={setBroadcastToOnline}
              />
              <Label htmlFor="broadcast-online">
                {broadcastToOnline
                  ? `Send to ${onlineUsers.length} online users`
                  : `Send to all ${liveUsers.length} users`}
              </Label>
            </div>

            <Textarea
              placeholder="Enter your broadcast message..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              rows={4}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBroadcast(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBroadcast}
                disabled={sending || !broadcastText.trim()}
                variant="gold"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Broadcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveUsersMonitor;
