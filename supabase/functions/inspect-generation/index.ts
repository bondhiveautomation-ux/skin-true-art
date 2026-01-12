import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputImage, outputImage, featureName, userId, gemCost } = await req.json();

    if (!inputImage || !outputImage) {
      return new Response(
        JSON.stringify({ error: 'Both input and output images are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required for gem refund' }),
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Inspecting generation for:", featureName, "userId:", userId, "gemCost:", gemCost);

    // Build the inspection prompt based on feature type
    let inspectionPrompt = "";
    
    if (featureName === "Dress Extractor" || featureName === "extract-dress-to-dummy") {
      inspectionPrompt = `You are a STRICT quality control inspector for a fashion AI service. Your job is to determine if a dress extraction was done correctly.

TASK: Compare the INPUT image (person wearing a dress) with the OUTPUT image (dress on a mannequin).

=== CRITICAL INSPECTION CRITERIA ===

The OUTPUT dress MUST match the INPUT dress EXACTLY in:

1. **NECKLINE** - Must be identical shape (V-neck stays V-neck, round stays round)
2. **SLEEVE TYPE** - Must be identical (puff sleeves stay puff, not bishop or bell)
3. **SLEEVE LENGTH** - Full length stays full, 3/4 stays 3/4, short stays short
4. **PATTERN/PRINT** - Exact same floral pattern, colors, scale
5. **FABRIC APPEARANCE** - Same texture and drape
6. **OVERALL SILHOUETTE** - Same cut and shape
7. **DETAILS** - Same buttons, zippers, trims, embellishments

=== YOUR VERDICT ===

If the dress in the OUTPUT is CLEARLY DIFFERENT from the INPUT (different neckline shape, different sleeve type, different pattern, etc.), respond with:
VERDICT: MISMATCH

If the dress in the OUTPUT is ESSENTIALLY THE SAME as the INPUT (minor lighting/angle differences are acceptable), respond with:
VERDICT: MATCH

=== IMPORTANT RULES ===

- Be FAIR to the user - if there's a noticeable difference that changes how the dress looks, it's a MISMATCH
- Be FAIR to the system - minor variations in lighting, mannequin pose, or background are NOT mismatches
- Focus on the GARMENT ITSELF, not the mannequin or background
- The key question: "Would a fashion buyer recognize this as the SAME DRESS?"

Respond with ONLY your verdict (MATCH or MISMATCH) followed by a brief 1-sentence explanation.`;
    } else {
      // Generic inspection for other features
      inspectionPrompt = `You are a quality control inspector. Compare the INPUT image with the OUTPUT image and determine if the AI generation was successful and accurate.

For ${featureName}, check if the output correctly represents what was requested based on the input.

Respond with:
VERDICT: MATCH - if the output is correct and matches expectations
VERDICT: MISMATCH - if the output is clearly wrong or doesn't match the input

Be fair: minor variations are acceptable, but significant errors should be flagged.

Respond with ONLY your verdict followed by a brief 1-sentence explanation.`;
    }

    console.log('Calling AI for inspection...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: inspectionPrompt
              },
              {
                type: 'text',
                text: 'INPUT IMAGE (Original):'
              },
              {
                type: 'image_url',
                image_url: { url: inputImage }
              },
              {
                type: 'text',
                text: 'OUTPUT IMAGE (Generated):'
              },
              {
                type: 'image_url',
                image_url: { url: outputImage }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI inspection error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to inspect images' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const inspectionResult = aiData.choices?.[0]?.message?.content || "";
    
    console.log('Inspection result:', inspectionResult);

    // Parse the verdict
    const isMismatch = inspectionResult.toUpperCase().includes('VERDICT: MISMATCH');
    const isMatch = inspectionResult.toUpperCase().includes('VERDICT: MATCH');

    if (!isMismatch && !isMatch) {
      console.error('Could not parse verdict from:', inspectionResult);
      return new Response(
        JSON.stringify({ 
          error: 'Could not determine inspection result',
          rawResult: inspectionResult 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let gemsRefunded = 0;
    let refundSuccess = false;

    // If mismatch detected, refund the gems
    if (isMismatch && gemCost && gemCost > 0) {
      console.log('Mismatch detected, refunding', gemCost, 'gems to user', userId);
      
      const { data: refundData, error: refundError } = await supabase.rpc('add_gems', {
        p_user_id: userId,
        p_gems: gemCost,
        p_transaction_type: 'inspection_refund'
      });

      if (refundError) {
        console.error('Error refunding gems:', refundError);
      } else {
        gemsRefunded = gemCost;
        refundSuccess = true;
        console.log('Gems refunded successfully, new balance:', refundData);
      }
    }

    // Extract just the explanation (remove VERDICT: prefix)
    const explanation = inspectionResult
      .replace(/VERDICT:\s*(MATCH|MISMATCH)\s*/i, '')
      .trim();

    return new Response(
      JSON.stringify({
        verdict: isMismatch ? 'mismatch' : 'match',
        explanation,
        gemsRefunded,
        refundSuccess
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in inspect-generation function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
