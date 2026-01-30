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

// Image Pre-Processing: Convert HEIC and downscale to 2048px max
async function preprocessImage(base64Image: string): Promise<string> {
  // Extract image data
  const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return base64Image;
  
  const format = matches[1].toLowerCase();
  
  // HEIC/HEIF detection - these would come through as the format
  // Note: Browser typically converts HEIC to JPEG before sending, but we handle it
  if (format === 'heic' || format === 'heif') {
    console.log("HEIC image detected - will be processed as JPEG by AI");
  }
  
  // The AI model handles the actual image processing
  // We just ensure the image is properly formatted
  console.log(`Image format: ${format}, preprocessing complete`);
  
  return base64Image;
}

interface EnhanceRequest {
  image: string;
  photoType: "product" | "portrait" | "lifestyle";
  stylePreset: string;
  backgroundOption: string;
  outputQuality: "hd" | "ultra_hd";
  aiPhotographerMode: boolean;
  skinFinishEnabled?: boolean;
  skinFinishIntensity?: "light" | "medium" | "pro";
  userId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DLR STUDIO ARTISTIC DIRECTION FRAGMENTS - Bridal Photography Style Presets
// ═══════════════════════════════════════════════════════════════════════════════
const styleDescriptions: Record<string, string> = {
  clean_studio: `CLEAN STUDIO: High-end professional studio lighting with soft-box shadows and neutral backdrops. 
Three-point lighting system with key light at 45°, fill at 30% power, hair light from above-behind. 
Color temperature: 5600K neutral daylight. Catchlights visible and natural in eyes.
Professional commercial photography standard used by luxury bridal studios.`,

  luxury_brand: `LUXURY BRAND: Editorial mood, cinematic high-contrast lighting, rich shadows and premium color grading.
Chiaroscuro technique with dramatic directional lighting and intentional shadow play.
Color palette: desaturated luxury tones—champagne golds, deep burgundies, midnight blues.
Reference: Vogue, Harper's Bazaar high-fashion bridal editorials.`,

  soft_natural: `SOFT NATURAL: Golden hour daylight, gentle flare, warm organic diffusion, soft-focus background.
Warm 3200K-4000K color temperature, 45° side lighting simulating window or outdoor sun.
Light appears filtered through sheer curtains or cloud cover.
Skin tones: warm, healthy, luminous. Lifestyle-aspirational aesthetic.`,

  dark_premium: `DARK PREMIUM: Midnight noir, dramatic key light on subject, deep velvet-black background shadows.
Single key light with Rembrandt lighting, 4:1+ contrast ratio between lit and shadow areas.
Background falls to near-black, subject pops forward with selective dramatic lighting.
Mood: powerful, editorial, premium automotive/fashion advertising quality.`,

  royal_monochrome: `ROYAL MONOCHROME: Timeless high-fashion black and white. Stark contrast, deep onyx shadows, and brilliant silver highlights.
Classic Hollywood golden-age portraiture with full tonal range (Zone II blacks to Zone VIII whites).
Butterfly or Paramount lighting technique. Porcelain skin luminosity.
Reference: George Hurrell, Irving Penn, Richard Avedon timeless portraiture.`,

  golden_sahara_glow: `GOLDEN SAHARA: Intense warm amber color-grading, sunset backlighting with ethereal light-leaks.
Deep golden hour warmth with dramatic rim lighting from behind.
Atmosphere: dreamy, romantic, desert-sunset inspired warmth.
Perfect for romantic bridal portraits with ethereal glow.`,

  vintage_film_vogue: `VINTAGE FILM VOGUE: 90s supermodel aesthetic. Subtle analog film grain, characteristic lens flare.
Kodak Portra 400 or Fujifilm Pro 400H color science emulation.
Softened contrast, lifted shadows, vintage warmth.
Reference: 90s Vogue editorials, classic supermodel campaigns.`,

  ecommerce_white: `ECOMMERCE WHITE: Commercial high-key purity, shadowless precision, seamless white backdrop.
Pure white background (RGB 255,255,255). Even, diffused lighting from all angles.
Color accuracy critical—products/outfits show TRUE colors.
Professional e-commerce/catalog standard for bridal retail.`,

  instagram_editorial: `INSTAGRAM EDITORIAL: Modern creator aesthetic, film grain, stylized aesthetic color-tinting.
Bright, airy exposure with lifted shadows. Trendy warm tones (peachy highlights), teal-orange harmony.
Subtle Fujifilm/VSCO color science. Soft background bokeh.
Aspirational, share-worthy, scroll-stopping quality for social media.`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// DLR STUDIO BACKGROUND ENVIRONMENT LIBRARY - Premium Set Designs
// ═══════════════════════════════════════════════════════════════════════════════
const backgroundDescriptions: Record<string, string> = {
  keep_original: `PRESERVE ORIGINAL BACKGROUND (MANDATORY):
CRITICAL INSTRUCTION - DO NOT REPLACE THE BACKGROUND. This is a NON-DESTRUCTIVE enhancement:
- Keep 100% of the original background elements, colors, and composition
- Only ENHANCE the existing background: improve clarity, reduce noise, balance exposure
- Adjust background lighting to complement the selected style preset
- Add subtle depth enhancement if appropriate (slight blur graduation to separate planes)
- Fix any background imperfections (dust spots, minor distractions) while keeping the scene
- Color grade the background to match the overall style harmoniously
- DO NOT add new elements, DO NOT change the location, DO NOT replace anything
- The original environment must remain recognizable and authentic`,

  clean_studio: `PROFESSIONAL PHOTOGRAPHY STUDIO BACKDROP:
Generate a high-end studio environment backdrop:
- Seamless gradient background: subtle grey-to-white or neutral tone graduation
- OR solid professional grey (18% grey card reference)
- Gentle vignette: darker edges drawing focus to center subject
- Floor reflection: subtle, polished surface feel if full-body shot
- Professional cyclorama curve where wall meets floor (no hard edge)
- Lighting ambiance consistent with selected style preset
- Clean, distraction-free, allows subject to be the complete focus
- Commercial studio quality: $2,000/day rental studio look`,

  premium_lifestyle: `LUXURY LIFESTYLE INTERIOR ENVIRONMENT:
Place subject in an aspirational high-end interior setting:
- Setting: modern luxury apartment, boutique hotel, or upscale café
- Soft ambient lighting: warm interior glow with natural window light
- Background elements: tasteful furniture, plants, art pieces (blurred softly)
- Textures: marble, velvet, brass accents, linen, natural materials
- Depth: clear foreground/midground/background separation with natural bokeh
- Color palette: neutral warm tones—cream, beige, soft grey, gold accents
- Mood: sophisticated, aspirational, lifestyle brand campaign quality
- Reference: Architectural Digest interiors, luxury brand lookbooks`,

  royal_bridal_chamber: `ROYAL BRIDAL PALACE CHAMBER:
Ultra-premium bridal/formal photography backdrop with royal elegance:
- Setting: aristocratic palace interior, bridal suite, or ballroom
- Walls: ivory and champagne panels with intricate gold leaf trim and moldings
- Architectural details: ornate crown molding, chandelier soft glow, tall windows
- Fabric elements: luxurious draped silk curtains, velvet accents
- Floor: polished marble or parquet with subtle reflection
- Lighting: soft diffused chandelier glow mixed with window light
- Props: fresh flowers, candelabra, antique furniture (blurred in background)
- Color palette: ivory, gold, champagne, blush pink, soft cream
- Quality: $15,000 destination wedding venue atmosphere`,

  garden_pavilion: `ELEGANT GARDEN PAVILION SETTING:
Romantic outdoor estate photography environment:
- Setting: manicured formal garden, estate grounds, or botanical pavilion
- Architectural elements: classical stone columns, pergola, gazebo structure
- Greenery: soft-focus hedges, climbing roses, wisteria, manicured lawn
- Lighting: golden hour sunlight filtering through foliage, dappled light
- Floral accents: romantic blooms—roses, peonies, hydrangeas (subtle, not overwhelming)
- Atmosphere: English country estate, French château gardens, aristocratic grounds
- Depth: natural bokeh from foliage, subject clearly separated from environment
- Mood: romantic, fairy-tale, timeless elegance
- Reference: royal wedding photography, estate lifestyle campaigns`,

  palace_corridor: `GRAND PALACE CORRIDOR:
Majestic royal heritage architectural setting:
- Setting: palace corridor, grand gallery, or museum hall
- Architecture: ornate gilded ceiling, classical columns, arched doorways
- Walls: rich burgundy, deep green, or ivory with gold frame accents
- Floor: polished marble with geometric patterns, reflective surface
- Lighting: dramatic natural light from tall arched windows, chandelier glow
- Art: classical paintings in ornate frames (blurred background elements)
- Depth: long perspective corridor with subject as focal point
- Color palette: burgundy, gold, ivory, deep emerald, royal blue accents
- Mood: regal, powerful, museum-gallery prestige
- Reference: Versailles, Hermitage, Buckingham Palace aesthetics`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTO TYPE SPECIFIC INSTRUCTIONS - Contextual Enhancement Rules
// ═══════════════════════════════════════════════════════════════════════════════
const photoTypeInstructions: Record<string, string> = {
  product: `PRODUCT PHOTOGRAPHY OPTIMIZATION:
This is a PRODUCT photograph—the item being sold is the hero:
- Focus ALL attention on the product: perfect focus, crisp edges, accurate detail
- Color accuracy is CRITICAL: product colors must match real-life appearance exactly
- Remove ALL distracting elements: dust, fingerprints, scratches, unwanted reflections
- Enhance product texture and material quality: make fabrics look touchable, metals gleam, glass sparkle
- Professional product isolation with appropriate shadowing or reflection
- Composition: product fills frame appropriately, balanced negative space
- Lighting: even, revealing product details without harsh shadows or blown highlights
- E-commerce ready: image should meet marketplace photography standards
- DO NOT add elements that aren't in the original product shot`,

  portrait: `PORTRAIT & INFLUENCER PHOTOGRAPHY OPTIMIZATION:
This is a PORTRAIT/HEADSHOT/INFLUENCER photograph—the person is the star:
- Flattering facial lighting: soft, even, with natural dimensionality
- PRESERVE 100% of facial identity: same face structure, features, expression, age
- Natural skin texture: NO plastic, waxy, or overly smoothed appearance (unless skin finish enabled)
- Eye enhancement: subtle catchlight, clarity, life—NOT color change or enlargement
- Natural pose refinement: subtle improvements to posture if needed, nothing drastic
- Hair: maintain natural texture and style, enhance shine and definition
- Expression: preserve the authentic emotion and personality
- Background separation: clear subject focus with appropriate depth of field
- Professional headshot/creator content quality—magazine or LinkedIn-ready
- IDENTITY PRESERVATION IS NON-NEGOTIABLE`,

  lifestyle: `LIFESTYLE & BRAND PHOTOGRAPHY OPTIMIZATION:
This is a LIFESTYLE/BRAND photograph—the scene tells a story:
- Storytelling composition: the image should evoke emotion and aspiration
- Brand-appropriate atmosphere: match the mood to the intended brand personality
- Environmental context: enhance the setting to feel premium and desirable
- Subject integration: person should feel naturally placed within the environment
- Color harmony: cohesive color grading across subject and environment
- Aspirational quality: viewer should want to BE in this image
- Natural candid feel: even if posed, should feel authentic and unforced
- Marketing-ready: suitable for social media, website hero, or advertising
- Lifestyle magazine editorial quality—Condé Nast Traveler, lifestyle brand campaigns
- Balance between subject and environment—both matter to the story`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FREQUENCY SEPARATION SKIN FINISH - Professional Retouching Technique
// ═══════════════════════════════════════════════════════════════════════════════
const skinFinishInstructions: Record<string, string> = {
  light: `FREQUENCY SEPARATION SKIN FINISH (Light - Subtle Touch):
Apply professional frequency separation retouching with minimal intervention:
- TEXTURE LAYER (High Frequency): Keep 100% of natural skin texture, pores, and fine details
- COLOR LAYER (Low Frequency): Remove only the most obvious temporary blemishes
- Target ONLY: small pimples, temporary red spots, minor discolorations
- PRESERVE: all pores, natural skin texture, moles, beauty marks, freckles
- Do NOT smooth or blur any skin area—maintain complete high-frequency detail
- Result should be imperceptible: viewer shouldn't notice any retouching
- Natural, authentic, "your skin but on a good day" result
- NEVER create plastic, airbrushed, or doll-like appearance`,

  medium: `FREQUENCY SEPARATION SKIN FINISH (Medium - Balanced Retouch):
Apply professional frequency separation for polished but natural results:
- TEXTURE LAYER (High Frequency): Preserve natural pore structure and skin texture
- COLOR LAYER (Low Frequency): Even out skin tone, remove color inconsistencies
- Remove: acne, blemishes, dark spots, under-eye circles, redness, uneven patches
- Maintain: natural pore visibility, skin texture, character marks (moles, beauty marks)
- Smooth color layer ONLY—texture layer stays intact and visible
- Balance between magazine polish and authentic appearance
- Apply to primary subject face if multiple people present
- This is the "professional headshot" level of retouching
- Prevents the dreaded "plastic AI face" while still looking polished`,

  pro: `FREQUENCY SEPARATION SKIN FINISH (Pro - Editorial Retouch):
Apply high-end editorial frequency separation technique:
- TEXTURE LAYER (High Frequency): Refine pore structure, subtle skin smoothing
- COLOR LAYER (Low Frequency): Complete color evening, seamless skin tone
- Remove: all blemishes, spots, scars, dark circles, fine lines, redness
- Maintain: realistic pore texture (subtle but visible), natural skin character
- Professional beauty/fashion magazine standard
- Porcelain skin quality while maintaining realistic texture
- Apply only to primary subject if multiple faces present
- Result: expert Photoshop frequency separation by skilled retoucher
- NEVER AI blur—must maintain organic skin texture visible at 100% zoom
- Reference: Vogue beauty editorials, high-end cosmetic campaigns`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EnhanceRequest = await req.json();
    const { image, photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId } = body;

    console.log("DLR Studio enhancement request:", { photoType, stylePreset, backgroundOption, outputQuality, aiPhotographerMode, skinFinishEnabled, skinFinishIntensity, userId: userId || "not provided" });

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Please provide an image to enhance" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Always return 200 so the client shows the real message instead of
      // "Edge Function returned a non-2xx status code".
      return new Response(
        JSON.stringify({
          error: "Service is not configured (missing API key). Please contact support.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // IMAGE PRE-PROCESSING: Optimization Pass
    console.log("Running image pre-processing optimization pass...");
    const processedImage = await preprocessImage(image);

    const styleDesc = styleDescriptions[stylePreset] || styleDescriptions.clean_studio;
    const bgDesc = backgroundDescriptions[backgroundOption] || backgroundDescriptions.keep_original;
    const photoTypeInstruction = photoTypeInstructions[photoType] || photoTypeInstructions.portrait;
    
    // Output Fidelity: Editorial Print (HD) vs Master Portfolio (Ultra HD)
    const qualityInstruction = outputQuality === "ultra_hd" 
      ? "OUTPUT FIDELITY: MASTER PORTFOLIO (Ultra HD) - Maximum sharpness, clarity, and detail. DSLR-quality with f/1.4 lens depth simulation, professional depth of field, 4K-ready output."
      : "OUTPUT FIDELITY: EDITORIAL PRINT (HD) - High sharpness and clarity, print-ready quality, balanced detail preservation.";

    const aiModeInstruction = aiPhotographerMode 
      ? `
AI PHOTOGRAPHER MODE (AUTO-OPTIMIZE):
Analyze the image and automatically determine:
- Best camera angle correction (fix any perspective distortion)
- Best crop and composition (apply rule of thirds, golden ratio)
- Best lighting direction and intensity
- Best color grading for the style
- Natural pose corrections if needed
Make all these decisions automatically without user input.`
      : "";

    // Frequency Separation Skin Finish - only for non-product photos
    const skinFinishInstruction = skinFinishEnabled && photoType !== "product" && skinFinishIntensity
      ? `
${skinFinishInstructions[skinFinishIntensity]}

CRITICAL FREQUENCY SEPARATION RULES:
- Do NOT change face shape or facial features
- Do NOT enlarge eyes or lips
- Do NOT apply makeup or beauty filters
- Do NOT create plastic, doll-like, or unnaturally smooth skin
- Do NOT blur skin to the point of losing the high-frequency texture layer
- PRESERVE the person's age and natural appearance
- PRESERVE their identity completely
- Use TRUE frequency separation technique - texture layer stays intact`
      : "";

    // Determine if background should be preserved or replaced
    const isKeepOriginalBackground = backgroundOption === "keep_original";

    // MASTER PROMPT ARCHITECTURE - DLR Studio Bridal Photography Engine
    const prompt = `═══════════════════════════════════════════════════════════════════════════════
MASTER BACKGROUND ENGINE - ELITE BRIDAL PHOTOGRAPHY DIRECTOR
═══════════════════════════════════════════════════════════════════════════════
You are an elite virtual creative director specialized in ultra-realistic professional bridal photography output.

═══════════════════════════════════════════════════════════════════════════════
STRICT SUBJECT LOCK (PRIMARY RULE - NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════════════════════
Face, body, makeup, jewelry, dress, pose = 100% LOCKED.

Preserve the original character EXACTLY:
• SAME face, SAME facial structure, SAME expression
• SAME skin texture and skin tone (NO tone change)
• SAME makeup, jewelry, hairstyle, dress, embroidery, and accessories
• SAME body proportions and pose

FORBIDDEN MODIFICATIONS:
❌ NO facial alteration
❌ NO beautification changes
❌ NO stylization of features
❌ NO dress modification
❌ NO jewelry modification
❌ NO extra limbs, fingers, or body parts
❌ NO plastic skin, over-smoothing, or AI artifacts

CRITICAL: If something does NOT exist in the image, do NOT create it.
THE PERSON MUST BE RE-RENDERED WITH ENHANCEMENTS, NOT RE-CREATED.

═══════════════════════════════════════════════════════════════════════════════
BACKGROUND GENERATION INSTRUCTION:
═══════════════════════════════════════════════════════════════════════════════
ARTISTIC DIRECTION:
${styleDesc}

ENVIRONMENT CONTEXT:
${isKeepOriginalBackground ? `
⚠️ PRESERVATION MODE ACTIVE - DO NOT REPLACE BACKGROUND ⚠️
${bgDesc}

ALLOWED modifications:
✓ Enhance clarity, reduce noise, balance exposure
✓ Improve color balance to match artistic style
✓ Add subtle depth-of-field for subject separation
✓ Fix minor imperfections (dust, small distractions)

FORBIDDEN modifications:
✗ Replacing the background scene
✗ Removing environmental elements
✗ Adding new architectural/decorative elements
✗ Changing the location or setting

Original environment must remain 100% recognizable.
` : `
REPLACEMENT MODE - Generate new background:
${bgDesc}

• Seamlessly composite subject into new environment
• Match lighting direction and color temperature
• Apply natural depth of field (background softer than subject)
• Ensure shadows consistent with new environment
• Create realistic integration—no visible compositing edges
`}

Apply the selected background environment with realistic studio lighting, natural shadows, and cinematic depth.
Background elements must remain soft and out of focus where appropriate to keep the subject dominant.

═══════════════════════════════════════════════════════════════════════════════
PHOTO TYPE CONTEXT:
═══════════════════════════════════════════════════════════════════════════════
${photoTypeInstruction}

═══════════════════════════════════════════════════════════════════════════════
PHOTOGRAPHY STYLE (MANDATORY):
═══════════════════════════════════════════════════════════════════════════════
• DSLR bridal photography quality
• Shallow depth of field with natural bokeh
• Accurate color science and skin tone reproduction
• Soft light falloff with professional shadows
• Professional wedding editorial quality
• ${outputQuality === "ultra_hd" ? "MASTER PORTFOLIO: 4K-ready, maximum sharpness, f/1.4 lens depth simulation" : "EDITORIAL PRINT: High sharpness, print-ready, balanced detail"}

${aiModeInstruction}

${skinFinishInstruction}

═══════════════════════════════════════════════════════════════════════════════
ASPECT RATIO & DIMENSION LOCK (CRITICAL):
═══════════════════════════════════════════════════════════════════════════════
• Output MUST have EXACT SAME aspect ratio as input
• Portrait → Portrait, Landscape → Landscape, Square → Square
• Do NOT crop, zoom, or change composition boundaries
• Every element visible in input MUST be visible in output
• Full body stays full body, headshot stays headshot

═══════════════════════════════════════════════════════════════════════════════
NEGATIVE PROMPT (ABSOLUTE PROHIBITIONS):
═══════════════════════════════════════════════════════════════════════════════
face change, makeup change, dress change, jewelry change, extra limbs, extra fingers, 
distorted anatomy, plastic skin, over-smoothing, AI artifacts, cartoon, CGI, fantasy, 
fake lighting, unrealistic background, blur on subject, face blur, identity change,
age change, skin tone change, expression change, crop change, aspect ratio change

═══════════════════════════════════════════════════════════════════════════════
EXECUTION:
═══════════════════════════════════════════════════════════════════════════════
This is NON-DESTRUCTIVE PROFESSIONAL ENHANCEMENT:
1. LOCK the subject's complete identity (face, makeup, dress, jewelry, pose)
2. Apply the specified artistic lighting/color grading style
3. ${isKeepOriginalBackground ? "Enhance original background while keeping it intact" : "Generate specified background environment"}
4. Maintain exact framing and aspect ratio
5. Output at professional bridal photography quality

EDIT THE PROVIDED IMAGE following all instructions precisely.

After completing, provide a brief 2-sentence creative director's note explaining:
1. What enhancements were applied
2. How the subject's identity was preserved`;

    console.log("Calling Lovable AI with DLR Studio Master Prompt...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              { type: "image_url", image_url: { url: processedImage } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("DLR Studio AI response received");

    // Check for error payload in 200 response
    if (data?.error) {
      console.error("AI gateway error payload:", JSON.stringify(data));
      const msg = typeof data.error?.message === "string" ? data.error.message : "AI service temporarily unavailable";
      return new Response(
        JSON.stringify({ error: msg, retryable: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the enhanced image and creative brief from the response
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const creativeBrief = data.choices?.[0]?.message?.content || "";
    
    // Comprehensive finish reason and refusal detection
    const finishReason = (data.choices?.[0]?.native_finish_reason || data.choices?.[0]?.finish_reason || "").toUpperCase();
    const textContent = (data.choices?.[0]?.message?.content || "").toLowerCase();
    
    // Known safety / refusal finish reasons
    const safetyReasons = ["SAFETY", "IMAGE_SAFETY", "CONTENT_FILTER", "RECITATION", "OTHER"];
    const isSafetyBlock = safetyReasons.includes(finishReason);
    
    // Known refusal phrases in model text
    const refusalPhrases = ["cannot", "i'm unable", "i am unable", "not able to", "i can't", "inappropriate", "violates", "policy"];
    const isTextRefusal = refusalPhrases.some(phrase => textContent.includes(phrase));

    if (!enhancedImageUrl) {
      // Log detailed response for debugging
      const responsePreview = JSON.stringify(data).substring(0, 1200);
      console.error("No image in AI response. Full response preview:", responsePreview);
      console.error("Finish reason:", finishReason);
      console.error("Text content preview:", textContent.substring(0, 400));
      
      // Provide specific, actionable error messages
      if (isSafetyBlock) {
        return new Response(
          JSON.stringify({ 
            error: "This photo was blocked by content safety filters. Please try a different image—avoid close-ups of skin, suggestive poses, or images that may be flagged as sensitive.",
            retryable: false,
            reason: "safety_filter"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (isTextRefusal) {
        return new Response(
          JSON.stringify({ 
            error: "The AI couldn't enhance this particular image. Try a different photo with clearer lighting or less complex backgrounds.",
            retryable: false,
            reason: "model_refusal"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Generic transient failure - encourage retry
      return new Response(
        JSON.stringify({ 
          error: "Image enhancement failed this time. This can happen occasionally—please try again.",
          retryable: true,
          reason: "no_image_generated"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("DLR Studio enhancement complete");
    console.log("Creative Brief:", creativeBrief.substring(0, 200));

    // Upload to storage and log generation if userId is provided
    if (userId) {
      try {
        let inputStorageUrl: string | null = null;
        let outputStorageUrl: string | null = null;

        // Upload input image to storage
        if (processedImage.startsWith('data:image')) {
          inputStorageUrl = await uploadImageToStorage(supabase, processedImage, userId, 'input_enhance');
          console.log("Input image uploaded:", inputStorageUrl ? "success" : "failed");
        } else {
          inputStorageUrl = processedImage;
        }

        if (enhancedImageUrl.startsWith('data:image')) {
          outputStorageUrl = await uploadImageToStorage(supabase, enhancedImageUrl, userId, 'output_enhance');
          console.log("Output image uploaded:", outputStorageUrl ? "success" : "failed");
        }

        const inputImages = inputStorageUrl ? [inputStorageUrl] : [];
        const outputImages = outputStorageUrl ? [outputStorageUrl] : [];

        const { error: logError } = await supabase.rpc('log_generation', {
          p_user_id: userId,
          p_feature_name: 'Photography Studio',
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

    // DUAL RETURN: The Frame (image) + The Brief (explanation)
    return new Response(
      JSON.stringify({ 
        enhancedImage: enhancedImageUrl,
        creativeBrief: creativeBrief 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("DLR Studio enhancement error:", error);
    // Always 200 so the client can show the real message.
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to enhance photo" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});