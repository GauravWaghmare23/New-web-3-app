import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchMultipleCryptoPrices } from '@/services/cryptoApi';

export interface UserProfile {
  id: string;
  wallet_address: string;
  shm_tokens: number;
  prediction_streak: number;
  total_predictions: number;
  correct_predictions: number;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  asset: 'BTC' | 'ETH';
  prediction: 'UP' | 'DOWN';
  confidence: number;
  entry_price: number;
  target_price?: number;
  timeframe: string;
  status: 'PENDING' | 'WON' | 'LOST';
  reward_tokens: number;
  created_at: string;
  resolved_at?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  asset: 'BTC' | 'ETH';
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  total_shm: number;
  tx_hash?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

interface AppContextType {
  // User data
  userProfile: UserProfile | null;
  predictions: Prediction[];
  trades: Trade[];
  
  // Crypto prices
  btcPrice: number;
  ethPrice: number;
  priceHistory: { time: string; btc: number; eth: number }[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  createUserProfile: (walletAddress: string) => Promise<void>;
  loadUserData: (walletAddress: string) => Promise<void>;
  updateSHMTokens: (amount: number) => Promise<void>;
  createPrediction: (prediction: Omit<Prediction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  resolvePrediction: (predictionId: string, won: boolean) => Promise<void>;
  createTrade: (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  fetchCryptoPrices: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [btcPrice, setBtcPrice] = useState(43250);
  const [ethPrice, setEthPrice] = useState(2640);
  const [priceHistory, setPriceHistory] = useState<{ time: string; btc: number; eth: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real crypto prices using our Edge Function
  const fetchCryptoPrices = async () => {
    try {
      const prices = await fetchMultipleCryptoPrices();
      
      setBtcPrice(prices.BTC);
      setEthPrice(prices.ETH);
      
      const timestamp = new Date().toISOString();
      setPriceHistory(prev => [
        ...prev.slice(-100), // Keep last 100 entries
        { time: timestamp, btc: prices.BTC, eth: prices.ETH }
      ]);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      // Fallback to simulated prices
      const btcChange = (Math.random() - 0.5) * 1000;
      const ethChange = (Math.random() - 0.5) * 100;
      
      const newBtcPrice = Math.max(30000, btcPrice + btcChange);
      const newEthPrice = Math.max(1500, ethPrice + ethChange);
      
      setBtcPrice(newBtcPrice);
      setEthPrice(newEthPrice);
      
      const timestamp = new Date().toISOString();
      setPriceHistory(prev => [
        ...prev.slice(-100),
        { time: timestamp, btc: newBtcPrice, eth: newEthPrice }
      ]);
    }
  };

  const createUserProfile = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingProfile) {
        setUserProfile(existingProfile);
        return;
      }

      // Create new profile
      const newProfile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = {
        wallet_address: walletAddress,
        shm_tokens: 100, // Starting bonus
        prediction_streak: 0,
        total_predictions: 0,
        correct_predictions: 0,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      
      // Load user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (profile) {
        setUserProfile(profile);
        
        // Load user predictions
        const { data: userPredictions } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (userPredictions) {
          setPredictions(userPredictions as Prediction[]);
        }

        // Load user trades
        const { data: userTrades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (userTrades) {
          setTrades(userTrades as Trade[]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSHMTokens = async (amount: number) => {
    if (!userProfile) return;

    try {
      const updatedTokens = Math.max(0, userProfile.shm_tokens + amount);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          shm_tokens: updatedTokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error updating SHM tokens:', error);
    }
  };

  const createPrediction = async (prediction: Omit<Prediction, 'id' | 'user_id' | 'created_at'>) => {
    if (!userProfile) return;

    try {
      const newPrediction = {
        ...prediction,
        user_id: userProfile.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('predictions')
        .insert([newPrediction])
        .select()
        .single();

      if (error) throw error;
      
      setPredictions(prev => [data as Prediction, ...prev]);
      
      // Update user profile prediction count
      await supabase
        .from('user_profiles')
        .update({ 
          total_predictions: userProfile.total_predictions + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      setUserProfile(prev => prev ? {
        ...prev,
        total_predictions: prev.total_predictions + 1
      } : null);
    } catch (error) {
      console.error('Error creating prediction:', error);
    }
  };

  const resolvePrediction = async (predictionId: string, won: boolean) => {
    if (!userProfile) return;

    try {
      const prediction = predictions.find(p => p.id === predictionId);
      if (!prediction) return;

      const rewardTokens = won ? prediction.reward_tokens : 0;
      
      const { error } = await supabase
        .from('predictions')
        .update({
          status: won ? 'WON' : 'LOST',
          resolved_at: new Date().toISOString()
        })
        .eq('id', predictionId);

      if (error) throw error;

      // Update predictions list
      setPredictions(prev => prev.map(p => 
        p.id === predictionId 
          ? { ...p, status: won ? 'WON' : 'LOST', resolved_at: new Date().toISOString() }
          : p
      ));

      // Update user profile
      const newCorrectPredictions = won ? userProfile.correct_predictions + 1 : userProfile.correct_predictions;
      const newStreak = won ? userProfile.prediction_streak + 1 : 0;

      await supabase
        .from('user_profiles')
        .update({
          correct_predictions: newCorrectPredictions,
          prediction_streak: newStreak,
          shm_tokens: userProfile.shm_tokens + rewardTokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      setUserProfile(prev => prev ? {
        ...prev,
        correct_predictions: newCorrectPredictions,
        prediction_streak: newStreak,
        shm_tokens: prev.shm_tokens + rewardTokens
      } : null);
    } catch (error) {
      console.error('Error resolving prediction:', error);
    }
  };

  const createTrade = async (trade: Omit<Trade, 'id' | 'user_id' | 'created_at'>) => {
    if (!userProfile) return;

    try {
      const newTrade = {
        ...trade,
        user_id: userProfile.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([newTrade])
        .select()
        .single();

      if (error) throw error;
      setTrades(prev => [data as Trade, ...prev]);
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  // Initialize price history with dummy data
  useEffect(() => {
    const generateInitialHistory = () => {
      const history = [];
      const now = new Date();
      
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const btc = 43250 + (Math.random() - 0.5) * 2000;
        const eth = 2640 + (Math.random() - 0.5) * 200;
        
        history.push({
          time: time.toISOString(),
          btc,
          eth
        });
      }
      
      setPriceHistory(history);
    };

    generateInitialHistory();
  }, []);

  // Update prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchCryptoPrices, 30000);
    return () => clearInterval(interval);
  }, [btcPrice, ethPrice]);

  const value: AppContextType = {
    userProfile,
    predictions,
    trades,
    btcPrice,
    ethPrice,
    priceHistory,
    isLoading,
    createUserProfile,
    loadUserData,
    updateSHMTokens,
    createPrediction,
    resolvePrediction,
    createTrade,
    fetchCryptoPrices,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};