// ==============================================================================
// Billing Registry (Dependency Injection & Fallback Coordinator)
// ==============================================================================

import { IBillingProvider } from "../../domain/billing/billing-provider.interface";
import { StripeBillingProvider, MockBillingProvider } from "../billing/billing-providers";

export class BillingRegistry {
  private static billingProvider: IBillingProvider;

  /**
   * Resolves the active billing provider instance
   */
  public static getBillingProvider(): IBillingProvider {
    if (!this.activeBillingProviderInstanceResolved()) {
      const apiKey = process.env.STRIPE_API_KEY;
      if (apiKey && apiKey.trim() !== "") {
        console.log("[BillingRegistry] Initializing Stripe SaaS Billing Provider.");
        this.billingProvider = new StripeBillingProvider(apiKey);
      } else {
        console.log("[BillingRegistry] Stripe key absent. Defaulting to MockBillingProvider.");
        this.billingProvider = new MockBillingProvider();
      }
    }
    return this.billingProvider;
  }

  private static activeBillingProviderInstanceResolved(): boolean {
    return !!this.billingProvider;
  }
}
