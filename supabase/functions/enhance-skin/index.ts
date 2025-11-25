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
    const { imageUrl, mode = "preserve" } = await req.json();
    
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing skin enhancement for image", { mode });

    const preserveMakeupPrompt = `YOU ARE A SKIN TEXTURE SPECIALIST. YOUR ONLY JOB IS TO ADD REALISTIC SKIN PORES AND TEXTURE.

🚨 CRITICAL: This image has MAKEUP on it. The makeup MUST remain 100% UNTOUCHED.
Makeup is PAINTED ON TOP OF the skin. You are ONLY adding texture to the skin UNDERNEATH the makeup layer.
DO NOT remove, lighten, blur, or modify ANY makeup whatsoever.

THINK OF IT THIS WAY:
- Skin = base layer (you add pores and texture here)
- Makeup = top layer painted on skin (you NEVER touch this)

WHAT YOU MUST DO:
Add realistic skin texture ONLY to visible skin areas:
- Face, neck, shoulders, chest, arms, hands
- Add natural pores (more on nose/forehead, less on neck)
- Add micro-lines, tiny imperfections, organic bumps
- Add realistic micro-shadows following skin contours
- Add matte texture depth (not glossy)
- Remove artificial smoothing/blur ONLY on bare skin areas

🚨 ELEMENTS THAT MUST STAY 100% PIXEL-IDENTICAL:
✗ All makeup (eyeshadow, lipstick, blush, contour, eyeliner, foundation, highlighter)
✗ Lip color, shine, gloss, wetness, shape, position
✗ Eye makeup, eyeliner, mascara, lashes
✗ Facial expression (smile, eye opening, mouth position)
✗ Face shape, jawline, nose, cheekbones, proportions
✗ Eyebrows (shape, color, thickness)
✗ Eye shape, iris color, pupil size
✗ Hair, hairstyle, hair color
✗ Clothing, jewelry, accessories
✗ Background, lighting style, color mood

🚨 ABSOLUTE PROHIBITIONS:
❌ DO NOT remove ANY makeup
❌ DO NOT lighten foundation or concealer
❌ DO NOT change lip color or gloss
❌ DO NOT modify eye makeup
❌ DO NOT change facial features or expression
❌ DO NOT whiten, brighten, or beautify
❌ DO NOT reshape face, nose, lips, or eyes
❌ DO NOT change lighting or colors

✅ YOUR ONLY TASK:
Add a realistic skin texture overlay to exposed skin (pores, micro-detail, organic imperfections) while keeping absolutely everything else identical.

Think: "Same person, same makeup, same everything — just add camera-quality skin pores and texture to the bare skin surface."`;

    const removeMakeupPrompt = `YOU ARE A PROFESSIONAL MAKEUP REMOVAL AND SKIN TEXTURE SPECIALIST.

YOUR TASK: Remove ALL makeup from this portrait and reveal natural, realistic skin with proper texture.

STEP 1 - REMOVE ALL MAKEUP COMPLETELY:
Remove every trace of:
- Foundation, concealer, powder (reveal natural skin tone and texture underneath)
- Eyeshadow, eyeliner, mascara (reveal natural eyelids and lashes)
- Lipstick, lip gloss, lip liner (reveal natural lip color)
- Blush, contour, highlighter (reveal natural face shape and coloring)
- Eyebrow makeup (reveal natural eyebrow hair and skin)

STEP 2 - ADD REALISTIC NATURAL SKIN TEXTURE:
Add natural skin features to ALL visible skin (face, neck, shoulders, arms, hands):
- Natural pores (more visible on nose/forehead, less on cheeks)
- Fine lines and natural wrinkles
- Natural skin imperfections (slight redness, tiny blemishes, natural texture variation)
- Realistic micro-shadows following natural face contours
- Natural skin tone with realistic color variation
- Matte, organic texture (no artificial smoothing or shine)

PRESERVE ABSOLUTELY:
✓ Facial structure (face shape, jawline, nose, cheekbones)
✓ Eye shape, iris color, pupil size
✓ Natural eyebrow shape and hair
✓ Natural lip shape and structure
✓ Facial expression
✓ Hair and hairstyle
✓ Clothing and accessories
✓ Background and lighting
✓ Photo composition

RESULT: A natural, makeup-free portrait with realistic skin texture that looks like the same person photographed without makeup.`;

    const enhancementPrompt = mode === "remove" ? removeMakeupPrompt : preserveMakeupPrompt;

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
