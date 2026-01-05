import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Background preset library
const BACKGROUND_PRESETS: Record<string, { name: string; prompt: string }> = {
  "luxury-neutral": {
    name: "Luxury Neutral Studio",
    prompt: "Ultra-realistic luxury bridal studio background. Soft beige and ivory walls with subtle plaster texture. Elegant minimal molding details. Natural depth with soft falloff. Warm studio lighting creating gentle shadows. Premium photography backdrop suitable for South Asian bridal portraits. No props, no furniture, no decorations. Clean empty space. 8K photorealistic quality."
  },
  "royal-mughal": {
    name: "Royal Mughal Interior",
    prompt: "Ultra-realistic Mughal heritage interior background. Muted elegant arches with warm sandstone tones. Tasteful symmetry with subtle carved details. Soft heritage lighting. Premium backdrop for bridal photography. No heavy decorations, no props, no furniture. Understated royal elegance. 8K photorealistic quality."
  },
  "floral-studio": {
    name: "Floral Studio Wall",
    prompt: "Ultra-realistic studio background with soft pastel floral wall. Blurred depth with elegant understated flower arrangements. Soft pink, cream and sage tones. Premium bridal photography backdrop. No props, clean composition. Subtle and elegant. 8K photorealistic quality."
  },
  "modern-bridal": {
    name: "Modern Bridal Studio",
    prompt: "Ultra-realistic modern luxury bridal studio background. Minimalist wall panels in warm neutral palette. Editorial vibe with clean lines. Soft studio lighting. Premium backdrop for contemporary bridal portraits. No props, no furniture. Sophisticated and clean. 8K photorealistic quality."
  },
  "white-gold": {
    name: "Classic White & Gold Studio",
    prompt: "Ultra-realistic classic bridal studio background. Clean white walls with very subtle faint gold trim accents. Timeless elegant bridal look. Soft warm lighting. Premium photography backdrop. No props, no decorations. Simple and refined. 8K photorealistic quality."
  },
  "draped-fabric": {
    name: "Soft Draped Fabric Background",
    prompt: "Ultra-realistic studio background with sheer draped fabric layers. Gentle flowing folds in cream and champagne tones. Studio-lit realism with soft shadows. Premium bridal photography backdrop. No props. Elegant and romantic. 8K photorealistic quality."
  },
  "dark-luxury": {
    name: "Dark Luxury Editorial",
    prompt: "Ultra-realistic dark luxury editorial background. Deep charcoal or muted emerald tones. Soft gradients with cinematic depth. Premium backdrop for dramatic bridal portraits. No props, clean composition. Sophisticated and moody. 8K photorealistic quality."
  },
  "palace-wall": {
    name: "Palace-Inspired Soft Wall",
    prompt: "Ultra-realistic palace-inspired background. Textured stone and plaster look with heritage luxury feel. Warm cream and sand tones. No props, no furniture. Subtle elegance. Premium bridal photography backdrop. 8K photorealistic quality."
  },
  "window-light": {
    name: "Window Light Studio",
    prompt: "Ultra-realistic studio background with large diffused window light impression. Soft daylight look with gentle shadows. Warm neutral walls. No visible window frame. Premium bridal photography backdrop. Clean and airy. 8K photorealistic quality."
  },
  "makeup-studio": {
    name: "Premium Makeup Studio Interior",
    prompt: "Ultra-realistic premium makeup studio interior background. Clean luxury interior with neutral warm tones. Professional depth with subtle background blur. Soft studio lighting. Premium backdrop for beauty and bridal portraits. No props in foreground. 8K photorealistic quality."
  }
};

// Global system prompt for background generation
const SYSTEM_PROMPT = `You are an elite background-generation engine specialized in high-end South Asian bridal, fashion, and studio photography.

Your ONLY task is to generate photorealistic, premium backgrounds that:
- Look like real physical studio sets
- Never look AI-generated
- Never overpower the subject
- Are suitable for bridal portraits, editorial shoots, and luxury makeup studios

HARD CONSTRAINTS (DO NOT BREAK):
❌ Do NOT generate people, faces, hands, bodies
❌ Do NOT include text, logos, signage, frames, props that touch the subject
❌ Do NOT create busy, distracting, or over-decorated scenes
❌ Do NOT use fantasy, surreal, cartoon, or painterly styles
❌ Do NOT change lighting direction dramatically

MANDATORY QUALITIES:
✅ Photorealistic - must look like a real photograph
✅ Look like a real studio or real venue
✅ Natural depth with soft falloff
✅ Match bridal elegance and premium makeup work
✅ Support soft studio lighting
✅ Maintain neutral-to-warm tones
✅ Feel like a high-end bridal studio (Gulshan/Banani level)

OUTPUT: Generate ONLY the background image. No people, no subjects, just the empty background ready for composite use.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { presetId, customPrompt } = await req.json();

    console.log("Background generation request:", { presetId, customPrompt: customPrompt?.substring(0, 50) });

    // Build the generation prompt based on inputs
    let finalPrompt = "";
    let presetName = "";

    if (presetId && BACKGROUND_PRESETS[presetId]) {
      // Use preset as base
      presetName = BACKGROUND_PRESETS[presetId].name;
      finalPrompt = BACKGROUND_PRESETS[presetId].prompt;

      if (customPrompt?.trim()) {
        // Merge custom prompt with preset
        finalPrompt = `${BACKGROUND_PRESETS[presetId].prompt}

Additional requirements from user (incorporate elegantly while maintaining bridal luxury aesthetic):
${customPrompt.trim()}`;
      }
    } else if (customPrompt?.trim()) {
      // Custom prompt only
      presetName = "Custom Background";
      finalPrompt = `Generate ultra-realistic luxury bridal studio background based on this description:

${customPrompt.trim()}

Requirements:
- Must be photorealistic, look like a real physical studio set
- Suitable for South Asian bridal portraits
- No people, no faces, no bodies - just the empty background
- Warm neutral tones, soft studio lighting
- Clean, elegant, not busy or distracting
- 8K quality`;
    } else {
      // Neither - generate default neutral luxury background
      presetName = "Default Luxury Studio";
      finalPrompt = "Ultra-realistic neutral luxury bridal studio background. Soft warm beige walls with subtle texture. Elegant depth with soft falloff. Premium photography backdrop for South Asian bridal portraits. Soft studio lighting. No props, no decorations. Clean and sophisticated. 8K photorealistic quality.";
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling AI gateway for background generation...");
    console.log("Final prompt:", finalPrompt.substring(0, 200) + "...");

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
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: finalPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract generated image
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image generated");
    }

    console.log("Background generated successfully");

    return new Response(
      JSON.stringify({
        result: generatedImageUrl,
        presetName: presetName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Background generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
