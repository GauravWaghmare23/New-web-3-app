import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Shield, Zap, ArrowRight, Star, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';

const Landing = () => {
  const { isConnected, connectWallet } = useWallet();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms analyze market trends to provide accurate crypto predictions.',
    },
    {
      icon: TrendingUp,
      title: 'Learn & Earn',
      description: 'Make predictions and earn SHM tokens for correct forecasts. Perfect for beginners to learn trading.',
    },
    {
      icon: Shield,
      title: 'Safe Testnet Trading',
      description: 'Practice with real Web3 technology on Shardeum testnet without risking real money.',
    },
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Live crypto prices and instant trade execution for an authentic trading experience.',
    },
  ];

  const stats = [
    { label: 'Cryptocurrencies', value: '50+' },
    { label: 'Prediction Accuracy', value: '95%' },
    { label: 'Active Users', value: '10K+' },
    { label: 'Trades Executed', value: '1M+' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse-glow">
              <Star className="w-4 h-4" />
              <span>AI-Powered Crypto Trading Platform</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Crypto Trading
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                With AI Insights
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Trade cryptocurrencies with confidence using AI-powered predictions. Earn SHM tokens for accurate market forecasts and build your portfolio.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {!isConnected ? (
                <Button 
                  onClick={connectWallet}
                  size="lg"
                  className="btn-trading text-lg px-8 py-6"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Connect Wallet & Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button 
                  asChild
                  size="lg"
                  className="btn-trading text-lg px-8 py-6"
                >
                  <Link to="/dashboard">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="lg"
                asChild
                className="text-lg px-8 py-6 border-primary/50 hover:bg-primary/10"
              >
                <Link to="/predictions">
                  View AI Predictions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for successful crypto trading in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="trading-card group hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-glow rounded-2xl flex items-center justify-center group-hover:shadow-glow transition-shadow duration-300">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with AI-powered crypto trading in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your MetaMask wallet to the Shardeum testnet and get started with free SHM tokens.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-accent to-accent/80 rounded-full flex items-center justify-center text-2xl font-bold text-accent-foreground">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Make Predictions</h3>
              <p className="text-muted-foreground">
                Use our AI-powered insights to predict crypto price movements and earn SHM tokens for accurate forecasts.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-success to-success/80 rounded-full flex items-center justify-center text-2xl font-bold text-success-foreground">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Trade & Learn</h3>
              <p className="text-muted-foreground">
                Execute trades with your earned tokens and track your portfolio performance in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary via-primary-glow to-accent rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of traders who are already earning with AI-powered predictions
            </p>
            
            {!isConnected ? (
              <Button 
                onClick={connectWallet}
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
            ) : (
              <Button 
                asChild
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <Link to="/dashboard">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Your Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;