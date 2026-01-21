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
    const { image, userId, dummyStyle = "standard", correctionFeedback } = await req.json();

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

    console.log("Processing dress extraction, userId:", userId || "not provided", "style:", dummyStyle, "hasCorrectionFeedback:", !!correctionFeedback);

    // Define mannequin and background styles
    const DUMMY_STYLES: Record<string, { mannequin: string; background: string }> = {
      "standard": {
        mannequin: `Use a simple, minimal, professional mannequin/dummy:
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms must be visible in a natural pose (at sides or slightly away from body)
   - Hands must be visible and complete
   - No facial features, no hair, no skin details
   - Clean white or grey mannequin body
   - Position the dress naturally on the mannequin as it would appear in a catalog`,
        background: `Use a clean, professional studio background (light grey or white)`
      },
      "premium-wood": {
        mannequin: `Use a premium, elegant mannequin/dummy:
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms must be visible in a natural, elegant pose
   - Hands must be visible and complete
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
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms must be visible in a graceful, editorial pose
   - Hands must be visible and complete
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
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms positioned elegantly, hands visible and complete
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
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms in a soft, graceful pose, hands visible and complete
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
   - FULL-BODY MANNEQUIN with visible arms and hands - MANDATORY
   - Arms in a clean, modern pose, hands visible and complete
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

    // Build correction section if there's feedback from previous inspection
    const correctionSection = correctionFeedback ? `

=== ⚠️ CRITICAL CORRECTION REQUIRED ⚠️ ===

A previous generation was REJECTED because: "${correctionFeedback}"

YOU MUST FIX THIS SPECIFIC ISSUE. This is your TOP PRIORITY.
Pay extra attention to whatever was wrong and make sure it is CORRECT this time.

` : "";

    const systemPrompt = `You are the WORLD'S BEST garment extraction AI. Your extractions are used by professional fashion brands. ZERO ERRORS ALLOWED.
${correctionSection}

=== 🚨 ABSOLUTE GARMENT PRESERVATION LAW 🚨 ===

THE DRESS/GARMENT MUST NEVER, EVER CHANGE. THIS IS NON-NEGOTIABLE.

You are NOT creating a new dress. You are PHOTOGRAPHICALLY EXTRACTING the EXACT dress from the input image.
Think of yourself as a high-precision scanner - you capture EXACTLY what exists, nothing more, nothing less.

FORBIDDEN MODIFICATIONS (instant rejection if any occur):
❌ DO NOT change any colors - not even slightly
❌ DO NOT alter patterns, prints, or embroidery designs
❌ DO NOT modify the neckline shape or depth
❌ DO NOT change sleeve style, length, or construction
❌ DO NOT add or remove any design elements
❌ DO NOT simplify or "clean up" complex designs
❌ DO NOT change fabric texture or drape
❌ DO NOT alter embellishments, beadwork, or sequin patterns
❌ DO NOT modify the silhouette or cut of the garment
❌ DO NOT change the length of the dress/skirt

The output garment must be a 100% IDENTICAL CLONE of the input garment.
If a client places the input and output side by side, the ONLY difference should be:
- Person removed, replaced with mannequin
- Background changed to selected style
- NOTHING ELSE

=== MISSION: PIXEL-PERFECT GARMENT REPLICATION ===

You must extract the EXACT garment and place it on a mannequin. The output must be indistinguishable from a real photograph of that exact garment on a mannequin.

=== STEP 1: FORENSIC NECKLINE ANALYSIS ===

CRITICAL: The neckline is the #1 most scrutinized element. Get this wrong = REJECTED.

Look at WHERE the fabric edge meets at the center front:
- If the fabric forms a POINTED shape going DOWN into the chest = V-NECK
- If the fabric forms a CURVED line across = ROUND NECK  
- If the fabric forms a STRAIGHT horizontal line = SQUARE NECK
- If the fabric dips in a curved heart shape = SWEETHEART

MEASURE THE V-NECK DEPTH:
- Shallow V (ends above bust line)
- Medium V (ends at bust line)
- Deep V (ends below bust line)

YOUR OUTPUT NECKLINE MUST MATCH THE EXACT SAME SHAPE AND DEPTH.
If original is V-neck, output MUST be V-neck with same angle and depth.
DO NOT round off V-necks. DO NOT convert V to round.

=== STEP 2: FORENSIC SLEEVE ANALYSIS ===

CRITICAL: Sleeves are the #2 most scrutinized element.

SLEEVE TYPE - Look at the SHAPE:
- PUFF SLEEVE: Has volume/poof at the shoulder, then tapers down
- BISHOP SLEEVE: Fitted at shoulder, billows out, gathered at cuff
- BELL SLEEVE: Flares out continuously from shoulder to hem
- FITTED SLEEVE: Follows the arm shape closely throughout

CUFF STYLE - Look at the WRIST AREA:
- ELASTIC GATHERED: Fabric is bunched/gathered at the wrist (visible gathering)
- OPEN HEM: Sleeve just ends, no gathering
- BUTTON CUFF: Has buttons at the wrist

IF THE ORIGINAL HAS PUFF SLEEVES WITH ELASTIC CUFFS:
- The sleeve MUST have volume at the shoulder
- The sleeve MUST have visible gathering at the wrist
- The sleeve must NOT be loose/flowing at the wrist
- The sleeve must NOT be bishop style (billowing)

=== STEP 3: REMOVE ONLY PROPS ===

REMOVE (styling props that would fall off if you shook the dress):
- Jewelry laying on the fabric
- Decorative items placed for the photoshoot
- Accessories not attached to the garment

KEEP (sewn into the garment):
- All fabric construction
- Buttons, zippers
- Any trim sewn into seams

=== STEP 4: FABRIC & PRINT ACCURACY ===

- EXACT same floral/print pattern
- EXACT same colors (no color shifts)
- EXACT same print scale
- EXACT same fabric texture appearance

=== STEP 5: MANNEQUIN PLACEMENT ===
${selectedStyle.mannequin}

=== STEP 6: BACKGROUND ===
${selectedStyle.background}

=== ⚠️ CRITICAL: FULL-BODY MANNEQUIN REQUIREMENT ⚠️ ===

THIS IS MANDATORY - NO EXCEPTIONS:
- The mannequin MUST have a COMPLETE FULL BODY with visible arms and hands
- ARMS: Both arms must be visible in a natural pose (at sides or elegantly positioned)
- HANDS: Both hands must be complete and visible
- Even if the input image shows a cropped dress or partial view, YOU MUST show the COMPLETE mannequin
- The mannequin body should extend from head/neck area down to the floor
- NEVER crop the mannequin - show the entire figure
- If the dress is sleeveless/short-sleeved, the mannequin's bare arms must still be fully visible

FAILURE TO SHOW COMPLETE MANNEQUIN WITH HANDS = AUTOMATIC REJECTION

=== FINAL QA CHECKLIST (ALL MUST BE YES) ===

□ Is the neckline the EXACT same shape? (V=V, Round=Round)
□ Is the neckline the EXACT same depth?
□ Are the sleeves the EXACT same type? (Puff=Puff, not Bishop)
□ Are the cuffs the EXACT same style? (Elastic gathered=Elastic gathered, not open)
□ Is the print pattern identical?
□ Did I add ANY elements not in the original? (If yes, REMOVE THEM)
□ Does the mannequin have VISIBLE ARMS AND HANDS? (MUST BE YES)
□ Is the mannequin FULL-BODY from neck to floor? (MUST BE YES)
${correctionFeedback ? `□ Did I fix the specific issue: "${correctionFeedback}"? (MUST BE YES)` : ""}

If ANY answer is NO, your extraction will be REJECTED by the client.

=== OUTPUT ===

A professional e-commerce photograph showing the IDENTICAL garment on a FULL-BODY mannequin with visible arms and hands.
The garment must be a 1:1 replica - same neckline shape, same sleeve construction, same everything.
The mannequin must be complete with arms and hands visible, regardless of the input image framing.
This is for a paying client. Errors are not acceptable.`;


    console.log('Calling Lovable AI for dress extraction...');
    
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});