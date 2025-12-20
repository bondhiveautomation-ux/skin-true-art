import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LiveUser {
  user_id: string;
  email: string | null;
  full_name: string | null;
  is_online: boolean;
  current_page_name: string | null;
  current_path: string | null;
  current_tool: string | null;
  last_seen: string;
  last_active_at: string;
  device_type: string | null;
}

const OFFLINE_THRESHOLD = 60000; // 60 seconds

export const useLiveUsers = () => {
  const { user } = useAuth();
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveUsers = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch presence data
      const { data: presenceData, error: presenceError } = await supabase
        .from("user_presence")
        .select("*")
        .order("last_active_at", { ascending: false });

      if (presenceError) throw presenceError;

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name");

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine presence with profile data and check actual online status
      const now = Date.now();
      const users: LiveUser[] = (presenceData || []).map(presence => {
        const profile = profileMap.get(presence.user_id);
        const lastActiveTime = new Date(presence.last_active_at).getTime();
        const isActuallyOnline = presence.is_online && (now - lastActiveTime) < OFFLINE_THRESHOLD;

        return {
          user_id: presence.user_id,
          email: profile?.email || null,
          full_name: profile?.full_name || null,
          is_online: isActuallyOnline,
          current_page_name: presence.current_page_name,
          current_path: presence.current_path,
          current_tool: presence.current_tool,
          last_seen: presence.last_seen,
          last_active_at: presence.last_active_at,
          device_type: presence.device_type,
        };
      });

      setLiveUsers(users);
    } catch (error) {
      console.error("Error fetching live users:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    fetchLiveUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel("live-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        () => {
          fetchLiveUsers();
        }
      )
      .subscribe();

    // Periodically refresh to update online status based on threshold
    const refreshInterval = setInterval(fetchLiveUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [user?.id, fetchLiveUsers]);

  const onlineUsers = liveUsers.filter(u => u.is_online);
  const offlineUsers = liveUsers.filter(u => !u.is_online);

  return {
    liveUsers,
    onlineUsers,
    offlineUsers,
    loading,
    refetch: fetchLiveUsers,
  };
};
