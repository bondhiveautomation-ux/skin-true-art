// Credit/gem system removed — this app is private, single-user.
// Kept as a shim so any remaining references resolve to a zero cost.

export const getGemCost = (_featureName?: string): number => 0;

export const getGemCostAsync = async (_featureName?: string): Promise<number> => 0;

export const preloadGemCosts = async (): Promise<void> => {};
