import { supabase } from "@/integrations/supabase/client";

// Default gem costs per feature (fallback if DB unavailable)
// IMPORTANT: These should match database values in feature_gem_costs table
export const GEM_COSTS = {
  // High-Impact Features - 5 Gems (matches DB)
  "apply-makeup": 5,
  "generate-character-image": 5,
  "pose-transfer": 5,
  "face-swap": 5,
  "cinematic-transform": 5,
  "extract-dress-to-dummy": 5,
  "dress-change": 5, // Alias for dress extractor
  "generate-background": 5,
  "generate-logo": 15,
  
  // Studio Utility Features - 3 Gems (matches DB)
  "enhance-photo": 3,
  "apply-branding": 3,
  "remove-people-from-image": 3,
  
  // Quick Tools - 1 Gem
  "generate-caption": 1,
  "extract-image-prompt": 1,
  "refine-prompt": 1,
  
  // Prompt Engineer - 5 Gems
  "prompt-engineer": 5,
} as const;

export type FeatureName = keyof typeof GEM_COSTS;

// Cache for DB gem costs
let dbGemCostsCache: Record<string, number> | null = null;
let dbCachePromise: Promise<Record<string, number>> | null = null;
let lastCacheFetch = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Fetch gem costs from database
const fetchDBGemCosts = async (): Promise<Record<string, number>> => {
  const now = Date.now();
  
  // Return cache if valid
  if (dbGemCostsCache && (now - lastCacheFetch) < CACHE_TTL) {
    return dbGemCostsCache;
  }

  // If already fetching, wait for that promise
  if (dbCachePromise) {
    return dbCachePromise;
  }

  dbCachePromise = (async () => {
    try {
      const { data, error } = await supabase
        .from("feature_gem_costs")
        .select("feature_key, gem_cost")
        .eq("is_active", true);

      if (error) throw error;

      const costsMap: Record<string, number> = {};
      (data || []).forEach((f: { feature_key: string; gem_cost: number }) => {
        costsMap[f.feature_key] = f.gem_cost;
      });
      
      dbGemCostsCache = costsMap;
      lastCacheFetch = Date.now();
      return costsMap;
    } catch (error) {
      console.error("Error fetching gem costs from DB:", error);
      return {};
    } finally {
      dbCachePromise = null;
    }
  })();

  return dbCachePromise;
};

// Clear cache (call when admin updates costs)
export const clearGemCostCache = () => {
  dbGemCostsCache = null;
  dbCachePromise = null;
  lastCacheFetch = 0;
};

// Synchronous getter using cached values (falls back to defaults)
export const getGemCost = (featureName: string): number => {
  // First check DB cache
  if (dbGemCostsCache && dbGemCostsCache[featureName] !== undefined) {
    return dbGemCostsCache[featureName];
  }
  // Fall back to hardcoded defaults
  return GEM_COSTS[featureName as FeatureName] ?? 1;
};

// Async getter that ensures DB values are loaded
export const getGemCostAsync = async (featureName: string): Promise<number> => {
  const dbCosts = await fetchDBGemCosts();
  if (dbCosts[featureName] !== undefined) {
    return dbCosts[featureName];
  }
  return GEM_COSTS[featureName as FeatureName] ?? 1;
};

// Pre-load gem costs from DB (call on app init)
export const preloadGemCosts = async (): Promise<void> => {
  await fetchDBGemCosts();
};

export const FEATURE_CATEGORIES = {
  "high-impact": {
    label: "High-Impact Features",
    cost: 5,
    features: ["apply-makeup", "generate-character-image", "pose-transfer", "face-swap", "cinematic-transform", "extract-dress-to-dummy", "generate-background"],
  },
  "premium": {
    label: "Premium Features",
    cost: 15,
    features: ["generate-logo"],
  },
  "studio-utility": {
    label: "Studio Utility Features", 
    cost: 3,
    features: ["enhance-photo", "apply-branding", "remove-people-from-image"],
  },
  "quick-tools": {
    label: "Quick Tools",
    cost: 1,
    features: ["generate-caption", "extract-image-prompt", "refine-prompt"],
  },
  "prompt-engineer": {
    label: "Prompt Engineer",
    cost: 5,
    features: ["prompt-engineer"],
  },
} as const;

// Pricing tiers (updated for profitability)
export const GEM_PRICING = {
  subscriptions: [
    {
      id: "trial",
      name: "Trial Pack",
      price: 49,
      gems: 50,
      validDays: 7,
      description: "Try all features",
      badge: null as string | null,
      highlighted: false,
    },
    {
      id: "starter",
      name: "Starter Pack",
      price: 149,
      gems: 200,
      validDays: 14,
      description: "For casual users",
      badge: null as string | null,
      highlighted: false,
    },
    {
      id: "weekly-pro",
      name: "Weekly Pro",
      price: 299,
      gems: 500,
      validDays: 7,
      description: "For regular users",
      badge: "POPULAR" as string | null,
      highlighted: false,
    },
    {
      id: "monthly-elite", 
      name: "Monthly Elite",
      price: 799,
      gems: 1500,
      validDays: 30,
      description: "Best value for power users",
      badge: "BEST VALUE" as string | null,
      highlighted: true,
    },
  ],
  topups: [
    {
      id: "studio",
      name: "Studio Pack", 
      price: 1999,
      gems: 5000,
      description: "For agencies & studios",
      badge: "STUDIO" as string | null,
    },
  ],
};
