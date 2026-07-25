export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const jsonResponse = (body: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export async function callLovableAI(payload: any) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI ${r.status}: ${t.slice(0, 300)}`);
  }
  return r.json();
}

export function extractJson(text: string): any {
  if (!text) return null;
  // strip fenced code
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fence?.[1] || text).trim();
  try {
    return JSON.parse(raw);
  } catch {
    // find first {...}
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* ignore */ }
    }
    return null;
  }
}
