import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_credits', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      setCredits(data ?? 0);
    } catch (error) {
      console.error("Error fetching credits:", error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const deductCredit = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credit', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (data === -1) {
        return false; // No credits available
      }

      setCredits(data);
      return true;
    } catch (error) {
      console.error("Error deducting credit:", error);
      return false;
    }
  }, [user?.id]);

  const hasCredits = credits !== null && credits > 0;

  return {
    credits,
    loading,
    deductCredit,
    hasCredits,
    refetchCredits: fetchCredits,
  };
};
