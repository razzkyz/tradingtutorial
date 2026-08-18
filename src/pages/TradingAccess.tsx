import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getBalances, calculateTotalBalance } from '../services/balanceService'
import { Wallet, TrendingUp, TrendingDown, Activity, Search, Star, X, Maximize2, ChevronRight, GripVertical } from 'lucide-react'
import { SkeletonBalanceCard } from '../components/Skeleton'
import { MarketSection } from '../components/market/MarketSection'
import ErrorState from '../components/ErrorState'

interface Balance {
  id: string
  balance_type: string
  amount: number
}

interface CoinData {
  symbol: string
  name: string
  tvSymbol: string
  price: string
  change24h: number
  category: 'crypto' | 'forex' | 'stocks' | 'commodities'
  favorite: boolean
}

declare global {
  interface Window {
    TradingView: any
  }
}

export default function TradingAccess() {
  const { user } = useAuth()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(288)
  const [isResizing, setIsResizing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('5')

  const timeframes = [
    { label: '1m', value: '1' },
    { label: '3m', value: '3' },
    { label: '5m', value: '5' },
    { label: '10m', value: '10' },
    { label: '15m', value: '15' },
    { label: '30m', value: '30' },
    { label: '1H', value: '60' },
    { label: '2H', value: '120' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
    { label: '1W', value: 'W' },
    { label: '1M', value: 'M' },
  ]

  const allCoins: CoinData[] = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', price: '0', change24h: 0, category: 'crypto', favorite: true },
    { symbol: 'ETHUSDT', name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', price: '0', change24h: 0, category: 'crypto', favorite: true },
    { symbol: 'BNBUSDT', name: 'BNB', tvSymbol: 'BINANCE:BNBUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'SOLUSDT', name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'ADAUSDT', name: 'Cardano', tvSymbol: 'BINANCE:ADAUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'XRPUSDT', name: 'Ripple', tvSymbol: 'BINANCE:XRPUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', tvSymbol: 'BINANCE:DOGEUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'DOTUSDT', name: 'Polkadot', tvSymbol: 'BINANCE:DOTUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'MATICUSDT', name: 'Polygon', tvSymbol: 'BINANCE:MATICUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'AVAXUSDT', name: 'Avalanche', tvSymbol: 'BINANCE:AVAXUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'LINKUSDT', name: 'Chainlink', tvSymbol: 'BINANCE:LINKUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'LTCUSDT', name: 'Litecoin', tvSymbol: 'BINANCE:LTCUSDT', price: '0', change24h: 0, category: 'crypto', favorite: false },
    { symbol: 'EURUSD', name: 'EUR/USD', tvSymbol: 'FX:EURUSD', price: '0', change24h: 0, category: 'forex', favorite: false },
    { symbol: 'GBPUSD', name: 'GBP/USD', tvSymbol: 'FX:GBPUSD', price: '0', change24h: 0, category: 'forex', favorite: false },
    { symbol: 'USDJPY', name: 'USD/JPY', tvSymbol: 'FX:USDJPY', price: '0', change24h: 0, category: 'forex', favorite: false },
    { symbol: 'AAPL', name: 'Apple Inc', tvSymbol: 'NASDAQ:AAPL', price: '0', change24h: 0, category: 'stocks', favorite: false },
    { symbol: 'TSLA', name: 'Tesla Inc', tvSymbol: 'NASDAQ:TSLA', price: '0', change24h: 0, category: 'stocks', favorite: false },
    { symbol: 'NVDA', name: 'NVIDIA', tvSymbol: 'NASDAQ:NVDA', price: '0', change24h: 0, category: 'stocks', favorite: false },
    { symbol: 'XAUUSD', name: 'Gold', tvSymbol: 'OANDA:XAUUSD', price: '0', change24h: 0, category: 'commodities', favorite: true },
  ]

  const [coinsData, setCoinsData] = useState<CoinData[]>(allCoins)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'commodities', label: 'Commodities' },
  ]

  const getTVSymbol = () => {
    const coin = coinsData.find(c => c.symbol === selectedCoin)
    return coin?.tvSymbol || 'BINANCE:BTCUSDT'
  }

  useEffect(() => {
    if (!user) return

    loadBalances()
    
    // Cleanup
    return () => {
      // Cancel any pending requests
    }
  }, [user?.id]) // Only depend on user.id

  useEffect(() => {
    // Load TradingView script once
    if (window.TradingView) {
      initChart()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => initChart()
    document.head.appendChild(script)

    return () => {
      // Don't remove script to avoid re-downloading
    }
  }, []) // Empty dependency - run only once

  useEffect(() => {
    if (window.TradingView) {
      initChart()
    }
  }, [selectedCoin, selectedTimeframe]) // Only when coin or timeframe changes

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
        const data = await response.json()

        setCoinsData(prevCoins => 
          prevCoins.map((coin) => {
            if (coin.category === 'crypto') {
              const ticker = data.find((t: any) => t.symbol === coin.symbol)
              if (ticker) {
                return {
                  ...coin,
                  price: parseFloat(ticker.lastPrice).toFixed(2),
                  change24h: parseFloat(ticker.priceChangePercent),
                }
              }
            }
            return coin
          })
        )
      } catch (error) {
        console.error('Error fetching crypto data:', error)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = e.clientX
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const loadBalances = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const data = await getBalances(user.id)
      setBalances(data)
    } catch (err) {
      console.error('Error loading balances:', err)
      setError('Failed to load balances')
    } finally {
      setLoading(false)
    }
  }

  const initChart = () => {
    if (!chartContainerRef.current || !window.TradingView) return

    chartContainerRef.current.innerHTML = ''

    new window.TradingView.widget({
      container_id: chartContainerRef.current.id,
      autosize: true,
      symbol: getTVSymbol(),
      interval: selectedTimeframe,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#1F2937',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      backgroundColor: '#000000',
      gridColor: '#1F2937',
      allow_symbol_change: true,
      studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
        'header_saveload',
        'header_screenshot',
        'header_chart_type',
        'header_compare',
        'header_undo_redo',
        'timeframes_toolbar',
        'create_volume_indicator_by_default',
        'left_toolbar',
        'control_bar',
        'border_around_the_chart',
        'main_series_scale_menu',
        'display_market_status',
        'items_favoriting',
        'context_menus',
        'use_localstorage_for_settings',
        'save_chart_properties_to_local_storage',
        'pane_context_menu',
      ],
      overrides: {
        'paneProperties.background': '#000000',
        'paneProperties.backgroundType': 'solid',
        'paneProperties.gridProperties.color': '#1F2937',
        'scalesProperties.textColor': '#9CA3AF',
        'mainSeriesProperties.candleStyle.upColor': '#10B981',
        'mainSeriesProperties.candleStyle.downColor': '#EF4444',
        'mainSeriesProperties.candleStyle.borderUpColor': '#10B981',
        'mainSeriesProperties.candleStyle.borderDownColor': '#EF4444',
        'mainSeriesProperties.candleStyle.wickUpColor': '#10B981',
        'mainSeriesProperties.candleStyle.wickDownColor': '#EF4444',
      },
    })
  }

  const handleCoinSelect = (symbol: string) => {
    setSelectedCoin(symbol)
    setShowSearch(false)
  }

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCoinsData(prevCoins =>
      prevCoins.map(coin =>
        coin.symbol === symbol ? { ...coin, favorite: !coin.favorite } : coin
      )
    )
  }

  const filteredCoins = coinsData.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedCategory === 'all') return matchesSearch
    if (selectedCategory === 'favorites') return matchesSearch && coin.favorite
    return matchesSearch && coin.category === selectedCategory
  })

  const getCurrentCoin = () => coinsData.find(c => c.symbol === selectedCoin)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  if (error) return <ErrorState message={error} />

  const totalBalance = calculateTotalBalance(balances)

  return (
    <div className="min-h-screen bg-black">
      {/* Balance Card Section - Full Height on Mobile */}
      <div className="min-h-screen sm:min-h-0 px-4 py-6 flex items-center">
        <div className="w-full max-w-2xl mx-auto">
          {/* Main Card Container */}
          <div className="bg-black/95 backdrop-blur-sm rounded-lg border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-6 md:p-8 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:border-cyan-400/70 transition-all duration-300">
            
            {/* Icon & Total Balance - Top Right */}
            <div className="mb-8">
              <div className="flex justify-end">
                {loading ? (
                  <div className="flex flex-col items-end">
                    <div className="w-24 h-24 bg-text-muted/20 rounded-2xl animate-pulse mb-3"></div>
                    <div className="h-10 w-40 bg-text-muted/20 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    {/* Wallet Icon - no glow */}
                    <div className="bg-gradient-to-br from-cyan-600 to-teal-600 p-6 rounded-lg mb-3">
                      <Wallet className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                    {/* Total Balance */}
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      USDT {totalBalance.toFixed(0).replace(/,/g, '')}
                    </h2>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {loading ? (
                <>
                  <SkeletonBalanceCard />
                  <SkeletonBalanceCard />
                  <SkeletonBalanceCard />
                  <SkeletonBalanceCard />
                </>
              ) : (
                balances.map((balance, index) => (
                  <div
                    key={balance.id}
                    className="bg-black/95 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-lg p-4 animate-scale-in hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:border-cyan-400/60 transition-all duration-300"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <p className="text-cyan-300 text-sm font-medium mb-1">
                      Balance {index + 1}
                    </p>
                    <p className="text-white text-xl font-bold">
                      USDT {balance.amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Trading Access Button */}
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-lg py-4 px-6 rounded-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              Trading Access
            </button>

          </div>
        </div>
      </div>

      {/* Trading Chart Section - Below Balance Cards */}
      <div className="min-h-screen flex flex-col">
        {/* Timeframe Toolbar - TOP ROW - Hidden on Mobile */}
        <div className="hidden sm:block bg-black border-b border-gray-800 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-gray-400 text-sm font-medium whitespace-nowrap mr-2">
              Timeframe:
            </span>
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedTimeframe === tf.value
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50'
                    : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/30'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol & Controls Toolbar - SECOND ROW - Compact Mobile */}
        <div className="bg-black border-b border-gray-800 px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-all"
              >
                <span className="text-white font-bold text-xs sm:text-base">{selectedCoin}</span>
                <Search className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              </button>

              {getCurrentCoin() && getCurrentCoin()!.price !== '0' && (
                <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    ${getCurrentCoin()!.price}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium px-2 py-1 rounded ${
                      getCurrentCoin()!.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {getCurrentCoin()!.change24h >= 0 ? '+' : ''}
                    {getCurrentCoin()!.change24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile: Toggle Sidebar Overlay */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 sm:p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Markets"
              >
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                className="p-1.5 sm:p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                title="Fullscreen"
                onClick={() => document.documentElement.requestFullscreen()}
              >
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative bg-black">
          {/* Sidebar Overlay for Mobile */}
          {sidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Watchlist Sidebar */}
          <div 
            className={`
              bg-black border-r border-gray-800 
              overflow-hidden flex flex-col transition-all duration-300 relative z-50
              ${sidebarOpen 
                ? 'fixed md:relative left-0 top-0 h-full w-80 md:w-auto' 
                : 'hidden md:flex md:-ml-full'
              }
            `}
            style={{ 
              width: sidebarOpen ? (window.innerWidth < 768 ? '320px' : `${sidebarWidth}px`) : '0px',
              minWidth: sidebarOpen ? (window.innerWidth < 768 ? '320px' : '200px') : '0px',
            }}
          >
            <div className="p-3 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbols..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="px-3 py-2 border-b border-gray-800">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3 py-2 border-b border-gray-800 bg-gray-900/30">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400">
                <div className="col-span-6">Symbol</div>
                <div className="col-span-3 text-right">Price</div>
                <div className="col-span-3 text-right">Change</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredCoins.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No symbols found</p>
                </div>
              ) : (
                filteredCoins.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => handleCoinSelect(coin.symbol)}
                    className={`w-full px-3 py-2.5 transition-all text-left border-b border-gray-900 hover:bg-gray-900/70 ${
                      selectedCoin === coin.symbol ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6 flex items-center gap-2">
                        <button
                          onClick={(e) => toggleFavorite(coin.symbol, e)}
                          className="flex-shrink-0"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              coin.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        </button>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {coin.symbol}
                          </p>
                          <p className="text-gray-500 text-xs truncate">{coin.name}</p>
                        </div>
                      </div>

                      <div className="col-span-3 text-right">
                        <p className="text-white text-sm font-medium">
                          {coin.price !== '0' ? `$${coin.price}` : '-'}
                        </p>
                      </div>

                      <div className="col-span-3 text-right">
                        {coin.change24h !== 0 ? (
                          <div className="flex items-center justify-end gap-1">
                            {coin.change24h > 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-400" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-400" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                coin.change24h > 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {coin.change24h > 0 ? '+' : ''}
                              {coin.change24h.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {sidebarOpen && window.innerWidth >= 768 && (
              <div
                onMouseDown={handleMouseDown}
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-cyan/50 transition-colors group"
                style={{ zIndex: 10 }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-cyan" />
                </div>
              </div>
            )}
          </div>

          {/* Floating Toggle Button for Desktop (when sidebar closed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex absolute left-4 top-4 z-20 p-3 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl hover:shadow-emerald-500/50 transition-all group"
              title="Show Watchlist"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </button>
          )}

          <div className="flex-1 min-w-0 overflow-x-hidden bg-black relative flex flex-col min-h-[600px]">
            <div 
              id="tradingview_chart_trading_access" 
              ref={chartContainerRef} 
              className="w-full h-[600px]"
            />
            
            {/* Real-time Market Section */}
            <MarketSection 
              onCoinSelect={(symbol) => handleCoinSelect(symbol + 'USDT')}
              selectedCoin={selectedCoin.replace('USDT', '')}
            />
          </div>
        </div>

        {showSearch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black rounded-2xl border border-gray-800 shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Search Symbol</h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol or name..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {filteredCoins.map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => handleCoinSelect(coin.symbol)}
                    className="w-full p-3 rounded-lg hover:bg-gray-900/70 transition-all text-left flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white font-bold">{coin.symbol}</p>
                      <p className="text-gray-400 text-sm">{coin.name} • {coin.category}</p>
                    </div>
                    {coin.price !== '0' && (
                      <div className="text-right">
                        <p className="text-white font-medium">${coin.price}</p>
                        <p
                          className={`text-sm ${
                            coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {coin.change24h >= 0 ? '+' : ''}
                          {coin.change24h.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
