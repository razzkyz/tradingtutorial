import { MarketData, CRYPTO_ASSETS } from './marketTypes';
import { BINANCE_WS_URL, fetchUsMarketData } from './marketApi';

class MarketService {
  private cryptoWs: WebSocket | null = null;
  private cryptoSubscribers: Set<(data: MarketData[]) => void> = new Set();
  private usMarketSubscribers: Set<(data: MarketData[]) => void> = new Set();
  
  private latestCryptoData: Map<string, MarketData> = new Map();
  private latestUsData: MarketData[] = [];
  
  private usMarketInterval: number | null = null;

  constructor() {
    // Initialize with loading state
    CRYPTO_ASSETS.forEach(asset => {
      this.latestCryptoData.set(asset.symbol, {
        symbol: asset.displaySymbol,
        name: asset.name,
        price: 0,
        changePercent: 0,
        change: 0,
        high: 0,
        low: 0,
        technicalRating: 'Netral',
        market: 'crypto',
      });
    });
  }

  // CRYPTO: WebSocket Implementation
  public subscribeToCrypto(callback: (data: MarketData[]) => void) {
    this.cryptoSubscribers.add(callback);
    
    if (this.cryptoSubscribers.size === 1) {
      this.connectCryptoWs();
    } else {
      // Immediately send latest data
      callback(Array.from(this.latestCryptoData.values()));
    }

    return () => {
      this.cryptoSubscribers.delete(callback);
      if (this.cryptoSubscribers.size === 0) {
        this.disconnectCryptoWs();
      }
    };
  }

  private connectCryptoWs() {
    if (this.cryptoWs) return;

    // Use Binance stream for multiple symbols: !miniTicker@arr gives all tickers, 
    // but we can filter it or subscribe to specific ones.
    const streams = CRYPTO_ASSETS.map(asset => `${asset.symbol.toLowerCase()}@miniTicker`).join('/');
    this.cryptoWs = new WebSocket(`${BINANCE_WS_URL}/${streams}`);

    this.cryptoWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbolInfo = CRYPTO_ASSETS.find(a => a.symbol === data.s);
      
      if (symbolInfo) {
        const price = parseFloat(data.c);
        const openPrice = parseFloat(data.o);
        const change = price - openPrice;
        const changePercent = (change / openPrice) * 100;
        const high = parseFloat(data.h);
        const low = parseFloat(data.l);
        
        let technicalRating: MarketData['technicalRating'] = 'Netral';
        if (changePercent > 1.5) technicalRating = 'Pembelian kuat';
        else if (changePercent > 0.5) technicalRating = 'Pembelian';
        else if (changePercent < -1.5) technicalRating = 'Penjualan kuat';
        else if (changePercent < -0.5) technicalRating = 'Penjualan';

        const marketData: MarketData = {
          symbol: symbolInfo.displaySymbol,
          name: symbolInfo.name,
          price,
          changePercent,
          change,
          high,
          low,
          technicalRating,
          market: 'crypto',
        };

        this.latestCryptoData.set(symbolInfo.symbol, marketData);
        
        // Notify subscribers
        const updatedData = Array.from(this.latestCryptoData.values());
        this.cryptoSubscribers.forEach(sub => sub(updatedData));
      }
    };

    this.cryptoWs.onerror = (error) => {
      console.error('Crypto WebSocket Error:', error);
      // Implement reconnect logic if necessary
    };

    this.cryptoWs.onclose = () => {
      this.cryptoWs = null;
      if (this.cryptoSubscribers.size > 0) {
        setTimeout(() => this.connectCryptoWs(), 5000); // Reconnect after 5s
      }
    };
  }

  private disconnectCryptoWs() {
    if (this.cryptoWs) {
      this.cryptoWs.close();
      this.cryptoWs = null;
    }
  }

  // US MARKET: Polling Implementation
  public subscribeToUsMarket(callback: (data: MarketData[]) => void) {
    this.usMarketSubscribers.add(callback);
    
    if (this.usMarketSubscribers.size === 1) {
      this.startUsMarketPolling();
    } else if (this.latestUsData.length > 0) {
      callback(this.latestUsData);
    }

    return () => {
      this.usMarketSubscribers.delete(callback);
      if (this.usMarketSubscribers.size === 0) {
        this.stopUsMarketPolling();
      }
    };
  }

  private async startUsMarketPolling() {
    if (this.usMarketInterval) return;

    const fetchAndUpdate = async () => {
      const data = await fetchUsMarketData();
      this.latestUsData = data;
      this.usMarketSubscribers.forEach(sub => sub(data));
    };

    await fetchAndUpdate();
    
    // Check if we are simulating (no API key in env). 
    // If simulating, update every 3 seconds to make it look "live".
    // If using real API, update every 60 seconds to respect rate limits.
    const isSimulated = !import.meta.env.VITE_US_MARKET_API_KEY;
    const intervalMs = isSimulated ? 3000 : 60 * 1000;
    
    this.usMarketInterval = window.setInterval(fetchAndUpdate, intervalMs);
  }

  private stopUsMarketPolling() {
    if (this.usMarketInterval) {
      clearInterval(this.usMarketInterval);
      this.usMarketInterval = null;
    }
  }
}

export const marketService = new MarketService();
