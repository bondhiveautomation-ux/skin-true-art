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

const styleDescriptions: Record<string, string> = {
  clean_studio: "Clean, professional studio lighting with soft shadows and neutral background tones",
  luxury_brand: "High-end luxury brand aesthetic with dramatic lighting, rich colors, and sophisticated mood",
  soft_natural: "Soft, natural daylight with gentle diffused lighting and warm organic tones",
  dark_premium: "Dark, moody premium aesthetic with selective lighting and deep shadows for drama",
  ecommerce_white: "Pure white e-commerce background with even, shadowless product lighting",
  instagram_editorial: "Instagram-worthy editorial style with trendy color grading and lifestyle appeal",
};

const backgroundDescriptions: Record<string, string> = {
  keep_original: "Keep and enhance the original background with improved lighting and clarity",
  clean_studio: "Replace with a clean, professional studio background",
  premium_lifestyle: "Replace with a premium lifestyle context that complements the subject",
};

const photoTypeInstructions: Record<string, string> = {
  product: "This is a PRODUCT photo. Focus on: showcasing the product clearly, accurate colors, appealing presentation, remove any distracting elements, ensure the product is the hero of the image.",
  portrait: "This is a PORTRAIT/INFLUENCER photo. Focus on: flattering lighting on the face, natural skin texture (no plastic look), natural pose correction, eye enhancement, professional headshot quality while maintaining the person's authentic identity.",
  lifestyle: "This is a LIFESTYLE/BRAND photo. Focus on: storytelling composition, aspirational mood, brand-appropriate atmosphere, lifestyle context enhancement, making the scene feel premium and desirable.",
};

const skinFinishInstructions: Record<string, string> = {
  light: `STUDIO SKIN FINISH (Light):
- Remove only small blemishes, tiny spots, and minor imperfections
- Keep FULL skin texture and all pores visible
- Do NOT smooth or blur any skin areas
- Maintain complete natural appearance
- Only touch up the most obvious temporary marks`,
  medium: `STUDIO SKIN FINISH (Medium - Recommended):
- Smooth skin evenly while maintaining natural texture
- Remove acne, dark spots, scars, and uneven skin tone
- Keep natural pores visible but refined
- Balance between retouching and realism
- Apply to primary subject face only if multiple people exist`,
  pro: `STUDIO SKIN FINISH (Pro Retouch):
- High-end professional beauty retouch
- Smooth and even skin tone throughout
- Remove all blemishes, spots, scars, and imperfections
- Maintain realistic pore texture (subtle but visible)
- Professional magazine-quality finish
- Apply only to primary subject if multiple faces exist`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EnhanceRequest = await req.json();
    const { image, photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId } = body;

    console.log("Photo enhancement request:", { photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId: userId || "not provided" });

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Please provide an image to enhance" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const styleDesc = styleDescriptions[stylePreset] || styleDescriptions.clean_studio;
    const bgDesc = backgroundDescriptions[backgroundOption] || backgroundDescriptions.keep_original;
    const photoTypeInstruction = photoTypeInstructions[photoType] || photoTypeInstructions.portrait;
    const qualityInstruction = outputQuality === "ultra_hd" 
      ? "Output in ULTRA HIGH DEFINITION with maximum sharpness, clarity, and detail. DSLR-quality output with professional depth of field."
      : "Output in HIGH DEFINITION with good sharpness and clarity.";

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

    // Skin finish instructions - only for non-product photos
    const skinFinishInstruction = skinFinishEnabled && photoType !== "product" && skinFinishIntensity
      ? `
${skinFinishInstructions[skinFinishIntensity]}

CRITICAL SKIN FINISH RULES:
- Do NOT change face shape or facial features
- Do NOT enlarge eyes or lips
- Do NOT apply makeup or beauty filters
- Do NOT create plastic, doll-like, or unnaturally smooth skin
- Do NOT blur skin to the point of losing texture
- PRESERVE the person's age and natural appearance
- PRESERVE their identity completely
- This should look like expert Photoshop retouching, NOT AI beautification`
      : "";

    const prompt = `You are a world-class professional photographer and photo retoucher. Transform this image into a stunning, professional-quality photograph.

${photoTypeInstruction}

STYLE: ${styleDesc}

BACKGROUND: ${bgDesc}

${qualityInstruction}

${aiModeInstruction}

${skinFinishInstruction}

CRITICAL RULES YOU MUST FOLLOW:
1. NEVER distort faces, bodies, or product shapes - preserve all proportions exactly
2. NEVER change the person's identity or make them unrecognizable
3. NEVER add fake beauty filters or plastic-looking skin - maintain natural texture
4. NEVER over-process or make the image look artificially filtered
5. PRESERVE REALISM at all costs - this should look like a professional photo, not AI art

PROFESSIONAL PHOTOGRAPHER CORRECTIONS:
- Fix camera angle and straighten any crooked framing
- Correct perspective distortion
- Apply professional lighting correction
- Enhance sharpness naturally without halos or artifacts
- Improve color accuracy and white balance
- Apply subtle professional color grading matching the style
- Enhance dynamic range
- Remove noise and grain professionally
- If pose looks awkward, make SUBTLE natural corrections only

The result should look like it was taken by a professional photographer with high-end equipment and then professionally retouched by an expert.

EDIT THE PROVIDED IMAGE following all these instructions. Return the enhanced version of this exact image.`;

    console.log("Calling Lovable AI for photo enhancement...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } }
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
    console.log("AI response received");

    // Extract the enhanced image from the response
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No enhanced image generated from AI");
    }

    console.log("Photo enhanced successfully");

    // Upload to storage and log generation if userId is provided
    if (userId) {
      try {
        let outputStorageUrl: string | null = null;

        if (enhancedImageUrl.startsWith('data:image')) {
          outputStorageUrl = await uploadImageToStorage(supabase, enhancedImageUrl, userId, 'output_enhance');
          console.log("Output image uploaded:", outputStorageUrl ? "success" : "failed");
        }

        const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

        const { error: logError } = await supabase.rpc('log_generation', {
          p_user_id: userId,
          p_feature_name: 'Photography Studio',
          p_input_images: [],
          p_output_images: outputImages
        });

        if (logError) {
          console.error("Error logging generation:", logError);
        } else {
          console.log("Generation logged with images:", { outputCount: outputImages.length });
        }
      } catch (logErr) {
        console.error("Error in logging/upload:", logErr);
      }
    }

    return new Response(
      JSON.stringify({ enhancedImage: enhancedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Photo enhancement error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to enhance photo" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});