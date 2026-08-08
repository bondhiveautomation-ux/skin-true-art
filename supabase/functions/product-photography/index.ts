import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3-pro-image-preview";

const SYSTEM_PROMPT = `You are an elite commercial PRODUCT PHOTOGRAPHER and retouching engine.

🔒 ABSOLUTE PRODUCT LOCK (NON-NEGOTIABLE):
- The product in the reference images must be reproduced EXACTLY: same shape, proportions, colour, material, texture, stitching, hardware, prints, labels, and logos.
- Do NOT redesign, restyle, recolour, simplify, or "improve" the product.
- Do NOT invent extra parts, patterns or text that do not exist in the reference.
- Every generated image must be instantly recognisable as the SAME physical product.

🎥 YOUR JOB:
Create a premium commercial photograph of that exact product, following the user's creative direction.
- Photorealistic, 8K, sharp focus on the product.
- Professional studio-grade lighting, natural shadows and reflections.
- Clean, tasteful composition suitable for e-commerce and advertising.

❌ NEVER: watermarks, text overlays, UI elements, collages, split frames, multiple variants in one frame, cartoon/3D-render look, distorted geometry.
✅ ALWAYS: one single clean photograph of the product, true-to-reference.

Output the image only.`;

// Five distinct commercial angles/setups so the set feels like a real photoshoot
const VARIATIONS = [
  "Hero shot: straight-on front view of the product, centered, perfectly lit, the strongest commercial hero image of the set.",
  "Three-quarter angle shot showing depth and dimension of the product, slight side perspective, soft directional lighting.",
  "Close-up detail / macro shot highlighting the material, texture and craftsmanship of the product with shallow depth of field.",
  "Lifestyle context shot: the product placed naturally in a tasteful environment that matches the creative direction, product still the clear focus.",
  "Editorial top-down or elevated flat-lay style shot of the product with elegant styling and premium negative space.",
];

async function uploadImageToStorage(
  supabase: any,
  base64Data: string,
  userId: string,
  index: number,
): Promise<string | null> {
  try {
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return null;
    const extension = matches[1];
    const buffer = Uint8Array.from(atob(matches[2]), (c) => c.charCodeAt(0));
    const fileName = `${userId}/product_photography_${Date.now()}_${index}.${extension}`;
    const { error } = await supabase.storage
      .from("generation-images")
      .upload(fileName, buffer, { contentType: `image/${extension}`, upsert: false });
    if (error) {
      console.error("Storage upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("generation-images").getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (e) {
    console.error("Upload failed:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, description, prompt, userId } = await req.json();

    if (!Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "Please upload at least one product image." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!prompt || !String(prompt).trim()) {
      return new Response(JSON.stringify({ error: "Please describe how you want the product photographed." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const refImages = images.slice(0, 10);

    const generateOne = async (variation: string) => {
      const content: any[] = [
        {
          type: "text",
          text: `PRODUCT REFERENCE IMAGES: ${refImages.length} image(s) of the exact product are attached. Replicate the product with 100% accuracy.

PRODUCT DESCRIPTION:
${description?.trim() || "(not provided)"}

CREATIVE DIRECTION FROM USER (highest priority):
${String(prompt).trim()}

SHOT BRIEF FOR THIS IMAGE:
${variation}

Deliver a single photorealistic commercial photograph of that exact product.`,
        },
        ...refImages.map((url: string) => ({ type: "image_url", image_url: { url } })),
      ];

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI gateway error:", res.status, text.substring(0, 300));
        return { status: res.status, image: null as string | null };
      }
      const data = await res.json();
      if (data?.error) {
        console.error("AI payload error:", JSON.stringify(data).substring(0, 300));
        return { status: 500, image: null as string | null };
      }
      return {
        status: 200,
        image: (data.choices?.[0]?.message?.images?.[0]?.image_url?.url as string) || null,
      };
    };

    const results = await Promise.all(VARIATIONS.map((v) => generateOne(v)));

    const rateLimited = results.some((r) => r.status === 429);
    const outOfCredits = results.some((r) => r.status === 402);
    const generated = results.map((r) => r.image).filter((x): x is string => !!x);

    if (generated.length === 0) {
      const message = outOfCredits
        ? "AI credits exhausted. Please add funds to continue."
        : rateLimited
          ? "Rate limit exceeded. Please try again in a moment."
          : "Image generation failed. Please try again.";
      return new Response(JSON.stringify({ error: message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store outputs so the client never handles huge base64 payloads
    let finalUrls = generated;
    if (userId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const uploaded = await Promise.all(
        generated.map((img, i) => uploadImageToStorage(supabase, img, userId, i)),
      );
      finalUrls = uploaded.map((u, i) => u || generated[i]);
    }

    return new Response(JSON.stringify({ results: finalUrls }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Product photography error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
