import { MarketData, MarketType, US_MARKET_INDICES } from './marketTypes';

// We use Binance WebSocket for real-time crypto prices
export const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// For US Market, we'll simulate real-time data if no API key is provided,
// but structure it for a real REST API (e.g., Financial Modeling Prep or Alpha Vantage)
export const US_MARKET_API_URL = 'https://financialmodelingprep.com/api/v3/quote/';
export const US_MARKET_API_KEY = import.meta.env.VITE_US_MARKET_API_KEY || '';

/**
 * Helper to determine technical rating based on percentage change
 */
const getTechnicalRating = (changePercent: number) => {
  if (changePercent > 1.5) return 'Pembelian kuat';
  if (changePercent > 0.5) return 'Pembelian';
  if (changePercent < -1.5) return 'Penjualan kuat';
  if (changePercent < -0.5) return 'Penjualan';
  return 'Netral';
};

/**
 * Fallback generator for realistic US Market index fluctuations
 */
const generateSimulatedUsMarket = (): MarketData[] => {
  return US_MARKET_INDICES.map((index) => {
    // Generate realistic base prices
    let basePrice = 10000;
    if (index.symbol === 'SPX') basePrice = 5100;
    else if (index.symbol === 'IXIC') basePrice = 16000;
    else if (index.symbol === 'DJI') basePrice = 39000;
    else if (index.symbol === 'VIX') basePrice = 14.5;
    else if (index.symbol === 'RUT') basePrice = 2050;

    // Add some random variation (-1% to +1%)
    const changePercent = (Math.random() * 2) - 1; 
    const currentPrice = basePrice * (1 + changePercent / 100);
    const changeAbs = currentPrice - basePrice;
    
    // Simulate high and low
    const high = currentPrice * (1 + (Math.random() * 0.5) / 100);
    const low = currentPrice * (1 - (Math.random() * 0.5) / 100);

    return {
      symbol: index.symbol,
      name: index.name,
      price: parseFloat(currentPrice.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      change: parseFloat(changeAbs.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      technicalRating: getTechnicalRating(changePercent),
      market: 'us' as MarketType,
    };
  });
};

export const fetchUsMarketData = async (): Promise<MarketData[]> => {
  if (!US_MARKET_API_KEY) {
    // Simulate network delay and return simulated data if no key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateSimulatedUsMarket());
      }, 800);
    });
  }

  try {
    const symbols = US_MARKET_INDICES.map(i => i.symbol === 'SPX' ? '^GSPC' : 
                                               i.symbol === 'IXIC' ? '^IXIC' : 
                                               i.symbol === 'DJI' ? '^DJI' : i.symbol).join(',');
    const response = await fetch(`${US_MARKET_API_URL}${symbols}?apikey=${US_MARKET_API_KEY}`);
    const data = await response.json();
    
    if (!Array.isArray(data)) throw new Error('Invalid API response');

    return US_MARKET_INDICES.map(index => {
      // Map API symbol back to our symbol if needed
      const apiSymbol = index.symbol === 'SPX' ? '^GSPC' : 
                        index.symbol === 'IXIC' ? '^IXIC' : 
                        index.symbol === 'DJI' ? '^DJI' : index.symbol;
      const quote = data.find((q: any) => q.symbol === apiSymbol);
      
      const changePercent = quote ? quote.changesPercentage : 0;
      
      return {
        symbol: index.symbol,
        name: index.name,
        price: quote ? quote.price : 0,
        changePercent,
        change: quote ? quote.change : 0,
        high: quote ? quote.dayHigh || quote.price * 1.01 : 0,
        low: quote ? quote.dayLow || quote.price * 0.99 : 0,
        technicalRating: getTechnicalRating(changePercent),
        market: 'us' as MarketType,
      };
    });
  } catch (error) {
    console.error('Error fetching US Market data:', error);
    // Fallback on error
    return generateSimulatedUsMarket();
  }
};
