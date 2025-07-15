import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '@/contexts/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  asset: 'BTC' | 'ETH';
  timeframe?: '1H' | '24H' | '7D' | '30D';
  height?: number;
}

export const PriceChart = ({ asset, timeframe = '24H', height = 300 }: PriceChartProps) => {
  const { priceHistory, btcPrice, ethPrice } = useApp();
  const chartRef = useRef<ChartJS<'line', number[], string>>(null);

  const currentPrice = asset === 'BTC' ? btcPrice : ethPrice;
  
  // Prepare chart data
  const chartData = {
    labels: priceHistory.map(item => {
      const date = new Date(item.time);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }),
    datasets: [
      {
        label: `${asset} Price`,
        data: priceHistory.map(item => asset === 'BTC' ? item.btc : item.eth),
        borderColor: asset === 'BTC' ? '#f7931a' : '#627eea',
        backgroundColor: `${asset === 'BTC' ? '#f7931a' : '#627eea'}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: asset === 'BTC' ? '#f7931a' : '#627eea',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: asset === 'BTC' ? '#f7931a' : '#627eea',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${asset}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: '#1e293b',
        },
        ticks: {
          color: '#64748b',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        },
        beginAtZero: false,
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: asset === 'BTC' ? '#f7931a' : '#627eea',
      }
    }
  };

  return (
    <div className="w-full bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{asset} Price Chart</h3>
          <p className="text-2xl font-bold price-display">
            ${currentPrice.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {['1H', '24H', '7D', '30D'].map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};