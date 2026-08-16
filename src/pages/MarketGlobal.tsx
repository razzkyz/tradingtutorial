import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface CoinData {
  symbol: string
  name: string
  price: string
  change24h: number
  volume: string
}

type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export default function MarketGlobal() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1m')
  const [currentPrice, setCurrentPrice] = useState<string>('0')
  const [priceChange, setPriceChange] = useState<number>(0)

  // Crypto coins list
  const coins: CoinData[] = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: '0', change24h: 0, volume: '0' },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: '0', change24h: 0, volume: '0' },
    { symbol: 'BNBUSDT', name: 'BNB', price: '0', change24h: 0, volume: '0' },
    { symbol: 'SOLUSDT', name: 'Solana', price: '0', change24h: 0, volume: '0' },
    { symbol: 'ADAUSDT', name: 'Cardano', price: '0', change24h: 0, volume: '0' },
    { symbol: 'XRPUSDT', name: 'Ripple', price: '0', change24h: 0, volume: '0' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', price: '0', change24h: 0, volume: '0' },
    { symbol: 'DOTUSDT', name: 'Polkadot', price: '0', change24h: 0, volume: '0' },
    { symbol: 'MATICUSDT', name: 'Polygon', price: '0', change24h: 0, volume: '0' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', price: '0', change24h: 0, volume: '0' },
  ]

  const [coinsData, setCoinsData] = useState<CoinData[]>(coins)

  const timeframes: { label: string; value: TimeFrame }[] = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1d' },
  ]

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#0B1A2A' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    })

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Load historical data and setup websocket
  useEffect(() => {
    loadHistoricalData()
    setupWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin, selectedTimeframe])

  // Load 24h ticker data for all coins
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr')
        const data = await response.json()

        const updatedCoins = coinsData.map((coin) => {
          const ticker = data.find((t: any) => t.symbol === coin.symbol)
          if (ticker) {
            return {
              ...coin,
              price: parseFloat(ticker.lastPrice).toFixed(2),
              change24h: parseFloat(ticker.priceChangePercent),
              volume: (parseFloat(ticker.volume) / 1000000).toFixed(2) + 'M',
            }
          }
          return coin
        })

        setCoinsData(updatedCoins)
      } catch (error) {
        console.error('Error fetching ticker data:', error)
      }
    }

    fetchTickerData()
    const interval = setInterval(fetchTickerData, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadHistoricalData = async () => {
    try {
      // Map timeframe to Binance interval
      const intervalMap: Record<TimeFrame, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
      }

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${selectedCoin}&interval=${intervalMap[selectedTimeframe]}&limit=100`
      )
      const data = await response.json()

      const candlestickData: CandlestickData[] = data.map((d: any) => ({
        time: (d[0] / 1000) as Time,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }))

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(candlestickData)
      }

      // Set initial price
      if (data.length > 0) {
        const lastCandle = data[data.length - 1]
        setCurrentPrice(parseFloat(lastCandle[4]).toFixed(2))
        
        // Calculate change from first to last
        const firstPrice = parseFloat(data[0][1])
        const lastPrice = parseFloat(lastCandle[4])
        const change = ((lastPrice - firstPrice) / firstPrice) * 100
        setPriceChange(change)
      }
    } catch (error) {
      console.error('Error loading historical data:', error)
    }
  }

  const setupWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Map timeframe to Binance stream interval
    const intervalMap: Record<TimeFrame, string> = {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    }

    const stream = `${selectedCoin.toLowerCase()}@kline_${intervalMap[selectedTimeframe]}`
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const candle = data.k

      if (candlestickSeriesRef.current) {
        const candlestickData: CandlestickData = {
          time: (candle.t / 1000) as Time,
          open: parseFloat(candle.o),
          high: parseFloat(candle.h),
          low: parseFloat(candle.l),
          close: parseFloat(candle.c),
        }

        candlestickSeriesRef.current.update(candlestickData)
        setCurrentPrice(parseFloat(candle.c).toFixed(2))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    wsRef.current = ws
  }

  const handleCoinSelect = (symbol: string) => {
    setSelectedCoin(symbol)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Sidebar - Coin List */}
      <div className="w-64 bg-gradient-to-b from-deep-navy to-dark-teal border-r border-cyan/20 overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-cyan/20">
          <h2 className="text-text-primary font-bold text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-cyan" />
            Markets
          </h2>
        </div>

        <div className="p-2">
          {coinsData.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => handleCoinSelect(coin.symbol)}
              className={`w-full p-3 rounded-lg mb-2 transition-all text-left ${
                selectedCoin === coin.symbol
                  ? 'bg-cyan/20 border border-cyan/40'
                  : 'bg-deep-navy/50 hover:bg-deep-navy/80 border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-primary font-semibold text-sm">{coin.name}</span>
                {coin.change24h !== 0 && (
                  coin.change24h > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">{coin.symbol}</span>
                <span
                  className={`text-xs font-medium ${
                    coin.change24h > 0 ? 'text-green' : coin.change24h < 0 ? 'text-red-400' : 'text-text-muted'
                  }`}
                >
                  {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              {coin.price !== '0' && (
                <div className="mt-1 text-text-primary text-sm font-bold">
                  ${coin.price}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col bg-deep-navy">
        {/* Chart Header */}
        <div className="bg-gradient-to-r from-deep-navy to-dark-teal border-b border-cyan/20 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Current Price Info */}
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-text-primary font-bold text-xl">{selectedCoin}</h2>
                <span className="text-text-primary font-bold text-2xl">${currentPrice}</span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    priceChange >= 0 ? 'bg-green/20 text-green' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
              <p className="text-text-secondary text-xs mt-1">Real-time data from Binance</p>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2 bg-deep-navy/50 rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTimeframe(tf.value)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    selectedTimeframe === tf.value
                      ? 'bg-button-gradient text-white shadow-lg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-dark-teal/50'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div ref={chartContainerRef} className="flex-1 relative">
          {/* Loading indicator can be added here */}
        </div>

        {/* Chart Footer - Additional Info */}
        <div className="bg-gradient-to-r from-deep-navy to-dark-teal border-t border-cyan/20 p-3">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>📊 Professional Trading Chart</span>
            <span>Powered by Binance Market Data</span>
          </div>
        </div>
      </div>
    </div>
  )
}
