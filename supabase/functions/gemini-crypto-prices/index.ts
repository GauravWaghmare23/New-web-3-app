import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asset } = await req.json();
    
    // Mock crypto prices for now - you can integrate with real APIs like CoinGecko
    const prices = {
      BTC: 43250 + (Math.random() - 0.5) * 1000,
      ETH: 2640 + (Math.random() - 0.5) * 100,
    };

    const price = prices[asset as keyof typeof prices] || 0;
    
    // Generate AI prediction using simple logic (you can enhance this with Gemini API)
    const trend = Math.random() > 0.5 ? 'UP' : 'DOWN';
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    const prediction = {
      asset,
      currentPrice: price,
      prediction: trend,
      confidence,
      reasoning: `Based on market analysis, ${asset} shows ${trend.toLowerCase()}ward momentum with ${confidence}% confidence.`,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-crypto-prices function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});