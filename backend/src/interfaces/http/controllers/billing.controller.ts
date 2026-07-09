// ==============================================================================
// Billing REST Controller (Checkout & Subscription Controls)
// ==============================================================================

import { Request, Response } from "express";
import { BillingRegistry } from "../../../infrastructure/config/billing-registry";

export class BillingController {

  /**
   * Triggers checkout page generation for upgrades
   * POST /billing/checkout
   */
  public static async createCheckout(req: Request, res: Response): Promise<Response> {
    try {
      const { tier, coupon } = req.body;
      const userId = req.user?.userId || "mock-user-id";

      if (tier !== "PRO" && tier !== "ENTERPRISE") {
        return res.status(400).json({ success: false, error: "Invalid plan tier requested." });
      }

      const checkoutUrl = await BillingRegistry.getBillingProvider().createCheckoutSession(userId, tier, coupon);
      return res.status(200).json({ success: true, checkoutUrl });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Cancels active plans and downgrades session to Free tier
   * POST /billing/cancel
   */
  public static async cancelPlan(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId || "mock-user-id";
      await BillingRegistry.getBillingProvider().cancelSubscription(userId);
      return res.status(200).json({ success: true, message: "Subscription downgraded to FREE tier." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Retrieves user payment histories
   * GET /billing/invoices
   */
  public static async getInvoices(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId || "mock-user-id";
      const invoices = await BillingRegistry.getBillingProvider().getInvoices(userId);
      return res.status(200).json({ success: true, data: invoices });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
