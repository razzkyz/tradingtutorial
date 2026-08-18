import React from 'react';
import { MarketData, MarketType } from '../../services/market/marketTypes';

interface MarketCardProps {
  data: MarketData;
  onClick?: () => void;
  isActive?: boolean;
}

export const MarketCard: React.FC<MarketCardProps> = ({ data, onClick, isActive }) => {
  const isPositive = data.changePercent >= 0;
  
  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return '--';
    // Format based on price size
    if (price < 1) return price.toFixed(4);
    if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  // Helper for icons based on symbol
  const getIcon = (symbol: string, market: MarketType) => {
    if (market === 'crypto') {
      const iconUrl = `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
      return (
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={iconUrl} 
            alt={symbol} 
            className="w-5 h-5 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `<span class="text-white font-bold text-[10px]">${symbol.slice(0,3)}</span>`;
              }
            }}
          />
        </div>
      );
    }
    
    // US Market Dynamic Icons
    const usIconUrl = `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&rounded=true&bold=true&size=64`;
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src={usIconUrl} alt={symbol} className="w-full h-full object-cover" />
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className={`
        flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-colors
        border border-transparent
        ${isActive ? 'bg-[#2a2e39]' : 'hover:bg-[#2a2e39]/50'}
      `}
    >
      {/* Icon */}
      {getIcon(data.symbol, data.market)}
      
      {/* Text Info */}
      <div className="flex flex-col items-start min-w-[120px]">
        {/* Name line */}
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-gray-300 font-medium text-[13px]">{data.name}</span>
          <span className="text-orange-500 text-[10px] font-bold align-super">D</span>
          <span className="text-gray-500 text-xs ml-1">=</span>
        </div>
        
        {/* Price & Change line */}
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-white font-medium text-[13px]">
              {data.price === 0 ? '--' : formatPrice(data.price)}
            </span>
            <span className="text-gray-500 text-[10px] uppercase tracking-wider">
              {data.market === 'us' ? 'POINT' : 'USD'}
            </span>
          </div>
          <span className={`text-[13px] font-medium ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};
