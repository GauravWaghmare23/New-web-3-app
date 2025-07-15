import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Activity,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriceChart } from '@/components/charts/PriceChart';
import { StatCard } from '@/components/ui/stat-card';
import { useWallet } from '@/contexts/WalletContext';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

const Trade = () => {
  const { isConnected, balance } = useWallet();
  const { 
    userProfile, 
    trades, 
    btcPrice, 
    ethPrice, 
    createTrade,
    updateSHMTokens 
  } = useApp();

  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH'>('BTC');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = selectedAsset === 'BTC' ? btcPrice : ethPrice;
  const totalCost = parseFloat(amount || '0') * currentPrice;
  const availableSHM = userProfile?.shm_tokens || 0;

  // Calculate user's holdings (simplified for demo)
  const userHoldings = {
    BTC: trades
      .filter(t => t.asset === 'BTC' && t.status === 'COMPLETED')
      .reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : -t.amount), 0),
    ETH: trades
      .filter(t => t.asset === 'ETH' && t.status === 'COMPLETED')
      .reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : -t.amount), 0)
  };

  const portfolioValue = (userHoldings.BTC * btcPrice) + (userHoldings.ETH * ethPrice);

  const handleTrade = async () => {
    if (!isConnected || !userProfile || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const tradeAmount = parseFloat(amount);
    const cost = tradeAmount * currentPrice;

    // Check if user has enough balance/holdings
    if (tradeType === 'BUY' && cost > availableSHM) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${cost.toFixed(2)} SHM tokens but only have ${availableSHM}`,
        variant: "destructive"
      });
      return;
    }

    if (tradeType === 'SELL' && tradeAmount > userHoldings[selectedAsset]) {
      toast({
        title: "Insufficient Holdings",
        description: `You only have ${userHoldings[selectedAsset].toFixed(6)} ${selectedAsset}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the trade record
      await createTrade({
        asset: selectedAsset,
        type: tradeType,
        amount: tradeAmount,
        price: currentPrice,
        total_shm: cost,
        status: 'COMPLETED'
      });

      // Update user's SHM balance
      const shmChange = tradeType === 'BUY' ? -cost : cost;
      await updateSHMTokens(shmChange);

      toast({
        title: "Trade Executed!",
        description: `Successfully ${tradeType.toLowerCase()}ed ${tradeAmount} ${selectedAsset} for ${cost.toFixed(2)} SHM tokens`,
      });

      // Reset form
      setAmount('');
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to start trading cryptocurrencies
          </p>
        </div>
      </div>
    );
  }

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Trading Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor your portfolio and trade cryptocurrencies with virtual funds
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="+3.58%"
          />
          <StatCard
            title="Available SHM"
            value={availableSHM}
            icon={Wallet}
            trend="neutral"
          />
          <StatCard
            title="Total Trades"
            value={trades.length}
            icon={Activity}
            trend="neutral"
          />
          <StatCard
            title="BTC Holdings"
            value={userHoldings.BTC.toFixed(6)}
            icon={TrendingUp}
            trend="neutral"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Trade Crypto
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

                {/* Current Price & Holdings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="font-bold price-display">${currentPrice.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Your {selectedAsset}</p>
                    <p className="font-bold">{userHoldings[selectedAsset].toFixed(6)}</p>
                  </div>
                </div>

                {/* Trade Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Trade Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={tradeType === 'BUY' ? 'default' : 'outline'}
                      className={tradeType === 'BUY' ? 'btn-bull' : ''}
                      onClick={() => setTradeType('BUY')}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      BUY
                    </Button>
                    <Button
                      variant={tradeType === 'SELL' ? 'default' : 'outline'}
                      className={tradeType === 'SELL' ? 'btn-bear' : ''}
                      onClick={() => setTradeType('SELL')}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      SELL
                    </Button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount ({selectedAsset})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.000001"
                    min="0"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Min: 0.000001</span>
                    <span>
                      Max: {tradeType === 'BUY' 
                        ? (availableSHM / currentPrice).toFixed(6) 
                        : userHoldings[selectedAsset].toFixed(6)
                      }
                    </span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {['25%', '50%', '75%', '100%'].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const maxAmount = tradeType === 'BUY' 
                          ? availableSHM / currentPrice 
                          : userHoldings[selectedAsset];
                        const percent = parseInt(percentage) / 100;
                        setAmount((maxAmount * percent).toFixed(6));
                      }}
                    >
                      {percentage}
                    </Button>
                  ))}
                </div>

                {/* Trade Summary */}
                {amount && parseFloat(amount) > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span>{amount} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span>${currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span>{totalCost.toFixed(2)} SHM</span>
                    </div>
                  </div>
                )}

                {/* Execute Trade Button */}
                <Button 
                  onClick={handleTrade}
                  disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                  className="w-full btn-trading"
                >
                  {isSubmitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  {tradeType} {selectedAsset}
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Your Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Bitcoin (BTC)</p>
                      <p className="text-sm text-muted-foreground">{userHoldings.BTC.toFixed(6)} BTC</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(userHoldings.BTC * btcPrice).toLocaleString()}</p>
                      <p className="text-xs text-success">+5.2%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Ethereum (ETH)</p>
                      <p className="text-sm text-muted-foreground">{userHoldings.ETH.toFixed(6)} ETH</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(userHoldings.ETH * ethPrice).toLocaleString()}</p>
                      <p className="text-xs text-destructive">-2.1%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">SHM Tokens</p>
                      <p className="text-sm text-muted-foreground">Available for trading</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{availableSHM} SHM</p>
                      <p className="text-xs text-muted-foreground">≈ ${availableSHM}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Trade History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Chart */}
            <PriceChart asset={selectedAsset} height={400} />

            {/* Trade History */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Trades
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {trades.length} total trades
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrades.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No trades yet</p>
                      <p className="text-sm text-muted-foreground">Execute your first trade to get started!</p>
                    </div>
                  ) : (
                    recentTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            trade.type === 'BUY' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {trade.type === 'BUY' ? 
                              <ArrowUpRight className="w-4 h-4" /> : 
                              <ArrowDownRight className="w-4 h-4" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{trade.type} {trade.asset}</span>
                              <span className="text-sm text-muted-foreground">
                                {trade.amount} @ ${trade.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(trade.created_at).toLocaleDateString()} • 
                              {new Date(trade.created_at).toLocaleTimeString()}
                            </div>
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
                          <div className="text-sm text-muted-foreground">
                            {trade.total_shm.toFixed(2)} SHM
                          </div>
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

export default Trade;