import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a professional AI prompt engineer specialized in character-consistent image generation.

Your task is to rewrite the user's prompt into a clearer, more professional, AI-optimized version.

🔒 MANDATORY RULE — NEVER SKIP
Every refined prompt MUST include a clear instruction that:
- The character's face, identity, age, gender, expression, hair, and body proportions remain EXACTLY THE SAME
- No facial modification, beautification, or identity drift is allowed

STRICT CONSTRAINTS:
- Do NOT change the user's intent
- Do NOT add new concepts
- Do NOT introduce outfits, makeup, poses, or backgrounds unless explicitly stated
- Do NOT exaggerate or stylize unless the user asked for it

OUTPUT RULES:
- Output ONLY the refined prompt text
- No explanations
- No formatting
- No bullet points

🧪 Identity Lock Clause (AUTO-INJECTED)
Every refined prompt must end with or include wording similar to:
"…while keeping the character's face, identity, facial features, expression, hairstyle, body structure, and proportions exactly the same as the uploaded photo, with absolutely no facial or identity changes."

This clause is always present, even if the user did not mention it.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Please write a prompt to refine." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Refine this prompt for character-consistent image generation:\n\n${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable, please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to refine prompt");
    }

    const data = await response.json();
    const refinedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!refinedPrompt) {
      throw new Error("No refined prompt returned");
    }

    return new Response(
      JSON.stringify({ refinedPrompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in refine-prompt function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
