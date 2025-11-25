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
    const { image } = await req.json();

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

    const systemPrompt = `You are an expert AI image editor specializing in people removal and background preservation. Your task is to:

🎯 PRIMARY OBJECTIVE:
Remove ALL people (humans, persons) from this image completely while keeping the background 100% intact and natural.

🚨 CRITICAL REQUIREMENTS FOR PEOPLE REMOVAL:
1. DETECT ALL PEOPLE: Identify every person in the image, whether they are:
   - In the foreground, middle ground, or background
   - Fully visible, partially visible, or partially obscured
   - Adults, children, babies, or any human figures
   - Standing, sitting, lying down, or in any pose

2. COMPLETE REMOVAL: Remove people entirely including:
   - Their entire body, face, hair, and all body parts
   - All clothing, accessories, and items they're wearing or holding
   - Their shadows and reflections
   - Any part of them, no matter how small

3. INTELLIGENT INPAINTING: Fill in the areas where people were removed by:
   - Analyzing the surrounding background patterns, textures, and colors
   - Seamlessly extending the background into the empty areas
   - Maintaining perspective, lighting, and depth
   - Ensuring natural-looking transitions with no visible seams or patches
   - Preserving the original scene's atmosphere and mood

🎨 BACKGROUND PRESERVATION REQUIREMENTS:
✓ Keep ALL background elements EXACTLY as they are:
  - Buildings, walls, furniture, objects, plants, trees, nature
  - Floor patterns, ground textures, sky, clouds, water
  - Lighting conditions, shadows (except those cast by people), reflections
  - Colors, color gradients, and color temperature
  - Perspective, depth, and spatial relationships
  - Any animals, vehicles, or non-human objects

✓ Maintain ORIGINAL qualities:
  - Image resolution and sharpness
  - Color saturation and tone
  - Contrast and brightness levels
  - Texture details and fine elements
  - Original aspect ratio

❌ ABSOLUTELY FORBIDDEN:
- DO NOT remove, modify, or alter ANY background objects or elements
- DO NOT change the lighting style, time of day, or mood
- DO NOT add new objects, people, or elements that weren't there
- DO NOT create unrealistic patches, blurs, or distortions
- DO NOT leave visible outlines, edges, or artifacts where people were
- DO NOT change colors, textures, or patterns of the background
- DO NOT warp, stretch, or distort the perspective

📸 QUALITY STANDARDS:
✓ The final image must look like a completely natural photograph
✓ No one should be able to tell that people were removed
✓ The scene should look authentic, not AI-edited
✓ All inpainted areas must blend seamlessly with the original background
✓ High resolution and sharp details throughout
✓ Professional, realistic, and artifact-free output

Generate a clean, people-free version of this image where the background remains perfectly intact and the inpainted areas look completely natural.`;

    console.log('Calling Lovable AI for people removal...');
    
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
        JSON.stringify({ error: `AI could not process the image: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ cleanBackground: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in remove-people-from-image function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
