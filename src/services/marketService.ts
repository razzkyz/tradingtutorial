/**
 * Market Data Service
 * Provides interfaces and utilities for market data across different asset types
 */

export interface MarketAsset {
  symbol: string
  name: string
  price: number
  changePercent: number
  change: number
  high?: number
  low?: number
  volume?: number
  marketCap?: number
  technicalRating?: 'Pembelian Kuat' | 'Pembelian' | 'Netral' | 'Penjualan' | 'Penjualan Kuat'
  icon?: string
  iconBg?: string
  iconText?: string
  market: 'crypto' | 'us' | 'forex' | 'commodities' | 'stocks'
}

export interface CryptoAsset extends MarketAsset {
  market: 'crypto'
  pair: string
}

export interface USMarketAsset extends MarketAsset {
  market: 'us'
  exchange?: string
  indexType?: 'major' | 'sector' | 'smallcap'
}

export interface MarketDataResponse<T = MarketAsset> {
  success: boolean
  data: T[]
  timestamp: number
  error?: string
}

/**
 * Calculate technical rating based on price change
 * This is a simple heuristic - can be replaced with actual technical analysis
 */
export function calculateTechnicalRating(changePercent: number): MarketAsset['technicalRating'] {
  if (changePercent >= 2) return 'Pembelian Kuat'
  if (changePercent >= 0.5) return 'Pembelian'
  if (changePercent <= -2) return 'Penjualan Kuat'
  if (changePercent <= -0.5) return 'Penjualan'
  return 'Netral'
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })
}

/**
 * Format percentage for display
 */
export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

/**
 * Handle API errors gracefully
 */
export function handleMarketError(error: unknown): MarketDataResponse {
  console.error('Market data error:', error)
  return {
    success: false,
    data: [],
    timestamp: Date.now(),
    error: error instanceof Error ? error.message : 'Unknown error'
  }
}
