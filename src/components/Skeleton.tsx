export function SkeletonCard() {
  return (
    <div className="card-premium p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="h-3 bg-text-muted/20 rounded w-24 mb-2"></div>
          <div className="h-8 bg-text-muted/30 rounded w-32 mb-1"></div>
          <div className="h-2 bg-text-muted/20 rounded w-16"></div>
        </div>
        <div className="w-16 h-16 bg-text-muted/20 rounded-xl"></div>
      </div>
    </div>
  )
}

export function SkeletonBalanceCard() {
  return (
    <div className="bg-dark-teal/40 border border-text-muted/20 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-text-muted/20 rounded w-20 mb-2"></div>
      <div className="h-6 bg-text-muted/30 rounded w-32"></div>
    </div>
  )
}

export function SkeletonQuickAction() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-dark-teal/40 rounded-xl border border-text-muted/20 animate-pulse">
      <div className="w-12 h-12 bg-text-muted/30 rounded-lg mb-2"></div>
      <div className="h-3 bg-text-muted/20 rounded w-16"></div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="card-premium p-8 animate-pulse">
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-text-muted/30 rounded-full"></div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="h-3 bg-text-muted/20 rounded w-24 mb-2"></div>
            <div className="h-6 bg-text-muted/30 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonMarketItem() {
  return (
    <div className="bg-dark-teal/40 border border-text-muted/20 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-5 bg-text-muted/30 rounded w-24 mb-2"></div>
          <div className="h-3 bg-text-muted/20 rounded w-20"></div>
        </div>
        <div className="text-right">
          <div className="h-5 bg-text-muted/30 rounded w-28 mb-2"></div>
          <div className="h-3 bg-text-muted/20 rounded w-16 ml-auto"></div>
        </div>
      </div>
    </div>
  )
}
