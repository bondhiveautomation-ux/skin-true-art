import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserWithCredits {
  user_id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  created_at: string;
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
  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [history, setHistory] = useState<GenerationHistory[]>([]);

  // Check if current user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        
        if (error) throw error;
        setIsAdmin(data === true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user?.id]);

  // Fetch all users with credits
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, credits');

      if (creditsError) throw creditsError;

      const creditsMap = new Map(credits?.map(c => [c.user_id, c.credits]) || []);

      const usersWithCredits: UserWithCredits[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name,
        credits: creditsMap.get(p.user_id) ?? 0,
        created_at: p.created_at,
      }));

      setUsers(usersWithCredits);
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

  // Update user credits
  const updateCredits = useCallback(async (targetUserId: string, newCredits: number): Promise<boolean> => {
    if (!user?.id || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('admin_update_credits', {
        p_admin_id: user.id,
        p_target_user_id: targetUserId,
        p_credits: newCredits,
      });

      if (error) throw error;
      if (data) {
        await fetchUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating credits:", error);
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
    refetchUsers: fetchUsers,
    refetchHistory: fetchHistory,
  };
};