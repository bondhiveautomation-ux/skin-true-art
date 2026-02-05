import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const requestBody = await req.json();
    const { 
      characterImage, characterLeftProfile, characterRightProfile, 
      prompt, productImage, preset, cameraAngle, backgroundImage, pose, userId,
      // Couple mode fields
      coupleMode, coupleImage, maleDressImage, femaleDressImage
    } = requestBody;
    
    // ========== COUPLE MODE HANDLING ==========
    if (coupleMode) {
      if (!coupleImage) {
        return new Response(
          JSON.stringify({ error: "No couple photo provided" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!maleDressImage || !femaleDressImage) {
        return new Response(
          JSON.stringify({ error: "Both dress images are required for couple mode" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Service not configured. Please contact support." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log("COUPLE MODE: Generating dress transfer for couple");

      const couplePrompt = `You are an expert fashion AI. Your task is to transfer dresses onto a couple photo while preserving their faces 100%.

CRITICAL IDENTITY PRESERVATION RULES:
- The faces of BOTH people in the couple photo MUST remain EXACTLY identical - no changes whatsoever
- Preserve: face shape, facial features, expressions, skin tone, hair, eye color, eyebrows
- Only the clothing/outfit should change

TASK:
1. Analyze the couple photo and identify the two people
2. Analyze both dress images to determine which dress is for which person (based on style - saree/lehenga typically female, sherwani/suit typically male, etc.)
3. Generate a new image where:
   - Both people are wearing the appropriate dresses
   - Their faces remain 100% identical to the original
   - The dresses fit naturally on their body types
   - Lighting and composition match the original photo
   - The pose and positioning remain similar

OUTPUT: A photorealistic image of the couple wearing the transferred dresses, with absolutely no changes to their facial features.`;

      const contentArray = [
        { type: "text", text: couplePrompt },
        { type: "image_url", image_url: { url: coupleImage } },
        { type: "image_url", image_url: { url: maleDressImage } },
        { type: "image_url", image_url: { url: femaleDressImage } }
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: contentArray }],
          modalities: ["image", "text"]
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const finishReason = data.choices?.[0]?.native_finish_reason || data.choices?.[0]?.finish_reason;
      if (finishReason === "IMAGE_SAFETY" || finishReason === "SAFETY") {
        return new Response(
          JSON.stringify({ error: "Image blocked by safety filters. Please try different photos." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!generatedImageUrl) {
        const errorMessage = data.error?.message || data.choices?.[0]?.message?.content || "No image generated";
        return new Response(
          JSON.stringify({ error: `Generation failed: ${errorMessage}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Couple dress transfer generated successfully");

      // Upload and log for couple mode
      if (userId) {
        try {
          const inputUrls: string[] = [];
          let outputStorageUrl: string | null = null;

          if (coupleImage.startsWith('data:image')) {
            const url = await uploadImageToStorage(supabase, coupleImage, userId, 'input_couple');
            if (url) inputUrls.push(url);
          } else {
            inputUrls.push(coupleImage);
          }

          if (maleDressImage.startsWith('data:image')) {
            const url = await uploadImageToStorage(supabase, maleDressImage, userId, 'input_dress1');
            if (url) inputUrls.push(url);
          } else {
            inputUrls.push(maleDressImage);
          }

          if (femaleDressImage.startsWith('data:image')) {
            const url = await uploadImageToStorage(supabase, femaleDressImage, userId, 'input_dress2');
            if (url) inputUrls.push(url);
          } else {
            inputUrls.push(femaleDressImage);
          }

          if (generatedImageUrl.startsWith('data:image')) {
            outputStorageUrl = await uploadImageToStorage(supabase, generatedImageUrl, userId, 'output_couple_dress');
          }

          const outputImages = outputStorageUrl ? [outputStorageUrl] : [];
          await supabase.rpc('log_generation', {
            p_user_id: userId,
            p_feature_name: 'Character Generator (Couple)',
            p_input_images: inputUrls,
            p_output_images: outputImages
          });
        } catch (logErr) {
          console.error("Error in couple mode logging:", logErr);
        }
      }

      return new Response(
        JSON.stringify({ generatedImageUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // ========== SINGLE PERSON MODE (existing logic) ==========
    if (!characterImage) {
      return new Response(
        JSON.stringify({ error: "No character reference image provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const hasMultipleReferenceImages = characterLeftProfile || characterRightProfile;
    
    if (!prompt && !productImage && !backgroundImage) {
      return new Response(
        JSON.stringify({ error: "No prompt, product, or background provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (productImage && !preset) {
      return new Response(
        JSON.stringify({ error: "Product preset not specified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (backgroundImage && !pose) {
      return new Response(
        JSON.stringify({ error: "Character pose not specified for background integration" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Service not configured. Please contact support." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for storage and logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Generating image with character consistency");
    console.log("Has side profiles:", hasMultipleReferenceImages ? "yes" : "no");
    console.log("User ID for logging:", userId || "not provided");

    // Helper to build character reference images array
    const buildCharacterReferenceImages = () => {
      const images = [{ type: "image_url", image_url: { url: characterImage } }];
      if (characterLeftProfile) {
        images.push({ type: "image_url", image_url: { url: characterLeftProfile } });
      }
      if (characterRightProfile) {
        images.push({ type: "image_url", image_url: { url: characterRightProfile } });
      }
      return images;
    };

    const multiReferenceNote = hasMultipleReferenceImages 
      ? `\n\nMultiple Reference Images Provided:
You have been given multiple reference images of the same person from different angles. Use ALL provided reference images to ensure maximum character consistency. The main image shows the primary view, and additional side profile images help maintain accurate facial structure and features from all angles.`
      : '';

    let generationPrompt: string;
    let contentArray: any[];

    if (backgroundImage && pose) {
      // Background integration mode
      console.log("Background integration mode with pose:", pose);
      
      const poseInstructions: Record<string, string> = {
        standing: "The character is standing naturally and comfortably in the scene. Posture should be relaxed, confident, and appropriate for the environment. Body weight balanced evenly, arms positioned naturally at sides or slightly engaged.",
        sitting: "The character is sitting comfortably in the scene. Position should look natural and relaxed, with proper sitting posture. Body positioned appropriately for the setting (chair, bench, ground, etc.).",
        walking: "The character is walking naturally through the scene. Capture mid-stride with realistic body movement, arms swinging naturally, and a natural walking gait. Should look candid and in motion.",
        leaning: "The character is leaning casually against an object or surface in the scene. Pose should look relaxed and natural, with body weight shifted appropriately. Arms and legs positioned comfortably.",
        "arms-crossed": "The character has arms crossed in a confident, composed pose. Body language should convey assurance and poise. Stance should be grounded and stable, appropriate for the scene.",
        "hands-in-pockets": "The character has hands casually placed in pockets. Pose should look relaxed and effortless. Body language should be casual and comfortable, suitable for the environment.",
        "dynamic-action": "The character is in a dynamic, active pose with energy and movement. Capture an expressive, engaging action appropriate for the scene. Body should show motion and vitality."
      };

      generationPrompt = `Create a photorealistic image compositing the person from the reference images into the scene from the background image.

Character Preservation:
Maintain the exact appearance of the person including facial features, body type, skin tone, hair, and overall identity. Keep their natural proportions and characteristics identical to the reference images.${multiReferenceNote}

Background Integration:
Place the person naturally into the background scene while preserving the original environment, lighting, colors, and atmosphere of the background image.

Pose: ${pose.replace('-', ' ')}
${poseInstructions[pose]}

Quality Requirements:
- Match lighting and shadows between the person and background
- Ensure proper scale and perspective alignment
- Create seamless blending with natural depth of field
- Produce a photorealistic result that looks like a professional photograph
- Maintain high resolution and sharp details

The final image should appear as if the person was actually photographed in that location with natural, realistic composition.`;

      contentArray = [
        { type: "text", text: generationPrompt },
        ...buildCharacterReferenceImages(),
        { type: "image_url", image_url: { url: backgroundImage } }
      ];
    } else if (productImage && preset) {
      // Product integration mode
      console.log("Product integration mode with preset:", preset);
      
      const cameraAngleInstructions = cameraAngle ? (() => {
        switch(cameraAngle) {
          case 'front':
            return '\n\n📸 CAMERA ANGLE: Front view - Position the character facing directly forward. Straight-on perspective with clear frontal view of both character and product.';
          case 'side':
            return '\n\n📸 CAMERA ANGLE: Side view - Position the character in profile. 90-degree side perspective showing character and product from the side.';
          case 'three-quarter':
            return '\n\n📸 CAMERA ANGLE: Three-quarter view - Position the character at a 45-degree angle. Show both front and side elements of character and product.';
          case 'back':
            return '\n\n📸 CAMERA ANGLE: Back view - Position the character facing away from camera. Show the rear view of character and product.';
          case 'top-down':
            return '\n\n📸 CAMERA ANGLE: Top-down view - Use an elevated perspective looking down at the character and product from above.';
          default:
            return '';
        }
      })() : '';
      
      const presetInstructions: Record<string, string> = {
        wearing: "The character is wearing the product naturally and realistically. The product must fit the character's body perfectly with proper draping, fabric physics, and realistic material behavior. Ensure zero distortion, proper sizing, and natural integration with the character's pose and movement.",
        holding: "The character is holding the product in their hands naturally and comfortably. The product must maintain its original shape, size, and proportions. The character's grip and hand position should be natural and realistic, with proper product orientation and scale.",
        showcasing: "The character is positioned beside the product in a clean, professional composition. The product is placed next to the character (not on or being held by them) in a visually appealing arrangement. Both character and product should be clearly visible and well-lit.",
        floating: "The product is displayed artistically floating near the character in a visually striking composition. The product maintains its exact shape and appearance while being highlighted with professional studio lighting. The character and product should complement each other in the frame without physical contact.",
        lifestyle: "The character is naturally interacting with the product in a realistic lifestyle setting. The interaction should look organic and unforced, as if captured in a real moment. The product and character should blend seamlessly into the scene with natural lighting and authentic body language."
      };

      generationPrompt = `Create a professional product photography image featuring the person from the reference images with the product from the product image.

Character Preservation:
Maintain the exact appearance of the person including all facial features, body proportions, skin tone, hair style, and natural characteristics from the reference images.${multiReferenceNote}

Product Integration:
Preserve the product's design, colors, patterns, textures, and all details accurately.

Styling: ${preset}
${presetInstructions[preset]}${cameraAngleInstructions}

Quality Requirements:
- Professional photography lighting and composition
- Natural and realistic interaction between person and product
- Accurate proportions and proper scale
- High-resolution photorealistic output
- Clean, polished result suitable for commercial use

Create an image that looks like a real professional photoshoot session.`;

      contentArray = [
        { type: "text", text: generationPrompt },
        ...buildCharacterReferenceImages(),
        { type: "image_url", image_url: { url: productImage } }
      ];
    } else {
      // Standard scenario generation mode
      console.log("Standard scenario generation for prompt:", prompt);
      
      generationPrompt = `Create a photorealistic image of the person from the reference images in a new scenario.

Character Preservation:
Keep the person's appearance identical including facial features, body proportions, skin tone, hair, and all distinctive characteristics.${multiReferenceNote}

Scenario:
"${prompt}"

Requirements:
- Maintain complete character consistency
- Only change the scenario, setting, clothing, and context
- Use professional photography quality
- Create natural, realistic lighting and composition
- High-resolution output

Generate an image showing the same person in this new situation.`;

      contentArray = [
        { type: "text", text: generationPrompt },
        ...buildCharacterReferenceImages()
      ];
    }

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
            content: contentArray
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    // Check for safety filter blocks
    const finishReason = data.choices?.[0]?.native_finish_reason || data.choices?.[0]?.finish_reason;
    if (finishReason === "IMAGE_SAFETY" || finishReason === "SAFETY") {
      console.log("Image blocked by safety filters");
      return new Response(
        JSON.stringify({ 
          error: "Image generation was blocked by content safety filters. Please try with a different image or scenario. Avoid content that may be considered sensitive or inappropriate." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in AI response");
      
      const errorMessage = data.error?.message || data.choices?.[0]?.message?.content || "No image generated";
      
      return new Response(
        JSON.stringify({ 
          error: `Image generation failed: ${errorMessage}. Please try a different image or adjust your request.` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Character-consistent image generated successfully");

    // CRITICAL: Upload output image to storage first to prevent memory issues from returning large base64
    let finalImageUrl = generatedImageUrl;
    
    if (generatedImageUrl.startsWith('data:image') && userId) {
      try {
        const outputStorageUrl = await uploadImageToStorage(supabase, generatedImageUrl, userId, 'output_character');
        if (outputStorageUrl) {
          finalImageUrl = outputStorageUrl;
          console.log("Output image uploaded to storage successfully");
        }
      } catch (uploadErr) {
        console.error("Failed to upload output to storage, returning base64:", uploadErr);
        // Continue with base64 if upload fails
      }
    }

    // Fire-and-forget: Log generation asynchronously to avoid blocking the response
    if (userId) {
      (async () => {
        try {
          const inputUrls: string[] = [];

          // Upload character image to storage
          if (characterImage.startsWith('data:image')) {
            const url = await uploadImageToStorage(supabase, characterImage, userId, 'input_character');
            if (url) inputUrls.push(url);
          } else {
            inputUrls.push(characterImage);
          }

          // Upload additional reference images if provided
          if (characterLeftProfile) {
            if (characterLeftProfile.startsWith('data:image')) {
              const url = await uploadImageToStorage(supabase, characterLeftProfile, userId, 'input_character_left');
              if (url) inputUrls.push(url);
            } else {
              inputUrls.push(characterLeftProfile);
            }
          }

          if (characterRightProfile) {
            if (characterRightProfile.startsWith('data:image')) {
              const url = await uploadImageToStorage(supabase, characterRightProfile, userId, 'input_character_right');
              if (url) inputUrls.push(url);
            } else {
              inputUrls.push(characterRightProfile);
            }
          }

          // Upload product image if provided
          if (productImage) {
            if (productImage.startsWith('data:image')) {
              const url = await uploadImageToStorage(supabase, productImage, userId, 'input_product');
              if (url) inputUrls.push(url);
            } else {
              inputUrls.push(productImage);
            }
          }

          // Upload background image if provided
          if (backgroundImage) {
            if (backgroundImage.startsWith('data:image')) {
              const url = await uploadImageToStorage(supabase, backgroundImage, userId, 'input_background');
              if (url) inputUrls.push(url);
            } else {
              inputUrls.push(backgroundImage);
            }
          }

          const outputImages = finalImageUrl.startsWith('http') ? [finalImageUrl] : [];

          // Log the generation
          await supabase.rpc('log_generation', {
            p_user_id: userId,
            p_feature_name: 'Character Generator',
            p_input_images: inputUrls,
            p_output_images: outputImages
          });
          console.log("Generation logged successfully");
        } catch (logErr) {
          console.error("Error in logging/upload:", logErr);
        }
      })();
    }

    return new Response(
      JSON.stringify({ generatedImageUrl: finalImageUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-character-image function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});