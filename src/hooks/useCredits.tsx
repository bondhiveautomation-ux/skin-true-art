// This hook is deprecated. Use useGems instead.
// Kept for backward compatibility during migration.

import { useGems } from "./useGems";

export const useCredits = () => {
  const { gems, loading, deductGems, hasEnoughGems, refetchGems } = useGems();
  
  return {
    credits: gems,
    loading,
    deductCredit: async () => {
      // This is a simplified wrapper - new code should use useGems directly
      const result = await deductGems("legacy-credit");
      return result.success;
    },
    hasCredits: gems !== null && gems > 0,
    refetchCredits: refetchGems,
  };
};
