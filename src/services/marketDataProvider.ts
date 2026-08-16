// Market Data Provider Interface
// This abstraction allows switching between different data sources

export interface OHLCVData {
  timestamp: number // Unix timestamp in seconds (UTC)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface SymbolInfo {
  symbol: string
  name: string
  exchange: string
  category: 'crypto' | 'forex' | 'stocks' | 'commodities'
  description?: string
}

export interface QuoteData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h?: number
  low24h?: number
  timestamp: number
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d' | '1w' | '1M'

export interface MarketDataProvider {
  name: string
  getSymbols(category?: string): Promise<SymbolInfo[]>
  getCandles(symbol: string, timeframe: Timeframe, from?: number, to?: number, limit?: number): Promise<OHLCVData[]>
  getQuote(symbol: string): Promise<QuoteData>
  subscribeToQuotes(symbols: string[], callback: (quote: QuoteData) => void): () => void
}

// Binance Provider Implementation
class BinanceProvider implements MarketDataProvider {
  name = 'Binance'
  private wsConnections: Map<string, WebSocket> = new Map()

  private readonly SYMBOLS: SymbolInfo[] = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', exchange: 'Binance', category: 'crypto', description: 'BTC/USDT' },
    { symbol: 'ETHUSDT', name: 'Ethereum', exchange: 'Binance', category: 'crypto', description: 'ETH/USDT' },
    { symbol: 'BNBUSDT', name: 'BNB', exchange: 'Binance', category: 'crypto', description: 'BNB/USDT' },
    { symbol: 'SOLUSDT', name: 'Solana', exchange: 'Binance', category: 'crypto', description: 'SOL/USDT' },
    { symbol: 'ADAUSDT', name: 'Cardano', exchange: 'Binance', category: 'crypto', description: 'ADA/USDT' },
    { symbol: 'XRPUSDT', name: 'Ripple', exchange: 'Binance', category: 'crypto', description: 'XRP/USDT' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', exchange: 'Binance', category: 'crypto', description: 'DOGE/USDT' },
    { symbol: 'DOTUSDT', name: 'Polkadot', exchange: 'Binance', category: 'crypto', description: 'DOT/USDT' },
    { symbol: 'MATICUSDT', name: 'Polygon', exchange: 'Binance', category: 'crypto', description: 'MATIC/USDT' },
    { symbol: 'AVAXUSDT', name: 'Avalanche', exchange: 'Binance', category: 'crypto', description: 'AVAX/USDT' },
    { symbol: 'LTCUSDT', name: 'Litecoin', exchange: 'Binance', category: 'crypto', description: 'LTC/USDT' },
    { symbol: 'LINKUSDT', name: 'Chainlink', exchange: 'Binance', category: 'crypto', description: 'LINK/USDT' },
    { symbol: 'UNIUSDT', name: 'Uniswap', exchange: 'Binance', category: 'crypto', description: 'UNI/USDT' },
    { symbol: 'ATOMUSDT', name: 'Cosmos', exchange: 'Binance', category: 'crypto', description: 'ATOM/USDT' },
  ]

  private timeframeToInterval(timeframe: Timeframe): string {
    const map: Record<Timeframe, string> = {
      '1m': '1m',
      '3m': '3m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '2h': '2h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w',
      '1M': '1M',
    }
    return map[timeframe]
  }

  async getSymbols(category?: string): Promise<SymbolInfo[]> {
    if (category) {
      return this.SYMBOLS.filter(s => s.category === category)
    }
    return this.SYMBOLS
  }

  async getCandles(
    symbol: string,
    timeframe: Timeframe,
    from?: number,
    to?: number,
    limit: number = 500
  ): Promise<OHLCVData[]> {
    try {
      const interval = this.timeframeToInterval(timeframe)
      let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`

      if (from) {
        url += `&startTime=${from * 1000}`
      }
      if (to) {
        url += `&endTime=${to * 1000}`
      }

      const response = await fetch(url)
      const data = await response.json()

      return data.map((d: any) => ({
        timestamp: Math.floor(d[0] / 1000),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }))
    } catch (error) {
      console.error('Error fetching candles:', error)
      return []
    }
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      const data = await response.json()

      return {
        symbol,
        price: parseFloat(data.lastPrice),
        change: parseFloat(data.priceChange),
        changePercent: parseFloat(data.priceChangePercent),
        volume: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: Math.floor(data.closeTime / 1000),
      }
    } catch (error) {
      console.error('Error fetching quote:', error)
      throw error
    }
  }

  subscribeToQuotes(symbols: string[], callback: (quote: QuoteData) => void): () => void {
    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/')
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const data = message.data

      if (data && data.s) {
        callback({
          symbol: data.s,
          price: parseFloat(data.c),
          change: parseFloat(data.p),
          changePercent: parseFloat(data.P),
          volume: parseFloat(data.v),
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l),
          timestamp: Math.floor(data.E / 1000),
        })
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    const connectionId = Math.random().toString(36)
    this.wsConnections.set(connectionId, ws)

    // Return cleanup function
    return () => {
      ws.close()
      this.wsConnections.delete(connectionId)
    }
  }

  cleanup() {
    this.wsConnections.forEach(ws => ws.close())
    this.wsConnections.clear()
  }
}

// Export singleton instance
export const marketDataProvider: MarketDataProvider = new BinanceProvider()
