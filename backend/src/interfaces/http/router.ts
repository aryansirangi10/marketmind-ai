import { Router } from "express";
import { MarketController } from "./controllers/market.controller";
import { AuthController } from "./controllers/auth.controller";
import { PortfolioController } from "./controllers/portfolio.controller";
import { AIController } from "./controllers/ai.controller";
import { AdminController } from "./controllers/admin.controller";
import { requireAuth, requireAdmin } from "./middleware/auth.middleware";

const router = Router();
const marketController = new MarketController();
const authController = new AuthController();
const portfolioController = new PortfolioController();
const aiController = new AIController();
const adminController = new AdminController();

// Health Check
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// Authentication Routes
router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);
router.post("/auth/refresh", authController.refresh);
router.post("/auth/logout", authController.logout);

// Portfolio Sandbox Fallbacks
router.get("/portfolios/list-fallback", portfolioController.listFallback);
router.post("/portfolios/create-fallback", portfolioController.createFallback);

// AI Routes (Auth Protected)
router.post("/ai/chat", requireAuth, aiController.chat);

// Admin Routes (Auth & Admin Protected)
router.get("/admin/stats", requireAuth, requireAdmin, adminController.getStats);
router.get("/admin/logs", requireAuth, requireAdmin, adminController.getAuditLogs);

// Portfolio Routes (Auth Protected)
router.post("/portfolios/:id/buy", requireAuth, portfolioController.buyAsset);
router.post("/portfolios/:id/sell", requireAuth, portfolioController.sellAsset);
router.get("/portfolios/:id/summary", requireAuth, portfolioController.getSummary);

// News API
router.get("/news", marketController.getMarketNews);

// Stocks API
router.get("/stocks/:symbol/quote", marketController.getStockQuote);
router.get("/stocks/:symbol/profile", marketController.getStockProfile);
router.get("/stocks/:symbol/candles", marketController.getStockCandles);

// Cryptocurrency API
router.get("/crypto/markets", marketController.getCryptoMarkets);
router.get("/crypto/:symbol/quote", marketController.getCryptoQuote);
router.get("/crypto/:symbol/candles", marketController.getCryptoCandles);

export default router;
