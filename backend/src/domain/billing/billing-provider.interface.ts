// ==============================================================================
// Domain Interface for SaaS Billing Providers (Stripe, Mock, etc.)
// ==============================================================================

export interface BillingPlan {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  price: number;
  interval: "month" | "year";
}

export interface BillingInvoice {
  id: string;
  amount: number;
  pdfUrl?: string;
  issuedAt: Date;
}

export interface IBillingProvider {
  /**
   * Generates a checkout link/session URL for subscribing to a plan tier
   */
  createCheckoutSession(userId: string, tier: "PRO" | "ENTERPRISE", coupon?: string): Promise<string>;

  /**
   * Cancels an active user subscription
   */
  cancelSubscription(userId: string): Promise<boolean>;

  /**
   * Retrieves billing invoice records for a user
   */
  getInvoices(userId: string): Promise<BillingInvoice[]>;

  /**
   * Tracks customer usage quotas (for API and token limits)
   */
  trackUsage(userId: string, units: number): Promise<void>;
}
