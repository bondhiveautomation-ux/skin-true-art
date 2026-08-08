// Credit/gem system removed — this app is private, single-user.
// Kept as a no-op shim so existing tool pages keep working without credit checks.

export const useGems = () => {
  const noop = async (_featureName?: string) => ({ success: true, newBalance: 0 });

  return {
    gems: null as number | null,
    loading: false,
    subscriptionType: null as string | null,
    subscriptionExpiresAt: null as string | null,
    deductGems: noop,
    refundGems: noop,
    hasEnoughGems: (_featureName?: string) => true,
    checkSufficientGems: (_featureName?: string) => true,
    refetchGems: async () => {},
  };
};
