import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserWithGems {
  user_id: string;
  email: string | null;
  full_name: string | null;
  gems: number;
  created_at: string;
  is_blocked: boolean;
  subscription_type: string | null;
  subscription_expires_at: string | null;
}

interface GenerationHistory {
  id: string;
  user_id: string;
  feature_name: string;
  created_at: string;
  user_email?: string;
  input_images: string[];
  output_images: string[];
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithGems[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  // Check if current user is admin with retry logic
  useEffect(() => {
    let isMounted = true;
    
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log("[useAdmin] Checking admin status for user:", user.id);

      // Retry logic for database timeouts
      const maxRetries = 3;
      let lastError: any = null;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!isMounted) return;
        
        try {
          console.log(`[useAdmin] Attempt ${attempt + 1}/${maxRetries}`);
          
          const { data, error } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });
          
          if (!isMounted) return;
          
          if (error) {
            lastError = error;
            console.warn(`[useAdmin] RPC error:`, error.message);
            // If it's a timeout, wait and retry
            if (error.message?.includes('timeout') || error.code === '544' || error.message?.includes('connection')) {
              console.warn(`[useAdmin] Attempt ${attempt + 1} timed out, retrying...`);
              await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
              continue;
            }
            throw error;
          }
          
          console.log("[useAdmin] Admin check result:", data);
          setIsAdmin(data === true);
          setLoading(false);
          return; // Success, exit the retry loop
        } catch (error: any) {
          lastError = error;
          console.error(`[useAdmin] Attempt ${attempt + 1} failed:`, error?.message || error);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
          }
        }
      }
      
      // All retries failed
      console.error("[useAdmin] All admin check attempts failed:", lastError);
      if (isMounted) {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Fetch all users with gems and subscription info
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at, is_blocked');

      if (profilesError) throw profilesError;

      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, gems_balance, subscription_type, subscription_expires_at');

      if (creditsError) throw creditsError;

      const creditsMap = new Map(credits?.map(c => [c.user_id, c]) || []);

      const usersWithGems: UserWithGems[] = (profiles || []).map(p => {
        const credit = creditsMap.get(p.user_id);
        return {
          user_id: p.user_id,
          email: p.email,
          full_name: p.full_name,
          gems: credit?.gems_balance ?? 0,
          created_at: p.created_at,
          is_blocked: p.is_blocked ?? false,
          subscription_type: credit?.subscription_type ?? null,
          subscription_expires_at: credit?.subscription_expires_at ?? null,
        };
      });

      setUsers(usersWithGems);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [isAdmin]);

  // Fetch generation history with images
  const fetchHistory = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('generation_history')
        .select('id, user_id, feature_name, created_at, input_images, output_images')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user emails
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email');

      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      const historyWithEmails: GenerationHistory[] = (data || []).map(h => ({
        ...h,
        user_email: emailMap.get(h.user_id) || 'Unknown',
        input_images: h.input_images || [],
        output_images: h.output_images || [],
      }));

      setHistory(historyWithEmails);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [isAdmin]);

  // Update user gems
  const updateCredits = useCallback(async (targetUserId: string, newGems: number): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_update_gems', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
        p_gems: newGems,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating gems:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchUsers]);

  // Delete generation history entry
  const deleteHistoryEntry = useCallback(async (historyId: string): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('generation_history')
        .delete()
        .eq('id', historyId);

      if (error) throw error;
      await fetchHistory();
      return true;
    } catch (error) {
      console.error("Error deleting history entry:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchHistory]);

  // Toggle block/unblock user
  const toggleBlockUser = useCallback(async (targetUserId: string, blocked: boolean): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_toggle_block_user', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
        p_blocked: blocked,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error toggling block status:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchUsers]);

  // Set user subscription period
  const setSubscription = useCallback(async (targetUserId: string, subscriptionType: string, days: number): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_set_subscription', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
        p_subscription_type: subscriptionType,
        p_days: days,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error setting subscription:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchUsers]);

  // Clear user subscription
  const clearSubscription = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_clear_subscription', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error clearing subscription:", error);
      return false;
    }
  }, [user?.id, isAdmin, fetchUsers]);

  // Create new user (admin only)
  const createUser = useCallback(async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id || !isAdmin) return { success: false, error: "Unauthorized" };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        return { success: false, error: "No active session" };
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ email, password, full_name: fullName }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Failed to create user" };
      }

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error: "Failed to create user" };
    }
  }, [user?.id, isAdmin, fetchUsers]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchHistory();
    }
  }, [isAdmin, fetchUsers, fetchHistory]);

  return {
    isAdmin,
    loading,
    users,
    history,
    updateCredits,
    deleteUser,
    deleteHistoryEntry,
    createUser,
    toggleBlockUser,
    setSubscription,
    clearSubscription,
    refetchUsers: fetchUsers,
    refetchHistory: fetchHistory,
  };
};
