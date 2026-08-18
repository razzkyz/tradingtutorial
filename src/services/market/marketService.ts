import { MarketData, CRYPTO_ASSETS } from './marketTypes';
import { fetchUsMarketData } from './marketApi';

// Binance REST API - works on ALL networks including mobile
const BINANCE_REST_URL = 'https://api.binance.com/api/v3/ticker/24hr';

class MarketService {
  private cryptoSubscribers: Set<(data: MarketData[]) => void> = new Set();
  private usMarketSubscribers: Set<(data: MarketData[]) => void> = new Set();

  private latestCryptoData: Map<string, MarketData> = new Map();
  private latestUsData: MarketData[] = [];

  private cryptoInterval: ReturnType<typeof setInterval> | null = null;
  private usMarketInterval: number | null = null;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;

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

    // Handle mobile browser sleep/wake and network reconnects
    if (typeof window !== 'undefined') {
      const handleWakeUp = () => {
        if (document.visibilityState === 'visible' || navigator.onLine) {
          if (this.cryptoSubscribers.size > 0) {
            this.fetchCryptoData();
          }
          if (this.usMarketSubscribers.size > 0) {
            this.stopUsMarketPolling();
            this.startUsMarketPolling();
          }
        }
      };
      window.addEventListener('visibilitychange', handleWakeUp);
      window.addEventListener('online', handleWakeUp);
    }
  }

  // Fetch crypto prices via REST (100% compatible with all mobile networks)
  private async fetchCryptoData() {
    try {
      const symbols = JSON.stringify(CRYPTO_ASSETS.map(a => a.symbol));
      const url = `${BINANCE_REST_URL}?symbols=${encodeURIComponent(symbols)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const tickers: Array<{
        symbol: string;
        lastPrice: string;
        priceChangePercent: string;
        priceChange: string;
        highPrice: string;
        lowPrice: string;
      }> = await res.json();

      tickers.forEach(ticker => {
        const asset = CRYPTO_ASSETS.find(a => a.symbol === ticker.symbol);
        if (!asset) return;

        const price = parseFloat(ticker.lastPrice);
        const changePercent = parseFloat(ticker.priceChangePercent);
        const change = parseFloat(ticker.priceChange);
        const high = parseFloat(ticker.highPrice);
        const low = parseFloat(ticker.lowPrice);

        let technicalRating: MarketData['technicalRating'] = 'Netral';
        if (changePercent > 1.5) technicalRating = 'Pembelian kuat';
        else if (changePercent > 0.5) technicalRating = 'Pembelian';
        else if (changePercent < -1.5) technicalRating = 'Penjualan kuat';
        else if (changePercent < -0.5) technicalRating = 'Penjualan';

        this.latestCryptoData.set(asset.symbol, {
          symbol: asset.displaySymbol,
          name: asset.name,
          price,
          changePercent,
          change,
          high,
          low,
          technicalRating,
          market: 'crypto',
        });
      });

      const updatedData = Array.from(this.latestCryptoData.values());
      this.cryptoSubscribers.forEach(sub => sub(updatedData));
    } catch (err) {
      console.error('Crypto fetch error:', err);
    }
  }

  private startCryptoPolling() {
    if (this.cryptoInterval) return;
    // Fetch immediately, then every 5 seconds
    this.fetchCryptoData();
    this.cryptoInterval = setInterval(() => this.fetchCryptoData(), 5000);
  }

  private stopCryptoPolling() {
    if (this.cryptoInterval) {
      clearInterval(this.cryptoInterval);
      this.cryptoInterval = null;
    }
  }

  // CRYPTO: Subscribe/Unsubscribe
  public subscribeToCrypto(callback: (data: MarketData[]) => void) {
    // Cancel any pending disconnect
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }

    this.cryptoSubscribers.add(callback);

    if (!this.cryptoInterval) {
      this.startCryptoPolling();
    } else {
      // Send latest data immediately
      callback(Array.from(this.latestCryptoData.values()));
    }

    return () => {
      this.cryptoSubscribers.delete(callback);
      if (this.cryptoSubscribers.size === 0) {
        // Debounce stop by 3s to handle rapid auth state changes
        this.disconnectTimer = setTimeout(() => {
          if (this.cryptoSubscribers.size === 0) {
            this.stopCryptoPolling();
          }
        }, 3000);
      }
    };
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
