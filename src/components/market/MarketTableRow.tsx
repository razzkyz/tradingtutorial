import React from 'react';
import { MarketData, MarketType } from '../../services/market/marketTypes';

interface MarketTableRowProps {
  data: MarketData;
  onClick?: () => void;
  isActive?: boolean;
}

export const MarketTableRow: React.FC<MarketTableRowProps> = ({ data, onClick, isActive }) => {
  const isPositive = data.changePercent >= 0;

  // Format price
  const formatPrice = (price: number) => {
    if (price === 0) return '--';
    if (price < 1) return price.toFixed(4);
    if (price > 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  // Helper for icons based on symbol
  const getIcon = (symbol: string, market: MarketType) => {
    if (market === 'crypto') {
      const iconUrl = `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
      return (
        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img 
            src={iconUrl} 
            alt={symbol} 
            className="w-4 h-4 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = `<span class="text-white font-bold text-[8px]">${symbol.slice(0,3)}</span>`;
              }
            }}
          />
        </div>
      );
    }
    
    // US Market Dynamic Icons
    const usIconUrl = `https://ui-avatars.com/api/?name=${symbol}&background=random&color=fff&rounded=true&bold=true&size=64`;
    return (
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src={usIconUrl} alt={symbol} className="w-full h-full object-cover" />
      </div>
    );
  };

  const renderTechnicalRating = (rating: MarketData['technicalRating']) => {
    switch (rating) {
      case 'Pembelian kuat':
        return <span className="text-[#089981] flex items-center justify-end gap-1"><span className="text-xs">↑</span> {rating}</span>;
      case 'Pembelian':
        return <span className="text-[#089981] flex items-center justify-end gap-1"><span className="text-xs">^</span> {rating}</span>;
      case 'Penjualan kuat':
        return <span className="text-[#f23645] flex items-center justify-end gap-1"><span className="text-xs">↓</span> {rating}</span>;
      case 'Penjualan':
        return <span className="text-[#f23645] flex items-center justify-end gap-1"><span className="text-xs">v</span> {rating}</span>;
      case 'Netral':
      default:
        return <span className="text-[#9ea6b5] flex items-center justify-end gap-1"><span className="text-xs">=</span> {rating || 'Netral'}</span>;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        grid grid-cols-12 gap-4 py-2 px-4 items-center cursor-pointer transition-colors
        hover:bg-gray-800/30 border-b border-[#2a2e39]
        ${isActive ? 'bg-[#1e222d]' : ''}
      `}
    >
      {/* Symbol & Name */}
      <div className="col-span-3 flex items-center gap-3">
        {getIcon(data.symbol, data.market)}
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 bg-[#2a2e39] text-gray-300 rounded font-semibold text-[11px] uppercase tracking-wider">{data.symbol}</span>
          <span className="text-gray-300 font-medium text-[13px] truncate">{data.name}</span>
        </div>
      </div>

      {/* Harga */}
      <div className="col-span-2 text-right">
        <span className="text-gray-300 font-medium text-[13px]">
          {data.price === 0 ? '--' : formatPrice(data.price)}
        </span>
      </div>

      {/* Perubahan % */}
      <div className="col-span-1 text-right">
        <span className={`text-[13px] font-medium ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
          {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Perubahan */}
      <div className="col-span-2 text-right">
        <span className={`text-[13px] ${isPositive ? 'text-[#089981]' : 'text-[#f23645]'}`}>
          {data.change !== undefined ? `${isPositive ? '+' : ''}${formatPrice(data.change)}` : '--'}
        </span>
      </div>

      {/* Tertinggi */}
      <div className="col-span-1 text-right">
        <span className="text-gray-300 text-[13px]">
          {data.high === 0 ? '--' : formatPrice(data.high)}
        </span>
      </div>

      {/* Terendah */}
      <div className="col-span-1 text-right">
        <span className="text-gray-300 text-[13px]">
          {data.low === 0 ? '--' : formatPrice(data.low)}
        </span>
      </div>

      {/* Peringkat Teknikal */}
      <div className="col-span-2 text-right text-[13px]">
        {renderTechnicalRating(data.technicalRating)}
      </div>
    </div>
  );
};
