// ==============================================================================
// Broker Registry (Dependency Injection & Fallback Manager)
// ==============================================================================

import { IBroker } from "../../domain/brokers/broker.interface";
import { 
  MockBroker, 
  AlpacaBroker, 
  InteractiveBrokersBroker, 
  BinanceBroker, 
  ZerodhaBroker,
  UpstoxBroker,
  AngelOneBroker
} from "../brokers/mock-broker";

export class BrokerRegistry {
  private static activeBroker: IBroker;

  /**
   * Resolves the broker provider based on environment config keys
   */
  public static getBrokerProvider(): IBroker {
    if (!this.activeBroker) {
      const brokerEnv = (process.env.ACTIVE_BROKER || "MOCK").toUpperCase();

      switch (brokerEnv) {
        case "ALPACA":
          console.log("[BrokerRegistry] Initializing Alpaca Broker Adapter.");
          this.activeBroker = new AlpacaBroker(process.env.ALPACA_API_KEY, process.env.ALPACA_SECRET_KEY);
          break;
        case "INTERACTIVE_BROKERS":
          console.log("[BrokerRegistry] Initializing Interactive Brokers Adapter.");
          this.activeBroker = new InteractiveBrokersBroker(process.env.IB_ACCOUNT_CODE);
          break;
        case "BINANCE":
          console.log("[BrokerRegistry] Initializing Binance Broker Adapter.");
          this.activeBroker = new BinanceBroker(process.env.BINANCE_API_KEY);
          break;
        case "ZERODHA":
          console.log("[BrokerRegistry] Initializing Zerodha Broker Adapter.");
          this.activeBroker = new ZerodhaBroker(process.env.ZERODHA_API_KEY);
          break;
        case "UPSTOX":
          console.log("[BrokerRegistry] Initializing Upstox Broker Adapter.");
          this.activeBroker = new UpstoxBroker(process.env.UPSTOX_API_KEY);
          break;
        case "ANGELONE":
          console.log("[BrokerRegistry] Initializing Angel One Broker Adapter.");
          this.activeBroker = new AngelOneBroker(process.env.ANGELONE_API_KEY);
          break;
        default:
          console.log("[BrokerRegistry] No credentials configured. Falling back to MockBroker.");
          this.activeBroker = new MockBroker();
          break;
      }
    }

    return this.activeBroker;
  }
}
