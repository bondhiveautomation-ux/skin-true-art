import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CINEMATIC_PRESETS: Record<string, { name: string; prompt: string }> = {
  "over-shoulder": {
    name: "Over-the-Shoulder Grace",
    prompt: `Model facing away from the camera with her body slightly turned. She gently turns her head back over her shoulder, making soft eye contact with the camera. Back of the blouse embroidery clearly visible, including tie details. Earrings and maang-tikka chain falling naturally along the face. Dupatta draped elegantly behind her. Graceful posture, calm expression. Warm cinematic lighting, soft highlights on skin and jewellery. Shallow depth of field, background softly blurred. Ultra-realistic bridal editorial photography, DSLR look.`
  },
  "birds-eye": {
    name: "Bird's-Eye Bridal Symphony",
    prompt: `Camera placed directly above the model, looking straight down. Model standing gracefully at the center, eyes lifted upward toward the camera. Lehenga spread evenly in a circular pattern around her, creating a symmetrical, elegant shape. Jewellery glowing softly under warm light. Dupatta arranged neatly around the body. Balanced composition, overhead cinematic lighting, soft shadows. Ultra-high-resolution bridal editorial photography, realistic textures, DSLR quality.`
  },
  "high-angle": {
    name: "High-Angle Royal Gaze",
    prompt: `Camera positioned slightly above eye level, angled downward. Model gazing softly to the side, not directly at the camera. Upper torso and neckline visible with detailed lehenga blouse embroidery. Dupatta draped gracefully over the shoulder. Gold choker and maang-tikka catching top light. Warm vintage tones, soft shadow behind her. Cinematic, royal bridal portrait with shallow depth of field and DSLR realism.`
  },
  "joy-closeup": {
    name: "Spontaneous Joy Close-Up",
    prompt: `Extreme close-up portrait capturing a natural, candid smile. Slightly open lips, soft laugh lines, expressive eyes filled with warmth. Jewellery sparkling subtly in warm golden light, especially the choker and nose ring chain. Skin texture realistic with a soft cinematic glow. Very shallow depth of field, background fully blurred. Focus on eyes, smile, and facial jewellery. Luxury bridal advertisement aesthetic, ultra-realistic DSLR quality.`
  },
  "neckline": {
    name: "Neckline Elegance Detail",
    prompt: `Close-up shot focused on the choker necklace and neckline. Model's hand gently touching or lifting the necklace, fingers relaxed. Subtle henna or mehendi visible on fingers. Collarbone, neckline, blouse embroidery, and jewellery in frame. Warm golden highlights reflecting off the jewellery. Background softly blurred. High-detail cinematic jewellery editorial photography, realistic textures, DSLR quality.`
  },
  "eyes": {
    name: "Eyes of the Bride",
    prompt: `Tight portrait framing focused on the eyes and upper face. Soft warm smile visible. Nose ring chain, choker, and jhumkas subtly glowing. Warm vintage lighting, shallow depth of field. Natural skin texture retained, no over-processing. Eyes in sharp focus with cinematic softness elsewhere. Luxury bridal portrait photography, ultra-realistic DSLR look.`
  },
  "full-frame": {
    name: "Full-Frame Royal Stance",
    prompt: `Wide-angle full-body shot. Model standing gracefully with a relaxed posture and gentle smile. Full lehenga silhouette visible, dupatta draped naturally over the arms. Jewellery shining softly under warm cinematic lighting. Environment visible but softly blurred to keep focus on the subject. Balanced composition, elegant royal bridal editorial style. Ultra-realistic DSLR photography.`
  },
  "window-light": {
    name: "Window-Light Serenity",
    prompt: `Model positioned near a window with soft natural light falling across her face from one side. Gentle shadows adding depth and realism. Calm, serene expression. Jewellery softly glowing in the light. Background minimal and elegant. Natural cinematic realism, fine-art bridal portrait, DSLR quality.`
  },
  "candid-walk": {
    name: "Candid Side Walk",
    prompt: `Model captured mid-movement, taking a gentle step forward. Dupatta flowing subtly with motion. Looking away from the camera naturally. Movement frozen cleanly without blur. Warm indoor cinematic lighting. Realistic candid bridal moment, editorial DSLR photography.`
  },
  "floor-seated": {
    name: "Floor-Seated Royal Pose",
    prompt: `Model seated gracefully on the floor with lehenga arranged neatly around her. Hands resting softly. Calm, composed expression. Camera slightly above eye level. Warm ambient lighting, royal indoor mood. Cinematic bridal storytelling frame, ultra-realistic DSLR quality.`
  },
  "jewellery-glow": {
    name: "Jewellery Glow Portrait",
    prompt: `Mid-close portrait balancing face and jewellery equally. Lighting designed to enhance gold textures without overpowering skin tones. Neutral elegant pose. Premium bridal advertisement aesthetic. Cinematic lighting, shallow depth of field, DSLR realism.`
  },
  "mirror": {
    name: "Mirror Reflection Elegance",
    prompt: `Artistic composition using a mirror reflection. Model partially visible through the mirror, face softly framed. Warm cinematic lighting, shallow depth of field. Elegant, storytelling bridal editorial style. Ultra-realistic textures, DSLR quality.`
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

const GLOBAL_SYSTEM_PROMPT = `CRITICAL RULES - ABSOLUTE MUST FOLLOW:

IDENTITY PRESERVATION (HIGHEST PRIORITY):
1. Preserve the EXACT identity of the person - face, makeup, skin tone, hairstyle, jewellery must remain 100% identical.
2. NEVER rotate the image. Keep the exact same orientation as the original.
3. Maintain exact body proportions - do not stretch, compress, or distort.

CLOTHING & OUTFIT PRESERVATION (CRITICAL):
4. The outfit/clothing must remain EXACTLY as in the original - same shape, same drape, same folds, same position.
5. Do NOT add any extra fabric, cloth pieces, or extensions to the outfit.
6. Do NOT remove or hide any part of the outfit.
7. Do NOT change how the dupatta/scarf/veil is draped or positioned.
8. Preserve the exact silhouette and boundaries of the clothing - no extra floating fabric.
9. Every piece of clothing (blouse, lehenga, dupatta) must maintain its original form without distortion.
10. The outfit edges must be clean and natural - no AI-generated extra pieces or artifacts.

QUALITY REQUIREMENTS:
11. Photorealistic DSLR quality only. Cinematic lighting. Natural skin texture.
12. No AI artifacts, no plastic skin, no over-smoothing, no cut-out edges, no fake blur.
13. The output image must have the SAME orientation and aspect ratio as the input.
14. Seamless, natural result - should look like a real photograph, not AI-generated.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, presetId, backgroundId } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // At least one option must be selected
    if (!presetId && !backgroundId) {
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
    console.log(`Processing cinematic transform with preset: ${preset?.name || 'None'}, background: ${background?.name || 'Original'}`);

    // Build background instructions
    let backgroundInstructions = '';
    if (background) {
      backgroundInstructions = `
BACKGROUND REPLACEMENT INSTRUCTIONS:
Replace ONLY the background using the following description while keeping the subject completely unchanged:
${background.prompt}

Ensure realistic lighting integration, natural shadows, correct perspective, and seamless blending. The subject must look naturally photographed in the new environment.`;
    } else {
      backgroundInstructions = `
BACKGROUND PRESERVATION:
Preserve the original background exactly as it appears in the uploaded image. Do NOT change the background in any way.`;
    }

    // Build cinematic style instructions
    let cinematicInstructions = '';
    if (preset) {
      cinematicInstructions = `
CINEMATIC STYLE TO APPLY: ${preset.name}

${preset.prompt}`;
    } else {
      cinematicInstructions = `
STYLE PRESERVATION:
Keep the original cinematic style, pose, and framing of the photo exactly as it appears. Only apply background changes if specified above.`;
    }

    const fullPrompt = `${GLOBAL_SYSTEM_PROMPT}

${backgroundInstructions}

${cinematicInstructions}

FINAL CRITICAL REMINDERS:
- DO NOT rotate the image under any circumstances
- DO NOT add extra fabric, cloth pieces, or extensions to clothing
- DO NOT distort the outfit silhouette or boundaries
- Keep clothing exactly as worn in the original - same shape, folds, drape
- ${background ? 'Replace ONLY the background as specified, keep subject and outfit completely unchanged' : 'Keep the exact same background'}
- ${preset ? 'Apply cinematic lighting/color grading without altering clothing structure' : 'Keep the original style and pose'}
- Preserve the exact identity, outfit, and appearance of the person
- Output must look like a natural photograph with no AI artifacts`;

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
              { type: "text", text: fullPrompt },
              { type: "image_url", image_url: { url: image } }
            ]
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("Failed to generate cinematic image");
    }

    return new Response(
      JSON.stringify({ 
        result: generatedImage,
        presetName: preset?.name || 'None',
        backgroundName: background?.name || 'Original'
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
