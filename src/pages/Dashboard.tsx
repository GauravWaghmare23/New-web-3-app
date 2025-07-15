import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Brain, 
  Wallet, 
  Target, 
  Award, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { PriceChart } from '@/components/charts/PriceChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { account, isConnected, connectWallet, balance } = useWallet();
  const { 
    userProfile, 
    predictions, 
    trades, 
    btcPrice, 
    ethPrice, 
    createUserProfile,
    isLoading 
  } = useApp();

  useEffect(() => {
    if (isConnected && account && !userProfile) {
      createUserProfile(account);
    }
  }, [isConnected, account, userProfile]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your MetaMask wallet to access your trading dashboard
          </p>
          <Button onClick={connectWallet} className="btn-trading">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const recentPredictions = predictions.slice(0, 5);
  const recentTrades = trades.slice(0, 5);
  const predictionAccuracy = userProfile.total_predictions > 0 
    ? (userProfile.correct_predictions / userProfile.total_predictions) * 100 
    : 0;

  const portfolioValue = parseFloat(balance) * 43250; // Assuming SHM is roughly equivalent to USD

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Trader!</h1>
            <p className="text-muted-foreground">
              Connected to {account?.substring(0, 6)}...{account?.substring(38)}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link to="/predictions">
                <Brain className="w-4 h-4 mr-2" />
                Make Prediction
              </Link>
            </Button>
            <Button asChild className="btn-trading">
              <Link to="/trade">
                <TrendingUp className="w-4 h-4 mr-2" />
                Start Trading
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="+3.58%"
          />
          <StatCard
            title="SHM Tokens"
            value={userProfile.shm_tokens}
            icon={Award}
            trend="up"
            trendValue={`+${userProfile.prediction_streak} streak`}
          />
          <StatCard
            title="Prediction Accuracy"
            value={`${predictionAccuracy.toFixed(1)}%`}
            icon={Target}
            trend={predictionAccuracy > 50 ? 'up' : 'down'}
            trendValue={`${userProfile.correct_predictions}/${userProfile.total_predictions}`}
          />
          <StatCard
            title="Total Trades"
            value={trades.length}
            icon={Activity}
            trend="neutral"
            trendValue="All time"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PriceChart asset="BTC" height={300} />
          <PriceChart asset="ETH" height={300} />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Predictions */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Recent Predictions
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/predictions">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPredictions.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No predictions yet</p>
                  <Button asChild variant="outline">
                    <Link to="/predictions">Make Your First Prediction</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          prediction.prediction === 'UP' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {prediction.prediction === 'UP' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{prediction.asset} {prediction.prediction}</p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {prediction.confidence}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          prediction.status === 'WON' ? 'text-success' :
                          prediction.status === 'LOST' ? 'text-destructive' :
                          'text-warning'
                        }`}>
                          {prediction.status}
                        </div>
                        {prediction.status !== 'PENDING' && (
                          <div className="text-xs text-muted-foreground">
                            +{prediction.reward_tokens} SHM
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Trades
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/trade">View All</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTrades.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No trades yet</p>
                  <Button asChild variant="outline">
                    <Link to="/trade">Start Trading</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTrades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          trade.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {trade.type === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{trade.type} {trade.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.amount} @ ${trade.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          trade.status === 'COMPLETED' ? 'text-success' :
                          trade.status === 'FAILED' ? 'text-destructive' :
                          'text-warning'
                        }`}>
                          {trade.status}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trade.total_shm} SHM
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="btn-bull h-20 flex-col space-y-2">
                <Link to="/predictions">
                  <Brain className="w-6 h-6" />
                  <span>AI Predictions</span>
                </Link>
              </Button>
              <Button asChild className="btn-trading h-20 flex-col space-y-2">
                <Link to="/trade">
                  <TrendingUp className="w-6 h-6" />
                  <span>Trade Crypto</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                <Link to="/portfolio">
                  <DollarSign className="w-6 h-6" />
                  <span>View Portfolio</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;