import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  children?: ReactNode;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className = '',
  children
}: StatCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <Card className={`stat-card ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && trendValue && (
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {getTrendIcon()} {trendValue}
                </span>
              )}
            </div>
            {children}
          </div>
          <div className={`p-3 rounded-lg ${
            trend === 'up' ? 'bg-success/10' : 
            trend === 'down' ? 'bg-destructive/10' : 
            'bg-muted/50'
          }`}>
            <Icon className={`w-6 h-6 ${
              trend === 'up' ? 'text-success' : 
              trend === 'down' ? 'text-destructive' : 
              'text-muted-foreground'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};