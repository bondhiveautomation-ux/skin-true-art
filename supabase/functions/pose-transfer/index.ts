import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { influencerImage, poseReferenceImage } = await req.json();

    if (!influencerImage) {
      return new Response(
        JSON.stringify({ error: "Missing influencer image" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!poseReferenceImage) {
      return new Response(
        JSON.stringify({ error: "Missing pose reference image" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Processing pose transfer request...");

    const poseTransferPrompt = `TASK: Generate a new image of the person from IMAGE 1 in the exact body pose from IMAGE 2.

STEP 1 - ANALYZE IMAGE 1 (Main Subject):
Memorize every detail: face, hair, skin tone, body shape, clothing, accessories, makeup, background, lighting.

STEP 2 - ANALYZE IMAGE 2 (Pose Reference):
Extract ONLY the body pose: how arms are positioned, how legs are positioned, body angle, head tilt, shoulder position, hand placement.

STEP 3 - GENERATE NEW IMAGE:
Create the person from IMAGE 1 with:
✓ SAME face (identical features, expression style)
✓ SAME body proportions and shape
✓ SAME clothing (exact outfit, colors, patterns, textures)
✓ SAME background (environment, colors, elements)
✓ SAME lighting style and mood
✓ SAME accessories, jewelry, makeup
✓ NEW pose matching IMAGE 2's body position

FORBIDDEN:
✗ Do NOT use face from IMAGE 2
✗ Do NOT use clothing from IMAGE 2
✗ Do NOT use background from IMAGE 2
✗ Do NOT blend or morph features
✗ Do NOT create ghosting or double limbs
✗ Do NOT change the person's identity

The output must look like a professional photograph of the same person who simply moved into a different pose.`;

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
                text: poseTransferPrompt
              },
              {
                type: "text",
                text: "IMAGE 1 - INFLUENCER PHOTO (keep face, body, outfit, background from this):"
              },
              {
                type: "image_url",
                image_url: {
                  url: influencerImage
                }
              },
              {
                type: "text",
                text: "IMAGE 2 - POSE REFERENCE (use ONLY the pose/body position from this):"
              },
              {
                type: "image_url",
                image_url: {
                  url: poseReferenceImage
                }
              },
              {
                type: "text",
                text: "Now generate the influencer from Image 1 in the exact pose from Image 2. Keep everything from Image 1 except apply the pose from Image 2."
              }
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
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits depleted. Please add credits to continue." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to process pose transfer" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. The AI may have blocked the request due to content filters." }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ generatedImageUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Pose transfer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
