-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  shm_tokens DECIMAL(20,8) NOT NULL DEFAULT 100,
  prediction_streak INTEGER NOT NULL DEFAULT 0,
  total_predictions INTEGER NOT NULL DEFAULT 0,
  correct_predictions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL CHECK (asset IN ('BTC', 'ETH')),
  prediction TEXT NOT NULL CHECK (prediction IN ('UP', 'DOWN')),
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  entry_price DECIMAL(20,8) NOT NULL,
  target_price DECIMAL(20,8),
  timeframe TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'WON', 'LOST')),
  reward_tokens DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  asset TEXT NOT NULL CHECK (asset IN ('BTC', 'ETH')),
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  amount DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  total_shm DECIMAL(20,8) NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create RLS policies for predictions
CREATE POLICY "Users can view their own predictions" 
ON public.predictions 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.user_profiles 
  WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
));

CREATE POLICY "Users can insert their own predictions" 
ON public.predictions 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.user_profiles 
  WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
));

CREATE POLICY "Users can update their own predictions" 
ON public.predictions 
FOR UPDATE 
USING (user_id IN (
  SELECT id FROM public.user_profiles 
  WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
));

-- Create RLS policies for trades
CREATE POLICY "Users can view their own trades" 
ON public.trades 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.user_profiles 
  WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
));

CREATE POLICY "Users can insert their own trades" 
ON public.trades 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.user_profiles 
  WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.user_profiles (wallet_address, shm_tokens, prediction_streak, total_predictions, correct_predictions) VALUES
('0x1234567890123456789012345678901234567890', 250.50, 3, 15, 10),
('0x2345678901234567890123456789012345678901', 180.25, 1, 8, 5),
('0x3456789012345678901234567890123456789012', 320.75, 5, 12, 9),
('0x4567890123456789012345678901234567890123', 95.00, 0, 6, 3),
('0x5678901234567890123456789012345678901234', 440.25, 7, 20, 14);

-- Insert sample predictions
INSERT INTO public.predictions (user_id, asset, prediction, confidence, entry_price, target_price, timeframe, status, reward_tokens) VALUES
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x1234567890123456789012345678901234567890'), 'BTC', 'UP', 85, 43250.00, 44000.00, '1h', 'WON', 10.5),
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x2345678901234567890123456789012345678901'), 'ETH', 'DOWN', 70, 2640.00, 2500.00, '4h', 'LOST', 0),
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x3456789012345678901234567890123456789012'), 'BTC', 'UP', 92, 42800.00, 43500.00, '1h', 'WON', 15.25);

-- Insert sample trades
INSERT INTO public.trades (user_id, asset, type, amount, price, total_shm, tx_hash, status) VALUES
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x1234567890123456789012345678901234567890'), 'BTC', 'BUY', 0.001, 43250.00, 43.25, '0xabcd1234...', 'COMPLETED'),
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x2345678901234567890123456789012345678901'), 'ETH', 'SELL', 0.05, 2640.00, 132.00, '0xefgh5678...', 'COMPLETED'),
((SELECT id FROM public.user_profiles WHERE wallet_address = '0x3456789012345678901234567890123456789012'), 'BTC', 'BUY', 0.002, 42800.00, 85.60, '0xijkl9012...', 'COMPLETED');