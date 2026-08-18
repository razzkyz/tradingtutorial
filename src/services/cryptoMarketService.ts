/**
 * Cryptocurrency Market Data Service
 * Fetches real-time crypto prices from Binance API
 */

import { CryptoAsset, MarketDataResponse, calculateTechnicalRating, handleMarketError } from './marketService'

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'

// Crypto icon data
const cryptoIcons: Record<string, { bg: string; text: string; url: string }> = {
  'BTCUSDT': { 
    bg: 'bg-orange-500', 
    text: '₿',
    url: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  'ETHUSDT': { 
    bg: 'bg-blue-500', 
    text: 'Ξ',
    url: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  'BNBUSDT': { 
    bg: 'bg-yellow-500', 
    text: 'BNB',
    url: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
  },
  'XRPUSDT': { 
    bg: 'bg-gray-600', 
    text: 'XRP',
    url: 'https://cryptologos.cc/logos/xrp-xrp-logo.png'
  },
  'SOLUSDT': { 
    bg: 'bg-purple-500', 
    text: 'SOL',
    url: 'https://cryptologos.cc/logos/solana-sol-logo.png'
  },
  'ADAUSDT': { 
    bg: 'bg-blue-600', 
    text: 'ADA',
    url: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
  },
  'DOGEUSDT': { 
    bg: 'bg-yellow-600', 
    text: 'Ð',
    url: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png'
  },
  'TRXUSDT': { 
    bg: 'bg-red-600', 
    text: 'TRX',
    url: 'https://cryptologos.cc/logos/tron-trx-logo.png'
  },
  'SHIBUSDT': { 
    bg: 'bg-orange-600', 
    text: 'SHIB',
    url: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'
  },
  'LTCUSDT': { 
    bg: 'bg-gray-400', 
    text: 'Ł',
    url: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png'
  },
}

// Crypto name mapping
const cryptoNames: Record<string, string> = {
  'BTCUSDT': 'Bitcoin',
  'ETHUSDT': 'Ethereum',
  'BNBUSDT': 'BNB',
  'XRPUSDT': 'XRP',
  'SOLUSDT': 'Solana',
  'ADAUSDT': 'Cardano',
  'DOGEUSDT': 'Dogecoin',
  'TRXUSDT': 'TRON',
  'SHIBUSDT': 'Shiba Inu',
  'LTCUSDT': 'Litecoin',
}

/**
 * Fetch crypto market data from Binance
 */
export async function fetchCryptoMarketData(
  symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT', 'ADAUSDT', 'DOGEUSDT', 'TRXUSDT', 'SHIBUSDT', 'LTCUSDT']
): Promise<MarketDataResponse<CryptoAsset>> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr`)
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`)
    }

    const allTickers = await response.json()
    
    const cryptoAssets = symbols
      .map(symbol => {
        const ticker = allTickers.find((t: any) => t.symbol === symbol)
        if (!ticker) return null

        const price = parseFloat(ticker.lastPrice)
        const changePercent = parseFloat(ticker.priceChangePercent)
        const change = parseFloat(ticker.priceChange)
        const high = parseFloat(ticker.highPrice)
        const low = parseFloat(ticker.lowPrice)
        const volume = parseFloat(ticker.volume)
        
        const iconData = cryptoIcons[symbol] || { 
          bg: 'bg-gray-500', 
          text: symbol.slice(0, 3),
          url: '' 
        }

        const asset: CryptoAsset = {
          symbol,
          name: cryptoNames[symbol] || symbol.replace('USDT', ''),
          pair: symbol,
          price,
          changePercent,
          change,
          high,
          low,
          volume,
          technicalRating: calculateTechnicalRating(changePercent),
          icon: iconData.url,
          iconBg: iconData.bg,
          iconText: iconData.text,
          market: 'crypto' as const
        }
        
        return asset
      })
      .filter((asset): asset is CryptoAsset => asset !== null)

    return {
      success: true,
      data: cryptoAssets,
      timestamp: Date.now()
    }
  } catch (error) {
    const errorResponse = handleMarketError(error)
    return {
      ...errorResponse,
      data: [] as CryptoAsset[]
    }
  }
}

/**
 * Get fallback crypto data when API is unavailable
 */
export function getCryptoFallbackData(symbols: string[]): CryptoAsset[] {
  return symbols.map(symbol => {
    const iconData = cryptoIcons[symbol] || { 
      bg: 'bg-gray-500', 
      text: symbol.slice(0, 3),
      url: '' 
    }

    return {
      symbol,
      name: cryptoNames[symbol] || symbol.replace('USDT', ''),
      pair: symbol,
      price: 0,
      changePercent: 0,
      change: 0,
      technicalRating: 'Netral',
      icon: iconData.url,
      iconBg: iconData.bg,
      iconText: iconData.text,
      market: 'crypto' as const
    }
  })
}
