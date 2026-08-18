interface MarketAsset {
  symbol: string
  name: string
  price: string
  changePercent: number
  change: number
  high?: string
  low?: string
  technicalRating?: string
  icon?: string
  iconBg?: string
  iconText?: string
}

interface MarketTableProps {
  assets: MarketAsset[]
  type: 'crypto' | 'us'
}

export default function MarketTable({ assets }: MarketTableProps) {
  const getTechnicalColor = (rating?: string) => {
    if (!rating) return 'text-gray-500'
    const lower = rating.toLowerCase()
    if (lower.includes('kuat')) {
      if (lower.includes('beli') || lower.includes('buy')) return 'text-emerald-500'
      if (lower.includes('jual') || lower.includes('sell')) return 'text-red-600'
    }
    if (lower.includes('beli') || lower.includes('buy')) return 'text-green-400'
    if (lower.includes('jual') || lower.includes('sell')) return 'text-red-400'
    return 'text-gray-400'
  }

  const getTechnicalIcon = (rating?: string) => {
    if (!rating) return '='
    const lower = rating.toLowerCase()
    if (lower.includes('beli') || lower.includes('buy')) return '↑'
    if (lower.includes('jual') || lower.includes('sell')) return '↓'
    return '='
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full min-w-[800px]">
        <thead className="border-b border-gray-800">
          <tr className="text-left">
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">
              Symbol
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider text-right">
              Harga
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider text-right">
              Perubahan %
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider text-right">
              Perubahan
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider text-right hidden md:table-cell">
              Tertinggi
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider text-right hidden md:table-cell">
              Terendah
            </th>
            <th className="px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
              Peringkat Teknikal
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => {
            const isPositive = asset.changePercent >= 0
            const priceValue = parseFloat(asset.price) || 0
            const changeValue = asset.change || 0
            
            return (
              <tr 
                key={`${asset.symbol}-${index}`}
                className="border-b border-gray-900 hover:bg-gray-900/30 transition-colors cursor-pointer"
              >
                {/* Symbol + Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${asset.iconBg || 'bg-gray-700'}`}
                    >
                      {asset.icon ? (
                        <img 
                          src={asset.icon} 
                          alt={asset.symbol}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && asset.iconText) {
                              parent.innerHTML = `<span class="text-white font-bold text-xs">${asset.iconText}</span>`
                            }
                          }}
                        />
                      ) : (
                        <span className="text-white font-bold text-xs">
                          {asset.iconText || asset.symbol.slice(0, 3)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">{asset.symbol}</p>
                      <p className="text-gray-500 text-xs truncate">{asset.name}</p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-right">
                  <span className="text-white font-semibold text-sm whitespace-nowrap">
                    ${priceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>

                {/* Change % */}
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold text-sm whitespace-nowrap ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </span>
                </td>

                {/* Change */}
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium text-sm whitespace-nowrap ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{changeValue.toFixed(2)}
                  </span>
                </td>

                {/* High - hidden on mobile */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    {asset.high ? `$${parseFloat(asset.high).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                  </span>
                </td>

                {/* Low - hidden on mobile */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    {asset.low ? `$${parseFloat(asset.low).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
                  </span>
                </td>

                {/* Technical Rating - hidden on small screens */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  {asset.technicalRating ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getTechnicalColor(asset.technicalRating)}`}>
                        {getTechnicalIcon(asset.technicalRating)}
                      </span>
                      <span className={`text-sm font-medium whitespace-nowrap ${getTechnicalColor(asset.technicalRating)}`}>
                        {asset.technicalRating}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-sm">--</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
