import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not set');
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_KEY,
    });

    const body = await req.json();
    const { mode, lyrics, language, genre, prompt, instrumentalType } = body;

    console.log("Music generation request:", { mode, language, genre, instrumentalType });

    let musicPrompt = "";
    
    if (mode === "lyrics") {
      // Lyrics-to-Song Mode
      if (!lyrics || !language || !genre) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: lyrics, language, and genre are required" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Build comprehensive prompt for lyrics-to-song
      musicPrompt = `Generate a ${genre} song with vocals singing these lyrics in ${language}: "${lyrics}". `;
      
      if (prompt) {
        musicPrompt += `Additional style guidance: ${prompt}. `;
      }
      
      musicPrompt += `The song should have realistic vocals, proper melody, background music, and professional mastering that matches the ${genre} genre.`;
      
    } else if (mode === "instrumental") {
      // Instrumental-Only Mode
      if (!instrumentalType) {
        return new Response(
          JSON.stringify({ error: "Missing required field: instrumentalType is required" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Build comprehensive prompt for instrumental
      musicPrompt = `Generate a high-quality ${instrumentalType} instrumental track. `;
      
      if (prompt) {
        musicPrompt += `Style guidance: ${prompt}. `;
      }
      
      musicPrompt += `The music should be professionally mixed with clean audio quality, suitable for royalty-free use.`;
      
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be 'lyrics' or 'instrumental'" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log("Generated music prompt:", musicPrompt);

    // Use MusicGen model from Meta
    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          prompt: musicPrompt,
          model_version: "stereo-large",
          output_format: "mp3",
          normalization_strategy: "peak",
          duration: 30, // Start with 30 seconds, can be adjusted
        }
      }
    );

    console.log("Music generation response:", output);

    return new Response(
      JSON.stringify({ audioUrl: output }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate-music function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
