import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptionRequest {
  productImage?: string;
  description: string;
  language: "bangla" | "english";
  withEmojis: boolean;
  captionLength: "short" | "medium" | "long";
  toneStyle: "bold_salesy" | "elegant_premium" | "friendly_casual" | "minimal_clean";
  generateVariations: boolean;
}

const toneDescriptions: Record<string, string> = {
  bold_salesy: "Bold, energetic, and sales-driven. Use urgency, excitement, and strong action words.",
  elegant_premium: "Sophisticated, refined, and luxurious. Use polished language that conveys exclusivity.",
  friendly_casual: "Warm, approachable, and conversational. Like talking to a friend.",
  minimal_clean: "Simple, modern, and straightforward. No fluff, just key points.",
};

const lengthInstructions: Record<string, string> = {
  short: "Write a very concise caption of 1-2 lines maximum, followed by a clear CTA.",
  medium: "Write a medium-length caption with 3-5 bullet points highlighting key benefits, followed by a strong CTA.",
  long: "Write a detailed caption with comprehensive bullet points covering features, benefits, trust elements (like warranty, quality), and a compelling CTA at the end.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CaptionRequest = await req.json();
    const { productImage, description, language, withEmojis, captionLength, toneStyle, generateVariations } = body;

    console.log("Caption generation request:", { language, withEmojis, captionLength, toneStyle, generateVariations });

    if (!productImage && !description) {
      return new Response(
        JSON.stringify({ error: "Please provide a product image or description" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstruction = language === "bangla" 
      ? "Write the caption ENTIRELY in proper Bengali script (বাংলা). Do NOT use transliteration or romanized Bengali. The output must be readable native Bengali."
      : "Write the caption in simple, modern, engaging English suitable for social media marketing.";

    const emojiInstruction = withEmojis 
      ? "Include relevant emojis naturally throughout the caption to enhance readability and engagement. Don't overdo it - use them strategically."
      : "DO NOT include ANY emojis in the caption. Zero emojis.";

    const toneInstruction = toneDescriptions[toneStyle] || toneDescriptions.bold_salesy;
    const lengthInstruction = lengthInstructions[captionLength] || lengthInstructions.medium;

    const variationInstruction = generateVariations 
      ? "Generate 2 DIFFERENT versions of the caption. Separate them with '---SEPARATOR---'. Each version should have a different approach while following all the same rules."
      : "Generate 1 caption only.";

    const systemPrompt = `You are an expert social media copywriter specializing in high-converting product captions for Facebook, Instagram, and e-commerce platforms.

Your captions must:
1. Be highly converting and attention-grabbing
2. Include product benefits and trust cues
3. Use proper formatting with line breaks for readability
4. End with a strong, clear call-to-action (CTA) like: "Order now", "Inbox now", "DM to buy", "Call now", "Limited stock - grab yours!", "Shop now", etc.
5. Be suitable for the Bangladeshi market context

LANGUAGE: ${languageInstruction}

EMOJI RULE: ${emojiInstruction}

TONE: ${toneInstruction}

LENGTH: ${lengthInstruction}

${variationInstruction}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    if (productImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: productImage }
      });
    }

    const productDesc = description 
      ? `\n\nProduct Details provided by seller:\n${description}`
      : "\n\n(No description provided - analyze the product from the image)";

    userContent.push({
      type: "text",
      text: `Create a ${captionLength} ${language === "bangla" ? "Bengali" : "English"} product caption for this product.${productDesc}\n\nRemember: ${withEmojis ? "Use emojis naturally" : "NO EMOJIS AT ALL"}. End with a compelling CTA.`
    });

    console.log("Calling Lovable AI for caption generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const captionText = data.choices?.[0]?.message?.content;

    if (!captionText) {
      throw new Error("No caption generated from AI");
    }

    console.log("Caption generated successfully");

    // Parse captions
    let captions: string[];
    if (generateVariations && captionText.includes('---SEPARATOR---')) {
      captions = captionText.split('---SEPARATOR---').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    } else {
      captions = [captionText.trim()];
    }

    // Clean up any remaining separator markers if AI added extra
    captions = captions.map((caption: string) => 
      caption.replace(/---SEPARATOR---/g, '').trim()
    );

    return new Response(
      JSON.stringify({ captions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Caption generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate caption" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
