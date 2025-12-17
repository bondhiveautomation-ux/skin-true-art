import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function uploadImageToStorage(
  supabase: any,
  base64Data: string,
  userId: string,
  prefix: string
): Promise<string | null> {
  try {
    const base64Content = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `${userId}/${prefix}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("generation-images")
      .upload(fileName, bytes, { contentType: "image/png", upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("generation-images").getPublicUrl(fileName);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading to storage:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userImage, dressImageUrl, category, userId } = await req.json();

    if (!userImage) {
      return new Response(
        JSON.stringify({ error: "User image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dressImageUrl) {
      return new Response(
        JSON.stringify({ error: "Dress image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing dress change for category:", category);

    // Build the prompt with strict face/pose preservation
    const prompt = `You are an AI fashion stylist performing a VIRTUAL DRESS CHANGE.

INPUT:
1. PERSON IMAGE: The user's uploaded photo - this person's IDENTITY must be 100% preserved
2. DRESS REFERENCE: A dress/outfit image to apply to the person

ABSOLUTE REQUIREMENTS (NON-NEGOTIABLE):
- Keep the person's face EXACTLY the same - no beautification, no modification of any facial features
- Keep the person's exact pose, body position, and angle - no changes whatsoever
- Keep the person's exact expression - no smile changes, no eye changes, no lip changes
- Keep the person's exact head shape, jawline, nose, eyes, eyebrows, lips - zero modifications
- Keep the person's exact hair style and hair - no changes
- Keep the person's hands exactly as they appear - same position, same fingers
- Keep the exact camera angle and framing from the original photo
- Keep the background exactly as it appears in the original photo

WHAT YOU MUST DO:
- Replace ONLY the clothing/outfit on the person with the dress from the reference image
- Match the dress design, fabric, color, pattern, and style as closely as possible
- Blend the clothing edges naturally with the person's skin and existing elements
- Ensure the dress fits naturally on the person's body proportions
- Maintain original lighting and shadows, adjusting only where the new clothing requires

WHAT YOU MUST NOT DO:
- DO NOT change any facial features - not even subtle beautification
- DO NOT change the person's expression or gaze direction
- DO NOT change the person's pose, posture, or body angle
- DO NOT change the person's hands or their position
- DO NOT add or remove any accessories not present in the original (unless part of the dress)
- DO NOT change the background or lighting style
- DO NOT modify skin texture or skin tone

If you cannot perform this task while preserving 100% of the person's identity, face, and pose, return the original image unchanged and indicate that the transformation failed.

Generate a high-resolution result where the ONLY visible change is the outfit/clothing.`;

    console.log("Calling AI Gateway for dress change...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: userImage },
                },
                {
                  type: "image_url",
                  image_url: { url: dressImageUrl },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits depleted. Please add credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to process image with AI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("AI Gateway response received");

    const generatedImageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          error: "Could not generate the dress change. Please try with a clearer photo.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upload images to storage and log generation if userId provided
    if (userId) {
      try {
        const inputUrl = await uploadImageToStorage(
          supabase,
          userImage,
          userId,
          "dress-change-input"
        );
        const outputUrl = await uploadImageToStorage(
          supabase,
          generatedImageUrl,
          userId,
          "dress-change-output"
        );

        const inputImages = [inputUrl, dressImageUrl].filter(Boolean) as string[];
        const outputImages = outputUrl ? [outputUrl] : [];

        await supabase.rpc("log_generation", {
          p_user_id: userId,
          p_feature_name: "Dress Change Studio",
          p_input_images: inputImages,
          p_output_images: outputImages,
        });

        console.log("Generation logged successfully");
      } catch (logError) {
        console.error("Error logging generation:", logError);
      }
    }

    return new Response(JSON.stringify({ generatedImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in dress-change function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
