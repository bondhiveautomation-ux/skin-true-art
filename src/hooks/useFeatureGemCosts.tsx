import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeatureGemCost {
  id: string;
  feature_key: string;
  feature_name: string;
  gem_cost: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Cache for gem costs to avoid refetching on every component mount
let cachedCosts: Record<string, number> | null = null;
let cachePromise: Promise<Record<string, number>> | null = null;

export const useFeatureGemCosts = () => {
  const [features, setFeatures] = useState<FeatureGemCost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feature_gem_costs")
        .select("*")
        .order("category", { ascending: true })
        .order("feature_name", { ascending: true });

      if (error) throw error;

      setFeatures(data || []);
      
      // Update cache
      const costsMap: Record<string, number> = {};
      (data || []).forEach((f: FeatureGemCost) => {
        costsMap[f.feature_key] = f.gem_cost;
      });
      cachedCosts = costsMap;
    } catch (error) {
      console.error("Error fetching feature gem costs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const updateFeatureCost = async (
    id: string,
    updates: Partial<Pick<FeatureGemCost, "gem_cost" | "feature_name" | "category" | "is_active">>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("feature_gem_costs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Refetch to update cache
      await fetchFeatures();
      return true;
    } catch (error) {
      console.error("Error updating feature cost:", error);
      return false;
    }
  };

  return {
    features,
    loading,
    updateFeatureCost,
    refetch: fetchFeatures,
  };
};

// Fetch gem cost from database with fallback to hardcoded defaults
export const fetchGemCostFromDB = async (featureKey: string): Promise<number> => {
  // Return from cache if available
  if (cachedCosts && cachedCosts[featureKey] !== undefined) {
    return cachedCosts[featureKey];
  }

  // If already fetching, wait for that promise
  if (cachePromise) {
    const costs = await cachePromise;
    return costs[featureKey] ?? getDefaultGemCost(featureKey);
  }

  // Fetch all costs and cache them
  cachePromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("feature_gem_costs")
        .select("feature_key, gem_cost");

      if (error) throw error;

      const costsMap: Record<string, number> = {};
      (data || []).forEach((f: { feature_key: string; gem_cost: number }) => {
        costsMap[f.feature_key] = f.gem_cost;
      });
      cachedCosts = costsMap;
      return costsMap;
    } catch (error) {
      console.error("Error fetching gem costs from DB:", error);
      return {};
    } finally {
      cachePromise = null;
    }
  })();

  const costs = await cachePromise;
  return costs[featureKey] ?? getDefaultGemCost(featureKey);
};

// Clear cache (call after admin updates costs)
export const clearGemCostCache = () => {
  cachedCosts = null;
  cachePromise = null;
};

// Hardcoded defaults as fallback
const DEFAULT_GEM_COSTS: Record<string, number> = {
  "dress-change": 15,
  "apply-makeup": 15,
  "generate-character-image": 15,
  "pose-transfer": 15,
  "face-swap": 15,
  "cinematic-transform": 15,
  "extract-dress-to-dummy": 15,
  "generate-background": 15,
  "enhance-photo": 12,
  "apply-branding": 12,
  "remove-people-from-image": 12,
  "generate-caption": 1,
  "extract-image-prompt": 1,
  "refine-prompt": 1,
};

const getDefaultGemCost = (featureKey: string): number => {
  return DEFAULT_GEM_COSTS[featureKey] ?? 1;
};
