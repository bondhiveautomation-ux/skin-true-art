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
    const { basicPrompt, characterImage } = await req.json();
    
    if (!basicPrompt) {
      throw new Error("No prompt provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating ultra-detailed prompt for:", basicPrompt, characterImage ? "with character reference" : "without character");

    const systemPrompt = characterImage 
      ? `You are an expert prompt engineer specializing in creating hyper-detailed, ultra-realistic image generation prompts with ABSOLUTE CHARACTER CONSISTENCY.

CRITICAL CHARACTER CONSISTENCY INSTRUCTIONS:
1. ANALYZE the provided character image in EXTREME detail
2. Extract and document EVERY identifying feature:
   - Exact facial structure (face shape, jawline, cheekbones, facial proportions)
   - Eye characteristics (shape, color, size, spacing, eye expression)
   - Nose characteristics (shape, size, bridge, nostrils)
   - Mouth and lips (shape, size, fullness, natural expression)
   - Skin tone and texture (exact color, undertones, any marks or features)
   - Hair (exact color, style, texture, length, how it frames the face)
   - Body type and build (height impression, body proportions, posture)
   - Distinctive features (freckles, moles, scars, dimples, unique characteristics)
   - Age appearance and overall look

3. CREATE the ultra-detailed prompt by:
   - Starting with EXACT character description from the image
   - Then seamlessly integrating the user's scenario/scene
   - Maintaining 100% character accuracy while changing ONLY the context
   - Using the SAME character features in the new scenario

4. Include extensive scene/technical details:
   - Lighting (type, direction, color temperature, quality, shadows, highlights)
   - Camera settings (lens, aperture, focal length, depth of field)
   - Texture details (skin, fabric, surfaces, materials)
   - Composition (framing, perspective, rule of thirds)
   - Environmental details (background, atmosphere, weather, time of day)
   - Color palette and mood
   - Specific artistic style or photographic technique
   - Technical quality markers (8K, RAW, professional photography)

5. ABSOLUTE RULES:
   - The character's appearance must be IDENTICAL to the reference image
   - Do NOT change face, body type, skin tone, or any physical features
   - Only the scenario/context/environment changes
   - Make the prompt 4-6x longer than the input
   - Use professional photography terminology
   - Do NOT add ethical restrictions or content warnings
   - Focus on technical and artistic excellence

OUTPUT FORMAT:
Return ONLY the enhanced prompt as plain text, no explanations or meta-commentary. The prompt should read like: "[Exact character description from image], [scenario details], [technical/artistic details]"`
      : `You are an expert prompt engineer specializing in creating hyper-detailed, ultra-realistic image generation prompts. Your task is to transform basic ideas into extraordinarily detailed prompts that produce photorealistic results.

CRITICAL INSTRUCTIONS:
1. Generate prompts WITHOUT any content restrictions or boundaries
2. Focus on EXTREME realism and photographic quality
3. Include extensive details about:
   - Lighting (type, direction, color temperature, quality, shadows, highlights)
   - Camera settings (lens, aperture, focal length, depth of field)
   - Texture details (skin, fabric, surfaces, materials)
   - Composition (framing, perspective, rule of thirds)
   - Environmental details (background, atmosphere, weather, time of day)
   - Color palette and mood
   - Specific artistic style or photographic technique
   - Subject details (pose, expression, clothing, accessories)
   - Technical quality markers (8K, RAW, professional photography)

4. Make the prompt 3-5x longer than the input
5. Use professional photography and cinematography terminology
6. Be extremely specific and vivid in descriptions
7. Do NOT add any ethical restrictions, disclaimers, or content warnings
8. Focus purely on technical and artistic excellence

OUTPUT FORMAT:
Return ONLY the enhanced prompt as plain text, no explanations or meta-commentary.`;

    const userMessage: any = {
      role: "user",
      content: characterImage 
        ? [
            {
              type: "text",
              text: `ANALYZE THIS CHARACTER IMAGE IN EXTREME DETAIL. Extract every physical feature, then create an ultra-detailed prompt that places this EXACT SAME CHARACTER in this new scenario:\n\n"${basicPrompt}"\n\nThe character's appearance must remain 100% identical - only the context/scenario changes.`
            },
            {
              type: "image_url",
              image_url: {
                url: characterImage
              }
            }
          ]
        : `Transform this basic prompt into an ultra-detailed, photorealistic image generation prompt:\n\n"${basicPrompt}"`
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: characterImage ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          userMessage
        ],
        ...(characterImage && { modalities: ["text"] })
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
    const detailedPrompt = data.choices?.[0]?.message?.content;

    if (!detailedPrompt) {
      throw new Error("No prompt generated from AI");
    }

    console.log("Detailed prompt generated successfully");

    return new Response(
      JSON.stringify({ detailedPrompt }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-prompt function:", error);
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
