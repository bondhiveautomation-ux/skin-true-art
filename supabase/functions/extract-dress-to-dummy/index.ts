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
    const { image, cameraAngle } = await req.json();

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

    // Camera angle instructions
    const cameraAngleInstructions = cameraAngle ? (() => {
      switch(cameraAngle) {
        case 'front':
          return '\n\nCAMERA ANGLE: Position the mannequin facing directly forward. Front view, straight-on perspective.';
        case 'side':
          return '\n\nCAMERA ANGLE: Position the mannequin in profile view. Side angle showing the dress from a 90-degree side perspective.';
        case 'three-quarter':
          return '\n\nCAMERA ANGLE: Position the mannequin at a three-quarter angle (45 degrees). Show both the front and side of the dress.';
        case 'back':
          return '\n\nCAMERA ANGLE: Position the mannequin facing away from camera. Back view showing the rear design of the dress.';
        case 'top-down':
          return '\n\nCAMERA ANGLE: Use an elevated, top-down perspective. Camera positioned above looking down at the mannequin.';
        default:
          return '';
      }
    })() : '';

    const systemPrompt = `You are an expert clothing extraction and mannequin placement AI. Your task is to:

1. DETECT AND ISOLATE: Carefully identify and extract ONLY the clothing/outfit from the person in the image
2. REMOVE COMPLETELY: Remove the person's body, face, hair, skin, and ALL accessories including:
   - Jewelry (necklaces, earrings, rings, bracelets, bangles, watches)
   - Belts, bags, purses, handbags
   - Scarves, shawls, stoles (unless part of the main outfit)
   - Hair accessories, headbands, clips
   - Any other ornaments or accessories
3. EXTRACT EXACT DRESS: Keep the clothing exactly as it appears with:
   - Same design, pattern, and style
   - Same colors and color combinations
   - Same fabric texture and material appearance
   - Same folds, draping, and structure
   - Same embellishments that are part of the clothing (embroidery, sequins on fabric)
4. PLACE ON NEUTRAL MANNEQUIN:
   - Use a simple, minimal, professional mannequin/dummy
   - No facial features, no hair, no skin details
   - Clean white or grey mannequin body
   - Position the dress naturally on the mannequin as it would appear in a catalog
5. BACKGROUND: Use a clean, professional studio background (light grey or white)
6. OUTPUT QUALITY: Generate a high-resolution, catalog-ready image

CRITICAL RULES:
- The dress must be a 1:1 copy of what the person was wearing
- Do NOT redesign, modify, or create a new style
- Do NOT include any body parts, face, or hair
- Do NOT include any jewelry or accessories
- Focus ONLY on the clothing item itself
- Make it look professional and e-commerce ready${cameraAngleInstructions}`;

    console.log('Calling Lovable AI for dress extraction...');
    
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
        JSON.stringify({ error: `AI could not extract the dress: ${errorMessage}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ extractedImage: generatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-dress-to-dummy function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
