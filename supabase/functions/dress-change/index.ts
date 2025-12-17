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

    // Build the prompt with strict orientation and face/pose preservation
    const prompt = `VIRTUAL CLOTHING SWAP TASK

I am providing two images:
- IMAGE 1 (PERSON): A photo of a person - this is the BASE image
- IMAGE 2 (DRESS): A dress/outfit reference

YOUR TASK: Create a new image showing the person from IMAGE 1 wearing the outfit from IMAGE 2.

CRITICAL REQUIREMENTS:
1. ORIENTATION: The output MUST have EXACTLY the same orientation as IMAGE 1. If the person is upright in IMAGE 1, they must be upright in output. DO NOT ROTATE THE IMAGE IN ANY DIRECTION.
2. FACE: Keep 100% identical - same features, expression, angle
3. POSE: Keep 100% identical - same body position, arms, hands
4. BACKGROUND: Keep 100% identical to IMAGE 1
5. CLOTHING: Replace only the visible clothing with the outfit design from IMAGE 2

The output image orientation and rotation must EXACTLY match IMAGE 1. This is the most important requirement.`;

    console.log("Calling AI Gateway for dress change with gemini-3-pro-image-preview...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
