// ==============================================================================
// Mock Broker Implementations (Alpaca, Interactive Brokers, Zerodha, Upstox, etc.)
// ==============================================================================

import { IBroker, BrokerOrder, BrokerHolding } from "../../domain/brokers/broker.interface";

export class MockBroker implements IBroker {
  protected balance = 100000.0;
  protected holdings: BrokerHolding[] = [
    { symbol: "RELIANCE", quantity: 150, averageBuyPrice: 2400.0, currentPrice: 2450.0 },
    { symbol: "BTC", quantity: 0.5, averageBuyPrice: 62000.0, currentPrice: 65800.0 }
  ];

  public async placeOrder(order: Omit<BrokerOrder, "id" | "status">): Promise<BrokerOrder> {
    const newOrder: BrokerOrder = {
      id: Math.random().toString(36).substr(2, 9),
      ...order,
      status: "FILLED"
    };
    
    // Adjust mock balances
    const cost = order.quantity * (order.price || 100);
    if (order.type === "BUY") {
      this.balance -= cost;
      const existing = this.holdings.find(h => h.symbol === order.symbol);
      if (existing) {
        existing.quantity += order.quantity;
      } else {
        this.holdings.push({
          symbol: order.symbol,
          quantity: order.quantity,
          averageBuyPrice: order.price || 100,
          currentPrice: order.price || 100
        });
      }
    } else {
      this.balance += cost;
      this.holdings = this.holdings.filter(h => {
        if (h.symbol === order.symbol) {
          h.quantity -= order.quantity;
          return h.quantity > 0;
        }
        return true;
      });
    }

    return newOrder;
  }

  public async cancelOrder(_orderId: string): Promise<boolean> {
    return true;
  }

  public async getAccountValue(): Promise<number> {
    const holdingsVal = this.holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    return this.balance + holdingsVal;
  }

  public async getHoldings(): Promise<BrokerHolding[]> {
    return this.holdings;
  }
}

// ------------------------------------------------------------------------------
// Individual Broker Adapters extending the Mock Base for development
// ------------------------------------------------------------------------------

export class AlpacaBroker extends MockBroker {
  constructor(_apiKey?: string, _secretKey?: string) {
    super();
  }
}

export class InteractiveBrokersBroker extends MockBroker {
  constructor(_accountCode?: string) {
    super();
  }
}

export class BinanceBroker extends MockBroker {
  constructor(_apiKey?: string) {
    super();
  }
}

export class ZerodhaBroker extends MockBroker {
  constructor(_apiKey?: string) {
    super();
  }
}

export class UpstoxBroker extends MockBroker {
  constructor(_apiKey?: string) {
    super();
  }
}

export class AngelOneBroker extends MockBroker {
  constructor(_apiKey?: string) {
    super();
  }
}
