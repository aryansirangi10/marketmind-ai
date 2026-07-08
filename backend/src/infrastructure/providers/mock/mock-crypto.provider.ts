// ==============================================================================
// Mock Crypto Provider Implementation
// ==============================================================================

import { ICryptoProvider, CryptoMarketSummary, CryptoQuote } from "../../../domain/providers/crypto-provider.interface";
import { Candlestick } from "../../../domain/providers/stock-provider.interface";

export class MockCryptoProvider implements ICryptoProvider {
  private static readonly CRYPTO_LIST: Array<{ id: string; symbol: string; name: string; basePrice: number; image: string }> = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin", basePrice: 65000.0, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum", basePrice: 3500.0, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    { id: "binancecoin", symbol: "BNB", name: "BNB", basePrice: 580.0, image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
    { id: "solana", symbol: "SOL", name: "Solana", basePrice: 145.0, image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
    { id: "ripple", symbol: "XRP", name: "Ripple", basePrice: 0.48, image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
    { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", basePrice: 0.12, image: "https://assets.coingecko.com/coins/images/325/large/dogecoin.png" },
    { id: "cardano", symbol: "ADA", name: "Cardano", basePrice: 0.38, image: "https://assets.coingecko.com/coins/images/975/large/cardano.png" }
  ];

  public async getMarkets(_vsCurrency = "usd", limit = 10): Promise<CryptoMarketSummary[]> {
    return MockCryptoProvider.CRYPTO_LIST.slice(0, limit).map(crypto => {
      // Simulate live price changes (+-1.5% daily fluctuation)
      const variation = crypto.basePrice * (Math.random() - 0.5) * 0.03;
      const currentPrice = Number((crypto.basePrice + variation).toFixed(crypto.basePrice < 1 ? 4 : 2));
      const priceChangePercentage24h = Number(((Math.random() - 0.48) * 8).toFixed(2)); // mock percentage
      const marketCap = currentPrice * (crypto.symbol === "BTC" ? 19700000 : crypto.symbol === "ETH" ? 120000000 : 1000000000);
      const totalVolume = marketCap * 0.02 * (Math.random() + 0.5);

      return {
        id: crypto.id,
        symbol: crypto.symbol.toLowerCase(),
        name: crypto.name,
        imageUrl: crypto.image,
        currentPrice,
        marketCap: Number(marketCap.toFixed(0)),
        totalVolume: Number(totalVolume.toFixed(0)),
        priceChangePercentage24h
      };
    });
  }

  public async getQuote(symbol: string): Promise<CryptoQuote> {
    const cleanSymbol = symbol.toUpperCase().replace("USDT", "");
    const crypto = MockCryptoProvider.CRYPTO_LIST.find(c => c.symbol === cleanSymbol) || {
      id: "generic",
      symbol: cleanSymbol,
      name: `${cleanSymbol} Coin`,
      basePrice: 1.0,
      image: ""
    };

    const variation = crypto.basePrice * (Math.random() - 0.5) * 0.02;
    const price = Number((crypto.basePrice + variation).toFixed(crypto.basePrice < 1 ? 4 : 2));
    const bidPrice = Number((price * 0.999).toFixed(crypto.basePrice < 1 ? 4 : 2));
    const askPrice = Number((price * 1.001).toFixed(crypto.basePrice < 1 ? 4 : 2));
    
    return {
      symbol: `${crypto.symbol}USDT`,
      price,
      bidPrice,
      askPrice,
      high24h: Number((price * 1.05).toFixed(crypto.basePrice < 1 ? 4 : 2)),
      low24h: Number((price * 0.95).toFixed(crypto.basePrice < 1 ? 4 : 2)),
      volume24h: Number((price * 1000000).toFixed(0)),
      timestamp: Date.now()
    };
  }

  public async getCandlesticks(symbol: string, interval: string, limit = 100): Promise<Candlestick[]> {
    const cleanSymbol = symbol.toUpperCase().replace("USDT", "");
    const crypto = MockCryptoProvider.CRYPTO_LIST.find(c => c.symbol === cleanSymbol) || {
      id: "generic",
      symbol: cleanSymbol,
      name: `${cleanSymbol} Coin`,
      basePrice: 1.0,
      image: ""
    };

    let currentPrice = crypto.basePrice;
    const series: Candlestick[] = [];
    const now = Math.floor(Date.now() / 1000);
    const timeDelta = this.intervalToSeconds(interval);
    
    for (let i = limit; i >= 0; i--) {
      // Crypto is highly volatile (3.5% daily volatility)
      const volatility = 0.035;
      const changePercent = (Math.random() - 0.49) * volatility;
      const openPrice = currentPrice;
      const closePrice = openPrice * (1 + changePercent);
      const highPrice = Math.max(openPrice, closePrice) * (1 + Math.random() * 0.01);
      const lowPrice = Math.min(openPrice, closePrice) * (1 - Math.random() * 0.01);
      const volume = Math.floor(100000 + Math.random() * 9000000);
      const time = now - i * timeDelta;
      
      const precision = crypto.basePrice < 1 ? 4 : 2;
      series.push({
        time,
        open: Number(openPrice.toFixed(precision)),
        high: Number(highPrice.toFixed(precision)),
        low: Number(lowPrice.toFixed(precision)),
        close: Number(closePrice.toFixed(precision)),
        volume
      });
      
      currentPrice = closePrice;
    }
    
    return series;
  }

  private intervalToSeconds(interval: string): number {
    const unit = interval.slice(-1);
    const amount = parseInt(interval.slice(0, -1), 10) || 1;
    
    switch (unit) {
      case "m": return amount * 60;
      case "h": return amount * 60 * 60;
      case "d": return amount * 24 * 60 * 60;
      case "w": return amount * 7 * 24 * 60 * 60;
      default: return 24 * 60 * 60; // 1d default
    }
  }
}
