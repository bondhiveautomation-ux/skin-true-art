import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentConfig {
  id: string;
  name: string;
  getSystemPrompt: (promptType: string, originalPrompt: string) => string;
}

const getPromptTypeContext = (promptType: string): string => {
  switch (promptType) {
    case 'image':
      return "This is an IMAGE GENERATION prompt. Focus on visual descriptors, style keywords, composition, lighting, camera angles, and artistic direction.";
    case 'pdf':
      return "This is a DOCUMENT/PDF generation prompt. Focus on structure, formal language, sections, professional formatting, and clear organization.";
    case 'code':
      return "This is a CODE generation prompt. Focus on specifications, edge cases, language-specific syntax, error handling, and technical precision.";
    case 'email':
      return "This is an EMAIL/COMMUNICATION prompt. Focus on tone, call-to-action, professional formatting, clarity, and appropriate formality.";
    default:
      return "This is a GENERAL prompt. Focus on clarity, structure, and comprehensive detail.";
  }
};

const AGENTS: AgentConfig[] = [
  {
    id: 'detailer',
    name: 'Detailer',
    getSystemPrompt: (promptType: string, _originalPrompt: string) => `You are Agent 1: The Detailer.
${getPromptTypeContext(promptType)}

Your job is to enhance the user's raw prompt with:
- Specific technical details relevant to the prompt type
- Precise, unambiguous language
- Clear structure and logical flow
- Industry-standard terminology

CRITICAL: Keep the original intent 100% intact. Do NOT change the core request.
Output ONLY the enhanced prompt text, nothing else. No explanations.`
  },
  {
    id: 'contextualizer',
    name: 'Contextualizer',
    getSystemPrompt: (promptType: string, _originalPrompt: string) => `You are Agent 2: The Contextualizer.
${getPromptTypeContext(promptType)}

Build upon the previous agent's enhanced prompt by adding:
1. A clear Persona/Role for the AI (e.g., "You are an expert...")
2. Relevant context about the task and expected outcomes
3. 2 specific examples of what good output looks like

Keep everything the previous agent added. Enrich, don't replace.
Output ONLY the enriched prompt text, nothing else. No explanations.`
  },
  {
    id: 'alignment',
    name: 'Alignment Check',
    getSystemPrompt: (_promptType: string, originalPrompt: string) => `You are Agent 3: The Alignment Checker.

ORIGINAL USER INTENT: "${originalPrompt}"

Your critical job is to:
1. Compare the refined prompt to the ORIGINAL user intent above
2. Check for scope creep or drift from the original request
3. If there's drift, correct it while keeping valid enhancements
4. If aligned, pass through with minor clarity improvements

Your goal is to prevent the prompt from becoming something the user didn't ask for.
Output ONLY the aligned prompt text, nothing else. No explanations.`
  },
  {
    id: 'polisher',
    name: 'Polisher',
    getSystemPrompt: (promptType: string, _originalPrompt: string) => `You are Agent 4: The Polisher.
${getPromptTypeContext(promptType)}

Final editing pass. Your job is to:
- Fix any grammar, spelling, or punctuation errors
- Ensure professional, confident tone
- Apply clear formatting (use headers, bullets, numbered lists where appropriate)
- Remove any redundancy or filler words
- Ensure the prompt flows logically

Output ONLY the polished, professional prompt, nothing else. No explanations.`
  },
  {
    id: 'final',
    name: 'Final Output',
    getSystemPrompt: (promptType: string, _originalPrompt: string) => `You are Agent 5: Final Output Generator.
${getPromptTypeContext(promptType)}

Present the completed prompt in a clean, ready-to-use format.

After the main prompt, add a brief separator line "---" and then include:
**Quick Tips:**
- 2-3 bullet points about how to best use this prompt
- Any model/tool recommendations if relevant

This is the final version the user will copy and use.
Output the complete, ready-to-use prompt with tips.`
  }
];

async function runAgent(
  agentConfig: AgentConfig,
  inputPrompt: string,
  promptType: string,
  originalPrompt: string,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: agentConfig.getSystemPrompt(promptType, originalPrompt) },
        { role: "user", content: inputPrompt }
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Agent ${agentConfig.name} error:`, response.status, errorText);
    throw new Error(`Agent ${agentConfig.name} failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || inputPrompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, promptType = 'general' } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide a prompt to refine" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing API configuration" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const originalPrompt = prompt.trim();
    const agentResults: { id: string; name: string; output: string }[] = [];
    let currentPrompt = originalPrompt;

    // Run each agent sequentially
    for (const agentConfig of AGENTS) {
      console.log(`Running agent: ${agentConfig.name}`);
      
      const output = await runAgent(
        agentConfig,
        currentPrompt,
        promptType,
        originalPrompt,
        LOVABLE_API_KEY
      );

      agentResults.push({
        id: agentConfig.id,
        name: agentConfig.name,
        output: output
      });

      currentPrompt = output;
    }

    return new Response(
      JSON.stringify({
        success: true,
        originalPrompt,
        promptType,
        agents: agentResults,
        finalPrompt: currentPrompt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Prompt engineer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Processing failed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
