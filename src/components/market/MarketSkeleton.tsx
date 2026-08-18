import React from 'react';

export const MarketSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-[180px] sm:w-[200px] p-3 rounded-2xl bg-[#0a0d14] border border-gray-800/50 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800"></div>
          <div className="w-10 h-4 bg-gray-800 rounded"></div>
        </div>
        <div className="w-12 h-4 bg-gray-800 rounded"></div>
      </div>
      
      <div className="flex flex-col">
        <div className="w-20 h-3 bg-gray-800 rounded mt-1"></div>
        <div className="w-24 h-6 bg-gray-800 rounded mt-2"></div>
      </div>
    </div>
  );
};
