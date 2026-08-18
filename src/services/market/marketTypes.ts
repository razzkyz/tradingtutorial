export type MarketType = 'crypto' | 'us';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  change?: number; // Optional absolute change
  high: number;
  low: number;
  technicalRating?: 'Pembelian' | 'Pembelian kuat' | 'Netral' | 'Penjualan' | 'Penjualan kuat';
  icon?: string;
  market: MarketType;
}

export interface MarketSubscription {
  symbols: string[];
  onUpdate: (data: MarketData[]) => void;
  onError?: (error: string) => void;
}

export const CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', displaySymbol: 'BTC' },
  { symbol: 'ETHUSDT', name: 'Ethereum', displaySymbol: 'ETH' },
  { symbol: 'BNBUSDT', name: 'BNB', displaySymbol: 'BNB' },
  { symbol: 'XRPUSDT', name: 'XRP', displaySymbol: 'XRP' },
  { symbol: 'SOLUSDT', name: 'Solana', displaySymbol: 'SOL' },
  { symbol: 'ADAUSDT', name: 'Cardano', displaySymbol: 'ADA' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', displaySymbol: 'DOGE' },
  { symbol: 'TRXUSDT', name: 'TRON', displaySymbol: 'TRX' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', displaySymbol: 'SHIB' },
  { symbol: 'LTCUSDT', name: 'Litecoin', displaySymbol: 'LTC' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', displaySymbol: 'AVAX' },
  { symbol: 'DOTUSDT', name: 'Polkadot', displaySymbol: 'DOT' },
  { symbol: 'LINKUSDT', name: 'Chainlink', displaySymbol: 'LINK' },
  { symbol: 'TONUSDT', name: 'Toncoin', displaySymbol: 'TON' },
  { symbol: 'BCHUSDT', name: 'Bitcoin Cash', displaySymbol: 'BCH' },
  { symbol: 'UNIUSDT', name: 'Uniswap', displaySymbol: 'UNI' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', displaySymbol: 'NEAR' },
  { symbol: 'APTUSDT', name: 'Aptos', displaySymbol: 'APT' },
  { symbol: 'SUIUSDT', name: 'Sui', displaySymbol: 'SUI' },
  { symbol: 'ATOMUSDT', name: 'Cosmos', displaySymbol: 'ATOM' },
];

export const US_MARKET_INDICES = [
  { symbol: 'SPX', name: 'S&P 500' },
  { symbol: 'IXIC', name: 'NASDAQ Composite' },
  { symbol: 'DJI', name: 'Dow Jones' },
  { symbol: 'VIX', name: 'CBOE Volatility' },
  { symbol: 'NYA', name: 'NYSE Composite' },
  { symbol: 'XAX', name: 'NYSE American' },
  { symbol: 'RUI', name: 'Russell 1000' },
  { symbol: 'RUT', name: 'Russell 2000' },
  { symbol: 'RUA', name: 'Small Cap 3000' },
  { symbol: 'SOX', name: 'PHLX Semiconductor' },
  { symbol: 'HGX', name: 'PHLX Housing' },
  { symbol: 'OSX', name: 'PHLX Oil Service' },
  { symbol: 'US30USD', name: 'US Wall St 30' }
];
