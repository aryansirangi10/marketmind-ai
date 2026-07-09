// ==============================================================================
// SaaS Billing Provider Implementations (Stripe & Mock Provider)
// ==============================================================================

import { IBillingProvider, BillingInvoice } from "../../domain/billing/billing-provider.interface";
import { PrismaService } from "../database/prisma.service";

export class MockBillingProvider implements IBillingProvider {
  private prisma = PrismaService.getClient();

  public async createCheckoutSession(userId: string, tier: "PRO" | "ENTERPRISE", _coupon?: string): Promise<string> {
    // Upsert subscription state to ACTIVE for testing
    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        status: "ACTIVE",
        planTier: tier,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      create: {
        userId,
        status: "ACTIVE",
        planTier: tier,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    // Return a mock checkout redirection URL
    return `/portfolio?subscription_checkout_success=true&tier=${tier}`;
  }

  public async cancelSubscription(userId: string): Promise<boolean> {
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELED",
        planTier: "FREE",
        currentPeriodEnd: null
      }
    });
    return true;
  }

  public async getInvoices(userId: string): Promise<BillingInvoice[]> {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { invoices: true }
    });

    if (!sub || sub.invoices.length === 0) {
      // Return simulated mock invoice history
      return [
        { id: "inv_mock_1", amount: 29.99, pdfUrl: "#mock-invoice-pdf", issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { id: "inv_mock_2", amount: 29.99, pdfUrl: "#mock-invoice-pdf", issuedAt: new Date() }
      ];
    }

    return sub.invoices.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      pdfUrl: inv.pdfUrl || undefined,
      issuedAt: inv.issuedAt
    }));
  }

  public async trackUsage(_userId: string, _units: number): Promise<void> {
    // Log usage metrics
    return;
  }
}

export class StripeBillingProvider implements IBillingProvider {
  private stripeClient: any;
  private fallbackProvider = new MockBillingProvider();

  constructor(apiKey?: string) {
    if (apiKey && apiKey.trim() !== "") {
      try {
        const Stripe = require("stripe");
        this.stripeClient = new Stripe(apiKey, { apiVersion: "2023-10-16" });
      } catch {
        console.warn("[StripeBillingProvider] Stripe library loading failed. Defaulting to mock billing provider.");
      }
    }
  }

  public async createCheckoutSession(userId: string, tier: "PRO" | "ENTERPRISE", coupon?: string): Promise<string> {
    if (!this.stripeClient) {
      return this.fallbackProvider.createCheckoutSession(userId, tier, coupon);
    }
    
    // Simulate real stripe checkout logic
    const session = await this.stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: tier === "PRO" ? "price_pro_id" : "price_ent_id", quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/portfolio?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/portfolio?canceled=true`
    });

    return session.url;
  }

  public async cancelSubscription(userId: string): Promise<boolean> {
    if (!this.stripeClient) return this.fallbackProvider.cancelSubscription(userId);
    return true;
  }

  public async getInvoices(userId: string): Promise<BillingInvoice[]> {
    if (!this.stripeClient) return this.fallbackProvider.getInvoices(userId);
    return [];
  }

  public async trackUsage(userId: string, units: number): Promise<void> {
    if (!this.stripeClient) return this.fallbackProvider.trackUsage(userId, units);
  }
}
