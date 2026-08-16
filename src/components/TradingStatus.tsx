interface TradingStatusProps {
  status: string
}

export default function TradingStatus({ status }: TradingStatusProps) {
  const isActive = status === 'active'

  return (
    <div
      className={`inline-flex items-center px-6 py-4 rounded-xl border-2 ${
        isActive
          ? 'bg-active-gradient border-green/50 shadow-lg shadow-green/20'
          : 'bg-text-muted/20 border-text-muted/40'
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full mr-3 ${
          isActive ? 'bg-green animate-pulse' : 'bg-text-muted'
        }`}
      />
      <span className="text-lg font-semibold">
        {isActive ? 'Active' : 'Inactive'} Trading
      </span>
    </div>
  )
}
