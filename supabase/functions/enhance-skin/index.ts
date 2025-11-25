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

    const enhancementPrompt = `CRITICAL INSTRUCTIONS - Enhance ONLY the skin texture layer. You are FORBIDDEN from modifying anything else.

LOCKED LAYERS (DO NOT MODIFY):
- All makeup: eyeshadow, lipstick, lip gloss, contour, blush, eyeliner, mascara, highlighter
- Lip position, shape, openness, color, and gloss - MUST remain pixel-identical
- Eyebrows: shape, color, thickness, and positioning
- Eyelashes: volume, length, and curl
- Face shape, jawline, nose shape, eye shape, and all facial proportions
- Facial expression: MUST remain exactly the same
- Hairstyle and hair color
- Lighting style and direction
- Background

ONLY MODIFY: Skin surface texture
Add to skin ONLY:
- Natural visible pores (especially on nose, cheeks, forehead)
- Micro-lines and fine wrinkles
- Soft organic imperfections and asymmetry
- Natural micro-shadows around facial contours
- Realistic skin texture depth with matte finish
- Preserve natural skin undertones and color variation
- Remove plastic smoothness and artificial blur

ABSOLUTE PROHIBITIONS:
- NO makeup removal or modification
- NO color changes to lips, eyes, or skin tone
- NO changes to lip position, openness, or gloss
- NO expression changes (no smile adjustment, eye closing/opening)
- NO facial feature reshaping (slimming, nose job, eye enlargement)
- NO whitening or beautification filters
- NO changes to facial proportions

The result must look like: Same person, same makeup application, same facial expression, same lighting - but photographed with a professional camera that captures real human skin texture instead of phone camera smoothing.

Think of this as adding a "real skin texture overlay" on top of the existing image without touching anything underneath.`;


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
