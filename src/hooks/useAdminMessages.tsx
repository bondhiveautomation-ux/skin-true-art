import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AdminMessage {
  id: string;
  user_id: string;
  sender_id: string;
  is_from_admin: boolean;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserWithMessages {
  user_id: string;
  email: string | null;
  full_name: string | null;
  messages: AdminMessage[];
  unread_count: number;
}

export const useAdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch messages for the current user (user side)
  const fetchUserMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("admin_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setUnreadCount(data?.filter(m => m.is_from_admin && !m.is_read).length || 0);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Send a message from user to admin
  const sendUserMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("admin_messages")
        .insert({
          user_id: user.id,
          sender_id: user.id,
          is_from_admin: false,
          message: text,
        });

      if (error) throw error;
      await fetchUserMessages();
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, [user?.id, fetchUserMessages]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from("admin_messages")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_from_admin", true)
        .eq("is_read", false);

      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [user?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchUserMessages();

    const channel = supabase
      .channel("user-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_messages",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as AdminMessage;
          setMessages(prev => [...prev, newMessage]);
          if (newMessage.is_from_admin && !newMessage.is_read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUserMessages]);

  return {
    messages,
    unreadCount,
    loading,
    sendUserMessage,
    markAsRead,
    refetch: fetchUserMessages,
  };
};

// Admin-specific hook for managing messages
export const useAdminMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<UserWithMessages[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all conversations for admin
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all messages
      const { data: messages, error: messagesError } = await supabase
        .from("admin_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name");

      if (profilesError) throw profilesError;

      // Group messages by user
      const userMessagesMap = new Map<string, AdminMessage[]>();
      (messages || []).forEach(msg => {
        const existing = userMessagesMap.get(msg.user_id) || [];
        userMessagesMap.set(msg.user_id, [...existing, msg]);
      });

      // Build conversations list
      const convos: UserWithMessages[] = [];
      userMessagesMap.forEach((msgs, userId) => {
        const profile = profiles?.find(p => p.user_id === userId);
        convos.push({
          user_id: userId,
          email: profile?.email || null,
          full_name: profile?.full_name || null,
          messages: msgs,
          unread_count: msgs.filter(m => !m.is_from_admin && !m.is_read).length,
        });
      });

      // Sort by most recent message
      convos.sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.created_at || "";
        const bLast = b.messages[b.messages.length - 1]?.created_at || "";
        return bLast.localeCompare(aLast);
      });

      setConversations(convos);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Send message from admin to user
  const sendAdminMessage = useCallback(async (targetUserId: string, text: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("admin_messages")
        .insert({
          user_id: targetUserId,
          sender_id: user.id,
          is_from_admin: true,
          message: text,
        });

      if (error) throw error;
      await fetchConversations();
      return true;
    } catch (error) {
      console.error("Error sending admin message:", error);
      return false;
    }
  }, [user?.id, fetchConversations]);

  // Mark user messages as read (admin side)
  const markUserMessagesAsRead = useCallback(async (targetUserId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from("admin_messages")
        .update({ is_read: true })
        .eq("user_id", targetUserId)
        .eq("is_from_admin", false)
        .eq("is_read", false);

      await fetchConversations();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [user?.id, fetchConversations]);

  // Broadcast message to multiple users
  const broadcastMessage = useCallback(async (userIds: string[], text: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const messages = userIds.map(userId => ({
        user_id: userId,
        sender_id: user.id,
        is_from_admin: true,
        message: text,
      }));

      const { error } = await supabase
        .from("admin_messages")
        .insert(messages);

      if (error) throw error;
      await fetchConversations();
      return true;
    } catch (error) {
      console.error("Error broadcasting message:", error);
      return false;
    }
  }, [user?.id, fetchConversations]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchConversations();

    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConversations]);

  return {
    conversations,
    loading,
    sendAdminMessage,
    markUserMessagesAsRead,
    broadcastMessage,
    refetch: fetchConversations,
  };
};
