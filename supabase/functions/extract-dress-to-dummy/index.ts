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

    const systemPrompt = `You are a MASTER TEXTILE EXPERT and professional garment photographer. Your job is to extract the EXACT garment and display it on a mannequin for e-commerce catalog.

CRITICAL: YOU MUST REPLICATE THE GARMENT WITH 100% CONSTRUCTION ACCURACY.

=== TEXTILE CONSTRUCTION ANALYSIS (STUDY BEFORE EXTRACTING) ===

NECKLINE - This is CRITICAL:
- Identify the EXACT neckline type: V-neck, round neck, square neck, sweetheart, boat neck, halter, etc.
- If it's a V-neck, preserve the EXACT V-shape depth and angle
- If it's a round neck, preserve the EXACT curve radius
- Preserve ANY trim on the neckline: pearl trim, lace trim, piping, embroidery border
- The neckline trim is PART OF THE GARMENT, not a separate accessory

SLEEVES - Study the exact construction:
- Sleeve type: puff sleeves, bishop sleeves, bell sleeves, fitted sleeves, cap sleeves
- Sleeve length: full length, 3/4, elbow length, short
- Cuff style: elastic gathered, button cuff, open hem, ruffle edge
- Any details on sleeves: embroidery, lace, etc.

BODICE - The torso construction:
- Fitted or loose silhouette
- Darts, princess seams, or gathered construction
- Any pleats, tucks, or ruching
- Waistline: natural waist, empire, drop waist

SKIRT/BOTTOM PORTION:
- Gathered, A-line, straight, flared
- Any tiers, ruffles, or layers
- Hem style and length

FABRIC & PRINT:
- Exact print pattern: floral, geometric, abstract
- Print scale and placement
- Fabric type: chiffon, silk, cotton, georgette
- Fabric transparency level
- Fabric drape and flow

=== EXTRACTION RULES ===

1. NECKLINE MUST MATCH EXACTLY:
   - If original has V-neck with pearl/bead trim sewn onto the neckline edge → output MUST have V-neck with pearl/bead trim on the edge
   - Do NOT convert V-neck to round neck
   - Do NOT add a separate necklace when the original has sewn-on neckline trim
   - The trim is PART of the garment construction, not jewelry

2. SLEEVES MUST MATCH EXACTLY:
   - Same puff/volume at shoulder
   - Same length
   - Same cuff style (if elastic gathered, show the gather)

3. WAISTLINE MUST MATCH EXACTLY:
   - Same waist definition
   - If there's a belt or sash attached to garment, include it
   - Same gathering or pleating

4. PRINT MUST MATCH EXACTLY:
   - Same flowers, same colors, same placement
   - Same print scale
   - Same color saturation

=== WHAT TO REMOVE (NOT PART OF GARMENT) ===
- Person's body, face, hands, skin
- Separate jewelry: necklaces worn OVER the garment, earrings, bangles
- Handbags, clutches
- The background

=== WHAT TO KEEP (PART OF GARMENT CONSTRUCTION) ===
- Neckline trim that is SEWN onto the dress edge
- Buttons, zippers, ties that are part of the garment
- Attached belts or sashes
- Embroidery, beadwork, sequins that are ON the fabric

=== MANNEQUIN PLACEMENT ===
${selectedStyle.mannequin}

=== BACKGROUND ===
${selectedStyle.background}

=== FINAL CHECK BEFORE OUTPUT ===
Ask yourself:
1. Is the neckline EXACTLY the same shape? (V vs round vs square)
2. Is the neckline trim/detail in the same position (on the edge vs around the neck)?
3. Are the sleeves the same style and length?
4. Is the waist defined the same way?
5. Is every flower/pattern in the same position?

If ANY answer is NO, you have failed. Redo it.

OUTPUT: A professional catalog photo showing the EXACT SAME GARMENT with identical construction details.`;

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