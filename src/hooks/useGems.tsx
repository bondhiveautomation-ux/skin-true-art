import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getGemCost } from "@/lib/gemCosts";

interface GemsData {
  gems_balance: number;
  subscription_type: string | null;
  subscription_expires_at: string | null;
}

export const useGems = () => {
  const { user } = useAuth();
  const [gems, setGems] = useState<number | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGems = useCallback(async () => {
    if (!user?.id) {
      setGems(null);
      setSubscriptionType(null);
      setSubscriptionExpiresAt(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_gems', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const gemData = data[0] as GemsData;
        setGems(gemData.gems_balance ?? 0);
        setSubscriptionType(gemData.subscription_type);
        setSubscriptionExpiresAt(gemData.subscription_expires_at);
      } else {
        setGems(0);
      }
    } catch (error) {
      console.error("Error fetching gems:", error);
      setGems(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  const checkSufficientGems = useCallback((featureName: string): boolean => {
    if (gems === null) return false;
    const cost = getGemCost(featureName);
    return gems >= cost;
  }, [gems]);

  const deductGems = useCallback(async (featureName: string): Promise<{ success: boolean; newBalance: number }> => {
    if (!user?.id) return { success: false, newBalance: 0 };

    const cost = getGemCost(featureName);
    
    try {
      const { data, error } = await supabase.rpc('deduct_gems', {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_gem_cost: cost
      });

      if (error) throw error;

      if (data === -1) {
        return { success: false, newBalance: gems ?? 0 }; // Not enough gems
      }

      setGems(data);
      return { success: true, newBalance: data };
    } catch (error) {
      console.error("Error deducting gems:", error);
      return { success: false, newBalance: gems ?? 0 };
    }
  }, [user?.id, gems]);

  const hasEnoughGems = (featureName: string): boolean => {
    if (gems === null) return false;
    return gems >= getGemCost(featureName);
  };

  return {
    gems,
    loading,
    subscriptionType,
    subscriptionExpiresAt,
    deductGems,
    hasEnoughGems,
    checkSufficientGems,
    refetchGems: fetchGems,
  };
};
