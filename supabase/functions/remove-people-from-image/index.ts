import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to upload base64 image to Supabase storage
async function uploadImageToStorage(
  supabase: any,
  base64Data: string,
  userId: string,
  prefix: string
): Promise<string | null> {
  try {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;
    
    const extension = matches[1];
    const base64Content = matches[2];
    const buffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    const fileName = `${userId}/${prefix}_${Date.now()}.${extension}`;
    
    const { error } = await supabase.storage
      .from('generation-images')
      .upload(fileName, buffer, {
        contentType: `image/${extension}`,
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
    console.error("Error uploading to storage:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, userId } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing background saver, userId:", userId || "not provided");

    const systemPrompt = `You are an expert AI image editor specializing in people removal and background preservation. Your task is to:

🎯 PRIMARY OBJECTIVE:
Remove ALL people (humans, persons) from this image completely while keeping the background 100% intact and natural.

🚨 CRITICAL REQUIREMENTS FOR PEOPLE REMOVAL:
1. DETECT ALL PEOPLE: Identify every person in the image, whether they are:
   - In the foreground, middle ground, or background
   - Fully visible, partially visible, or partially obscured
   - Adults, children, babies, or any human figures
   - Standing, sitting, lying down, or in any pose

2. COMPLETE REMOVAL: Remove people entirely including:
   - Their entire body, face, hair, and all body parts
   - All clothing, accessories, and items they're wearing or holding
   - Their shadows and reflections
   - Any part of them, no matter how small

3. INTELLIGENT INPAINTING: Fill in the areas where people were removed by:
   - Analyzing the surrounding background patterns, textures, and colors
   - Seamlessly extending the background into the empty areas
   - Maintaining perspective, lighting, and depth
   - Ensuring natural-looking transitions with no visible seams or patches
   - Preserving the original scene's atmosphere and mood

🎨 BACKGROUND PRESERVATION REQUIREMENTS:
✓ Keep ALL background elements EXACTLY as they are:
  - Buildings, walls, furniture, objects, plants, trees, nature
  - Floor patterns, ground textures, sky, clouds, water
  - Lighting conditions, shadows (except those cast by people), reflections
  - Colors, color gradients, and color temperature
  - Perspective, depth, and spatial relationships
  - Any animals, vehicles, or non-human objects

✓ Maintain ORIGINAL qualities:
  - Image resolution and sharpness
  - Color saturation and tone
  - Contrast and brightness levels
  - Texture details and fine elements
  - Original aspect ratio

❌ ABSOLUTELY FORBIDDEN:
- DO NOT remove, modify, or alter ANY background objects or elements
- DO NOT change the lighting style, time of day, or mood
- DO NOT add new objects, people, or elements that weren't there
- DO NOT create unrealistic patches, blurs, or distortions
- DO NOT leave visible outlines, edges, or artifacts where people were
- DO NOT change colors, textures, or patterns of the background
- DO NOT warp, stretch, or distort the perspective

📸 QUALITY STANDARDS:
✓ The final image must look like a completely natural photograph
✓ No one should be able to tell that people were removed
✓ The scene should look authentic, not AI-edited
✓ All inpainted areas must blend seamlessly with the original background
✓ High resolution and sharp details throughout
✓ Professional, realistic, and artifact-free output

Generate a clean, people-free version of this image where the background remains perfectly intact and the inpainted areas look completely natural.`;

    console.log('Calling Lovable AI for people removal...');
    
    // Add timeout to AI request (60 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    let aiResponse: Response;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: systemPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          modalities: ['image', 'text']
        }),
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timed out. Please try again with a smaller image.' }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    const generatedImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error('No image in AI response:', JSON.stringify(aiData, null, 2));
      const errorMessage = aiData.choices?.[0]?.message?.content || 'No image generated';
      return new Response(
        JSON.stringify({ error: `AI could not process the image: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the result immediately, don't wait for storage uploads
    // Storage uploads happen in the background (fire and forget) to prevent timeouts
    if (userId) {
      // Non-blocking background task - don't await
      (async () => {
        try {
          let inputStorageUrl: string | null = null;
          let outputStorageUrl: string | null = null;

          // Upload input image to storage with timeout
          if (image.startsWith('data:image')) {
            inputStorageUrl = await Promise.race([
              uploadImageToStorage(supabase, image, userId, 'input_bg_saver'),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            ]);
            console.log("Input image uploaded:", inputStorageUrl ? "success" : "skipped/failed");
          } else {
            inputStorageUrl = image;
          }

          if (generatedImageUrl.startsWith('data:image')) {
            outputStorageUrl = await Promise.race([
              uploadImageToStorage(supabase, generatedImageUrl, userId, 'output_bg_saver'),
              new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
            ]);
            console.log("Output image uploaded:", outputStorageUrl ? "success" : "skipped/failed");
          }

          const inputImages = inputStorageUrl ? [inputStorageUrl] : [];
          const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

          await supabase.rpc('log_generation', {
            p_user_id: userId,
            p_feature_name: 'Background Saver',
            p_input_images: inputImages,
            p_output_images: outputImages
          });
        } catch (logErr) {
          console.error("Background logging error (non-blocking):", logErr);
        }
      })();
    }

    return new Response(
      JSON.stringify({ cleanBackground: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in remove-people-from-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});