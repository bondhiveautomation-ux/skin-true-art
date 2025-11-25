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
    const { characterImage, prompt } = await req.json();
    
    if (!characterImage) {
      throw new Error("No character reference image provided");
    }
    
    if (!prompt) {
      throw new Error("No prompt provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating image with character consistency for prompt:", prompt);

    const generationPrompt = `YOU ARE A CHARACTER-CONSISTENT IMAGE GENERATOR. YOUR ONLY JOB IS TO CREATE A NEW IMAGE WITH THE EXACT SAME CHARACTER.

🚨 ABSOLUTE CHARACTER CONSISTENCY REQUIREMENTS:

ANALYZE THIS CHARACTER AND MEMORIZE EVERY DETAIL:
- Face shape, structure, and proportions (MUST BE IDENTICAL)
- Eye shape, color, size, spacing, and expression (MUST BE IDENTICAL)
- Nose shape, size, and bridge (MUST BE IDENTICAL)
- Mouth, lips shape, size, and natural expression (MUST BE IDENTICAL)
- Skin tone, texture, and any distinctive marks (MUST BE IDENTICAL)
- Hair color, style, texture, and length (MUST BE IDENTICAL)
- Body type, build, proportions, and posture (MUST BE IDENTICAL)
- Age appearance and overall facial features (MUST BE IDENTICAL)
- Any distinctive features like freckles, moles, scars, dimples (MUST BE IDENTICAL)

YOUR TASK:
Create a new photorealistic image where this EXACT character is placed in the following scenario:

"${prompt}"

🚨 CRITICAL RULES:
✓ The character's face, body, and all physical features MUST remain 100% identical to the reference
✓ Only change: the scenario, environment, clothing, pose, and context
✓ Maintain the same person's identity completely
✓ Generate a high-quality, photorealistic image (8K quality)
✓ Use professional photography lighting and composition
✓ Make it look like the same person photographed in a different situation

❌ NEVER change:
- Face shape, facial features, or proportions
- Eye shape, color, or characteristics  
- Skin tone or complexion
- Body type or build
- The person's core identity and appearance

Think: "Same person, same face, same body - just in a new scenario."

Generate a photorealistic, ultra-high-quality image maintaining absolute character consistency.`;

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
                text: generationPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: characterImage
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
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image generated from AI");
    }

    console.log("Character-consistent image generated successfully");

    return new Response(
      JSON.stringify({ generatedImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-character-image function:", error);
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
