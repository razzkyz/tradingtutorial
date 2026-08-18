import React from 'react';
import { MarketData } from '../../services/market/marketTypes';
import { MarketTableRow } from './MarketTableRow';

interface MarketTableProps {
  data: MarketData[];
  onRowClick?: (symbol: string) => void;
  activeSymbol?: string;
}

export const MarketTable: React.FC<MarketTableProps> = ({ data, onRowClick, activeSymbol }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 py-2 px-4 text-[11px] font-normal text-[#9ea6b5] border-b border-[#2a2e39]">
          <div className="col-span-3">Simbol</div>
          <div className="col-span-2 text-right">Harga</div>
          <div className="col-span-1 text-right">Perubahan %</div>
          <div className="col-span-2 text-right">Perubahan</div>
          <div className="col-span-1 text-right">Tertinggi</div>
          <div className="col-span-1 text-right">Terendah</div>
          <div className="col-span-2 text-right">Peringkat teknikal</div>
        </div>

        {/* Body Rows */}
        <div className="">
          {data.map((item) => (
            <MarketTableRow 
              key={item.symbol} 
              data={item} 
              onClick={() => onRowClick?.(item.symbol)}
              isActive={activeSymbol === item.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
