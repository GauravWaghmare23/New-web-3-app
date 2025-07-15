import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { PriceChart } from '@/components/charts/PriceChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { useApp } from '@/contexts/AppContext';

const Portfolio = () => {
  const { account, isConnected, balance } = useWallet();
  const { userProfile, trades, btcPrice, ethPrice } = useApp();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  // Calculate holdings
  const holdings = {
    BTC: trades
      .filter(t => t.asset === 'BTC' && t.status === 'COMPLETED')
      .reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : -t.amount), 0),
    ETH: trades
      .filter(t => t.asset === 'ETH' && t.status === 'COMPLETED')
      .reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : -t.amount), 0)
  };

  const portfolioValue = (holdings.BTC * btcPrice) + (holdings.ETH * ethPrice);
  const totalInvested = trades
    .filter(t => t.type === 'BUY' && t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.total_shm, 0);
  
  const pnl = portfolioValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Track your holdings, performance, and transaction history
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            icon={DollarSign}
            trend={pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'neutral'}
            trendValue={`${pnlPercentage > 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`}
          />
          <StatCard
            title="Total P&L"
            value={`${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`}
            icon={pnl > 0 ? TrendingUp : TrendingDown}
            trend={pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'neutral'}
            trendValue={`${pnlPercentage > 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`}
          />
          <StatCard
            title="Available Cash"
            value={`${userProfile?.shm_tokens || 0} SHM`}
            icon={DollarSign}
            trend="neutral"
          />
          <StatCard
            title="Total Trades"
            value={trades.length}
            icon={Activity}
            trend="neutral"
            trendValue="All time"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Holdings Breakdown */}
          <Card className="trading-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Current Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Wallet Balance */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-medium">Wallet Balance</p>
                    <p className="text-sm text-muted-foreground">Chain: {account?.substring(0, 6)}...{account?.substring(38)}</p>
                    <p className="text-sm text-muted-foreground">Balance: 0.0000 SHM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{parseFloat(balance).toFixed(4)} SHM</p>
                    <p className="text-xs text-muted-foreground">≈ ${parseFloat(balance).toFixed(2)}</p>
                  </div>
                </div>

                {/* BTC Holdings */}
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Bitcoin (BTC)</p>
                    <p className="text-sm text-muted-foreground">{holdings.BTC.toFixed(6)} BTC</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(holdings.BTC * btcPrice).toLocaleString()}</p>
                    <p className="text-xs text-success">+5.2%</p>
                  </div>
                </div>

                {/* ETH Holdings */}
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Ethereum (ETH)</p>
                    <p className="text-sm text-muted-foreground">{holdings.ETH.toFixed(6)} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(holdings.ETH * ethPrice).toLocaleString()}</p>
                    <p className="text-xs text-destructive">-2.1%</p>
                  </div>
                </div>

                {/* SHM Tokens */}
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">SHM Tokens</p>
                    <p className="text-sm text-muted-foreground">Earned from predictions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{userProfile?.shm_tokens || 0} SHM</p>
                    <p className="text-xs text-success">+{userProfile?.prediction_streak || 0} streak</p>
                  </div>
                </div>

                {/* Portfolio Allocation */}
                <div className="pt-4 border-t border-border">
                  <p className="font-medium mb-3">Portfolio Allocation</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Bitcoin (BTC)</span>
                      <span>{portfolioValue > 0 ? ((holdings.BTC * btcPrice / portfolioValue) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ethereum (ETH)</span>
                      <span>{portfolioValue > 0 ? ((holdings.ETH * ethPrice / portfolioValue) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cash (SHM)</span>
                      <span>{portfolioValue > 0 ? (((userProfile?.shm_tokens || 0) / portfolioValue) * 100).toFixed(1) : 100}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="btc" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="btc">Bitcoin</TabsTrigger>
                    <TabsTrigger value="eth">Ethereum</TabsTrigger>
                  </TabsList>
                  <TabsContent value="btc" className="mt-4">
                    <PriceChart asset="BTC" height={300} />
                  </TabsContent>
                  <TabsContent value="eth" className="mt-4">
                    <PriceChart asset="ETH" height={300} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Transaction History
                  </span>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trades.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No transactions yet</p>
                      <p className="text-sm text-muted-foreground">Your trading history will appear here</p>
                    </div>
                  ) : (
                    trades.slice(0, 10).map((trade) => (
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
                          {trade.tx_hash && (
                            <div className="text-xs text-primary">
                              Tx: {trade.tx_hash.substring(0, 8)}...
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

export default Portfolio;