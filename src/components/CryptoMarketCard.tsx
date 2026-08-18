interface CryptoMarketCardProps {
  name: string
  pair: string
  price: string
  change: number
  iconBg: string
  iconText: string
  iconUrl?: string
  onClick?: () => void
}

export default function CryptoMarketCard({
  name,
  pair,
  price,
  change,
  iconBg,
  iconText,
  iconUrl,
  onClick
}: CryptoMarketCardProps) {
  const isPositive = change >= 0
  
  // Format price - if it's a number string, format it nicely
  const formattedPrice = price === '--' || price === 'Loading...' 
    ? price 
    : `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 bg-black rounded-2xl px-6 py-5 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:bg-gray-900/30 w-[220px] cursor-pointer group"
    >
      <div className="flex flex-col gap-3">
        {/* Icon and Name */}
        <div className="flex items-center gap-3">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${iconBg}`}
          >
            {iconUrl ? (
              <img 
                src={iconUrl} 
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `<span class="text-white font-bold text-base">${iconText}</span>`
                  }
                }}
              />
            ) : (
              <span className="text-white font-bold text-base">{iconText}</span>
            )}
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="text-white font-semibold text-base truncate">
              {name}
            </p>
            <p className="text-gray-500 text-sm truncate">{pair}</p>
          </div>
        </div>
        
        {/* Price - Large and prominent */}
        <div className="text-left">
          <p className="text-white font-bold text-2xl mb-1">
            {formattedPrice}
          </p>
          {/* Change percentage */}
          {change !== 0 && (
            <p className={`text-base font-semibold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
