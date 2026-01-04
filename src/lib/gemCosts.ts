// Gem costs per feature category
export const GEM_COSTS = {
  // High-Impact Features - 15 Gems
  "dress-change": 15,
  "apply-makeup": 15,
  "generate-character-image": 15,
  "pose-transfer": 15,
  "full-look-transfer": 15,
  "face-swap": 15,
  "cinematic-transform": 15,
  
  // Studio Utility Features - 12 Gems (updated from 6 for profitability)
  "enhance-photo": 12,
  "apply-branding": 12,
  "extract-dress-to-dummy": 12,
  "remove-people-from-image": 12,
  
  // Quick Tools - 1 Gem
  "generate-caption": 1,
  "extract-image-prompt": 1,
  "refine-prompt": 1,
} as const;

export type FeatureName = keyof typeof GEM_COSTS;

export const getGemCost = (featureName: string): number => {
  return GEM_COSTS[featureName as FeatureName] ?? 1;
};

export const FEATURE_CATEGORIES = {
  "high-impact": {
    label: "High-Impact Features",
    cost: 15,
    features: ["dress-change", "apply-makeup", "generate-character-image", "pose-transfer", "full-look-transfer", "face-swap", "cinematic-transform"],
  },
  "studio-utility": {
    label: "Studio Utility Features", 
    cost: 12,
    features: ["enhance-photo", "apply-branding", "extract-dress-to-dummy", "remove-people-from-image"],
  },
  "quick-tools": {
    label: "Quick Tools",
    cost: 1,
    features: ["generate-caption", "extract-image-prompt", "refine-prompt"],
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
