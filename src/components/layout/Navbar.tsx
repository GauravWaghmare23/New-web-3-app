import { Link, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, Brain, PieChart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const location = useLocation();
  const { account, isConnected, connectWallet, disconnectWallet, balance } = useWallet();
  const { userProfile } = useApp();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: TrendingUp },
    { path: '/dashboard', label: 'Dashboard', icon: PieChart },
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/predictions', label: 'AI Predictions', icon: Brain },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              CryptoTradeAI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* SHM Token Balance */}
            {isConnected && userProfile && (
              <div className="hidden sm:flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-warning to-warning/80 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-warning-foreground">S</span>
                </div>
                <span className="font-mono font-semibold">{userProfile.shm_tokens}</span>
                <span className="text-sm text-muted-foreground">SHM</span>
              </div>
            )}

            {/* Wallet Button */}
            {!isConnected ? (
              <Button 
                onClick={connectWallet}
                className="btn-trading"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-success to-success/80 rounded-full" />
                    <div className="text-left hidden sm:block">
                      <div className="text-sm font-medium">{formatAddress(account!)}</div>
                      <div className="text-xs text-muted-foreground">{parseFloat(balance).toFixed(4)} SHM</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">Wallet Connected</p>
                    <p className="text-xs text-muted-foreground">{formatAddress(account!)}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Balance:</span>
                      <span className="font-mono">{parseFloat(balance).toFixed(4)} SHM</span>
                    </div>
                    {userProfile && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Earned Tokens:</span>
                        <span className="font-mono">{userProfile.shm_tokens} SHM</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio" className="flex items-center">
                      <PieChart className="w-4 h-4 mr-2" />
                      Portfolio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;