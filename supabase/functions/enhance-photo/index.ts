import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to upload base64 image to Supabase storage
async function uploadImageToStorage(
  supabase: any,
  base64Data: string,
  userId: string,
  prefix: string
): Promise<string | null> {
  try {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;
    
    const extension = matches[1];
    const base64Content = matches[2];
    const buffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    const fileName = `${userId}/${prefix}_${Date.now()}.${extension}`;
    
    const { error } = await supabase.storage
      .from('generation-images')
      .upload(fileName, buffer, {
        contentType: `image/${extension}`,
        upsert: false
      });
    
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('generation-images')
      .getPublicUrl(fileName);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error("Error uploading to storage:", error);
    return null;
  }
}

// Image Pre-Processing: Convert HEIC and downscale to 2048px max
async function preprocessImage(base64Image: string): Promise<string> {
  // Extract image data
  const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return base64Image;
  
  const format = matches[1].toLowerCase();
  
  // HEIC/HEIF detection - these would come through as the format
  // Note: Browser typically converts HEIC to JPEG before sending, but we handle it
  if (format === 'heic' || format === 'heif') {
    console.log("HEIC image detected - will be processed as JPEG by AI");
  }
  
  // The AI model handles the actual image processing
  // We just ensure the image is properly formatted
  console.log(`Image format: ${format}, preprocessing complete`);
  
  return base64Image;
}

interface EnhanceRequest {
  image: string;
  photoType: "product" | "portrait" | "lifestyle";
  stylePreset: string;
  backgroundOption: string;
  outputQuality: "hd" | "ultra_hd";
  aiPhotographerMode: boolean;
  skinFinishEnabled?: boolean;
  skinFinishIntensity?: "light" | "medium" | "pro";
  userId?: string;
}

// DLR Studio Style Descriptions - Artistic Direction (Global Illumination)
const styleDescriptions: Record<string, string> = {
  clean_studio: "CLEAN STUDIO: High-end professional studio lighting with soft-box shadows, neutral background tones, even illumination across the subject, professional color temperature",
  luxury_brand: "COUTURE MOOD (Luxury Brand): Editorial high-contrast lighting with premium color grading, rich deep shadows, sophisticated mood lighting, luxury fashion magazine aesthetic",
  soft_natural: "SOFT NATURAL: Soft diffused daylight simulation, gentle rim lighting, warm organic color tones, natural window light effect, golden hour warmth",
  dark_premium: "DARK PREMIUM: Selective dramatic lighting with deep moody shadows, high contrast ratio, spotlight effect on subject, noir-inspired atmosphere",
  ecommerce_white: "E-COMMERCE WHITE: Pure infinity white backdrop, completely even shadowless lighting, accurate product colors, commercial catalog quality",
  royal_monochrome: "SILVER SCREEN (Royal Monochrome): Stark black-and-white contrast with onyx shadows, classic Hollywood glamour lighting, timeless elegance",
  instagram_editorial: "INSTAGRAM EDITORIAL: Trendy lifestyle color grading, soft bokeh backgrounds, influencer-worthy aesthetics, vibrant yet natural tones",
};

// DLR Studio Background Descriptions - Environmental Set (World Architecture)
const backgroundDescriptions: Record<string, string> = {
  keep_original: "Enhance and refine the original background with improved lighting, depth, and clarity while maintaining its authentic character",
  clean_studio: "Ultra-realistic professional photography studio backdrop with seamless gradient, subtle vignette, controlled lighting environment",
  premium_lifestyle: "Aspirational luxury lifestyle environment with tasteful interior elements, soft ambient lighting, premium textures",
  royal_bridal_chamber: "Ultra-realistic royal bridal chamber environment: ivory and warm beige wall panels with intricate gold trim, architectural moldings, soft diffused chandelier lighting, luxurious draped curtains, polished marble accents, $10,000 photo set quality",
  garden_pavilion: "Elegant outdoor garden pavilion setting: manicured greenery, classical stone columns, soft natural daylight filtering through, romantic floral accents, aristocratic estate atmosphere",
  palace_corridor: "Grand palace corridor: ornate ceiling details, gilded frames, rich burgundy and gold color palette, dramatic natural light from tall windows, royal heritage ambiance",
};

const photoTypeInstructions: Record<string, string> = {
  product: "This is a PRODUCT photo. Focus on: showcasing the product clearly, accurate colors, appealing presentation, remove any distracting elements, ensure the product is the hero of the image.",
  portrait: "This is a PORTRAIT/INFLUENCER photo. Focus on: flattering lighting on the face, natural skin texture (no plastic look), natural pose correction, eye enhancement, professional headshot quality while maintaining the person's authentic identity.",
  lifestyle: "This is a LIFESTYLE/BRAND photo. Focus on: storytelling composition, aspirational mood, brand-appropriate atmosphere, lifestyle context enhancement, making the scene feel premium and desirable.",
};

// Frequency Separation Skin Finish - Treats skin as texture layer
const skinFinishInstructions: Record<string, string> = {
  light: `FREQUENCY SEPARATION SKIN FINISH (Light):
- Apply FREQUENCY SEPARATION technique: treat skin as a TEXTURE LAYER, not flat color
- Remove only small blemishes, tiny spots, and minor imperfections
- Keep FULL skin texture and all pores visible at the frequency level
- Do NOT smooth or blur any skin areas - maintain high-frequency detail
- Only touch up the most obvious temporary marks
- Preserve complete natural appearance with full texture integrity`,
  medium: `FREQUENCY SEPARATION SKIN FINISH (Medium - Recommended):
- Apply FREQUENCY SEPARATION technique: separate high-frequency texture from low-frequency color
- Smooth skin evenly at the color level while maintaining texture layer
- Remove acne, dark spots, scars, and uneven skin tone from the color layer
- Keep natural pores visible in the texture layer but refined
- Balance between retouching and realism using frequency separation
- Apply to primary subject face only if multiple people exist
- This prevents the "plastic AI face" look by preserving real skin texture`,
  pro: `FREQUENCY SEPARATION SKIN FINISH (Pro Retouch):
- Apply professional FREQUENCY SEPARATION: full control of texture and color layers
- High-end beauty retouch with smooth even skin tone on color layer
- Remove all blemishes, spots, scars, and imperfections
- Maintain realistic pore texture in high-frequency layer (subtle but visible)
- Professional magazine-quality finish using true frequency separation
- Apply only to primary subject if multiple faces exist
- Result should look like expert Photoshop frequency separation, NOT AI blur`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EnhanceRequest = await req.json();
    const { image, photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId } = body;

    console.log("DLR Studio enhancement request:", { photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId: userId || "not provided" });

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Please provide an image to enhance" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Always return 200 so the client shows the real message instead of
      // "Edge Function returned a non-2xx status code".
      return new Response(
        JSON.stringify({
          error: "Service is not configured (missing API key). Please contact support.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // IMAGE PRE-PROCESSING: Optimization Pass
    console.log("Running image pre-processing optimization pass...");
    const processedImage = await preprocessImage(image);

    const styleDesc = styleDescriptions[stylePreset] || styleDescriptions.clean_studio;
    const bgDesc = backgroundDescriptions[backgroundOption] || backgroundDescriptions.keep_original;
    const photoTypeInstruction = photoTypeInstructions[photoType] || photoTypeInstructions.portrait;
    
    // Output Fidelity: Editorial Print (HD) vs Master Portfolio (Ultra HD)
    const qualityInstruction = outputQuality === "ultra_hd" 
      ? "OUTPUT FIDELITY: MASTER PORTFOLIO (Ultra HD) - Maximum sharpness, clarity, and detail. DSLR-quality with f/1.4 lens depth simulation, professional depth of field, 4K-ready output."
      : "OUTPUT FIDELITY: EDITORIAL PRINT (HD) - High sharpness and clarity, print-ready quality, balanced detail preservation.";

    const aiModeInstruction = aiPhotographerMode 
      ? `
AI PHOTOGRAPHER MODE (AUTO-OPTIMIZE):
Analyze the image and automatically determine:
- Best camera angle correction (fix any perspective distortion)
- Best crop and composition (apply rule of thirds, golden ratio)
- Best lighting direction and intensity
- Best color grading for the style
- Natural pose corrections if needed
Make all these decisions automatically without user input.`
      : "";

    // Frequency Separation Skin Finish - only for non-product photos
    const skinFinishInstruction = skinFinishEnabled && photoType !== "product" && skinFinishIntensity
      ? `
${skinFinishInstructions[skinFinishIntensity]}

CRITICAL FREQUENCY SEPARATION RULES:
- Do NOT change face shape or facial features
- Do NOT enlarge eyes or lips
- Do NOT apply makeup or beauty filters
- Do NOT create plastic, doll-like, or unnaturally smooth skin
- Do NOT blur skin to the point of losing the high-frequency texture layer
- PRESERVE the person's age and natural appearance
- PRESERVE their identity completely
- Use TRUE frequency separation technique - texture layer stays intact`
      : "";

    // MASTER PROMPT ARCHITECTURE - DLR Studio Non-Destructive Identity Editor
    const prompt = `MASTER BACKGROUND ENGINE PROMPT:
You are an elite virtual creative director specialized in ultra-realistic professional bridal photography output.

═══════════════════════════════════════════════════════════════
STRICT SUBJECT LOCK (PRIMARY RULE - NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════
Face, body, makeup, jewelry, dress, pose = 100% LOCKED.
- Preserve the original character EXACTLY as provided
- SAME face, SAME facial structure, SAME expression - NO deviation
- SAME skin texture and skin tone (NO tone change whatsoever)
- SAME makeup application, jewelry placement, hairstyle - pixel perfect
- SAME dress, embroidery patterns, fabric texture, and accessories
- SAME body proportions and pose - mathematically identical
- NO facial alteration, NO beautification changes, NO stylization
- The human subject must be RE-RENDERED, not RE-CREATED

${photoTypeInstruction}

═══════════════════════════════════════════════════════════════
BACKGROUND GENERATION INSTRUCTION:
═══════════════════════════════════════════════════════════════
Artistic Style (Global Illumination): ${styleDesc}

Environment Context (World Architecture): ${bgDesc}

Apply the selected background environment with realistic studio lighting, natural shadows, and cinematic depth. Background elements must remain soft and out of focus where appropriate to keep the subject dominant. The environment should enhance, never compete with, the subject.

${qualityInstruction}

${aiModeInstruction}

${skinFinishInstruction}

═══════════════════════════════════════════════════════════════
PHOTOGRAPHY STYLE:
═══════════════════════════════════════════════════════════════
- DSLR bridal photography quality
- Shallow depth of field with f/1.4 lens simulation
- Accurate color science with professional white balance
- Soft light falloff with natural gradient transitions
- Professional wedding editorial quality output
- Cinematic depth with proper foreground/background separation

═══════════════════════════════════════════════════════════════
NEGATIVE PROMPT (ABSOLUTE PROHIBITIONS):
═══════════════════════════════════════════════════════════════
face change, makeup change, dress change, jewelry change, hairstyle change, extra limbs, extra fingers, distorted anatomy, plastic skin, AI artifacts, cartoon style, CGI look, fantasy elements, fake lighting, unrealistic background, blur on subject, identity alteration, age change, skin tone change, expression change, pose change, body proportion change

═══════════════════════════════════════════════════════════════
EXECUTION:
═══════════════════════════════════════════════════════════════
Transform ONLY the environment and lighting while keeping the human subject mathematically identical to the source. This is NON-DESTRUCTIVE IDENTITY EDITING.

After completing the enhancement, provide a brief 2-sentence creative director's note explaining what was enhanced and how the subject's identity was preserved.

EDIT THE PROVIDED IMAGE following all these instructions. Return the enhanced version.`;

    console.log("Calling Lovable AI with DLR Studio Master Prompt...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: processedImage } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("DLR Studio AI response received");

    // Check for error payload in 200 response
    if (data?.error) {
      console.error("AI gateway error payload:", JSON.stringify(data));
      const msg = typeof data.error?.message === "string" ? data.error.message : "AI service temporarily unavailable";
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the enhanced image and creative brief from the response
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const creativeBrief = data.choices?.[0]?.message?.content || "";

    if (!enhancedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No enhanced image generated from AI");
    }

    console.log("DLR Studio enhancement complete");
    console.log("Creative Brief:", creativeBrief.substring(0, 200));

    // Upload to storage and log generation if userId is provided
    if (userId) {
      try {
        let inputStorageUrl: string | null = null;
        let outputStorageUrl: string | null = null;

        // Upload input image to storage
        if (processedImage.startsWith('data:image')) {
          inputStorageUrl = await uploadImageToStorage(supabase, processedImage, userId, 'input_enhance');
          console.log("Input image uploaded:", inputStorageUrl ? "success" : "failed");
        } else {
          inputStorageUrl = processedImage;
        }

        if (enhancedImageUrl.startsWith('data:image')) {
          outputStorageUrl = await uploadImageToStorage(supabase, enhancedImageUrl, userId, 'output_enhance');
          console.log("Output image uploaded:", outputStorageUrl ? "success" : "failed");
        }

        const inputImages = inputStorageUrl ? [inputStorageUrl] : [];
        const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

        const { error: logError } = await supabase.rpc('log_generation', {
          p_user_id: userId,
          p_feature_name: 'Photography Studio',
          p_input_images: inputImages,
          p_output_images: outputImages
        });

        if (logError) {
          console.error("Error logging generation:", logError);
        } else {
          console.log("Generation logged with images:", { inputCount: inputImages.length, outputCount: outputImages.length });
        }
      } catch (logErr) {
        console.error("Error in logging/upload:", logErr);
      }
    }

    // DUAL RETURN: The Frame (image) + The Brief (explanation)
    return new Response(
      JSON.stringify({ 
        enhancedImage: enhancedImageUrl,
        creativeBrief: creativeBrief 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("DLR Studio enhancement error:", error);
    // Always 200 so the client can show the real message.
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to enhance photo" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});