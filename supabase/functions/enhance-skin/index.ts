import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing skin enhancement for image");

    const enhancementPrompt = `CRITICAL INSTRUCTIONS - Enhance ONLY the skin texture layer across ALL VISIBLE SKIN in the entire image.

SKIN AREAS TO ENHANCE:
Apply realistic skin texture enhancement to EVERY visible skin area including:
- Face (forehead, cheeks, nose, chin, around eyes)
- Neck (front and sides)
- Chest and décolletage
- Shoulders and upper back (if visible)
- Arms (upper arms, forearms)
- Hands and fingers
- Any other exposed skin areas

LOCKED LAYERS (ABSOLUTELY DO NOT MODIFY):
- All makeup: eyeshadow, foundation, contour, blush, eyeliner, mascara, lipstick, lip gloss, highlighter
- Lip shape, position, openness, color, shine, and gloss - MUST remain pixel-identical
- Facial expression: MUST remain exactly the same (no smile changes, eye adjustments)
- Eyebrows: shape, color, thickness, positioning
- Eyelashes: volume, length, curl
- Eye shape, iris color, pupil size
- Face shape, jawline, nose shape, cheekbones, and all facial proportions
- Hairstyle, hair color, hair texture
- Clothing, jewelry, accessories
- Background elements
- Lighting style, direction, and color mood

ONLY MODIFY: Skin surface texture on ALL visible skin areas
Apply these texture enhancements to all exposed skin:
- Natural visible pores (varying density - more on nose/forehead, less on neck/chest)
- Micro-lines and fine wrinkles appropriate to each skin area
- Soft organic imperfections and natural asymmetry
- Realistic micro-shadows that follow skin contours
- Natural skin texture depth with matte finish (not glossy or plastic)
- Preserve natural skin undertones and subtle color variations
- Remove only artificial smoothing, blur, and plastic-looking surfaces
- Maintain natural skin characteristics for different body areas (face skin differs from neck/arm skin)

TEXTURE VARIATION BY AREA:
- Face: More visible pores, micro-detail, expression lines
- Neck: Softer texture, natural lines, less prominent pores
- Chest/shoulders: Smooth but textured, subtle imperfections
- Arms/hands: Natural texture appropriate to body skin

ABSOLUTE PROHIBITIONS:
- NO makeup removal or modification whatsoever
- NO color changes to lips, eyes, skin tone, or makeup
- NO changes to lip position, openness, wetness, or gloss
- NO facial expression changes (smile, eye opening, head tilt)
- NO facial feature reshaping (slimming, nose refinement, eye enlargement)
- NO whitening, brightening, or beautification filters
- NO changes to facial proportions or bone structure
- NO alterations to clothing, hair, jewelry, or background
- NO smoothing or blur on non-skin areas

GOAL:
The result must look like the exact same person, same makeup application, same facial expression, same lighting - but photographed with a high-end professional camera that captures real human skin texture across all visible skin areas instead of phone camera smoothing. Think of this as adding a "real skin texture overlay" to all exposed skin without touching anything else in the image.`;



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
              {
                type: "text",
                text: enhancementPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      throw new Error("No enhanced image returned from AI");
    }

    console.log("Skin enhancement completed successfully");

    return new Response(
      JSON.stringify({ enhancedImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enhance-skin function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
