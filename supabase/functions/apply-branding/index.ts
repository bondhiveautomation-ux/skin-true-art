import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrandingSettings {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  transparency: number;
  logoSize: number;
  safeMargin: boolean;
  logoStyle: "clean" | "watermark" | "badge";
  brandBorder: boolean;
  ctaPreset: string;
  ctaCustomText: string;
  repeatWatermark: boolean;
  socialHandle: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postImage, logoImage, settings, userId } = await req.json();

    if (!postImage || !logoImage) {
      throw new Error("Post image and logo are required");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    console.log("Processing branding request for user:", userId);
    console.log("Settings:", JSON.stringify(settings));

    // Build the prompt based on settings
    const positionMap = {
      "top-left": "top-left corner",
      "top-right": "top-right corner",
      "bottom-left": "bottom-left corner",
      "bottom-right": "bottom-right corner"
    };

    const styleMap = {
      "clean": "direct overlay with no modifications",
      "watermark": "semi-transparent watermark style",
      "badge": "with a subtle background/badge behind it for better contrast"
    };

    let prompt = `Apply branding to this image following these EXACT specifications:

LOGO PLACEMENT:
- Place the logo in the ${positionMap[settings.position as keyof typeof positionMap]}
- Logo opacity/transparency: ${settings.transparency}%
- Logo size: ${settings.logoSize}% of the image width
- Safe margin from edges: ${settings.safeMargin ? "Yes, keep 2-3% padding from edges" : "No, can touch edges"}
- Logo style: ${styleMap[settings.logoStyle as keyof typeof styleMap]}

CRITICAL RULES - YOU MUST FOLLOW:
1. DO NOT modify, redraw, or change the logo in ANY way
2. DO NOT change logo colors, fonts, shape, or proportions
3. DO NOT alter the original image content (faces, products, background)
4. Keep the logo sharp and clear
5. Ensure logo is visible against any background
6. If logo style is "badge", add only a subtle semi-transparent background behind the logo for contrast`;

    if (settings.brandBorder) {
      prompt += `\n\nBRAND BORDER: Add a thin, elegant premium border (gold/cream color, 1-2px) around the entire image.`;
    }

    if (settings.ctaPreset !== "none") {
      const ctaText = settings.ctaPreset === "custom" ? settings.ctaCustomText : settings.ctaPreset.replace("-", " ").toUpperCase();
      prompt += `\n\nCTA STICKER: Add a small, professional CTA badge/sticker saying "${ctaText}" - position it elegantly, don't cover the logo or main content.`;
    }

    if (settings.repeatWatermark) {
      prompt += `\n\nWATERMARK PATTERN: In addition to the main logo, add a repeating diagonal pattern of the logo across the entire image at very low opacity (10-15%) to prevent content theft. The pattern should be subtle and not distract from the main content.`;
    }

    if (settings.socialHandle) {
      prompt += `\n\nSOCIAL HANDLE: Add a minimal strip at the very bottom of the image displaying "${settings.socialHandle}" in a clean, readable font with a semi-transparent dark background.`;
    }

    prompt += `\n\nFINAL OUTPUT: Return only the branded image. Maintain original image quality and dimensions.`;

    console.log("Sending request to AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: postImage } },
              { type: "image_url", image_url: { url: logoImage } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!resultImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No branded image generated");
    }

    return new Response(
      JSON.stringify({ resultImage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in apply-branding:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
