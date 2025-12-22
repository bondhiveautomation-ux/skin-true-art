import { useState, useEffect, useRef } from "react";
import { useAdminMessaging } from "@/hooks/useAdminMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  MessageCircle,
  User,
  Clock,
  ArrowLeft,
  Inbox,
  CheckCheck,
} from "lucide-react";

const AdminInbox = () => {
  const { conversations, loading, sendAdminMessage, markUserMessagesAsRead, refetch } = useAdminMessaging();
  const { toast } = useToast();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);
  
  // Total unread messages
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedUserId && selectedConversation?.unread_count > 0) {
      markUserMessagesAsRead(selectedUserId);
    }
  }, [selectedUserId, selectedConversation?.unread_count, markUserMessagesAsRead]);

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
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageText.trim()) return;

    setSending(true);
    const success = await sendAdminMessage(selectedUserId, messageText.trim());

    if (success) {
      setMessageText("");
    } else {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
    setSending(false);
  };

  const getLastMessage = (messages: any[]) => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="h-[600px] flex rounded-lg border border-gold/10 overflow-hidden bg-card">
      {/* Conversations List */}
      <div className={`w-full md:w-80 border-r border-gold/10 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gold/10 bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-gold" />
              <h3 className="font-medium">Messages</h3>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <Clock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gold/5">
              {conversations.map((convo) => {
                const lastMsg = getLastMessage(convo.messages);
                const isSelected = selectedUserId === convo.user_id;

                return (
                  <button
                    key={convo.user_id}
                    onClick={() => setSelectedUserId(convo.user_id)}
                    className={`w-full p-3 text-left hover:bg-accent/50 transition-colors ${
                      isSelected ? "bg-accent/70" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {convo.full_name || convo.email || "Unknown User"}
                          </p>
                          {convo.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs shrink-0">
                              {convo.unread_count}
                            </Badge>
                          )}
                        </div>
                        {convo.email && convo.full_name && (
                          <p className="text-xs text-muted-foreground truncate">{convo.email}</p>
                        )}
                        {lastMsg && (
                          <div className="flex items-center gap-1 mt-1">
                            {lastMsg.is_from_admin && (
                              <CheckCheck className="w-3 h-3 text-gold shrink-0" />
                            )}
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMsg.message}
                            </p>
                          </div>
                        )}
                        {lastMsg && (
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {formatTime(lastMsg.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {selectedUserId && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gold/10 bg-card/80 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUserId(null)}
                className="md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <User className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedConversation.full_name || selectedConversation.email || "User"}
                </p>
                {selectedConversation.email && selectedConversation.full_name && (
                  <p className="text-xs text-muted-foreground">{selectedConversation.email}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {selectedConversation.messages.length > 0 ? (
                <div className="space-y-3">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.is_from_admin
                            ? "bg-gold text-charcoal rounded-br-md"
                            : "bg-accent border border-gold/10 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.is_from_admin ? "text-charcoal/60" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gold/10 bg-card/80">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a user from the list to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
