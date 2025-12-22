// This hook provides backward compatibility with the old credit system.
// It wraps useGems and provides the same API as the old useCredits hook.

import { useGems } from "./useGems";

export const useCredits = () => {
  const { gems, loading, deductGems, hasEnoughGems, refetchGems } = useGems();
  
  // For backward compatibility, use a default cost of 1 gem
  const hasCredits = gems !== null && gems > 0;
  
  const deductCredit = async () => {
    // Use legacy-credit which defaults to 1 gem for backward compatibility
    const result = await deductGems("refine-prompt"); // Uses 1 gem
    return result.success;
  };
  
  return {
    credits: gems,
    loading,
    deductCredit,
    hasCredits,
    refetchCredits: refetchGems,
  };
};
