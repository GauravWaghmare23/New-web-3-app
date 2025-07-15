import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { PriceChart } from '@/components/charts/PriceChart';
import { StatCard } from '@/components/ui/stat-card';
import { useWallet } from '@/contexts/WalletContext';
import { useApp } from '@/contexts/AppContext';
import { fetchCryptoPrediction, CryptoPrediction } from '@/services/cryptoApi';
import { toast } from '@/hooks/use-toast';

const Predictions = () => {
  const { isConnected } = useWallet();
  const { 
    userProfile, 
    predictions, 
    btcPrice, 
    ethPrice, 
    createPrediction,
    resolvePrediction 
  } = useApp();

  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH'>('BTC');
  const [prediction, setPrediction] = useState<'UP' | 'DOWN' | null>(null);
  const [confidence, setConfidence] = useState([70]);
  const [timeframe, setTimeframe] = useState('1H');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // AI-generated prediction insights
  const [aiInsights, setAiInsights] = useState<{
    [key: string]: {
      suggestion: 'UP' | 'DOWN';
      confidence: number;
      factors: string[];
    }
  }>({
    BTC: {
      suggestion: 'UP' as 'UP' | 'DOWN',
      confidence: 78,
      factors: ['Loading AI insights...']
    },
    ETH: {
      suggestion: 'DOWN' as 'UP' | 'DOWN',
      confidence: 65,
      factors: ['Loading AI insights...']
    }
  });

  // Fetch AI insights when asset changes
  useEffect(() => {
    const fetchAIInsights = async () => {
      setIsLoadingAI(true);
      try {
        const prediction = await fetchCryptoPrediction(selectedAsset);
        setAiInsights(prev => ({
          ...prev,
          [selectedAsset]: {
            suggestion: prediction.prediction,
            confidence: prediction.confidence,
            factors: prediction.reasoning.split('. ').filter(f => f.length > 10)
          }
        }));
      } catch (error) {
        console.error('Error fetching AI insights:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAIInsights();
  }, [selectedAsset]);

  const currentPrice = selectedAsset === 'BTC' ? btcPrice : ethPrice;
  const aiSuggestion = aiInsights[selectedAsset];

  const handlePrediction = async () => {
    if (!prediction || !isConnected || !userProfile) {
      toast({
        title: "Error",
        description: "Please connect your wallet and select a prediction",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const rewardTokens = Math.floor(confidence[0] / 10) + 5; // 5-15 tokens based on confidence
      
      await createPrediction({
        asset: selectedAsset,
        prediction,
        confidence: confidence[0],
        entry_price: currentPrice,
        timeframe,
        status: 'PENDING',
        reward_tokens: rewardTokens
      });

      toast({
        title: "Prediction Submitted!",
        description: `Your ${prediction} prediction for ${selectedAsset} has been recorded. Potential reward: ${rewardTokens} SHM tokens.`
      });

      // Reset form
      setPrediction(null);
      setConfidence([70]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate prediction resolution (in a real app, this would be triggered by price movements)
  useEffect(() => {
    const resolvePendingPredictions = () => {
      predictions
        .filter(p => p.status === 'PENDING')
        .forEach(p => {
          const hoursSinceCreated = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCreated > 0.1) { // Resolve after 6 minutes for demo
            const won = Math.random() > 0.4; // 60% win rate for demo
            resolvePrediction(p.id, won);
          }
        });
    };

    const interval = setInterval(resolvePendingPredictions, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [predictions]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to start making AI-powered predictions
          </p>
        </div>
      </div>
    );
  }

  const pendingPredictions = predictions.filter(p => p.status === 'PENDING');
  const resolvedPredictions = predictions.filter(p => p.status !== 'PENDING');
  const accuracy = userProfile ? 
    (userProfile.total_predictions > 0 ? (userProfile.correct_predictions / userProfile.total_predictions) * 100 : 0) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            AI Market Predictions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered market insights up to 2 years ahead and earn SHM tokens by making accurate predictions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="SHM Tokens"
            value={userProfile?.shm_tokens || 0}
            icon={Award}
            trend="up"
            trendValue={`+${userProfile?.prediction_streak || 0} streak`}
          />
          <StatCard
            title="Accuracy"
            value={`${accuracy.toFixed(1)}%`}
            icon={Target}
            trend={accuracy > 50 ? 'up' : 'down'}
            trendValue={`${userProfile?.correct_predictions || 0}/${userProfile?.total_predictions || 0}`}
          />
          <StatCard
            title="Predictions"
            value={userProfile?.total_predictions || 0}
            icon={Brain}
            trend="neutral"
            trendValue="All time"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prediction Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Make Your Prediction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Asset Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Asset</label>
                  <Select value={selectedAsset} onValueChange={(value: 'BTC' | 'ETH') => setSelectedAsset(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Price */}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current {selectedAsset} Price</p>
                  <p className="text-2xl font-bold price-display">${currentPrice.toLocaleString()}</p>
                </div>

                {/* Timeframe */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Prediction Timeframe</label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1H">1 Hour</SelectItem>
                      <SelectItem value="4H">4 Hours</SelectItem>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="1W">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prediction Buttons */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Prediction</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={prediction === 'UP' ? 'default' : 'outline'}
                      className={prediction === 'UP' ? 'btn-bull' : ''}
                      onClick={() => setPrediction('UP')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Price will go UP
                    </Button>
                    <Button
                      variant={prediction === 'DOWN' ? 'default' : 'outline'}
                      className={prediction === 'DOWN' ? 'btn-bear' : ''}
                      onClick={() => setPrediction('DOWN')}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Price will go DOWN
                    </Button>
                  </div>
                </div>

                {/* Confidence Slider */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Confidence Level: {confidence[0]}%
                  </label>
                  <Slider
                    value={confidence}
                    onValueChange={setConfidence}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Reward Preview */}
                {prediction && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Potential Reward</p>
                    <p className="font-semibold text-primary">
                      {Math.floor(confidence[0] / 10) + 5} SHM tokens
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handlePrediction}
                  disabled={!prediction || isSubmitting}
                  className="w-full btn-trading"
                >
                  {isSubmitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Submit Prediction
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Insights for {selectedAsset}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>AI Suggestion:</span>
                    <div className={`flex items-center ${
                      aiSuggestion.suggestion === 'UP' ? 'text-success' : 'text-destructive'
                    }`}>
                      {aiSuggestion.suggestion === 'UP' ? 
                        <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      }
                      {aiSuggestion.suggestion}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>AI Confidence:</span>
                    <span className="font-semibold">{aiSuggestion.confidence}%</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Key Factors:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {aiSuggestion.factors.map((factor, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Predictions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart */}
            <PriceChart asset={selectedAsset} height={400} />

            {/* Predictions History */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Your Predictions
                  </span>
                  <div className="flex space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {pendingPredictions.length} pending
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No predictions yet</p>
                      <p className="text-sm text-muted-foreground">Make your first prediction to get started!</p>
                    </div>
                  ) : (
                    predictions.slice(0, 10).map((pred) => (
                      <div key={pred.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            pred.prediction === 'UP' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {pred.prediction === 'UP' ? 
                              <ArrowUpRight className="w-4 h-4" /> : 
                              <ArrowDownRight className="w-4 h-4" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{pred.asset} {pred.prediction}</span>
                              <span className="text-sm text-muted-foreground">
                                @ ${pred.entry_price.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Confidence: {pred.confidence}% • {pred.timeframe} • 
                              {new Date(pred.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            pred.status === 'WON' ? 'text-success' :
                            pred.status === 'LOST' ? 'text-destructive' :
                            'text-warning'
                          }`}>
                            {pred.status}
                          </div>
                          {pred.status !== 'PENDING' && (
                            <div className="text-xs text-muted-foreground">
                              +{pred.reward_tokens} SHM
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;