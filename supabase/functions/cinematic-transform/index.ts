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

LOCKED ELEMENTS (MUST NEVER CHANGE):
- Face identity: EXACT same person, same facial structure, same makeup style/shape, same skin tone.
- Jewellery: EXACT same jewellery pieces as the input. Same number of items, same design, same stones/metal style, same size, same placement.
  - DO NOT add new jewellery.
  - DO NOT remove jewellery.
  - DO NOT replace jewellery with different designs.
  - DO NOT "invent" extra chains, extra earrings, extra nose ring chains, extra bangles, extra headpieces, etc.
- Clothing/outfit: must remain the same outfit (same color, embroidery/patterns, fabric type). Do not introduce new clothing pieces.

QUALITY REQUIREMENTS:
- Photorealistic DSLR quality output
- Cinematic lighting appropriate to the scene
- Natural skin texture (no plastic look)
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
BACKGROUND REPLACEMENT INSTRUCTIONS:
You are provided with TWO images:
1. The subject image (bridal portrait)
2. A custom background image provided by the user

Your task: Extract the subject (the person) from the first image and seamlessly composite them onto the second image (the custom background). 

Requirements:
- Keep the subject EXACTLY as they appear - same face, makeup, jewellery, clothing
- Place the subject naturally within the custom background
- Match the lighting of the background to the subject
- Create realistic shadows and depth
- Ensure seamless blending - the subject must look naturally photographed in this environment
- Maintain photorealistic DSLR quality`;
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
            model: "google/gemini-2.5-flash-image-preview",
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
