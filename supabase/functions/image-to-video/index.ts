import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VIDEO_PRESETS: Record<string, string> = {
  "fashion-walk": "Subtle body movement with flowing fabric motion, runway-style elegant walk, cinematic lighting with soft shadows, professional fashion show atmosphere, smooth natural movement",
  "studio-portrait": "Gentle head movement with natural blinking, soft camera push-in zoom, studio lighting with professional backdrop, subtle breathing motion, intimate portrait feel",
  "lifestyle-reel": "Casual natural movement in everyday environment, social media ready content, warm ambient lighting, relaxed authentic motion, lifestyle photography style",
  "product-showcase": "Smooth camera pan around subject, professional focus shift, premium product highlight with elegant motion, studio quality presentation, commercial advertising style",
  "cinematic-mood": "Slow dramatic movement with depth of field, film-style lighting and color grading, atmospheric mood with shadows, professional cinematography, emotional visual storytelling"
};

// Helper function to upload image to storage
async function uploadImageToStorage(
  supabase: any,
  imageData: string,
  folder: string
): Promise<string | null> {
  try {
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const fileName = `${folder}/${crypto.randomUUID()}.png`;
    
    const { data, error } = await supabase.storage
      .from('generation-images')
      .upload(fileName, binaryData, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('generation-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, preset, customPrompt, userId } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    if (!REPLICATE_API_KEY) {
      console.error("REPLICATE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Video generation service is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for storage and logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine the motion prompt
    let motionPrompt = "";
    if (customPrompt && customPrompt.trim()) {
      motionPrompt = customPrompt.trim();
    } else if (preset && VIDEO_PRESETS[preset]) {
      motionPrompt = VIDEO_PRESETS[preset];
    } else {
      motionPrompt = "Subtle natural movement, smooth camera motion, cinematic quality, 5 seconds duration";
    }

    console.log("Starting video generation with prompt:", motionPrompt);

    // Use Stable Video Diffusion model on Replicate
    // This model generates a 5-second video from an image
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        version: "3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
        input: {
          input_image: image,
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          seed: Math.floor(Math.random() * 1000000),
          fps: 6,
          sizing_strategy: "maintain_aspect_ratio"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Video generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await response.json();
    console.log("Prediction created:", prediction.id, prediction.status);

    // If the prediction is still processing, poll for completion
    let result = prediction;
    if (result.status !== "succeeded" && result.status !== "failed") {
      // Poll for up to 5 minutes (video generation can take time)
      const maxAttempts = 60;
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between polls
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            "Authorization": `Bearer ${REPLICATE_API_KEY}`,
          }
        });
        
        if (!pollResponse.ok) {
          console.error("Polling error:", pollResponse.status);
          continue;
        }
        
        result = await pollResponse.json();
        console.log("Poll status:", result.status);
        
        if (result.status === "succeeded" || result.status === "failed") {
          break;
        }
      }
    }

    if (result.status === "failed") {
      console.error("Video generation failed:", result.error);
      return new Response(
        JSON.stringify({ error: "Video generation failed. Please try with a different image." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (result.status !== "succeeded") {
      console.error("Video generation timed out, status:", result.status);
      return new Response(
        JSON.stringify({ error: "Video generation is taking longer than expected. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoUrl = result.output;
    console.log("Video generated successfully:", videoUrl);

    // Upload input image to storage and log generation
    if (userId) {
      try {
        const inputImageUrl = await uploadImageToStorage(supabase, image, 'inputs');
        
        await supabase.rpc('log_generation', {
          p_user_id: userId,
          p_feature_name: 'Image to Video Generator',
          p_input_images: inputImageUrl ? [inputImageUrl] : [],
          p_output_images: videoUrl ? [videoUrl] : []
        });
      } catch (logError) {
        console.error('Error logging generation:', logError);
      }
    }

    return new Response(
      JSON.stringify({ videoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in image-to-video function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
