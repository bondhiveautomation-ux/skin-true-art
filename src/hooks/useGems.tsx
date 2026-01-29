import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getGemCost, getGemCostAsync, preloadGemCosts } from "@/lib/gemCosts";

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
      // Pre-load gem costs from DB (non-blocking)
      preloadGemCosts().catch(console.error);
      
      const { data, error } = await supabase.rpc('get_user_gems', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const gemData = data[0] as GemsData;
        const balance = gemData.gems_balance ?? 0;
        console.log('[useGems] Fetched balance:', balance); // Debug log
        setGems(balance);
        setSubscriptionType(gemData.subscription_type);
        setSubscriptionExpiresAt(gemData.subscription_expires_at);
      } else {
        console.log('[useGems] No data, setting to 0');
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
    if (!user?.id) {
      console.error('[useGems] No user ID for deduction');
      return { success: false, newBalance: 0 };
    }

    // Use async version to ensure we have the latest cost from DB
    const cost = await getGemCostAsync(featureName);
    console.log(`[useGems] Deducting ${cost} gems for ${featureName}`);
    
    try {
      const { data, error } = await supabase.rpc('deduct_gems', {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_gem_cost: cost
      });

      if (error) {
        console.error('[useGems] Deduction error:', error);
        throw error;
      }

      if (data === -1) {
        console.warn('[useGems] Insufficient gems');
        return { success: false, newBalance: gems ?? 0 }; // Not enough gems
      }

      console.log(`[useGems] Deduction successful, new balance: ${data}`);
      setGems(data);
      return { success: true, newBalance: data };
    } catch (error) {
      console.error("Error deducting gems:", error);
      return { success: false, newBalance: gems ?? 0 };
    }
  }, [user?.id, gems]);

  const refundGems = useCallback(async (featureName: string): Promise<{ success: boolean; newBalance: number }> => {
    if (!user?.id) {
      console.error('[useGems] No user ID for refund');
      return { success: false, newBalance: 0 };
    }

    // Use async version to ensure we have the latest cost from DB
    const cost = await getGemCostAsync(featureName);
    console.log(`[useGems] Refunding ${cost} gems for ${featureName}`);
    
    try {
      const { data, error } = await supabase.rpc('add_gems', {
        p_user_id: user.id,
        p_gems: cost,
        p_transaction_type: 'refund'
      });

      if (error) {
        console.error('[useGems] Refund error:', error);
        throw error;
      }

      const newBalance = data as number;
      console.log(`[useGems] Refund successful, new balance: ${newBalance}`);
      setGems(newBalance);
      return { success: true, newBalance };
    } catch (error) {
      console.error("Error refunding gems:", error);
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
    refundGems,
    hasEnoughGems,
    checkSufficientGems,
    refetchGems: fetchGems,
  };
};
