import { supabase } from '@/integrations/supabase/client';

export interface CryptoPrediction {
  asset: 'BTC' | 'ETH';
  currentPrice: number;
  prediction: 'UP' | 'DOWN';
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export const fetchCryptoPrediction = async (asset: 'BTC' | 'ETH'): Promise<CryptoPrediction> => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-crypto-prices', {
      body: { asset }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching crypto prediction:', error);
    // Fallback to mock data
    return {
      asset,
      currentPrice: asset === 'BTC' ? 43250 : 2640,
      prediction: Math.random() > 0.5 ? 'UP' : 'DOWN',
      confidence: Math.floor(Math.random() * 40) + 60,
      reasoning: `Network error - showing fallback prediction for ${asset}`,
      timestamp: new Date().toISOString(),
    };
  }
};

export const fetchMultipleCryptoPrices = async (): Promise<{ BTC: number; ETH: number }> => {
  try {
    const [btcData, ethData] = await Promise.all([
      fetchCryptoPrediction('BTC'),
      fetchCryptoPrediction('ETH'),
    ]);

    return {
      BTC: btcData.currentPrice,
      ETH: ethData.currentPrice,
    };
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
    return {
      BTC: 43250,
      ETH: 2640,
    };
  }
};