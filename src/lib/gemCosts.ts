// Gem costs per feature category
export const GEM_COSTS = {
  // High-Impact Features - 15 Gems
  "dress-change": 15,
  "apply-makeup": 15,
  "generate-character-image": 15,
  "pose-transfer": 15,
  "full-look-transfer": 15,
  "face-swap": 15,
  
  // Studio Utility Features - 6 Gems
  "enhance-photo": 6,
  "apply-branding": 6,
  "extract-dress-to-dummy": 6,
  "remove-people-from-image": 6,
  
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
    features: ["dress-change", "apply-makeup", "generate-character-image", "pose-transfer", "full-look-transfer", "face-swap"],
  },
  "studio-utility": {
    label: "Studio Utility Features", 
    cost: 6,
    features: ["enhance-photo", "apply-branding", "extract-dress-to-dummy", "remove-people-from-image"],
  },
  "quick-tools": {
    label: "Quick Tools",
    cost: 1,
    features: ["generate-caption", "extract-image-prompt", "refine-prompt"],
  },
} as const;

// Pricing tiers
export const GEM_PRICING = {
  subscriptions: [
    {
      id: "weekly-spark",
      name: "Weekly Spark",
      price: 149,
      gems: 250,
      validDays: 7,
      description: "Perfect for trying out all features",
      badge: null as string | null,
      highlighted: false,
    },
    {
      id: "monthly-elite", 
      name: "Monthly Elite",
      price: 499,
      gems: 1125,
      validDays: 30,
      description: "Best value for power users",
      badge: "BEST VALUE" as string | null,
      highlighted: true,
    },
  ],
  topups: [
    {
      id: "micro",
      name: "Micro Power-Up",
      price: 50,
      gems: 100,
      description: "Quick boost for small projects",
      badge: null as string | null,
    },
    {
      id: "pro",
      name: "Pro Power-Up", 
      price: 100,
      gems: 225,
      description: "More gems, better value",
      badge: "POPULAR" as string | null,
    },
  ],
};
