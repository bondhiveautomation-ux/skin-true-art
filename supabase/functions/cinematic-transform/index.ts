import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CINEMATIC_PRESETS: Record<string, { name: string; prompt: string }> = {
  "over-shoulder": {
    name: "Over-the-Shoulder Grace",
    prompt: `CAMERA: Behind the subject, shooting from back at 45-degree angle.
BODY: Subject's BACK is facing camera. Body turned away. Head rotated to look OVER LEFT SHOULDER toward camera.
VISIBLE: Back of blouse, shoulder, profile of face, back of head, one side of face making eye contact.
FRAMING: Upper body from waist up, emphasis on back and shoulder line.
This is a BACK VIEW shot - the camera sees the subject from behind.`
  },
  "birds-eye": {
    name: "Bird's-Eye Bridal Symphony",
    prompt: `CAMERA: Directly overhead, 90-degrees above subject, shooting straight DOWN at the floor.
BODY: Subject lying flat on floor OR standing with face tilted UP toward ceiling/camera.
VISIBLE: Top of head, full lehenga spread in circular pattern on floor, arms extended outward.
FRAMING: Full body visible from directly above, lehenga creates circular/symmetrical pattern.
This is a TOP-DOWN AERIAL shot - camera is on ceiling looking down.`
  },
  "high-angle": {
    name: "High-Angle Royal Gaze",
    prompt: `CAMERA: Above eye level, angled 30-degrees downward toward subject.
BODY: Subject looking to the side (NOT at camera), chin slightly lowered.
VISIBLE: Top of head, forehead, full face from above, shoulders, upper chest, neckline jewellery prominent.
FRAMING: Head and shoulders, shot from above making subject look elegant and demure.
This is a HIGH ANGLE portrait - camera is higher than subject's eyes.`
  },
  "joy-closeup": {
    name: "Spontaneous Joy Close-Up",
    prompt: `CAMERA: Eye level, very close to face (macro portrait distance).
EXPRESSION: Genuine LAUGHING smile - teeth visible, eyes crinkled with joy, natural laugh.
VISIBLE: Only face fills the frame - eyes, nose, lips, cheeks. Ears and hair partially cropped.
FRAMING: EXTREME close-up, face fills 90% of frame, background completely blurred.
This is a TIGHT FACE CROP with joyful expression.`
  },
  "neckline": {
    name: "Neckline Elegance Detail",
    prompt: `CAMERA: Slightly below chin level, angled upward at neckline.
BODY: One hand raised to TOUCH the necklace/choker gently with fingertips.
VISIBLE: Chin, neck, collarbone, upper chest, choker/necklace, fingers touching jewellery, blouse neckline.
FRAMING: Neck and chest area fills frame, face cropped at lips or nose level. Hand in frame.
This is a NECKLINE DETAIL shot focusing on jewellery and hand.`
  },
  "eyes": {
    name: "Eyes of the Bride",
    prompt: `CAMERA: Exact eye level, close portrait distance.
EXPRESSION: Soft, gentle gaze directly at camera. Slight smile, mysterious look.
VISIBLE: ONLY from forehead to nose/upper lip. Eyes are the focal point. Eyebrows, nose bridge visible.
FRAMING: ULTRA TIGHT crop - only eyes and bridge of nose in sharp focus. Rest soft.
This is an EYES-ONLY portrait - the tightest possible face crop.`
  },
  "full-frame": {
    name: "Full-Frame Royal Stance",
    prompt: `CAMERA: At waist level, wide angle lens, 3-4 meters away from subject.
BODY: Full standing pose - feet visible, arms relaxed at sides or holding dupatta.
VISIBLE: Entire body head to toe - full lehenga, full dupatta, all jewellery, footwear, floor.
FRAMING: WIDE SHOT with full body centered, significant space above head and below feet.
This is a FULL BODY portrait - the widest possible framing showing everything.`
  },
  "window-light": {
    name: "Window-Light Serenity",
    prompt: `CAMERA: Side angle, 90-degrees to window light source.
LIGHTING: Strong directional light from ONE SIDE creating half-lit face (split lighting).
BODY: Face turned toward window, eyes closed or looking at window peacefully.
VISIBLE: Half face in light, half in shadow. Dramatic light/shadow contrast.
FRAMING: Head and shoulders, emphasis on dramatic one-sided lighting.
This is a SPLIT-LIT portrait with strong window light from the side.`
  },
  "candid-walk": {
    name: "Candid Side Walk",
    prompt: `CAMERA: Side angle, subject walking LEFT to RIGHT across frame.
BODY: Mid-stride walking pose - one foot forward, weight shifting, arms in natural walking motion.
VISIBLE: Full body in profile/side view. Dupatta flowing behind with movement.
FRAMING: Full or 3/4 body, motion blur in fabric, walking direction clear.
This is a WALKING ACTION shot captured from the side - shows movement.`
  },
  "floor-seated": {
    name: "Floor-Seated Royal Pose",
    prompt: `CAMERA: Slightly above subject (who is on floor), angled down.
BODY: SITTING on floor - legs folded or extended, lehenga spread around on floor.
VISIBLE: Subject seated on ground, lehenga fabric arranged on floor, hands in lap or on floor.
FRAMING: Full seated figure with lehenga spread visible on floor around subject.
This is a SEATED ON FLOOR pose - subject is sitting down, not standing.`
  },
  "jewellery-glow": {
    name: "Jewellery Glow Portrait",
    prompt: `CAMERA: Eye level, standard portrait distance.
LIGHTING: Enhance golden glow and reflections on ALL EXISTING jewellery pieces only.
BODY: Natural standing pose, same as input photo.
VISIBLE: Face and upper body with jewellery catching beautiful light reflections.
FRAMING: Head to chest, jewellery prominently lit.
CRITICAL: DO NOT add any new jewellery. Only enhance lighting on existing pieces. Same pose as input.`
  },
  "mirror": {
    name: "Mirror Reflection Elegance",
    prompt: `COMPOSITION: A decorative mirror is visible in the scene. Subject's REFLECTION appears in the mirror.
CAMERA: Angled to capture both the real subject AND their mirror reflection simultaneously.
VISIBLE: Part of subject's back/side + their face visible IN THE MIRROR reflection.
FRAMING: Artistic split composition - real subject on one side, mirror with reflection on other.
This requires adding a MIRROR element to the scene showing the subject's reflection.`
  },
  "golden-hour-silhouette": {
    name: "Golden Hour Silhouette",
    prompt: `CAMERA: Low angle shooting toward strong backlight (sun/window behind subject).
LIGHTING: Intense golden rim light outlining the subject's silhouette. Face partially in shadow with golden edge glow.
BODY: Subject standing in profile or three-quarter view, dupatta catching the golden backlight.
VISIBLE: Silhouette outline with glowing golden rim, hair lit from behind, fabric translucent edges.
FRAMING: Full or 3/4 body with dramatic backlighting creating ethereal golden aura.
This is a BACKLIT SILHOUETTE shot with golden hour warmth.`
  },
  "dramatic-low-angle": {
    name: "Dramatic Low-Angle Power",
    prompt: `CAMERA: Very low position, shooting UPWARD at subject from below waist level.
BODY: Subject standing tall, chin slightly raised, powerful confident posture.
VISIBLE: Full figure looming above camera, lehenga fabric dramatic from below, ceiling/sky visible behind.
FRAMING: Subject appears powerful and majestic, shot from ground level looking up.
This is a LOW ANGLE HERO shot - camera is on ground, subject towers above.`
  },
  "hands-henna-detail": {
    name: "Mehndi Hands Artistry",
    prompt: `CAMERA: Close macro shot focused on hands.
BODY: Both hands raised near face or chest, fingers gracefully posed, showing intricate mehndi/henna patterns.
VISIBLE: Detailed henna designs on palms and fingers, rings and bangles, part of face soft in background.
FRAMING: EXTREME CLOSE-UP of hands only, face blurred behind. Henna patterns are the hero.
This is a HANDS DETAIL shot showcasing mehndi artistry.`
  },
  "veil-mystery": {
    name: "Veiled Mystery Portrait",
    prompt: `CAMERA: Eye level, intimate portrait distance.
BODY: Dupatta/veil partially covering face - draped over head, one eye or half face visible through sheer fabric.
VISIBLE: Face seen THROUGH translucent veil fabric, creating mystery and romance. Fabric texture visible.
FRAMING: Head and shoulders, emphasis on the veil creating soft diffusion over features.
This is a VEILED PORTRAIT - face partially hidden behind dupatta creating romantic mystery.`
  },
  "twirl-motion": {
    name: "Lehenga Twirl Motion",
    prompt: `CAMERA: Slightly low angle, capturing spinning motion.
BODY: Subject MID-SPIN, lehenga fabric swirling outward in circular motion, dupatta floating.
VISIBLE: Fabric in motion blur, lehenga spread in circular pattern, joyful expression, arms extended.
FRAMING: Full body with emphasis on the circular motion of swirling fabric.
This is a SPINNING ACTION shot - frozen moment of joyful twirl.`
  },
  "dutch-angle-editorial": {
    name: "Dutch Angle Editorial",
    prompt: `CAMERA: Tilted 15-20 degrees (Dutch angle), creating dynamic diagonal composition.
BODY: Subject in confident pose, body angled opposite to camera tilt for balance.
VISIBLE: Full or 3/4 body with dramatic diagonal lines, editorial fashion magazine aesthetic.
FRAMING: Intentionally tilted frame creating edgy, high-fashion magazine cover look.
This is a DUTCH ANGLE shot - camera deliberately tilted for editorial drama.`
  },
  "reflection-floor": {
    name: "Floor Reflection Glamour",
    prompt: `CAMERA: Low angle near reflective floor surface.
COMPOSITION: Subject standing on polished marble/reflective floor, their reflection visible below.
VISIBLE: Full standing figure with mirror-like reflection on glossy floor surface below feet.
FRAMING: Full body centered with symmetrical reflection extending downward.
This is a REFLECTION shot - polished floor creates mirror image beneath subject.`
  },
  "intimate-profile": {
    name: "Intimate Profile Silhouette",
    prompt: `CAMERA: Exact 90-degree side angle, subject in pure profile view.
BODY: Face in perfect profile - nose, lips, chin creating elegant outline. Eyes looking straight ahead (not at camera).
VISIBLE: Complete side profile of face, neck, shoulder line. Single earring visible, nose pin prominent.
FRAMING: Head and neck only, emphasis on the elegant profile silhouette line.
This is a PURE PROFILE shot - perfect side view of face.`
  },
  "dreamy-bokeh-lights": {
    name: "Dreamy Bokeh Fairylights",
    prompt: `CAMERA: Standard portrait angle with wide aperture creating heavy background blur.
LIGHTING: Warm fairy lights/bokeh orbs scattered behind subject creating magical dreamy atmosphere.
BODY: Subject in relaxed pose, soft expression, warmly lit face.
VISIBLE: Sharp subject with heavily blurred warm light orbs in background creating romantic ambiance.
FRAMING: Head to waist, shallow depth of field with magical light bokeh behind.
This is a BOKEH PORTRAIT with dreamy background lights.`
  },
  "staircase-regal": {
    name: "Staircase Regal Descent",
    prompt: `CAMERA: Below subject, shooting upward as subject descends stairs.
BODY: Subject on staircase, one hand on railing, lehenga trailing on steps behind, graceful descent pose.
VISIBLE: Full figure on stairs, fabric flowing down steps, regal posture, architectural elements.
FRAMING: Environmental portrait showing subject's grandeur on elegant staircase.
This is a STAIRCASE PORTRAIT - subject descending stairs like royalty.`
  },
  "backless-elegance": {
    name: "Backless Blouse Elegance",
    prompt: `CAMERA: Behind subject at slight angle, focusing on back.
BODY: Subject's BACK facing camera, head turned slightly showing profile, elegant backless blouse visible.
VISIBLE: Bare back, blouse details, back of neck, hair styled up or to side, subtle profile.
FRAMING: Upper body from behind, emphasis on the elegant back and blouse design.
This is a BACK DETAIL shot showcasing backless blouse design.`
  }
};

const BACKGROUND_OPTIONS: Record<string, { name: string; prompt: string }> = {
  "warm-neutral-luxury": {
    name: "Warm Neutral Luxury Wall",
    prompt: `Soft beige to warm ivory textured wall with subtle plaster finish. Minimal, elegant studio environment. Warm ambient lighting with gentle falloff. No patterns, no props, no decorations. Feels like a premium Gulshan makeup studio interior. Realistic shadows and depth.`
  },
  "dark-mocha-editorial": {
    name: "Dark Mocha Editorial Studio",
    prompt: `Deep mocha brown studio wall with soft gradient lighting. Rich, editorial tone. Low-contrast cinematic lighting creating depth without overpowering the subject. High-end bridal photoshoot aesthetic used in luxury Dhaka studios.`
  },
  "classic-off-white-panel": {
    name: "Classic Off-White Panel Room",
    prompt: `Elegant off-white wall with subtle rectangular panel detailing. Soft indoor lighting. Clean, timeless interior resembling upscale Gulshan apartments used for bridal shoots. Natural shadows, realistic perspective.`
  },
  "window-light-corner": {
    name: "Window-Light Studio Corner",
    prompt: `Soft studio corner with a large window off-frame. Natural daylight entering from one side, creating gentle highlights and realistic shadows. Minimal interior, calm and airy. Looks like a real daylight bridal studio in Dhaka.`
  },
  "luxury-fabric-backdrop": {
    name: "Luxury Fabric Backdrop",
    prompt: `Softly draped premium fabric backdrop in muted champagne or warm taupe tones. Natural folds, no symmetry. Subtle depth and shadow. Looks like a real cloth backdrop used by professional makeup studios, not a digital background.`
  },
  "royal-burgundy-editorial": {
    name: "Royal Burgundy Editorial Wall",
    prompt: `Deep burgundy textured wall with cinematic lighting. Rich but controlled saturation. Editorial bridal photography vibe used for jewellery and lehenga campaigns. Soft shadow separation between subject and background.`
  },
  "minimal-grey-studio": {
    name: "Minimal Grey Studio Interior",
    prompt: `Soft grey studio wall with smooth matte texture. Neutral, balanced lighting suitable for showcasing makeup and jewellery accurately. Clean, modern Dhaka makeup studio look. No props, no clutter.`
  },
  "warm-indoor-apartment": {
    name: "Warm Indoor Apartment Lounge",
    prompt: `Upscale Dhaka apartment interior with soft warm lighting. Minimal furniture blurred in the distance. Feels like a real bridal shoot done in a Gulshan living room. Natural depth, realistic indoor ambience.`
  },
  "soft-shadow-editorial": {
    name: "Soft Shadow Editorial Backdrop",
    prompt: `Neutral studio wall with gentle shadow gradients cast naturally behind the subject. Controlled cinematic lighting. Editorial fashion photography style. No visible light sources, no patterns.`
  },
  "classic-dark-studio-fade": {
    name: "Classic Dark Studio Fade",
    prompt: `Dark studio background fading from charcoal to deep brown. Subtle vignette effect. High-end bridal editorial style commonly used in jewellery campaigns. Realistic contrast and depth.`
  }
};

const GLOBAL_SYSTEM_PROMPT = `You are a professional bridal photography editor. Your task is to transform the provided photo according to the instructions below.

##############################################################################
#                    CRITICAL: FACE PRESERVATION RULES                       #
#           THE FACE MUST NEVER BE CHANGED - THIS IS NON-NEGOTIABLE          #
##############################################################################

ABSOLUTE FACE LOCK (ZERO TOLERANCE FOR CHANGES):
- The subject's FACE must remain 100% IDENTICAL to the input image
- EXACT same facial structure, bone structure, nose shape, eye shape, lip shape
- EXACT same facial proportions - distance between eyes, nose width, jawline
- EXACT same skin tone, skin texture, and complexion
- EXACT same makeup - same eyeshadow colors, lipstick shade, blush placement, eyeliner style
- EXACT same eyebrows - same shape, thickness, arch
- EXACT same expression and mouth position
- You are ONLY allowed to adjust LIGHTING on the face (highlights, shadows, color temperature)
- You are FORBIDDEN from changing ANY facial feature, structure, or proportion
- If you cannot preserve the face exactly, DO NOT generate the image

Think of it this way: If you showed the output to the person in the photo, they must immediately recognize themselves with zero doubt. The face must be pixel-perfect identical in structure.

##############################################################################

OTHER LOCKED ELEMENTS (MUST NEVER CHANGE):
- Jewellery: EXACT same jewellery pieces as the input. Same number of items, same design, same stones/metal style, same size, same placement.
  - DO NOT add new jewellery.
  - DO NOT remove jewellery.
  - DO NOT replace jewellery with different designs.
  - DO NOT "invent" extra chains, extra earrings, extra nose ring chains, extra bangles, extra headpieces, etc.
- Clothing/outfit: must remain the same outfit (same color, embroidery/patterns, fabric type). Do not introduce new clothing pieces.
- Hair: Same hairstyle, same hair color, same hair accessories.

QUALITY REQUIREMENTS:
- Photorealistic DSLR quality output
- Cinematic lighting appropriate to the scene (you may adjust lighting ON the face, but never change the face itself)
- Natural skin texture (no plastic look, no smoothing that changes appearance)
- No AI artifacts, no cut-out edges, no fake blur
- Seamless, natural result that looks like a real photograph`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, presetId, backgroundId, customBackgroundImage } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // At least one option must be selected (preset, backgroundId, or customBackgroundImage)
    if (!presetId && !backgroundId && !customBackgroundImage) {
      return new Response(
        JSON.stringify({ error: 'Please select at least a cinematic style or a background option' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preset = presetId ? CINEMATIC_PRESETS[presetId] : null;
    if (presetId && !preset) {
      return new Response(
        JSON.stringify({ error: 'Invalid preset ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const background = backgroundId ? BACKGROUND_OPTIONS[backgroundId] : null;
    const hasCustomBackground = !!customBackgroundImage;
    console.log(`Processing cinematic transform with preset: ${preset?.name || 'None'}, background: ${background?.name || (hasCustomBackground ? 'Custom' : 'Original')}`);

    // Build background instructions
    let backgroundInstructions = '';
    if (hasCustomBackground) {
      backgroundInstructions = `
BACKGROUND REPLACEMENT INSTRUCTIONS - PROFESSIONAL COMPOSITING:
You are provided with TWO images:
1. The subject image (bridal portrait) - THIS DEFINES THE OUTPUT ASPECT RATIO
2. A custom background image provided by the user

##############################################################################
#                    ASPECT RATIO REQUIREMENT                                #
##############################################################################
The OUTPUT image MUST have the EXACT SAME ASPECT RATIO as the SUBJECT IMAGE (image 1).
- If the subject image is portrait (vertical), output must be portrait
- If the subject image is 3:4 ratio, output must be 3:4 ratio
- CROP or EXTEND the background as needed to match the subject's aspect ratio
- NEVER change the subject's proportions or crop the subject

##############################################################################
#                    BACKGROUND ENHANCEMENT ALLOWED                          #
##############################################################################
You ARE ALLOWED and ENCOURAGED to MODIFY/ENHANCE the background to create a natural, professional result:
- You may CHANGE the background's lighting to better match the subject
- You may ADJUST the background's colors for better harmony
- You may ADD or MODIFY lighting elements in the background (lamps, windows, ambient glow)
- You may BLUR or SHARPEN parts of the background for depth-of-field effect
- You may REMOVE distracting elements from the background
- You may ENHANCE the background to look more luxurious/professional
- You may CREATE a seamless environment that feels cohesive with the subject

The goal is a PROFESSIONAL STUDIO RESULT - the background should complement and enhance the subject.

PROFESSIONAL COMPOSITING REQUIREMENTS:

1. LIGHTING HARMONY (CRITICAL):
   - The subject and background must have MATCHING lighting direction
   - Adjust the background lighting to match the subject, OR adjust subject lighting to match background
   - Create a unified light source - no conflicting shadows
   - Add rim lighting, ambient glow, or fill light as needed for professional look

2. COLOR GRADING:
   - Apply a UNIFIED color grade across both subject and background
   - Match skin tones with environment colors
   - Create a cohesive, magazine-quality color palette
   - The final image should look like a single photograph, not a composite

3. DEPTH & ATMOSPHERE:
   - Add appropriate depth-of-field blur to background if subject is in focus
   - Create atmospheric perspective if needed
   - Add subtle haze or glow for a dreamy, bridal aesthetic

4. PROFESSIONAL FINISHING:
   - Ensure no visible edges or cutout artifacts
   - Hair and fabric edges must blend seamlessly
   - Add contact shadows and ambient occlusion for grounding
   - The result should look like a high-end studio photograph

##############################################################################
#                    CRITICAL: FACE MUST NOT CHANGE                          #
##############################################################################
- The subject's FACE must be PIXEL-PERFECT IDENTICAL to the original image
- Same facial structure, same features, same proportions, same expression
- Same makeup colors, same skin tone, same complexion
- You may ONLY adjust lighting/shadows on the face to match the new environment
- You are ABSOLUTELY FORBIDDEN from altering any facial feature or structure
- If the person looked at this output, they must recognize themselves INSTANTLY

OTHER LOCKED ELEMENTS:
- Keep jewellery, clothing, and hair EXACTLY the same
- Only modify environmental lighting and color grading on these elements

OUTPUT: A professional, magazine-quality bridal photograph where the subject appears naturally photographed in a beautiful environment. The background can be creatively enhanced, but the FACE must remain 100% identical.`;
    } else if (background) {
      backgroundInstructions = `
BACKGROUND REPLACEMENT INSTRUCTIONS:
Replace ONLY the background using the following description while keeping the subject completely unchanged:
${background.prompt}

Ensure realistic lighting integration, natural shadows, correct perspective, and seamless blending. The subject must look naturally photographed in the new environment.`;
    }

    // Build cinematic style instructions - this is the PRIMARY transformation
    let cinematicInstructions = '';
    if (preset) {
      cinematicInstructions = `
PRIMARY TASK - CINEMATIC POSE/COMPOSITION TRANSFORMATION:
You MUST recreate this exact person in the following new pose and composition:

"${preset.name}": ${preset.prompt}

IMPORTANT: This is an image-to-image transformation. Take the person from the input image and recreate them in this new pose/angle/composition. The person's face, jewellery, and outfit should look exactly the same, but the pose, camera angle, and framing should match the description above.`;
    } else {
      cinematicInstructions = `
POSE PRESERVATION:
Keep the exact same pose, angle, and composition as the original photo.`;
    }

    // Combine instructions with clear priority
    let taskInstructions = '';
    if (preset && (background || hasCustomBackground)) {
      taskInstructions = `
DUAL TASK - Apply BOTH transformations:
1. FIRST: Transform the pose/composition as described in the cinematic style
2. THEN: Place the transformed subject in the new background environment

Both transformations must be applied together in the final output.`;
    } else if (preset) {
      taskInstructions = `
SINGLE TASK - Cinematic Style Only:
Transform the pose/composition as described. Keep the original background.`;
    } else if (background || hasCustomBackground) {
      taskInstructions = `
SINGLE TASK - Background Only:
Keep the exact same pose. Only replace the background as described.`;
    }

    const fullPrompt = `${GLOBAL_SYSTEM_PROMPT}

${taskInstructions}

${cinematicInstructions}

${backgroundInstructions}

QUALITY REMINDERS:
- The person's face, makeup, and jewellery must look identical to the original
- The outfit should appear natural in the new pose (same clothing, natural drape for the pose)
- Photorealistic DSLR quality, no AI artifacts
- Output should look like a real professional photograph`;

    // Build message content - include custom background image if provided
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: fullPrompt },
      { type: "image_url", image_url: { url: image } }
    ];
    
    // Add custom background image if provided
    if (hasCustomBackground) {
      messageContent.push({ type: "image_url", image_url: { url: customBackgroundImage } });
    }

    // Retry logic for resilience against temporary API outages
    let response: Response | null = null;
    let lastError: string = "";
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        }
        
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Use Nano banana for image editing/generation
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: messageContent
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "API credits exhausted. Please contact support." }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // On 503/502/500, retry
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = `Server error: ${response.status}`;
          console.log(`API returned ${response.status}, will retry...`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("AI API error:", response.status, errorText);
          throw new Error(`AI API error: ${response.status}`);
        }
        
        break; // Success, exit retry loop
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : String(fetchError);
        console.error(`Fetch attempt ${attempt + 1} failed:`, lastError);
        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError}`);
        }
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`API request failed: ${lastError}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // The gateway may return 200 with an error payload
    if (data?.error) {
      console.error("AI gateway error payload:", JSON.stringify(data));
      const msg = typeof data.error?.message === "string" ? data.error.message : "AI gateway internal error";
      throw new Error(msg);
    }

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("Failed to generate cinematic image");
    }

    return new Response(
      JSON.stringify({ 
        result: generatedImage,
        presetName: preset?.name || 'None',
        backgroundName: background?.name || (hasCustomBackground ? 'Custom Background' : 'Original')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cinematic-transform function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transform image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
