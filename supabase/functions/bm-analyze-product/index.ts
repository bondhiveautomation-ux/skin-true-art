import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse, callLovableAI, extractJson } from "../_shared/bm.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { project, brand, images } = await req.json();
    const content: any[] = [
      {
        type: "text",
        text: `You are a senior e-commerce product analyst.
Analyze the provided product images and the user-supplied information.
Return a strict JSON object with these keys:
- category
- product_type
- probable_material
- visible_colors
- design_details
- pattern
- shape_silhouette
- key_features
- unique_selling_points
- likely_customer
- suitable_occasions
- premium_positioning
- emotional_angles
- practical_angles
- concerns_or_unclear
- missing_information
- suggested_campaign_direction
- confirmed_from_user (list of facts the user provided)
- inferred_from_images (list of facts you inferred visually)
- uncertain (list of things user must verify before publishing)

Rules:
- Never invent fabric, size, delivery, quality or performance details.
- Mark uncertain items in "uncertain".
- Reply with ONLY JSON. No prose. No markdown.

USER INPUT:
${JSON.stringify(project, null, 2)}

BRAND:
${JSON.stringify(brand || {}, null, 2)}`,
      },
      ...(images || []).slice(0, 6).map((url: string) => ({ type: "image_url", image_url: { url } })),
    ];

    const data = await callLovableAI({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content }],
    });
    const text = data.choices?.[0]?.message?.content || "";
    const analysis = extractJson(text) || { raw: text };
    return jsonResponse({ analysis });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 200);
  }
});
