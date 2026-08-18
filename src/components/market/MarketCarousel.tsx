import React, { useRef, useState, useEffect } from 'react';
import { MarketData } from '../../services/market/marketTypes';
import { MarketCard } from './MarketCard';
import { MarketSkeleton } from './MarketSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketCarouselProps {
  data: MarketData[];
  isLoading: boolean;
  onCardClick?: (symbol: string) => void;
  activeSymbol?: string;
}

export const MarketCarousel: React.FC<MarketCarouselProps> = ({ 
  data, 
  isLoading,
  onCardClick,
  activeSymbol
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    // Add small buffer (2px) to avoid precision issues
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [data]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -400 : 400;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="relative group mb-6 w-full max-w-full">
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar w-full"
        style={{ 
          scrollSnapType: 'x mandatory', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        {isLoading ? (
          // Show skeletons while loading
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
              <MarketSkeleton />
            </div>
          ))
        ) : (
          data.map((item) => (
            <div key={item.symbol} style={{ scrollSnapAlign: 'start' }} className="shrink-0">
              <MarketCard 
                data={item} 
                onClick={() => onCardClick?.(item.symbol)}
                isActive={activeSymbol === item.symbol}
              />
            </div>
          ))
        )}
      </div>

      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 backdrop-blur-md rounded-full border border-gray-700 flex items-center justify-center text-white hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <ChevronRight size={20} />
        </button>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};
