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
    const { image, userId, dummyStyle = "standard" } = await req.json();

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

    console.log("Processing dress extraction, userId:", userId || "not provided", "style:", dummyStyle);

    // Define mannequin and background styles
    const DUMMY_STYLES: Record<string, { mannequin: string; background: string }> = {
      "standard": {
        mannequin: `Use a simple, minimal, professional mannequin/dummy:
   - No facial features, no hair, no skin details
   - Clean white or grey mannequin body
   - Position the dress naturally on the mannequin as it would appear in a catalog`,
        background: `Use a clean, professional studio background (light grey or white)`
      },
      "premium-wood": {
        mannequin: `Use a premium, elegant mannequin/dummy:
   - High-end boutique-style mannequin with a sophisticated matte finish
   - Warm beige or champagne-toned mannequin body
   - Elegant posture, professional catalog positioning
   - No facial features, no hair, no skin details`,
        background: `Use a warm, premium wooden background:
   - Rich dark wood paneling or warm walnut wood backdrop
   - Subtle wood grain texture visible
   - Professional boutique or showroom ambiance
   - Soft, warm lighting that complements the wood tones
   - Keep the background realistic and not overly stylized`
      },
      "luxury-marble": {
        mannequin: `Use a luxury, high-fashion mannequin/dummy:
   - Sleek, modern mannequin with a polished, glossy finish
   - Pure white or soft pearl-toned mannequin body
   - Graceful, editorial-style posture
   - No facial features, no hair, no skin details`,
        background: `Use a luxurious marble background:
   - Elegant white or cream marble with subtle grey veining
   - Clean, high-end jewelry store or fashion boutique aesthetic
   - Soft, diffused lighting creating a premium look
   - Polished, reflective floor surface for added luxury feel
   - Keep it realistic and tasteful, not gaudy`
      }
    };

    const selectedStyle = DUMMY_STYLES[dummyStyle] || DUMMY_STYLES["standard"];

    const systemPrompt = `You are an expert clothing extraction and mannequin placement AI. 

CRITICAL MISSION: Extract the EXACT dress from the person and place it on a mannequin with PIXEL-PERFECT ACCURACY.

STEP 1 - ANALYZE THE DRESS IN EXTREME DETAIL:
Before extraction, study and memorize every detail of the clothing:
- EXACT embroidery patterns (peacock motifs, floral designs, paisley, geometric patterns)
- EXACT border designs and their placement (hem borders, sleeve borders, neckline borders)
- EXACT colors including gradients and color transitions
- EXACT fabric texture (silk sheen, velvet texture, chiffon flow, cotton weave)
- EXACT sequin/mirror/stone placements if present
- EXACT thread work including zari/gold thread patterns
- EXACT draping style (how dupatta/pallu is arranged, pleats, gathers)

STEP 2 - EXTRACT WITH 100% FIDELITY:
- Copy EVERY embroidery pattern EXACTLY as it appears - same size, same placement, same colors
- Preserve ALL intricate details: if there are 50 small motifs, include all 50
- Keep the EXACT same border width, pattern repetition, and design elements
- Maintain the EXACT fabric appearance - if it has a silk sheen, keep that sheen
- Preserve ALL color variations and gradients exactly as in original
- Keep the EXACT same proportions and sizing of design elements

STEP 3 - REMOVE ONLY THE PERSON:
- Remove person's body, face, hair, skin completely
- Remove ALL jewelry (necklaces, earrings, bangles, maang tikka, rings)
- Remove ALL accessories not part of the garment
- Keep the dupatta/stole ONLY if it's part of the outfit set

STEP 4 - PLACE ON MANNEQUIN:
${selectedStyle.mannequin}

STEP 5 - BACKGROUND:
${selectedStyle.background}

ABSOLUTE RULES (DO NOT VIOLATE):
1. The extracted dress must be IDENTICAL to the original - NOT similar, NOT inspired by, but IDENTICAL
2. Do NOT simplify any embroidery - every single detail must be preserved
3. Do NOT change any colors - use the EXACT same shades
4. Do NOT alter any patterns - if the border has a specific peacock design, use that EXACT design
5. Do NOT reduce detail for any reason - full resolution, full detail preservation
6. The output must look like the EXACT same garment was physically moved to a mannequin
7. If the original has intricate zari work, the output MUST have the same intricate zari work
8. Match the exact embroidery density - if an area has heavy work, keep it heavy

OUTPUT: A catalog-ready image with the EXACT SAME DRESS in perfect detail on the mannequin.`;

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