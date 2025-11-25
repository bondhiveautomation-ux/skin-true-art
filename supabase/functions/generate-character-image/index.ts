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
    const { characterImage, prompt, productImage, preset } = await req.json();
    
    if (!characterImage) {
      throw new Error("No character reference image provided");
    }
    
    if (!prompt && !productImage) {
      throw new Error("No prompt or product provided");
    }

    if (productImage && !preset) {
      throw new Error("Product preset not specified");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating image with character consistency");

    let generationPrompt: string;
    let contentArray: any[];

    if (productImage && preset) {
      // Product integration mode
      console.log("Product integration mode with preset:", preset);
      
      const presetInstructions: Record<string, string> = {
        wearing: "The character is wearing the product naturally and realistically. The product must fit the character's body perfectly with proper draping, fabric physics, and realistic material behavior. Ensure zero distortion, proper sizing, and natural integration with the character's pose and movement.",
        holding: "The character is holding the product in their hands naturally and comfortably. The product must maintain its original shape, size, and proportions. The character's grip and hand position should be natural and realistic, with proper product orientation and scale.",
        showcasing: "The character is positioned beside the product in a clean, professional composition. The product is placed next to the character (not on or being held by them) in a visually appealing arrangement. Both character and product should be clearly visible and well-lit.",
        floating: "The product is displayed artistically floating near the character in a visually striking composition. The product maintains its exact shape and appearance while being highlighted with professional studio lighting. The character and product should complement each other in the frame without physical contact.",
        lifestyle: "The character is naturally interacting with the product in a realistic lifestyle setting. The interaction should look organic and unforced, as if captured in a real moment. The product and character should blend seamlessly into the scene with natural lighting and authentic body language."
      };

      generationPrompt = `YOU ARE A PRODUCT-CHARACTER INTEGRATION SPECIALIST. YOUR JOB IS TO CREATE PHOTOREALISTIC IMAGES COMBINING A SPECIFIC CHARACTER WITH A PRODUCT.

🚨 ABSOLUTE CHARACTER CONSISTENCY REQUIREMENTS:

ANALYZE THIS CHARACTER IMAGE AND MEMORIZE EVERY DETAIL:
- Face shape, structure, and proportions (MUST BE IDENTICAL)
- Eye shape, color, size, spacing, and expression (MUST BE IDENTICAL)
- Nose shape, size, and bridge (MUST BE IDENTICAL)
- Mouth, lips shape, size, and natural expression (MUST BE IDENTICAL)
- Skin tone, texture, and any distinctive marks (MUST BE IDENTICAL)
- Hair color, style, texture, and length (MUST BE IDENTICAL)
- Body type, build, proportions, and posture (MUST BE IDENTICAL)
- Age appearance and overall facial features (MUST BE IDENTICAL)

🎯 PRODUCT INTEGRATION REQUIREMENTS:

ANALYZE THE PRODUCT IMAGE AND PRESERVE:
- Product shape, design, and structure (MUST BE IDENTICAL)
- Product colors, patterns, and textures (MUST BE IDENTICAL)
- Product size and proportions (MUST BE REALISTIC AND ACCURATE)
- Product details like logos, embroidery, prints (MUST BE CLEAR AND INTACT)
- Material appearance (fabric, metal, leather, etc. MUST LOOK AUTHENTIC)

📸 STYLING PRESET: ${preset.toUpperCase()}
${presetInstructions[preset]}

🚨 CRITICAL QUALITY RULES:
✓ The character's face and body MUST be 100% identical to the reference
✓ The product MUST maintain its exact design, colors, and details
✓ NO distortions, warping, or unnatural proportions
✓ NO mismatches in scale, perspective, or physics
✓ NO style inconsistencies between character and product
✓ Generate ultra-high-quality, photorealistic output (8K quality)
✓ Use professional photography lighting and composition
✓ Make it look like a real photoshoot with this exact character and product

❌ ABSOLUTELY FORBIDDEN:
- Changing the character's face, body, or identity
- Altering the product's design, shape, or colors
- Creating unrealistic proportions or physics violations
- Adding unwanted elements or modifications
- Producing low-quality or artificial-looking results

Generate a flawless, natural, and cohesive image that looks like a real professional photoshoot.`;

      contentArray = [
        { type: "text", text: generationPrompt },
        { type: "image_url", image_url: { url: characterImage } },
        { type: "image_url", image_url: { url: productImage } }
      ];
    } else {
      // Standard scenario generation mode
      console.log("Standard scenario generation for prompt:", prompt);
      
      generationPrompt = `YOU ARE A CHARACTER-CONSISTENT IMAGE GENERATOR. YOUR ONLY JOB IS TO CREATE A NEW IMAGE WITH THE EXACT SAME CHARACTER.

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

      contentArray = [
        { type: "text", text: generationPrompt },
        { type: "image_url", image_url: { url: characterImage } }
      ];
    }

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
            content: contentArray
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
    console.log("AI response data:", JSON.stringify(data, null, 2));
    
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in AI response. Full response:", JSON.stringify(data, null, 2));
      
      // Check if there's an error message from the AI
      const errorMessage = data.error?.message || data.choices?.[0]?.message?.content || "No image generated";
      
      return new Response(
        JSON.stringify({ 
          error: `Image generation failed: ${errorMessage}. This may be due to content policy restrictions. Please try a different prompt or scenario.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
