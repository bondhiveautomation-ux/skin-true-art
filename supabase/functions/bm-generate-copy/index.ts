import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse, callLovableAI } from "../_shared/bm.ts";

const SECTION_RULES: Record<string, string> = {
  short_desc: "A short 2-4 sentence Shopify short description. Mobile-friendly.",
  full_desc: "A full Shopify product description with 3-5 short paragraphs. Mobile-friendly line breaks.",
  benefits: "A bullet list of 4-6 key customer benefits. Use '- ' bullets.",
  specs: "A bullet list of product specifications. Use '- Key: value' format.",
  size_fit: "Size & fit guidance. Mention only what the user provided or the analysis inferred safely.",
  delivery: "Delivery, COD, pre-order and payment information based on the brand + product data.",
  tags: "A single comma-separated line of 15-25 Shopify tags. No hashtags. No duplicates. Only the tags line, no commentary.",
  seo_title: "A single line SEO product title under 70 characters. Only the title.",
  seo_meta: "A single meta description 140-160 characters. Only the description.",
  faq: "5-7 FAQs in 'Q: ...\\nA: ...' format.",
  ending: "A short premium closing statement for the product page.",
  ad_primary: "Facebook ad primary text — persuasive, authoritative, 3-6 short lines.",
  ad_headline: "Facebook ad headline under 40 characters. Only the headline.",
  reel_hook: "3 short reel opening hooks separated by newlines.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const {
      section, project, brand, analysis, product_name,
      language_ratio, tone, length, emoji_density,
      current_content, instructions,
    } = await req.json();

    const sectionRule = SECTION_RULES[section] || "Generate copy for this section.";

    const prompt = `You are a senior Shopify conversion copywriter for Bangladeshi + international brands.
Produce ONLY the requested section content. No preface. No commentary. No markdown fences.

Section: ${section}
Rules for this section:
${sectionRule}

Global rules:
- Product name (LOCKED): "${product_name}". Use this exact name everywhere it appears.
- Language: mix Bangla and English naturally at approximately ${language_ratio}% Bangla / ${100 - (language_ratio ?? 50)}% English. If ratio is 0 use English only. If 100 use Bangla only.
- Tone: ${tone}
- Length: ${length}
- Emoji density: ${emoji_density} (none / minimal / balanced / expressive)
- Do NOT invent fabric, size, delivery, quality or performance details not present in the input.
- Do NOT use fake urgency or unsupported claims.
- No awkward literal Bangla translation.
${brand?.custom_ai_instructions ? `- Brand custom instructions: ${brand.custom_ai_instructions}` : ""}
${brand?.avoid_phrases?.length ? `- Avoid these phrases: ${JSON.stringify(brand.avoid_phrases)}` : ""}

Brand: ${JSON.stringify(brand || {})}
Product data: ${JSON.stringify(project || {})}
Analysis: ${JSON.stringify(analysis || {})}
${current_content ? `\nExisting content to revise (preserve everything except the requested change):\n${current_content}` : ""}
${instructions ? `\nUser instructions: ${instructions}` : ""}

Reply with the final section content only.`;

    const data = await callLovableAI({
      model: "google/gemini-3.6-flash",
      messages: [{ role: "user", content: prompt }],
    });
    const content = (data.choices?.[0]?.message?.content || "").trim();
    return jsonResponse({ content, meta: { section, tone, length, language_ratio, emoji_density } });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 200);
  }
});
