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

    console.log("Processing dress extraction, userId:", userId || "not provided");

    const systemPrompt = `You are an expert clothing extraction and mannequin placement AI. Your task is to:

1. DETECT AND ISOLATE: Carefully identify and extract ONLY the clothing/outfit from the person in the image
2. REMOVE COMPLETELY: Remove the person's body, face, hair, skin, and ALL accessories including:
   - Jewelry (necklaces, earrings, rings, bracelets, bangles, watches)
   - Belts, bags, purses, handbags
   - Scarves, shawls, stoles (unless part of the main outfit)
   - Hair accessories, headbands, clips
   - Any other ornaments or accessories
3. EXTRACT EXACT DRESS: Keep the clothing exactly as it appears with:
   - Same design, pattern, and style
   - Same colors and color combinations
   - Same fabric texture and material appearance
   - Same folds, draping, and structure
   - Same embellishments that are part of the clothing (embroidery, sequins on fabric)
4. PLACE ON NEUTRAL MANNEQUIN:
   - Use a simple, minimal, professional mannequin/dummy
   - No facial features, no hair, no skin details
   - Clean white or grey mannequin body
   - Position the dress naturally on the mannequin as it would appear in a catalog
5. BACKGROUND: Use a clean, professional studio background (light grey or white)
6. OUTPUT QUALITY: Generate a high-resolution, catalog-ready image

CRITICAL RULES:
- The dress must be a 1:1 copy of what the person was wearing
- Do NOT redesign, modify, or create a new style
- Do NOT include any body parts, face, or hair
- Do NOT include any jewelry or accessories
- Focus ONLY on the clothing item itself
- Make it look professional and e-commerce ready`;

    console.log('Calling Lovable AI for dress extraction...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
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
    });

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
        JSON.stringify({ error: `AI could not extract the dress: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage and log generation if userId is provided
    if (userId) {
      try {
        let inputStorageUrl: string | null = null;
        let outputStorageUrl: string | null = null;

        // Upload input image to storage
        if (image.startsWith('data:image')) {
          inputStorageUrl = await uploadImageToStorage(supabase, image, userId, 'input_dress_extract');
          console.log("Input image uploaded:", inputStorageUrl ? "success" : "failed");
        } else {
          inputStorageUrl = image;
        }

        if (generatedImageUrl.startsWith('data:image')) {
          outputStorageUrl = await uploadImageToStorage(supabase, generatedImageUrl, userId, 'output_dress_extract');
          console.log("Output image uploaded:", outputStorageUrl ? "success" : "failed");
        }

        const inputImages = inputStorageUrl ? [inputStorageUrl] : [];
        const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

        const { error: logError } = await supabase.rpc('log_generation', {
          p_user_id: userId,
          p_feature_name: 'Dress Extractor',
          p_input_images: inputImages,
          p_output_images: outputImages
        });

        if (logError) {
          console.error("Error logging generation:", logError);
        } else {
          console.log("Generation logged with images:", { inputCount: inputImages.length, outputCount: outputImages.length });
        }
      } catch (logErr) {
        console.error("Error in logging/upload:", logErr);
      }
    }

    return new Response(
      JSON.stringify({ extractedImage: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-dress-to-dummy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});