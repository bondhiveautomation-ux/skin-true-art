import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to upload video to Supabase storage
async function uploadVideoToStorage(
  supabase: any,
  videoUrl: string,
  userId: string,
  prefix: string
): Promise<string | null> {
  try {
    // Fetch the video from the URL
    const response = await fetch(videoUrl);
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    const fileName = `${userId}/${prefix}_${Date.now()}.mp4`;
    
    const { error } = await supabase.storage
      .from('generation-images')
      .upload(fileName, new Uint8Array(buffer), {
        contentType: 'video/mp4',
        upsert: false
      });
    
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('generation-images')
      .getPublicUrl(fileName);
    
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error("Error uploading video to storage:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      startingImage, 
      aspectRatio = "16:9",
      cameraMotion = "none",
      videoPreset = "cinematic",
      userId 
    } = await req.json();

    if (!prompt && !startingImage) {
      return new Response(
        JSON.stringify({ error: "Please provide a prompt or starting image" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: "Video service not configured. Please contact support." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing video generation request with Kling v2.1 Master...", { 
      hasPrompt: !!prompt, 
      hasImage: !!startingImage, 
      aspectRatio,
      cameraMotion,
      videoPreset,
      userId 
    });

    // Build enhanced prompt based on preset
    let enhancedPrompt = prompt || "Animate this image with subtle, cinematic motion";
    
    const presetEnhancements: Record<string, string> = {
      cinematic: "cinematic quality, professional cinematography, smooth motion, film grain, dramatic lighting",
      commercial: "professional commercial footage, polished look, advertising quality, clean motion",
      social: "dynamic social media content, eye-catching, vibrant, engaging motion",
      artistic: "artistic experimental footage, creative camera work, unique visual style",
      documentary: "documentary style, natural movement, authentic feel, journalistic quality",
      fashion: "high fashion editorial, elegant movement, luxury aesthetic, runway quality",
      product: "product showcase, smooth rotation, professional lighting, 3D-like presentation",
      nature: "nature documentary quality, organic movement, serene atmosphere, wildlife cinematography"
    };

    if (presetEnhancements[videoPreset]) {
      enhancedPrompt = `${enhancedPrompt}. Style: ${presetEnhancements[videoPreset]}`;
    }

    // Add camera motion instructions
    const cameraMotionMap: Record<string, string> = {
      none: "",
      static: "Camera: completely static, no camera movement",
      pan_left: "Camera: smooth cinematic pan from right to left",
      pan_right: "Camera: smooth cinematic pan from left to right",
      tilt_up: "Camera: smooth upward tilt revealing the scene",
      tilt_down: "Camera: smooth downward tilt",
      zoom_in: "Camera: slow deliberate zoom in",
      zoom_out: "Camera: slow zoom out revealing more of the scene",
      dolly_in: "Camera: dolly forward movement approaching subject",
      orbit: "Camera: orbital motion around the subject",
      crane_up: "Camera: crane shot rising upward"
    };

    if (cameraMotionMap[cameraMotion]) {
      enhancedPrompt = `${enhancedPrompt}. ${cameraMotionMap[cameraMotion]}`;
    }

    // Prepare the input for Kling v2.1 Master
    const input: Record<string, any> = {
      prompt: enhancedPrompt,
      duration: 5, // Kling supports 5 or 10 seconds
      aspect_ratio: aspectRatio,
      negative_prompt: "blurry, distorted, low quality, watermark, text overlay, flickering, jittery, artifacts, glitchy"
    };

    // If starting image is provided (image-to-video)
    if (startingImage) {
      input.image = startingImage;
    }

    console.log("Calling Replicate API with Kling v2.1 Master model...");

    // Start the prediction with Kling v2.1 Master (supports both text-to-video and image-to-video)
    const predictionResponse = await fetch("https://api.replicate.com/v1/models/kwaivgi/kling-v2.1-master/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({ input })
    });

    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.error("Replicate API error:", predictionResponse.status, errorText);

      if (predictionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (predictionResponse.status === 402 || predictionResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted or invalid key. Please check configuration." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Video generation failed. Please try again." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prediction = await predictionResponse.json();
    console.log("Initial prediction response:", prediction.status);

    // Poll for completion if not using "Prefer: wait" or if still processing
    let attempts = 0;
    const maxAttempts = 120; // 5 minutes max (2.5 seconds per poll)
    
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          "Authorization": `Bearer ${REPLICATE_API_KEY}`
        }
      });
      
      prediction = await statusResponse.json();
      attempts++;
      
      if (attempts % 10 === 0) {
        console.log(`Polling attempt ${attempts}: status = ${prediction.status}`);
      }
    }

    if (prediction.status === "failed") {
      console.error("Video generation failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: prediction.error || "Video generation failed. Try a different prompt." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prediction.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Video generation timed out. Please try again with a simpler prompt." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Kling v2.1 returns the video URL directly
    const videoUrl = prediction.output;
    
    if (!videoUrl) {
      console.error("No video URL in response:", prediction);
      return new Response(
        JSON.stringify({ error: "No video was generated. Please try again." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Video generated successfully with Kling v2.1:", videoUrl);

    // Save video and log generation if userId is provided
    if (userId) {
      const inputUrls: string[] = [];
      
      if (startingImage && startingImage.startsWith('http')) {
        inputUrls.push(startingImage);
      }

      // Upload video to storage
      const storedVideoUrl = await uploadVideoToStorage(supabase, videoUrl, userId, 'output_video');
      const outputUrls = storedVideoUrl ? [storedVideoUrl] : [videoUrl];

      const { error: logError } = await supabase.rpc('log_generation', {
        p_user_id: userId,
        p_feature_name: 'Videography Studio',
        p_input_images: inputUrls,
        p_output_images: outputUrls
      });

      if (logError) {
        console.error("Error logging generation:", logError);
      } else {
        console.log("Generation logged successfully");
      }
    }

    return new Response(
      JSON.stringify({ generatedVideoUrl: videoUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
