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

    // We treat IMAGE 2 as the immutable base and perform an EDIT:
    // replace ONLY the face with the identity from IMAGE 1.
    const fullLookTransferPrompt = `You are an expert photo editor.

GOAL (FACE KEEP): Edit IMAGE 2 by replacing ONLY the face with the face/identity from IMAGE 1.

HARD RULES (must follow):
- IMAGE 2 is the BASE. Keep EVERYTHING from IMAGE 2 pixel-consistent:
  outfit/dress, jewelry, body shape, pose, background, lighting, color grading, camera framing, hair from IMAGE 2.
- Replace ONLY the face area (forehead/eyes/nose/mouth/cheeks/chin) with the identity from IMAGE 1.
- The final face must be 100% recognizable as IMAGE 1 (identity preservation).
- Match IMAGE 2 lighting on the inserted face (shadows/highlights/white balance) so it blends naturally.
- NO double face, NO ghosting, NO seams at jaw/neck.

CRITICAL VALIDATION:
- Do NOT return IMAGE 2 unchanged.
- If you cannot perform the face replacement, you must FAIL (do not output an unchanged image).

Output: generate the final edited image.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // "Nano banana" image model tends to behave better for image edits.
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: fullLookTransferPrompt },
              { type: "text", text: "IMAGE 1 (use ONLY this face/identity):" },
              { type: "image_url", image_url: { url: influencerFaceImage } },
              { type: "text", text: "IMAGE 2 (BASE image — keep everything except the face):" },
              { type: "image_url", image_url: { url: referenceLookImage } },
              {
                type: "text",
                text: "Now output the edited IMAGE 2 with the face replaced by IMAGE 1 (everything else identical to IMAGE 2).",
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
        JSON.stringify({ error: "Failed to process full look transfer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received for full look transfer");

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    // Some models can (rarely) echo back the base input image; treat that as failure.
    if (generatedImageUrl && generatedImageUrl === referenceLookImage) {
      console.error("Model returned reference image unchanged");
      return new Response(
        JSON.stringify({ error: "The model returned the reference image unchanged. Please try a clearer face photo or a different reference look." }),
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
    console.error('Full look transfer error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
