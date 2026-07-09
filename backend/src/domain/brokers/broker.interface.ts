// ==============================================================================
// Domain Interface for Broker Integrations (Alpaca, IB, Zerodha, Mock, etc.)
// ==============================================================================

export interface BrokerOrder {
  id: string;
  symbol: string;
  quantity: number;
  price?: number;
  type: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  status: "PENDING" | "FILLED" | "CANCELLED";
}

export interface BrokerHolding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
}

export interface IBroker {
  /**
   * Places an order with the broker
   */
  placeOrder(order: Omit<BrokerOrder, "id" | "status">): Promise<BrokerOrder>;

  /**
   * Cancels a pending order by ID
   */
  cancelOrder(orderId: string): Promise<boolean>;

  /**
   * Fetches the current net liquidation value or cash balance
   */
  getAccountValue(): Promise<number>;

  /**
   * Retrieves active share/crypto positions
   */
  getHoldings(): Promise<BrokerHolding[]>;
}
