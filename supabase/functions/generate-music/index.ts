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

    let output;
    
    if (mode === "lyrics") {
      // Lyrics-to-Song Mode - Use minimax/music-1.5 for vocal generation
      if (!lyrics || !language || !genre) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: lyrics, language, and genre are required" }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Build style prompt for minimax model
      let stylePrompt = `${genre}`;
      if (prompt) {
        stylePrompt += `, ${prompt}`;
      }
      
      console.log("Generating song with vocals:", { lyrics: lyrics.substring(0, 100), stylePrompt });

      // Use minimax/music-1.5 model which supports vocals
      output = await replicate.run(
        "minimax/music-1.5",
        {
          input: {
            lyrics: lyrics,
            prompt: stylePrompt
          }
        }
      );
      
    } else if (mode === "instrumental") {
      // Instrumental-Only Mode - Use MusicGen for instrumentals
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
      let musicPrompt = `Generate a high-quality ${instrumentalType} instrumental track. `;
      
      if (prompt) {
        musicPrompt += `Style guidance: ${prompt}. `;
      }
      
      musicPrompt += `The music should be professionally mixed with clean audio quality, suitable for royalty-free use.`;
      
      console.log("Generated instrumental prompt:", musicPrompt);

      // Use MusicGen model from Meta for instrumentals
      output = await replicate.run(
        "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        {
          input: {
            prompt: musicPrompt,
            model_version: "stereo-large",
            output_format: "mp3",
            normalization_strategy: "peak",
            duration: 30,
          }
        }
      );
      
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Must be 'lyrics' or 'instrumental'" }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

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
