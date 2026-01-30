import { supabase } from "@/integrations/supabase/client";

/**
 * Log a generation event to the database for admin tracking.
 * This accepts both base64 images and URLs.
 * 
 * Note: For very large base64 images, consider uploading to storage first
 * and passing URLs instead to reduce database size.
 */
export const logGeneration = async (
  featureName: string,
  inputImages: string[] = [],
  outputImages: string[] = [],
  userId?: string
): Promise<void> => {
  if (!userId) {
    console.warn("[logGeneration] No user ID provided, skipping log");
    return;
  }
  
  // Filter to only valid strings (not null/undefined/empty)
  const validStrings = (arr: string[]) => 
    arr.filter((v) => typeof v === "string" && v.trim().length > 0);
  
  try {
    const { error } = await supabase.rpc("log_generation", {
      p_user_id: userId,
      p_feature_name: featureName,
      p_input_images: validStrings(inputImages),
      p_output_images: validStrings(outputImages),
    });
    
    if (error) {
      console.error("[logGeneration] RPC error:", error);
    } else {
      console.log(`[logGeneration] Logged ${featureName} generation`);
    }
  } catch (error) {
    console.error("[logGeneration] Failed to log generation:", error);
  }
};
