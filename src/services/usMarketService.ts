/**
 * US Market Data Service
 * Provides US market indices data
 * 
 * NOTE: This currently uses placeholder data. 
 * In production, integrate with a real financial data API like:
 * - Alpha Vantage
 * - Twelve Data
 * - Finnhub
 * - Yahoo Finance API
 */

import { USMarketAsset, MarketDataResponse, calculateTechnicalRating } from './marketService'

// US Market indices with placeholder data
const usMarketData: USMarketAsset[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    price: 7745.06,
    changePercent: -0.52,
    change: -40.70,
    high: 7785.76,
    low: 7730.45,
    technicalRating: 'Netral',
    iconBg: 'bg-red-600',
    iconText: '500',
    market: 'us',
    exchange: 'INDEX',
    indexType: 'major'
  },
  {
    symbol: 'IXIC',
    name: 'NASDAQ Composite',
    price: 26644.91,
    changePercent: -0.32,
    change: -84.25,
    high: 26729.16,
    low: 26590.32,
    technicalRating: 'Netral',
    iconBg: 'bg-blue-500',
    iconText: 'NDQ',
    market: 'us',
    exchange: 'NASDAQ',
    indexType: 'major'
  },
  {
    symbol: 'DJI',
    name: 'Dow Jones Industrial',
    price: 53459.78,
    changePercent: -0.51,
    change: -272.63,
    high: 53732.41,
    low: 53400.15,
    technicalRating: 'Netral',
    iconBg: 'bg-blue-600',
    iconText: 'DJI',
    market: 'us',
    exchange: 'NYSE',
    indexType: 'major'
  },
  {
    symbol: 'VIX',
    name: 'CBOE Volatility Index',
    price: 15.96,
    changePercent: 5.07,
    change: 0.77,
    high: 16.42,
    low: 15.19,
    technicalRating: 'Pembelian Kuat',
    iconBg: 'bg-yellow-600',
    iconText: 'VIX',
    market: 'us',
    exchange: 'CBOE',
    indexType: 'major'
  },
  {
    symbol: 'NYA',
    name: 'NYSE Composite Index',
    price: 24717.81,
    changePercent: -0.42,
    change: -104.17,
    high: 24821.98,
    low: 24680.63,
    technicalRating: 'Netral',
    iconBg: 'bg-blue-500',
    iconText: 'NYSE',
    market: 'us',
    exchange: 'NYSE',
    indexType: 'major'
  },
  {
    symbol: 'XAX',
    name: 'NYSE American Composite',
    price: 8994.90,
    changePercent: 0.77,
    change: 68.74,
    high: 9010.15,
    low: 8926.16,
    technicalRating: 'Pembelian',
    iconBg: 'bg-blue-400',
    iconText: 'XAX',
    market: 'us',
    exchange: 'NYSE',
    indexType: 'major'
  },
  {
    symbol: 'RUI',
    name: 'Russell 1000 Index',
    price: 4223.67,
    changePercent: -0.52,
    change: -22.09,
    high: 4245.76,
    low: 4215.58,
    technicalRating: 'Netral',
    iconBg: 'bg-purple-600',
    iconText: 'R1K',
    market: 'us',
    exchange: 'INDEX',
    indexType: 'smallcap'
  },
  {
    symbol: 'RUT',
    name: 'Russell 2000 Index',
    price: 3057.54,
    changePercent: -0.35,
    change: -10.75,
    high: 3068.29,
    low: 3045.79,
    technicalRating: 'Netral',
    iconBg: 'bg-purple-500',
    iconText: 'R2K',
    market: 'us',
    exchange: 'INDEX',
    indexType: 'smallcap'
  },
  {
    symbol: 'RUA',
    name: 'Russell 3000 Index',
    price: 4411.21,
    changePercent: -0.51,
    change: -22.63,
    high: 4433.84,
    low: 4402.58,
    technicalRating: 'Netral',
    iconBg: 'bg-purple-600',
    iconText: 'R3K',
    market: 'us',
    exchange: 'INDEX',
    indexType: 'smallcap'
  },
  {
    symbol: 'SOX',
    name: 'PHLX Semiconductor',
    price: 12621.00,
    changePercent: 1.64,
    change: 203.45,
    high: 12650.78,
    low: 12417.55,
    technicalRating: 'Pembelian',
    iconBg: 'bg-green-500',
    iconText: 'SOX',
    market: 'us',
    exchange: 'PHLX',
    indexType: 'sector'
  },
  {
    symbol: 'HGX',
    name: 'PHLX Housing Sector',
    price: 670.14,
    changePercent: -1.09,
    change: -7.38,
    high: 677.52,
    low: 668.05,
    technicalRating: 'Penjualan',
    iconBg: 'bg-orange-600',
    iconText: 'HGX',
    market: 'us',
    exchange: 'PHLX',
    indexType: 'sector'
  },
  {
    symbol: 'OSX',
    name: 'PHLX Oil Service Sector',
    price: 245.82,
    changePercent: 0.45,
    change: 1.10,
    high: 247.15,
    low: 244.72,
    technicalRating: 'Netral',
    iconBg: 'bg-amber-600',
    iconText: 'OSX',
    market: 'us',
    exchange: 'PHLX',
    indexType: 'sector'
  },
  {
    symbol: 'US30USD',
    name: 'US Wall St 30',
    price: 53475.20,
    changePercent: -0.48,
    change: -258.33,
    high: 53733.53,
    low: 53416.87,
    technicalRating: 'Netral',
    iconBg: 'bg-indigo-600',
    iconText: 'US30',
    market: 'us',
    exchange: 'FOREX',
    indexType: 'major'
  },
]

/**
 * Fetch US market data
 * Currently returns placeholder data
 * TODO: Integrate with real financial data API
 */
export async function fetchUSMarketData(): Promise<MarketDataResponse<USMarketAsset>> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // TODO: Replace with actual API call
    // Example: const response = await fetch('API_ENDPOINT')
    
    // For now, return static data with calculated technical ratings
    const data = usMarketData.map(asset => ({
      ...asset,
      technicalRating: calculateTechnicalRating(asset.changePercent)
    }))

    return {
      success: true,
      data,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('US Market data error:', error)
    return {
      success: false,
      data: usMarketData, // Return fallback data
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get US market fallback data
 */
export function getUSMarketFallbackData(): USMarketAsset[] {
  return usMarketData
}

/**
 * Update US market data (for future real-time updates)
 */
export function updateUSMarketPrices(updates: Partial<Record<string, number>>): USMarketAsset[] {
  return usMarketData.map(asset => {
    if (updates[asset.symbol]) {
      const newPrice = updates[asset.symbol]!
      const change = newPrice - asset.price
      const changePercent = (change / asset.price) * 100

      return {
        ...asset,
        price: newPrice,
        change,
        changePercent,
        technicalRating: calculateTechnicalRating(changePercent)
      }
    }
    return asset
  })
}
