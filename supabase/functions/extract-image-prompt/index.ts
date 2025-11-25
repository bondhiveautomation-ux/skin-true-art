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
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing image for prompt extraction...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert image analysis AI. Analyze this image in extreme detail and generate a comprehensive, highly accurate prompt that can be used to recreate this exact image in any image generator.

Your prompt MUST include:

1. CHARACTER DESCRIPTION (if present):
   - Face: facial features, expression, age range, skin tone (exact shade)
   - Hair: style, color, texture, length
   - Body: pose, position, body type
   - Expression: exact emotional state, gaze direction

2. CLOTHING DETAILS:
   - Style and type of all garments
   - Fabric textures and materials
   - Colors (specific shades)
   - Accessories, jewelry, makeup

3. BACKGROUND & ENVIRONMENT:
   - Location/setting (indoor/outdoor, specific place)
   - Lighting: direction, quality (soft/hard), color temperature
   - Mood and atmosphere
   - Depth and spatial composition

4. CAMERA DETAILS:
   - Camera angle (eye-level, low-angle, high-angle, etc.)
   - Focal length/lens type (wide, standard, telephoto)
   - Framing (close-up, medium shot, full body, etc.)
   - Depth of field

5. VISUAL STYLE:
   - Art style (photorealistic, cinematic, portrait, etc.)
   - Quality markers (DSLR, 8K, professional photography, etc.)
   - Color grading/tone

6. TEXTURE & FINE DETAILS:
   - Skin texture and quality
   - Shadows and highlights
   - Reflections and materials
   - Fine surface details

CRITICAL REQUIREMENTS:
- Write as ONE continuous, well-structured prompt
- Be extremely specific and detailed
- Use professional photography/art terminology
- No guesses - only describe what you clearly see
- No internal notes or explanations
- Generator-ready format
- No hallucinations or assumptions

Output ONLY the prompt, nothing else.`
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    const prompt = data.choices?.[0]?.message?.content;

    if (!prompt) {
      console.error('No prompt generated from AI');
      return new Response(
        JSON.stringify({ error: 'No prompt generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-image-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
