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
    const { sourceImage, targetImage, userId } = await req.json();

    if (!sourceImage) {
      return new Response(
        JSON.stringify({ error: "Missing source face image" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetImage) {
      return new Response(
        JSON.stringify({ error: "Missing target image" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "Service not configured. Please contact support." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing face swap request...");

    const faceSwapPrompt = `You are a photorealistic face identity transfer specialist.

TASK: Transfer ONLY the facial identity (who the person is) from IMAGE 1 onto IMAGE 2, while keeping EVERYTHING else from IMAGE 2 completely unchanged.

WHAT TO TRANSFER FROM IMAGE 1 (influencer):
- Facial bone structure and shape
- Skin texture and complexion
- Eye color and shape
- Nose shape
- Lip shape
- Distinctive facial features that identify this person

WHAT MUST STAY EXACTLY THE SAME FROM IMAGE 2 (reference) - DO NOT CHANGE:
- Facial EXPRESSION (smile, serious, pout, etc.)
- Eye direction and gaze
- Mouth position (open, closed, smiling angle)
- Head tilt and angle
- Camera perspective and framing
- Lighting direction and intensity
- Makeup style and application
- Hair (color, style, accessories like maang tikka, jhumar)
- Jewelry (earrings, necklace, nose ring)
- Bindi/tikka placement
- Background (every pixel)
- Clothing/outfit
- Body pose
- Overall image quality and style (professional or not)

CRITICAL RULES:
1. The result must look like IMAGE 1's PERSON but with IMAGE 2's EXPRESSION and POSE
2. If IMAGE 2 has a serious expression, keep it serious - do NOT make it smile
3. If IMAGE 2 is looking left, keep looking left
4. Do NOT improve, enhance, or "fix" the image quality
5. Do NOT change the mood or feeling of the photo
6. The swapped face must blend naturally with the exact lighting from IMAGE 2

OUTPUT: Generate the face-swapped image.`;

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
              { type: "text", text: "IMAGE 1 (Source Face - use this face):" },
              { type: "image_url", image_url: { url: sourceImage } },
              { type: "text", text: "IMAGE 2 (Target - keep everything except the face):" },
              { type: "image_url", image_url: { url: targetImage } },
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
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service credits exhausted. Please try again later." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to process face swap. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received for face swap");

    // Check for error payload in 200 response
    if (data?.error) {
      console.error("AI gateway error payload:", JSON.stringify(data));
      const msg = typeof data.error?.message === "string" ? data.error.message : "AI service temporarily unavailable";
      return new Response(
        JSON.stringify({ error: msg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (generatedImageUrl && generatedImageUrl === targetImage) {
      console.error("Model returned reference image unchanged");
      return new Response(
        JSON.stringify({ error: "Face swap failed. Please try a clearer face photo or different reference image." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No image was generated. The AI may have blocked the request due to content filters." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
