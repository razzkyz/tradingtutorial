import React, { useEffect, useState } from 'react';
import { MarketCarousel } from './MarketCarousel';
import { MarketTable } from './MarketTable';
import { marketService } from '../../services/market/marketService';
import { MarketData } from '../../services/market/marketTypes';

interface MarketSectionProps {
  onCoinSelect?: (symbol: string) => void;
  selectedCoin?: string;
}

export const MarketSection: React.FC<MarketSectionProps> = ({ onCoinSelect, selectedCoin }) => {
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [usData, setUsData] = useState<MarketData[]>([]);
  const [isLoadingCrypto, setIsLoadingCrypto] = useState(true);
  const [isLoadingUs, setIsLoadingUs] = useState(true);
  
  const [cryptoExpanded, setCryptoExpanded] = useState(false);
  const [usExpanded, setUsExpanded] = useState(false);

  useEffect(() => {
    // Subscribe to Crypto real-time data
    const unsubscribeCrypto = marketService.subscribeToCrypto((data) => {
      setCryptoData(data);
      if (isLoadingCrypto && data.some(d => d.price > 0)) {
        setIsLoadingCrypto(false);
      }
    });

    // Subscribe to US Market real-time/polling data
    const unsubscribeUs = marketService.subscribeToUsMarket((data) => {
      setUsData(data);
      if (isLoadingUs && data.length > 0) {
        setIsLoadingUs(false);
      }
    });

    return () => {
      unsubscribeCrypto();
      unsubscribeUs();
    };
  }, []);

  return (
    <div className="w-full bg-[#05070b] py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* CRYPTO SECTION */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              🔥 Crypto Market <span className="text-xs font-normal bg-red-500/20 text-red-400 px-2 py-0.5 rounded ml-2 animate-pulse">LIVE</span>
            </h2>
            <button 
              onClick={() => setCryptoExpanded(!cryptoExpanded)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors flex items-center group"
            >
              {cryptoExpanded ? (
                <>Tutup <span className="transform translate-y-0 group-hover:-translate-y-1 transition-transform inline-block ml-1">↑</span></>
              ) : (
                <>Lihat Semua <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform inline-block ml-1">→</span></>
              )}
            </button>
          </div>
          
          {cryptoExpanded ? (
            <div className="border border-gray-800/80 rounded-xl overflow-hidden">
              <MarketTable 
                data={cryptoData} 
                onRowClick={onCoinSelect} 
                activeSymbol={selectedCoin} 
              />
            </div>
          ) : (
            <MarketCarousel 
              data={cryptoData}
              isLoading={isLoadingCrypto}
              onCardClick={onCoinSelect}
              activeSymbol={selectedCoin}
            />
          )}
        </div>
        
        {/* US MARKET SECTION */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-white text-lg font-bold flex items-center gap-2">
              🇺🇸 US Market <span className="text-xs font-normal text-gray-500 ml-2">INDEXES</span>
            </h2>
            <button 
              onClick={() => setUsExpanded(!usExpanded)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors flex items-center group"
            >
              {usExpanded ? (
                <>Tutup <span className="transform translate-y-0 group-hover:-translate-y-1 transition-transform inline-block ml-1">↑</span></>
              ) : (
                <>Lihat Semua <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform inline-block ml-1">→</span></>
              )}
            </button>
          </div>
          
          {usExpanded ? (
            <div className="border border-gray-800/80 rounded-xl overflow-hidden">
              <MarketTable 
                data={usData} 
                // US Market rows can be clicked if needed in future
              />
            </div>
          ) : (
            <MarketCarousel 
              data={usData}
              isLoading={isLoadingUs}
            />
          )}
        </div>

      </div>
    </div>
  );
};
