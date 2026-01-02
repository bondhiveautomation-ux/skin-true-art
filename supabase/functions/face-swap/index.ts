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
    const { influencerImage, referenceImage } = await req.json();

    if (!influencerImage) {
      return new Response(
        JSON.stringify({ error: "Missing influencer image" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!referenceImage) {
      return new Response(
        JSON.stringify({ error: "Missing reference image" }),
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

    console.log("Processing face swap request...");

    const faceSwapPrompt = `You are an expert photo editor specializing in face swapping.

GOAL: Swap the face from IMAGE 1 (influencer) onto IMAGE 2 (reference), keeping everything else from IMAGE 2 exactly the same.

STRICT RULES:
- IMAGE 2 is the BASE. Keep EVERYTHING from IMAGE 2 pixel-perfect:
  • Background (every element)
  • Outfit/clothing/dress
  • Jewelry and accessories
  • Body pose and position
  • Hair styling and color from IMAGE 2
  • Lighting and color grading
  • Camera angle and framing

- Replace ONLY the face area (eyes, nose, mouth, cheeks, forehead, chin) with the face from IMAGE 1.
- The final face must be 100% recognizable as the person in IMAGE 1.
- Match the lighting from IMAGE 2 onto the swapped face for natural blending.
- NO double faces, NO ghosting, NO visible seams at the edges.

CRITICAL:
- Do NOT return IMAGE 2 unchanged.
- Do NOT alter the background, clothing, or any non-face elements.
- If the face swap cannot be performed cleanly, return an error.

Output: Generate the final image with the face swap applied.`;

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
              { type: "text", text: faceSwapPrompt },
              { type: "text", text: "IMAGE 1 (Influencer - use this face):" },
              { type: "image_url", image_url: { url: influencerImage } },
              { type: "text", text: "IMAGE 2 (Reference - keep everything except the face):" },
              { type: "image_url", image_url: { url: referenceImage } },
              {
                type: "text",
                text: "Now generate the face-swapped result where IMAGE 2 has the face from IMAGE 1.",
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to process face swap" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received for face swap");

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (generatedImageUrl && generatedImageUrl === referenceImage) {
      console.error("Model returned reference image unchanged");
      return new Response(
        JSON.stringify({ error: "Face swap failed. Please try a clearer face photo or different reference image." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. The AI may have blocked the request due to content filters." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Face swap error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
