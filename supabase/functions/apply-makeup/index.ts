import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Convert Makeup DNA to detailed prompt
function dnaToPrompt(dna: any): string {
  return `MAKEUP RECIPE (Layer-by-Layer Application):

PREP LAYER:
- Skin clarity level: ${dna.skinClarity}%
- Moisturizer: ${dna.moisturizerType} finish
- Primer: ${dna.primerType} primer

BASE LAYER:
- Concealer/Pan stick coverage: ${dna.panstickCoverage}%
- Foundation type: ${dna.foundationType}
- Loose powder: ${dna.loosePowder}%
- Press powder: ${dna.pressPowder}%

STRUCTURE LAYER:
- Blush: ${dna.blushColor} color, ${dna.blushPlacement} placement, ${dna.blushIntensity}% intensity
- Contour: ${dna.contourDepth}% depth for face sculpting
- Highlighter: ${dna.highlighterTone} tone, ${dna.highlighterIntensity}% intensity on high points

EYES LAYER:
- Eyeshadow: ${dna.eyeshadowFamily.replace("-", " ")} palette, ${dna.eyeshadowBlending} blending
- Eyeliner: ${dna.eyelinerType} style
- Lashes: ${dna.eyelashType} volume

LIPS LAYER:
- Lipstick shade: ${dna.lipstickShade.replace("-", " ")}
- Finish: ${dna.lipstickFinish}

FINISH LAYER:
- Setting spray: ${dna.settingSpray} finish`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode, image, makeupDNA, referenceImage, makeupStyle, userId } = body;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // DNA Extraction Mode
    if (mode === 'extract') {
      if (!referenceImage) {
        return new Response(
          JSON.stringify({ error: "Missing reference image" }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const extractPrompt = `You are an expert makeup artist analyzing a photo. Extract the complete makeup DNA from this image.

Analyze and identify:
1. PREP: Skin clarity level (0-100), moisturizer type (matte/dewy/gel-based), primer type (pore-filling/glow/matte)
2. BASE: Concealer coverage (0-100), foundation type (liquid/cream/matte/dewy), loose powder (0-100), press powder (0-100)
3. STRUCTURE: Blush color, blush placement (apples/cheekbones/draping), blush intensity (0-100), contour depth (0-100), highlighter tone (gold/champagne/silver/rose-gold), highlighter intensity (0-100)
4. EYES: Eyeshadow family (warm-neutrals/cool-tones/bold-colors/smokey/rose-gold/champagne), blending (soft/defined/cut-crease), eyeliner (soft/winged/bold/kohl), lashes (natural/volume/dramatic)
5. LIPS: Lipstick shade description, finish (matte/glossy/satin)
6. FINISH: Setting spray type (natural/long-wear/glow)

Return ONLY a valid JSON object with this exact structure:
{
  "skinClarity": number,
  "moisturizerType": "matte"|"dewy"|"gel-based",
  "primerType": "pore-filling"|"glow"|"matte",
  "panstickCoverage": number,
  "foundationType": "liquid"|"cream"|"matte"|"dewy",
  "loosePowder": number,
  "pressPowder": number,
  "blushColor": string,
  "blushPlacement": "apples"|"cheekbones"|"draping",
  "blushIntensity": number,
  "contourDepth": number,
  "highlighterTone": "gold"|"champagne"|"silver"|"rose-gold",
  "highlighterIntensity": number,
  "eyeshadowFamily": "warm-neutrals"|"cool-tones"|"bold-colors"|"smokey"|"rose-gold"|"champagne",
  "eyeshadowBlending": "soft"|"defined"|"cut-crease",
  "eyelinerType": "soft"|"winged"|"bold"|"kohl",
  "eyelashType": "natural"|"volume"|"dramatic",
  "lipstickShade": string,
  "lipstickFinish": "matte"|"glossy"|"satin",
  "settingSpray": "natural"|"long-wear"|"glow"
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "user", content: [
              { type: "text", text: extractPrompt },
              { type: "image_url", image_url: { url: referenceImage } }
            ]}
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI extraction error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to extract makeup DNA" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const makeupDNA = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ makeupDNA }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }

      return new Response(
        JSON.stringify({ error: "Could not parse makeup DNA" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply Mode (with DNA or legacy style)
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Missing face image" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let makeupInstructions = "";
    if (makeupDNA) {
      makeupInstructions = dnaToPrompt(makeupDNA);
    } else if (makeupStyle) {
      // Legacy preset support
      const legacyStyles: Record<string, string> = {
        "soft-glam": "Soft Glam: Subtle warm contour, nude pink lips, warm peachy eyeshadow, natural lashes",
        "bridal-glow": "Bridal Glow: Dewy luminous base, champagne shimmer, full lashes, nude-rose lips",
        "bridal-luxe-glam": "Bridal Luxe Glam: Full coverage matte, gold highlighter, dramatic lashes, berry-red matte lips",
        "bold-night-out": "Bold Night Out: Smokey eyes, winged liner, deep burgundy lips, dramatic lashes",
        "clean-girl": "Clean Girl: Minimal base, glossy lips, brushed brows, cream blush, dewy skin",
        "instagram-trendy": "Instagram Trendy: Sculpted brows, colorful eyeshadow, fox eye liner, nude mauve lips",
        "matte-professional": "Matte Professional: Smooth matte finish, neutral tones, precise liner, MLBB lips",
        "classic-red-glam": "Classic Red Glam: Red lips, cat eyeliner, neutral eyes, vintage Hollywood glamour"
      };
      makeupInstructions = legacyStyles[makeupStyle] || makeupStyle;
    }

    const masterPrompt = `MASTER MAKEUP DNA ENGINE:
You are an elite virtual makeup artist specialized in ultra-realistic professional makeup application.

STRICT SUBJECT LOCK (PRIMARY RULE):
Face, body, jewelry, dress, pose = 100% LOCKED.
- Preserve the original character exactly.
- SAME face, SAME facial structure, SAME expression.
- SAME skin texture and skin tone (NO tone change).
- SAME jewelry, hairstyle, dress, and accessories.
- SAME body proportions and pose.
- NO facial alteration, NO beautification changes, NO stylization.

${makeupInstructions}

MAKEUP APPLICATION RULES (South Asian Skin Tone Optimized):
- Apply makeup that looks PROFESSIONALLY DONE by a makeup artist
- Respect and enhance South Asian skin undertones (warm golden, olive, caramel)
- Maintain natural skin texture - visible pores, natural imperfections
- NO plastic or airbrushed skin effect
- NO face morphing or reshaping
- Makeup must blend naturally with existing lighting
- Professional studio-grade realism only

NEGATIVE PROMPT:
face change, skin smoothing, plastic skin, AI artifacts, cartoon, CGI, fantasy, unrealistic, blur on subject, distorted anatomy.

OUTPUT:
Generate a HIGH-RESOLUTION image of the SAME person with the specified makeup professionally applied.`;

    console.log("Applying makeup with DNA system");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "user", content: [
            { type: "text", text: masterPrompt },
            { type: "image_url", image_url: { url: image } }
          ]}
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
    
    if (data?.error) {
      console.error("AI gateway error payload:", JSON.stringify(data));
      const msg = typeof data.error?.message === "string" ? data.error.message : "AI service temporarily unavailable";
      return new Response(
        JSON.stringify({ error: msg }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. The AI may have blocked the request due to content filters." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log generation
    if (userId) {
      let inputStorageUrl: string | null = null;
      let outputStorageUrl: string | null = null;

      if (image.startsWith('data:image')) {
        inputStorageUrl = await uploadImageToStorage(supabase, image, userId, 'input_makeup');
      } else {
        inputStorageUrl = image;
      }

      if (generatedImageUrl.startsWith('data:image')) {
        outputStorageUrl = await uploadImageToStorage(supabase, generatedImageUrl, userId, 'output_makeup');
      }

      const inputImages = inputStorageUrl ? [inputStorageUrl] : [];
      const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

      await supabase.rpc('log_generation', {
        p_user_id: userId,
        p_feature_name: 'Makeup DNA Studio',
        p_input_images: inputImages,
        p_output_images: outputImages
      });
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
