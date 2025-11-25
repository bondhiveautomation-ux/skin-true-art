import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { referenceImages, angle, style, pose, dress, customPrompt } = await req.json() as {
      referenceImages: string[];
      angle: string;
      style: string;
      pose: string;
      dress: string;
      customPrompt: string;
    };

    console.log('Generating influencer image with consistency');
    console.log('Number of reference images:', referenceImages?.length);
    console.log('Settings:', { angle, style, pose, dress });

    if (!referenceImages || referenceImages.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Please upload at least 8 reference images for training' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build comprehensive system prompt for influencer consistency
    const systemPrompt = `You are a professional AI photographer specializing in creating consistent influencer photoshoots.

CRITICAL RULES FOR CHARACTER CONSISTENCY:
1. The user has provided multiple reference images of the SAME influencer
2. You MUST analyze ALL reference images to learn the influencer's:
   - Exact face shape, facial features, eye shape, nose, lips, jawline, cheekbones
   - Precise skin tone, complexion, and natural skin texture
   - Body proportions, height, build, posture
   - Overall identity and likeness
3. Every generated image MUST show the EXACT SAME PERSON from the references
4. Treat this like a real photoshoot - the person remains identical, only the setting/pose/angle changes
5. NO face morphing, NO feature changes, NO body alterations
6. The influencer's identity is LOCKED and CANNOT change

GENERATION REQUIREMENTS:
- Photorealistic, high-resolution output (suitable for social media)
- Professional photography quality with proper lighting and composition
- Natural skin texture with realistic detail
- Consistent identity across all generations
- No distortions, warping, or inconsistencies

Generate the image following the user's specified angle, style, pose, and scene requirements while maintaining 100% influencer consistency.`;

    // Build detailed generation prompt based on presets
    let generationPrompt = customPrompt || '';
    
    // Add angle details
    const angleDetails: Record<string, string> = {
      'front': 'Front-facing angle, looking directly at camera, symmetrical composition',
      '45-degree': '45-degree angle, three-quarter view showing face and partial profile',
      'side-profile': 'Side profile angle, showing complete profile of face from the side',
      'close-up': 'Close-up portrait, focusing on face and upper shoulders, intimate framing',
      'full-body-standing': 'Full-body standing shot, head to toe, complete figure visible',
      'sitting': 'Sitting pose angle, comfortable seated position, natural posture',
      'over-shoulder': 'Over-the-shoulder angle, looking back at camera with partial face visible',
      'walking': 'Walking pose angle, captured mid-stride with natural movement'
    };

    // Add style details
    const styleDetails: Record<string, string> = {
      'studio': 'Professional studio lighting with soft diffused light, clean white or grey backdrop, professional photography setup',
      'natural-light': 'Natural daylight lighting, soft ambient light from windows, bright and airy atmosphere',
      'outdoor': 'Outdoor natural setting with environmental lighting, authentic location photography',
      'fashion': 'High-fashion editorial style with dramatic lighting, elegant and sophisticated mood',
      'home': 'Home aesthetic with cozy interior lighting, warm and comfortable atmosphere',
      'cinematic': 'Cinematic mood lighting with dramatic shadows and highlights, film-like quality',
      'selfie': 'Selfie-style angle from slightly above, casual and personal perspective'
    };

    // Add pose details
    const poseDetails: Record<string, string> = {
      'standing': 'Standing naturally with relaxed posture, arms at sides or slightly bent',
      'leaning': 'Leaning casually against a wall or surface, relaxed confident pose',
      'sitting': 'Sitting comfortably with natural leg positioning, relaxed seated posture',
      'walking': 'Walking naturally with one foot forward, captured in motion',
      'hands-on-waist': 'Hands placed on waist or hips, confident assertive stance',
      'arms-crossed': 'Arms crossed over chest, powerful confident pose',
      'looking-back': 'Looking back over shoulder at camera, elegant turned pose'
    };

    // Build the complete prompt
    const promptParts = [];
    
    if (angle && angleDetails[angle]) {
      promptParts.push(angleDetails[angle]);
    }
    
    if (style && styleDetails[style]) {
      promptParts.push(styleDetails[style]);
    }
    
    if (pose && poseDetails[pose]) {
      promptParts.push(poseDetails[pose]);
    }

    if (dress === 'keep-reference') {
      promptParts.push('Keep the same clothing/dress from the reference images');
    } else if (dress === 'custom-prompt' && customPrompt) {
      // Custom prompt already included
    }

    if (customPrompt) {
      promptParts.push(customPrompt);
    }

    const finalPrompt = promptParts.join('. ') || 'Professional influencer photoshoot';
    
    console.log('Final generation prompt:', finalPrompt);

    // Prepare content array with all reference images
    const contentArray: any[] = [
      {
        type: "text",
        text: `${systemPrompt}\n\nGenerate a professional influencer photo with these specifications: ${finalPrompt}\n\nIMPORTANT: Maintain EXACT consistency with the influencer shown in ALL reference images below.`
      }
    ];

    // Add all reference images
    referenceImages.forEach((image: string, index: number) => {
      contentArray.push({
        type: "image_url",
        image_url: { url: image }
      });
    });

    console.log('Calling AI with', referenceImages.length, 'reference images');

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response data:', JSON.stringify(aiData));

    // Check for safety blocks
    const finishReason = aiData.choices?.[0]?.finish_reason || aiData.choices?.[0]?.native_finish_reason;
    if (finishReason === 'IMAGE_SAFETY' || finishReason === 'SAFETY') {
      console.log('Image blocked by safety filters');
      return new Response(
        JSON.stringify({ 
          error: 'Content policy restriction: The generated image was blocked by safety filters. Please try different settings or prompt.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract generated image
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImage) {
      console.error('No image in AI response. Full response:', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ 
          error: 'No image generated. This may be due to content policy restrictions or technical issues. Please try different settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated influencer image');

    return new Response(
      JSON.stringify({ image: generatedImage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-influencer-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
