import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LogoGenerationRequest {
  brandName: string;
  industry: string;
  targetCustomer: string;
  brandPersonality: string[];
  coreBrandFeeling: string;
  backgroundUse: "dark" | "light" | "both";
  colorPalette: string;
  symbolPreference: string;
  typographyDirection: string[];
  symbolMeaningFocus?: string[];
  culturalScope: string;
  lockupType: string;
  complexityLevel: string;
  numVariations: number;
  backgroundMode: string;
  textStrictness: string;
  tagline?: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured", success: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: LogoGenerationRequest = await req.json();
    const {
      brandName,
      industry,
      targetCustomer,
      brandPersonality,
      coreBrandFeeling,
      backgroundUse,
      colorPalette,
      symbolPreference,
      typographyDirection,
      symbolMeaningFocus,
      culturalScope,
      lockupType,
      complexityLevel,
      numVariations,
      backgroundMode,
      textStrictness,
      tagline,
      userId,
    } = requestData;

    console.log("Processing logo generation request:", {
      brandName,
      industry,
      lockupType,
      numVariations,
    });

    // Build the comprehensive prompt
    const personalityText = brandPersonality.join(" and ");
    const typographyText = typographyDirection.join(" or ");
    const symbolMeaningText = symbolMeaningFocus?.length ? symbolMeaningFocus.join(", ") : "";

    // Determine background instruction
    let backgroundInstruction = "";
    if (backgroundMode === "transparent") {
      backgroundInstruction = "on a pure transparent background";
    } else if (backgroundMode === "dark") {
      backgroundInstruction = "on a solid dark charcoal or black background";
    } else if (backgroundMode === "light") {
      backgroundInstruction = "on a clean white or off-white background";
    } else {
      backgroundInstruction = "on a minimal neutral background";
    }

    // Determine lockup description
    let lockupDescription = "";
    switch (lockupType) {
      case "wordmark":
        lockupDescription = "wordmark-only logo focusing on premium typography of the brand name";
        break;
      case "symbol-wordmark":
        lockupDescription = "logo with a distinctive symbol/icon alongside the brand name wordmark";
        break;
      case "monogram":
        lockupDescription = "monogram logo using the initials in an elegant, interlocking design";
        break;
      default:
        lockupDescription = "logo with balanced symbol and typography";
    }

    // Determine complexity
    let complexityDescription = "";
    switch (complexityLevel) {
      case "minimal":
        complexityDescription = "ultra-minimal, clean lines, maximum negative space";
        break;
      case "balanced":
        complexityDescription = "balanced detail, refined but not sparse";
        break;
      case "detailed":
        complexityDescription = "intricate but still luxurious, fine details that reward close viewing";
        break;
      default:
        complexityDescription = "balanced luxury aesthetic";
    }

    // Build the main prompt
    const prompt = `Create a luxury brand identity logo for "${brandName}" exactly as spelled.

BRAND CONTEXT:
- Industry: ${industry}
- Target Customer: ${targetCustomer}
- Brand Personality: ${personalityText}
- Core Brand Feeling: ${coreBrandFeeling}
- Cultural Scope: ${culturalScope}
${symbolMeaningText ? `- Symbol Should Convey: ${symbolMeaningText}` : ""}
${tagline && textStrictness === "with-tagline" ? `- Tagline: "${tagline}"` : ""}

VISUAL REQUIREMENTS:
- Logo Type: ${lockupDescription}
- Typography Style: ${typographyText}
- Color Palette: ${colorPalette}
- Complexity: ${complexityDescription}
- Background: ${backgroundInstruction}
- Designed for use on: ${backgroundUse === "both" ? "both dark and light backgrounds" : backgroundUse + " backgrounds"}

MANDATORY STYLE CONSTRAINTS:
- Luxury brand identity logo, premium vector-style mark
- Sharp edges, high clarity, crisp lines
- Balanced letter spacing, professional kerning
- Centered composition with harmonious proportions
- High contrast, timeless elegance
- The brand name "${brandName}" must be spelled exactly correctly
- Agency-quality, editorial-grade design
- Suitable for luxury fashion, premium tech, or high-end service brands

STRICTLY AVOID:
- No mockups, no business cards, no signage
- No 3D render, no embossing, no metallic texture simulation
- No watermarks, no random text, no spelling errors
- No busy backgrounds, no illustrations, no mascots
- No generic crowns, laurels, or lions
- No gradients unless specifically part of the requested color palette
- No trendy overused symbols`;

    console.log("Generated prompt for logo:", prompt.substring(0, 500) + "...");

    // Generate images using Lovable AI (Gemini image generation)
    const generatedImages: string[] = [];

    for (let i = 0; i < numVariations; i++) {
      console.log(`Generating logo variation ${i + 1} of ${numVariations}...`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: prompt + `\n\nThis is variation ${i + 1} - make it unique while maintaining the brand guidelines.`,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI gateway error for variation ${i + 1}:`, response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later.", success: false }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "API credits exhausted. Please contact support.", success: false }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        continue; // Try next variation
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        generatedImages.push(imageUrl);
        console.log(`Generated variation ${i + 1} successfully`);
      } else {
        console.error(`No image returned for variation ${i + 1}`);
      }
    }

    if (generatedImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate any logo variations", success: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully generated ${generatedImages.length} logo variations`);

    // Save to database if userId is provided
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Save generation to logo_generations table
      const { error: saveError } = await supabase.from("logo_generations").insert({
        user_id: userId,
        brand_name: brandName,
        inputs_json: requestData,
        images_json: generatedImages.map((url, idx) => ({
          url,
          label: `Concept ${String.fromCharCode(65 + idx)}`,
        })),
        status: "success",
      });

      if (saveError) {
        console.error("Failed to save generation:", saveError);
      }

      // Log generation for tracking
      await supabase.rpc("log_generation", {
        p_user_id: userId,
        p_feature_name: "logo-generator",
        p_input_images: [],
        p_output_images: generatedImages,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages.map((url, idx) => ({
          url,
          label: `Concept ${String.fromCharCode(65 + idx)}`,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Logo generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
