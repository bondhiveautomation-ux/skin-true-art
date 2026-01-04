import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Replicate from "https://esm.sh/replicate@0.25.2"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Preset prompts for video generation
const PRESET_PROMPTS: Record<string, string> = {
  "elegant": "A 5-second ultra-realistic cinematic video with subtle natural movement. The subject remains still with gentle breathing and micro facial motion. Soft professional studio lighting, shallow depth of field, smooth background blur. No dramatic camera movement. Calm, premium, elegant mood. Natural skin texture preserved. High-end fashion videography style.",
  
  "luxury-fashion": "A 5-second luxury fashion-style video with slow, smooth motion. Subject maintains original pose with minimal natural movement. Soft directional lighting highlights facial contours and outfit texture. Cinematic depth, controlled highlights, no artificial effects. Feels like a high-end fashion brand campaign.",
  
  "soft-glam-beauty": "A 5-second beauty videography clip with soft glam lighting. Natural blinking and breathing only. Even skin tones, realistic makeup texture preserved. Gentle light falloff, warm highlights, professional beauty studio aesthetic. No camera shake or zoom.",
  
  "cinematic-portrait": "A 5-second cinematic portrait video with subtle atmospheric depth. Subject remains steady with micro-movements only. Soft ambient lighting, cinematic color grading, smooth motion consistency. Feels like a premium film still brought gently to life.",
  
  "studio-commercial": "A 5-second professional commercial-style video. Clean studio background, controlled lighting, crisp subject separation. Minimal motion, high clarity, realistic textures. Designed for brand advertising and professional marketing use.",
  
  "modern-influencer": "A 5-second modern influencer-style video with natural motion and calm energy. Subject remains mostly still with gentle expression changes. Soft lighting, neutral background, realistic colors. Feels organic, social-media ready, not overproduced.",
  
  "bridal-premium": "A 5-second bridal beauty video with soft romantic lighting. Natural breathing and eye movement only. Skin texture and makeup details preserved accurately. Elegant, timeless, professional bridal studio aesthetic.",
  
  "editorial-fashion": "A 5-second editorial fashion video inspired by magazine shoots. Controlled lighting, high contrast but natural tones. Subject stays steady with micro head or eye movement. Clean, artistic, premium editorial feel.",
  
  "minimal-luxury": "A 5-second minimal luxury video with clean composition. Neutral background, soft shadows, subtle highlights. Very restrained motion, calm breathing only. High-end, understated, professional aesthetic.",
  
  "cinematic-glow": "A 5-second cinematic glow video with soft luminous lighting. Natural facial motion only. Gentle glow without artificial effects. Smooth gradients, premium color balance, elegant and realistic presentation.",
};

// Convert base64 to blob and upload to Supabase storage for URL
async function uploadBase64ToStorage(base64Data: string): Promise<string> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Extract base64 content and mime type
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid base64 data format')
  }
  
  const mimeType = matches[1]
  const base64Content = matches[2]
  
  // Convert base64 to Uint8Array
  const binaryString = atob(base64Content)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  // Generate unique filename
  const ext = mimeType.split('/')[1] || 'png'
  const fileName = `video-input-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  
  // Upload to storage bucket (create 'temp-uploads' bucket if needed)
  const { data, error } = await supabase.storage
    .from('temp-uploads')
    .upload(fileName, bytes, {
      contentType: mimeType,
      upsert: false,
    })
  
  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('temp-uploads')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set')
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    })

    const body = await req.json()

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      const prediction = await replicate.predictions.get(body.predictionId)
      console.log("Status check response:", prediction.status)
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generation request
    const { imageUrl, preset, customPrompt } = body

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required field: imageUrl" }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!preset || !PRESET_PROMPTS[preset]) {
      return new Response(
        JSON.stringify({ error: "Invalid preset selected" }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Handle base64 images by uploading to storage first
    let finalImageUrl = imageUrl
    if (imageUrl.startsWith('data:')) {
      console.log("Converting base64 to URL via storage upload...")
      finalImageUrl = await uploadBase64ToStorage(imageUrl)
      console.log("Image uploaded, URL:", finalImageUrl)
    }

    // Build the final prompt
    let finalPrompt = PRESET_PROMPTS[preset];
    
    // If custom prompt provided, softly combine it
    if (customPrompt && customPrompt.trim()) {
      finalPrompt = `${PRESET_PROMPTS[preset]} Additional context: ${customPrompt.trim()}. Maintain all realism and quality rules.`;
    }

    console.log("Generating video with Luma Ray (Dream Machine)")
    console.log("Preset:", preset)
    console.log("Custom prompt:", customPrompt || "None")

    // Create prediction with Luma Ray (Dream Machine) - supports image-to-video
    const prediction = await replicate.predictions.create({
      model: "luma/ray",
      input: {
        prompt: finalPrompt,
        start_image: finalImageUrl,
        aspect_ratio: "9:16",
      }
    })

    console.log("Prediction created:", prediction.id, "Status:", prediction.status)

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in generate-video function:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
