# CryptoTradeAI - Web3 Crypto Trading Platform

A comprehensive Web3 crypto trading application with AI-powered predictions and learn-to-earn features built on Shardeum testnet.

![CryptoTradeAI](https://via.placeholder.com/800x400/6366f1/ffffff?text=CryptoTradeAI+-+Web3+Trading+Platform)

## 🚀 Features

### 🔐 Web3 Wallet Integration
- **MetaMask Connection**: Seamless wallet authentication with MetaMask
- **Shardeum Testnet**: Built on Shardeum Sphinx testnet for safe learning
- **Automatic Network Switching**: Auto-detects and switches to correct network
- **Real-time Balance Updates**: Live wallet balance monitoring

### 🧠 AI-Powered Predictions
- **Machine Learning Insights**: Advanced AI analysis of market trends
- **Confidence Scoring**: AI provides confidence levels for predictions
- **Multiple Timeframes**: 1H, 4H, 1D, 1W prediction windows
- **Gemini API Integration**: Real-time market data and analysis

### 💰 Learn & Earn System
- **SHM Token Rewards**: Earn tokens for accurate predictions
- **Prediction Streaks**: Bonus rewards for consecutive correct predictions
- **Skill Progression**: Track your trading accuracy and improvement
- **Educational Trading**: Risk-free learning environment

### 📊 Advanced Trading Features
- **Real-time Charts**: Interactive price charts with Chart.js
- **Live Market Data**: Real-time BTC/ETH price feeds
- **Portfolio Tracking**: Comprehensive portfolio management
- **Trade History**: Complete transaction logging

### 🎯 User Experience
- **Modern UI/UX**: Beautiful dark theme optimized for trading
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Real-time Updates**: Live price feeds and instant notifications
- **Intuitive Navigation**: Easy-to-use interface for beginners

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **shadcn/ui** components
- **Lucide React** icons
- **React Router** for navigation

### Web3 & Blockchain
- **Ethers.js** for Web3 interaction
- **MetaMask** wallet integration
- **Shardeum Sphinx Testnet** deployment
- **Smart Contracts** for trade execution

### Data & APIs
- **Supabase** for user data and analytics
- **Chart.js** for data visualization
- **Gemini API** for crypto prices
- **Real-time WebSocket** connections

### AI & Predictions
- **Google Generative AI** for market analysis
- **Machine Learning** prediction algorithms
- **Confidence scoring** systems
- **Historical data analysis**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd cryptotradeai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API (Optional for real price feeds)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Google AI (Optional for advanced predictions)
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:8080`

### MetaMask Setup

1. **Install MetaMask**: Download from [metamask.io](https://metamask.io/)

2. **Add Shardeum Testnet**:
   - Network Name: `Shardeum Sphinx 1.X`
   - RPC URL: `https://sphinx.shardeum.org/`
   - Chain ID: `8082`
   - Currency Symbol: `SHM`
   - Block Explorer: `https://explorer-sphinx.shardeum.org/`

3. **Get Test Tokens**: Visit the [Shardeum Faucet](https://faucet-sphinx.shardeum.org/) to get free SHM tokens

## 📱 Usage Guide

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" to link your MetaMask
2. **Get SHM Tokens**: Visit the faucet for free testnet tokens
3. **Explore Dashboard**: View your portfolio and trading stats

### Making Predictions
1. **Visit AI Predictions Page**: Navigate to `/predictions`
2. **Select Asset**: Choose BTC or ETH
3. **Set Confidence**: Adjust your confidence level (50-100%)
4. **Choose Direction**: Predict if price will go UP or DOWN
5. **Submit**: Earn SHM tokens for correct predictions

### Trading Crypto
1. **Go to Trade Page**: Navigate to `/trade`
2. **Select Asset**: Choose BTC or ETH to trade
3. **Choose Action**: Buy or sell with your SHM tokens
4. **Set Amount**: Enter the quantity you want to trade
5. **Execute**: Confirm the transaction

### Portfolio Management
1. **View Holdings**: Check your current crypto holdings
2. **Track Performance**: Monitor your P&L and allocation
3. **Analyze History**: Review your trading and prediction history

## 🎨 Design System

The application uses a comprehensive design system with:

- **Dark Theme**: Optimized for trading environments
- **Purple/Blue Gradient**: Primary brand colors
- **Crypto Colors**: Green (bull), Red (bear), Gold (rewards)
- **Trading Cards**: Custom card components with glow effects
- **Responsive Grid**: Mobile-first responsive design
- **Animations**: Smooth transitions and hover effects

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (Navbar, etc.)
│   └── charts/         # Chart components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── lib/                # Utility functions
└── styles/             # Global styles and themes
```

### Key Components
- **WalletContext**: Manages Web3 wallet connections
- **AppContext**: Handles app state and Supabase integration
- **PriceChart**: Real-time crypto price charts
- **StatCard**: Reusable statistics display component
- **Navbar**: Main navigation with wallet integration

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🗄️ Database Schema

### User Profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  shm_tokens INTEGER DEFAULT 100,
  prediction_streak INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Predictions
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  asset TEXT NOT NULL, -- 'BTC' or 'ETH'
  prediction TEXT NOT NULL, -- 'UP' or 'DOWN'
  confidence INTEGER NOT NULL,
  entry_price DECIMAL NOT NULL,
  target_price DECIMAL,
  timeframe TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'WON', 'LOST'
  reward_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
```

### Trades
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  asset TEXT NOT NULL, -- 'BTC' or 'ETH'
  type TEXT NOT NULL, -- 'BUY' or 'SELL'
  amount DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total_shm DECIMAL NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Smart Contracts

### Trading Contract
```solidity
pragma solidity ^0.8.19;

contract CryptoTradeAI {
    struct Trade {
        address user;
        string asset;
        string tradeType;
        uint256 amount;
        uint256 price;
        uint256 timestamp;
    }
    
    mapping(uint256 => Trade) public trades;
    uint256 public tradeCount;
    
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed user,
        string asset,
        string tradeType,
        uint256 amount,
        uint256 price
    );
    
    function executeTrade(
        string memory asset,
        string memory tradeType,
        uint256 amount,
        uint256 price
    ) external {
        trades[tradeCount] = Trade({
            user: msg.sender,
            asset: asset,
            tradeType: tradeType,
            amount: amount,
            price: price,
            timestamp: block.timestamp
        });
        
        emit TradeExecuted(tradeCount, msg.sender, asset, tradeType, amount, price);
        tradeCount++;
    }
}
```

## 🌐 Deployment

### Frontend Deployment
The app is configured for deployment on Vercel, Netlify, or any static hosting:

```bash
npm run build
# Deploy the 'dist' folder
```

### Environment Variables
Set the following environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_GOOGLE_AI_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shardeum** for providing the testnet infrastructure
- **MetaMask** for wallet integration
- **Supabase** for backend services
- **shadcn/ui** for the component library
- **Chart.js** for data visualization
- **Lucide** for beautiful icons

## 📞 Support

For support, email support@cryptotradeai.dev or join our Discord community.

---

**⚠️ Disclaimer**: This is a testnet application for educational purposes only. Do not use real money or mainnet tokens. Always DYOR (Do Your Own Research) before making any financial decisions.# New-web-3-app
