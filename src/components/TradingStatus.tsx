interface TradingStatusProps {
  status: string
}

export default function TradingStatus({ status }: TradingStatusProps) {
  const isActive = status === 'active'

  return (
    <div
      className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 transition-all w-full sm:w-auto ${
        isActive
          ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          : 'bg-red-900/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      }`}
    >
      <div
        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2.5 sm:mr-3 animate-pulse ${
          isActive 
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]' 
            : 'bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.9)]'
        }`}
      />
      <span className={`text-base sm:text-lg font-bold uppercase tracking-widest animate-pulse ${
        isActive 
          ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' 
          : 'text-red-500 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]'
      }`}>
        {isActive ? 'Active' : 'Inactive'} Trading
      </span>
    </div>
  )
}
