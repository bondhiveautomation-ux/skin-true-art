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
    const { image, userId, dummyStyle = "standard", extractionType = "single-full", correctionFeedback } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Service not configured. Please contact support.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing dress extraction, userId:", userId || "not provided", "style:", dummyStyle, "extractionType:", extractionType, "hasCorrectionFeedback:", !!correctionFeedback);

    // Define mannequin instructions based on extraction type
    const MANNEQUIN_TYPES: Record<string, string> = {
      "single-upper": `UPPER BODY MANNEQUIN ONLY:
   - Show ONLY the upper body mannequin (torso, arms, hands)
   - The mannequin should be CUT OFF at the waist/hip area - NO LEGS
   - This is for tops, blouses, shirts, kurtas worn only on upper body
   - Arms must be visible in a natural pose
   - Hands must be visible and complete
   - The bottom edge of the mannequin/image should end where the garment ends
   - DO NOT show a naked mannequin below the garment - CUT THE MANNEQUIN OFF
   - Think: bust form / upper torso display stand`,
      
      "single-full": `FULL-BODY MANNEQUIN:
   - Show the COMPLETE full-body mannequin from head/neck to floor
   - Both arms must be visible in a natural, elegant pose
   - Both hands must be visible and complete
   - Legs should be visible and properly proportioned
   - The mannequin must show the ENTIRE garment - from top to bottom hem
   - Position the dress naturally on the mannequin as in a catalog`,
      
      "couple": `TWO SEPARATE MANNEQUINS SIDE BY SIDE:
   - There are TWO PEOPLE in the input image - extract BOTH outfits
   - Show TWO mannequins side by side
   - Each mannequin displays ONE outfit from the image
   - Both mannequins should be full-body with visible arms and hands
   - Position them symmetrically in the frame
   - Ensure BOTH garments are equally prominent and well-lit
   - If one is male and one is female outfit, use appropriate mannequin styles`
    };

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
      },
      "royal-velvet": {
        mannequin: `Use a regal, high-fashion mannequin/dummy:
   - Mannequin with a smooth, matte champagne or rose-gold finish
   - Elegant, statuesque posture befitting royalty
   - No facial features, no hair, no skin details`,
        background: `Use a luxurious royal velvet background:
   - Deep burgundy, royal purple, or midnight blue velvet draping
   - Rich, plush fabric texture visible with subtle folds
   - Warm, golden ambient lighting creating a regal atmosphere
   - Hints of ornate gold trim or subtle crown molding at edges
   - Evokes palace, royal chamber, or high-end bridal boutique ambiance
   - Dramatic yet elegant, suitable for wedding and luxury fashion`
      },
      "garden-elegance": {
        mannequin: `Use an ethereal, romantic mannequin/dummy:
   - Mannequin with a soft matte ivory or blush-toned finish
   - Feminine, gentle posture with elegant lines
   - No facial features, no hair, no skin details`,
        background: `Use a dreamy garden/nature background:
   - Soft-focus floral garden with blooming roses, peonies, or cherry blossoms
   - Lush greenery with gentle bokeh effect in the background
   - Golden hour or soft morning light filtering through
   - Romantic, whimsical atmosphere perfect for bridal and occasion wear
   - Natural outdoor elegance - think luxury garden wedding venue
   - Butterflies or petals gently floating optional for magical touch`
      },
      "modern-minimal": {
        mannequin: `Use a sleek, contemporary mannequin/dummy:
   - Ultra-modern mannequin with a smooth matte black or charcoal finish
   - Sharp, geometric posture with clean lines
   - No facial features, no hair, no skin details`,
        background: `Use a sophisticated modern minimal background:
   - Clean concrete or smooth grey textured wall
   - Subtle architectural elements - geometric shadows, clean lines
   - Industrial-chic with soft directional lighting
   - Minimalist aesthetic - less is more philosophy
   - High-fashion editorial vibe, suitable for contemporary designers
   - Shadow play creating visual interest without distraction`
      }
    };

    const selectedStyle = DUMMY_STYLES[dummyStyle] || DUMMY_STYLES["standard"];
    const mannequinType = MANNEQUIN_TYPES[extractionType] || MANNEQUIN_TYPES["single-full"];

    // Build correction section if there's feedback from previous inspection
    const correctionSection = correctionFeedback ? `

=== ⚠️ CRITICAL CORRECTION REQUIRED ⚠️ ===

A previous generation was REJECTED because: "${correctionFeedback}"

YOU MUST FIX THIS SPECIFIC ISSUE. This is your TOP PRIORITY.
Pay extra attention to whatever was wrong and make sure it is CORRECT this time.

` : "";

    const systemPrompt = `You are the WORLD'S MOST PRECISE garment extraction AI. Your work is used by professional fashion brands where ACCURACY IS EVERYTHING.
${correctionSection}

=== 🚨🚨🚨 ABSOLUTE ZERO-TOLERANCE GARMENT PRESERVATION LAW 🚨🚨🚨 ===

THE DRESS/GARMENT IN YOUR OUTPUT MUST BE A PIXEL-PERFECT, FORENSIC-LEVEL EXACT COPY OF THE INPUT.

You are a HIGH-PRECISION SCANNER, not a designer. You COPY, you do NOT create or interpret.

INSTANT REJECTION IF ANY OF THESE OCCUR:
❌ Color changed even 1% - REJECTED
❌ Pattern/print altered in any way - REJECTED  
❌ Neckline shape different - REJECTED
❌ Sleeve style modified - REJECTED
❌ Any design element added that wasn't there - REJECTED
❌ Any design element removed that was there - REJECTED
❌ Fabric texture looks different - REJECTED
❌ Embroidery/beadwork pattern changed - REJECTED
❌ Silhouette/cut modified - REJECTED
❌ Length changed - REJECTED

THE GARMENT MUST BE 100% IDENTICAL. Period. No exceptions. No "improvements". No "enhancements".

=== MANNEQUIN TYPE FOR THIS REQUEST ===
${mannequinType}

=== MANNEQUIN STYLE ===
${selectedStyle.mannequin}

=== BACKGROUND ===
${selectedStyle.background}

=== FORENSIC GARMENT ANALYSIS PROTOCOL ===

Before generating, you MUST mentally analyze these elements and ensure EXACT replication:

1. NECKLINE:
   - What exact shape? (V, round, square, sweetheart, boat, off-shoulder, high neck, halter)
   - What exact depth? (Shallow, medium, deep)
   - Any collar or border details?
   OUTPUT MUST MATCH EXACTLY.

2. SLEEVES:
   - What type? (Sleeveless, cap, short, 3/4, full, puff, bishop, bell, fitted, flutter)
   - What cuff style? (Open, gathered/elastic, buttoned, ruffled, none)
   - Exact length?
   OUTPUT MUST MATCH EXACTLY.

3. COLOR & FABRIC:
   - Exact color (use the SAME hex/shade - no color shifting!)
   - Fabric type appearance (silk, cotton, chiffon, velvet, etc.)
   - Sheen level (matte, satin, glossy)
   OUTPUT MUST MATCH EXACTLY.

4. PATTERN/PRINT:
   - Exact pattern type (solid, floral, geometric, abstract, etc.)
   - Exact pattern scale and placement
   - Exact colors in the pattern
   OUTPUT MUST MATCH EXACTLY.

5. EMBELLISHMENTS:
   - All embroidery, beadwork, sequins, lace, borders
   - Exact placement and pattern of embellishments
   OUTPUT MUST MATCH EXACTLY.

6. SILHOUETTE:
   - Exact cut and shape (A-line, bodycon, empire, fit-and-flare, etc.)
   - Waist placement and style
   - Length (mini, knee, midi, ankle, floor)
   OUTPUT MUST MATCH EXACTLY.

=== WHAT TO REMOVE (ONLY loose styling props) ===

- Jewelry laying on the fabric (not attached)
- Decorative items placed for the photoshoot
- Accessories not sewn into the garment
- The person's body, face, hair

=== WHAT TO KEEP (EVERYTHING that's part of the garment) ===

- ALL fabric construction
- ALL buttons, zippers, hooks
- ALL trim sewn into seams
- ALL attached embellishments
- Belt loops if part of garment
- Attached belts or sashes

=== FINAL QUALITY VERIFICATION CHECKLIST ===

Before outputting, confirm ALL are TRUE:
□ Neckline shape = EXACT MATCH
□ Neckline depth = EXACT MATCH  
□ Sleeve type = EXACT MATCH
□ Sleeve cuff = EXACT MATCH
□ Color = EXACT MATCH (no color shift!)
□ Pattern = EXACT MATCH
□ Embellishments = EXACT MATCH
□ Silhouette = EXACT MATCH
□ Length = EXACT MATCH
□ Mannequin type = Correct (upper/full/couple as specified)
□ No elements added that weren't in original
□ No elements removed that were in original
${correctionFeedback ? `□ Previous issue FIXED: "${correctionFeedback}"` : ""}

If ANY answer is NO, your output will be REJECTED and the client LOSES MONEY.

=== OUTPUT ===

A professional e-commerce photograph showing the FORENSICALLY IDENTICAL garment on the specified mannequin type.
This is for a paying client. Accuracy is non-negotiable. Every detail matters.`;


    console.log('Calling Lovable AI for dress extraction with highest-tier model...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
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
          JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service credits exhausted. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to process image. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage and log generation if userId is provided
    // Also prefer returning the storage URL (small payload) to avoid large base64 responses
    let finalImageUrl = generatedImageUrl;

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

        // Prefer the stored output image URL when available (prevents huge response bodies)
        if (outputStorageUrl) {
          finalImageUrl = outputStorageUrl;
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
      JSON.stringify({ extractedImage: finalImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-dress-to-dummy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
