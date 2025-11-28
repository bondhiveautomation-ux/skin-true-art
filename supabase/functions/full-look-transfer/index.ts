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
    const { influencerFaceImage, referenceLookImage } = await req.json();

    if (!influencerFaceImage) {
      return new Response(
        JSON.stringify({ error: "Missing influencer face image" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!referenceLookImage) {
      return new Response(
        JSON.stringify({ error: "Missing reference look image" }),
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

    console.log("Processing full look transfer request...");

    const fullLookTransferPrompt = `TASK: Create a seamless face swap - place the face from IMAGE 1 onto the person in IMAGE 2, keeping everything else from IMAGE 2.

STEP 1 - ANALYZE IMAGE 1 (Influencer Face):
Study and memorize every facial detail:
- Face shape, jawline, chin structure
- Eyes (shape, color, spacing, eyelids)
- Nose (shape, bridge, nostrils)
- Lips (shape, fullness, color)
- Eyebrows (shape, thickness, arch)
- Skin tone and texture
- Facial expression nuances
- Any unique facial features or marks

STEP 2 - ANALYZE IMAGE 2 (Reference Look - Full Template):
This is your BASE IMAGE. Keep EVERYTHING from this image:
- Exact outfit/dress/saree (every fold, pattern, color, texture)
- All jewelry and ornaments (necklace, earrings, bangles, maang tikka, nose ring)
- Exact body pose and posture
- Hand positions and gestures
- Background and location (every detail)
- Lighting setup and color grading
- Overall composition and framing
- Hair styling (from Image 2)

STEP 3 - GENERATE THE FINAL IMAGE:
Create a new image where:
✓ The FACE is from IMAGE 1 (influencer's exact face, features, identity)
✓ EVERYTHING ELSE is from IMAGE 2:
  - Same dress/outfit with identical details
  - Same jewelry and accessories
  - Same pose and body position
  - Same background and location
  - Same lighting and mood
  - Same hair styling from Image 2
✓ Face must be seamlessly blended:
  - Match skin tone to Image 2's lighting
  - Natural neck and jawline transition
  - Consistent shadow and highlight placement
  - No visible seams or edges

CRITICAL REQUIREMENTS:
✓ Face identity must be 100% recognizable as the person from IMAGE 1
✓ Dress, ornaments, pose, location must be exactly as in IMAGE 2
✓ Seamless blending at neck/jawline area
✓ Lighting on face matches the scene from IMAGE 2
✓ High-resolution, professional quality output

FORBIDDEN:
✗ Do NOT change or mix facial features between images
✗ Do NOT alter the outfit, jewelry, or accessories from IMAGE 2
✗ Do NOT change the background or location from IMAGE 2
✗ Do NOT create ghosting, double features, or artifacts
✗ Do NOT distort body proportions
✗ Do NOT create unnatural skin tone transitions

The output must look like a professional photograph where the influencer from Image 1 is actually wearing the exact look and standing in the exact location shown in Image 2.`;

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
                text: fullLookTransferPrompt
              },
              {
                type: "text",
                text: "IMAGE 1 - INFLUENCER FACE (use ONLY the face/identity from this):"
              },
              {
                type: "image_url",
                image_url: { url: influencerFaceImage }
              },
              {
                type: "text",
                text: "IMAGE 2 - REFERENCE LOOK (use dress, ornaments, pose, background, lighting from this - replace only the face):"
              },
              {
                type: "image_url",
                image_url: { url: referenceLookImage }
              },
              {
                type: "text",
                text: "Now generate the final image: Place the influencer's face from Image 1 onto the person in Image 2, keeping all outfit, jewelry, pose, and background from Image 2. Blend seamlessly."
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
        JSON.stringify({ error: "Failed to process full look transfer" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("AI response received for full look transfer");

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
    console.error('Full look transfer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
