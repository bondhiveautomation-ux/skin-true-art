import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse, callLovableAI, extractJson } from "../_shared/bm.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { project, brand, analysis, naming_style } = await req.json();
    const prompt = `You are a premium product naming expert for a Shopify brand.
Return 6-8 premium product-name options as strict JSON:
{"names":[{"name":"","subtitle":"","style":"","rationale":"","positioning":"","confidence":0.0}]}

Rules:
- Names should feel like legitimate branded product names, not supplier titles.
- Easy to remember, premium, suit the category, natural for Bangladeshi + international audiences.
- Do NOT claim legal availability. Do NOT invent trademarks.
- Naming style focus: ${naming_style || "premium"}
- Brand context: ${JSON.stringify(brand || {})}
- Product analysis: ${JSON.stringify(analysis || {})}
- User input: ${JSON.stringify(project || {})}

Reply ONLY with JSON.`;

    const data = await callLovableAI({
      model: "google/gemini-3.6-flash",
      messages: [{ role: "user", content: prompt }],
    });
    const text = data.choices?.[0]?.message?.content || "";
    const parsed = extractJson(text) || { names: [] };
    return jsonResponse({ names: parsed.names || [] });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 200);
  }
});
