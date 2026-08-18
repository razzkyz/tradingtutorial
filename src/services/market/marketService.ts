import { MarketData, CRYPTO_ASSETS } from './marketTypes';
import { fetchUsMarketData } from './marketApi';

// CoinGecko API - designed for browser access, no CORS issues, works on ALL networks
const COINGECKO_API = 'https://api.coingecko.com/api/v3/coins/markets';

// Map Binance symbols to CoinGecko coin IDs
const COINGECKO_ID_MAP: Record<string, string> = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  BNBUSDT: 'binancecoin',
  XRPUSDT: 'ripple',
  SOLUSDT: 'solana',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  TRXUSDT: 'tron',
  SHIBUSDT: 'shiba-inu',
  LTCUSDT: 'litecoin',
  AVAXUSDT: 'avalanche-2',
  DOTUSDT: 'polkadot',
  LINKUSDT: 'chainlink',
  TONUSDT: 'the-open-network',
  BCHUSDT: 'bitcoin-cash',
  UNIUSDT: 'uniswap',
  NEARUSDT: 'near',
  APTUSDT: 'aptos',
  SUIUSDT: 'sui',
  ATOMUSDT: 'cosmos',
};

class MarketService {
  private cryptoSubscribers: Set<(data: MarketData[]) => void> = new Set();
  private usMarketSubscribers: Set<(data: MarketData[]) => void> = new Set();

  private latestCryptoData: Map<string, MarketData> = new Map();
  private latestUsData: MarketData[] = [];

  private cryptoInterval: ReturnType<typeof setInterval> | null = null;
  private usMarketInterval: number | null = null;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
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

    if (typeof window !== 'undefined') {
      const handleWakeUp = () => {
        if (document.visibilityState === 'visible' || navigator.onLine) {
          if (this.cryptoSubscribers.size > 0) this.fetchCryptoData();
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

  private async fetchCryptoData() {
    try {
      const ids = CRYPTO_ASSETS.map(a => COINGECKO_ID_MAP[a.symbol]).filter(Boolean).join(',');
      const url = `${COINGECKO_API}?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h&per_page=50`;

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);

      const coins: Array<{
        id: string;
        symbol: string;
        current_price: number;
        price_change_percentage_24h: number;
        price_change_24h: number;
        high_24h: number;
        low_24h: number;
      }> = await res.json();

      // Build reverse map: coingecko id -> CRYPTO_ASSETS entry
      const idToAsset: Record<string, typeof CRYPTO_ASSETS[0]> = {};
      CRYPTO_ASSETS.forEach(asset => {
        const cgId = COINGECKO_ID_MAP[asset.symbol];
        if (cgId) idToAsset[cgId] = asset;
      });

      coins.forEach(coin => {
        const asset = idToAsset[coin.id];
        if (!asset) return;

        const changePercent = coin.price_change_percentage_24h ?? 0;
        let technicalRating: MarketData['technicalRating'] = 'Netral';
        if (changePercent > 1.5) technicalRating = 'Pembelian kuat';
        else if (changePercent > 0.5) technicalRating = 'Pembelian';
        else if (changePercent < -1.5) technicalRating = 'Penjualan kuat';
        else if (changePercent < -0.5) technicalRating = 'Penjualan';

        this.latestCryptoData.set(asset.symbol, {
          symbol: asset.displaySymbol,
          name: asset.name,
          price: coin.current_price,
          changePercent,
          change: coin.price_change_24h ?? 0,
          high: coin.high_24h ?? 0,
          low: coin.low_24h ?? 0,
          technicalRating,
          market: 'crypto',
        });
      });

      const updatedData = Array.from(this.latestCryptoData.values());
      this.cryptoSubscribers.forEach(sub => sub(updatedData));
    } catch (err) {
      console.error('CoinGecko fetch error:', err);
    }
  }

  private startCryptoPolling() {
    if (this.cryptoInterval) return;
    // Fetch immediately, then every 30s (CoinGecko free tier: max ~30 req/min)
    this.fetchCryptoData();
    this.cryptoInterval = setInterval(() => this.fetchCryptoData(), 30000);
  }

  private stopCryptoPolling() {
    if (this.cryptoInterval) {
      clearInterval(this.cryptoInterval);
      this.cryptoInterval = null;
    }
  }

  public subscribeToCrypto(callback: (data: MarketData[]) => void) {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }

    this.cryptoSubscribers.add(callback);

    if (!this.cryptoInterval) {
      this.startCryptoPolling();
    } else {
      callback(Array.from(this.latestCryptoData.values()));
    }

    return () => {
      this.cryptoSubscribers.delete(callback);
      if (this.cryptoSubscribers.size === 0) {
        this.disconnectTimer = setTimeout(() => {
          if (this.cryptoSubscribers.size === 0) this.stopCryptoPolling();
        }, 3000);
      }
    };
  }

  public subscribeToUsMarket(callback: (data: MarketData[]) => void) {
    this.usMarketSubscribers.add(callback);

    if (this.usMarketSubscribers.size === 1) {
      this.startUsMarketPolling();
    } else if (this.latestUsData.length > 0) {
      callback(this.latestUsData);
    }

    return () => {
      this.usMarketSubscribers.delete(callback);
      if (this.usMarketSubscribers.size === 0) this.stopUsMarketPolling();
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
