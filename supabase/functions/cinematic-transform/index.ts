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

const GLOBAL_SYSTEM_PROMPT = `Preserve the exact identity of the person in the uploaded image. Do not change face structure, skin tone, age, hairstyle, outfit, jewellery, or accessories. No added or missing jewellery. No extra limbs, no distortion, no anatomy errors. Maintain realistic proportions and natural expressions. Photorealistic DSLR quality only. Cinematic lighting, shallow depth of field. No AI artifacts, no plastic skin, no over-smoothing.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, presetId } = await req.json();

    if (!image || !presetId) {
      return new Response(
        JSON.stringify({ error: 'Image and preset ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preset = CINEMATIC_PRESETS[presetId];
    if (!preset) {
      return new Response(
        JSON.stringify({ error: 'Invalid preset ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Processing cinematic transform with preset: ${preset.name}`);

    const fullPrompt = `${GLOBAL_SYSTEM_PROMPT}

CINEMATIC STYLE TO APPLY: ${preset.name}

${preset.prompt}

Transform the uploaded image according to this cinematic style while preserving the exact identity of the person.`;

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
        presetName: preset.name
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
