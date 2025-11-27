import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const makeupStyles: Record<string, string> = {
  "soft-glam": `SOFT GLAM MAKEUP:
- Subtle, warm-toned contour on cheekbones and jawline
- Nude or soft pink lipstick with slight sheen
- Warm peachy or brown eyeshadow blended softly
- Natural-looking lashes with light mascara
- Soft brow definition
- Light highlighter on cheekbones, nose bridge, and cupid's bow
- Overall warm, romantic, feminine aesthetic`,

  "bridal-glow": `BRIDAL GLOW MAKEUP:
- Dewy, luminous base with flawless coverage
- Soft pink or coral blush on cheeks
- Highlighted cheekbones with champagne shimmer
- Neutral champagne and rose gold eyeshadow
- Full, fluffy lashes (bridal style)
- Soft pink or nude-rose lips
- Subtle inner corner highlight
- Elegant, timeless, radiant bridal look`,

  "bold-night-out": `BOLD NIGHT OUT MAKEUP:
- Dramatic smokey eyes with deep grays, blacks, or dark browns
- Sharp winged eyeliner (cat eye)
- Deep lipstick (burgundy, berry, or deep red)
- Strong contour and highlight
- Full dramatic lashes
- Defined, arched eyebrows
- Intense, glamorous, evening look`,

  "clean-girl": `CLEAN GIRL LOOK MAKEUP:
- Minimal, barely-there base showing natural skin
- Glossy, plump lips (clear or nude gloss)
- Brushed-up natural brows
- Light mascara only
- Cream blush for a healthy flush
- Dewy skin with no matte finish
- Fresh, effortless, "no-makeup makeup" aesthetic`,

  "instagram-trendy": `TRENDY INSTAGRAM LOOK MAKEUP:
- Sharp, sculpted eyebrows (laminated brow effect)
- Vibrant or colorful eyeshadow (sunset, pink, or purple tones)
- Light contour with soft sculpting
- Fox eye or soft wing liner
- Full fluffy lashes
- Nude or mauve lipstick with slight gloss
- Modern, social-media ready, trendy aesthetic`,

  "matte-professional": `MATTE PROFESSIONAL LOOK MAKEUP:
- Smooth, matte foundation finish
- Neutral brown and taupe eyeshadow
- Thin, precise eyeliner
- Natural lashes with volumizing mascara
- Matte nude or MLBB (my lips but better) lipstick
- Soft matte blush
- Polished, office-appropriate, sophisticated look`,

  "classic-red-glam": `CLASSIC RED GLAM MAKEUP:
- Bold, classic red lipstick (matte or satin finish)
- Sharp cat eyeliner (vintage winged style)
- Neutral eyeshadow with focus on liner
- Full lashes
- Defined arched brows
- Soft contour and rosy blush
- Timeless Hollywood glamour, vintage elegance`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, makeupStyle } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing face image" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!makeupStyle || !makeupStyles[makeupStyle]) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing makeup style" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing makeup application:", makeupStyle);

    const styleDescription = makeupStyles[makeupStyle];

    const makeupPrompt = `You are a professional makeup artist AI. Your task is to apply realistic, professional makeup to the person in this photo.

CRITICAL REQUIREMENTS - ABSOLUTE PRESERVATION:
You MUST keep these elements 100% IDENTICAL and UNCHANGED:
- The EXACT same face shape, jawline, nose, chin
- The EXACT same skin tone and natural skin texture (including pores, fine lines, natural imperfections)
- The EXACT same facial expression
- The EXACT same eyes, eye shape, and eye color
- The EXACT same eyebrows shape (only enhance with makeup)
- The EXACT same hair color, style, and position
- The EXACT same background
- The EXACT same lighting conditions
- The EXACT same outfit/clothing
- The EXACT same identity - this must look like the SAME person

WHAT TO ADD - MAKEUP APPLICATION:
${styleDescription}

MAKEUP APPLICATION RULES:
- Apply makeup that looks PROFESSIONALLY DONE by a makeup artist
- Makeup must blend naturally with the person's skin tone
- Makeup must match the existing lighting in the photo
- NO plastic or airbrushed skin effect
- NO face morphing or reshaping
- NO skin smoothing or texture removal
- NO filter effects or cartoon-like appearance
- The result should look like a real photograph after professional makeup application
- Makeup should enhance natural beauty, not mask it

OUTPUT:
Generate a HIGH-RESOLUTION image of the SAME person with the specified makeup professionally applied. The final result should look like a real photo from a professional photoshoot or beauty editorial.`;

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
              { type: "text", text: makeupPrompt },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to apply makeup" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. The AI may have blocked the request due to content filters." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Makeup application error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
