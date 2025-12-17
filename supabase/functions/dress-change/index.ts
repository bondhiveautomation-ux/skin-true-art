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
    const prompt = `TASK: Virtual clothing swap. Replace the clothing on the person in Image 1 with the outfit shown in Image 2.

CRITICAL INSTRUCTIONS:
1. OUTPUT IMAGE MUST have the EXACT SAME orientation, rotation, and framing as Image 1 (the person photo). DO NOT rotate the image.
2. The person's face must remain COMPLETELY UNCHANGED - same features, expression, angle, and position.
3. The person's pose must remain COMPLETELY UNCHANGED - same body position, arm positions, hand positions.
4. The background must remain COMPLETELY UNCHANGED - same as Image 1.
5. ONLY replace the clothing/outfit with the design from Image 2.

STEP BY STEP:
- Start with Image 1 (person photo) as the base
- Keep everything from Image 1 except the clothing
- Replace only the visible clothing with the outfit design from Image 2
- Blend the new clothing naturally onto the person's body
- Maintain the same lighting and shadows

DO NOT:
- Rotate or flip the image
- Change facial features or expression
- Change body pose or hand positions
- Change the background
- Add or remove accessories not in the original

Generate a high-quality image showing the person from Image 1 wearing the outfit from Image 2, with identical orientation and framing as Image 1.`;

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
