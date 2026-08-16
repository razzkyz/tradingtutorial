export default function MarketGlobal() {
  const markets = [
    { pair: 'BTC/USDT', price: '45,230.50', change: '+2.35%', positive: true },
    { pair: 'ETH/USDT', price: '2,890.75', change: '+1.82%', positive: true },
    { pair: 'BNB/USDT', price: '312.40', change: '-0.45%', positive: false },
    { pair: 'SOL/USDT', price: '98.65', change: '+5.23%', positive: true },
    { pair: 'ADA/USDT', price: '0.5420', change: '-1.12%', positive: false },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-br from-deep-navy/90 to-dark-teal/90 backdrop-blur-sm rounded-2xl border border-cyan/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-card-gradient p-6 border-b border-cyan/30">
          <h1 className="text-2xl font-bold text-text-primary flex items-center">
            <span className="mr-3">🌍</span>
            Market Global
          </h1>
        </div>

        {/* Market List */}
        <div className="p-6">
          <div className="space-y-4">
            {markets.map((market) => (
              <div
                key={market.pair}
                className="bg-dark-teal/40 border border-text-muted/20 rounded-xl p-4 hover:bg-dark-teal/60 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-bold text-lg">{market.pair}</p>
                    <p className="text-text-secondary text-sm">Trading Pair</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-bold text-lg">${market.price}</p>
                    <p
                      className={`text-sm font-medium ${
                        market.positive ? 'text-green' : 'text-red-400'
                      }`}
                    >
                      {market.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-cyan/10 border border-cyan/30 rounded-xl">
            <p className="text-text-secondary text-sm text-center">
              💡 Market data is for demonstration purposes only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
