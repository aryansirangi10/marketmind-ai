import { Router } from "express";
import { MarketController } from "./controllers/market.controller";
import { AuthController } from "./controllers/auth.controller";
import { PortfolioController } from "./controllers/portfolio.controller";
import { AIController } from "./controllers/ai.controller";
import { AdminController } from "./controllers/admin.controller";
import { ScreenerController } from "./controllers/screener.controller";
import { StrategyController } from "./controllers/strategy.controller";
import { LearningController } from "./controllers/learning.controller";
import { SocialController } from "./controllers/social.controller";
import { BillingController } from "./controllers/billing.controller";
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
router.post("/portfolios/create-custom", portfolioController.createCustom);

// AI Routes (Auth Protected)
router.post("/ai/chat", requireAuth, aiController.chat);

// Admin Routes (Auth & Admin Protected)
router.get("/admin/stats", requireAuth, requireAdmin, adminController.getStats);
router.get("/admin/logs", requireAuth, requireAdmin, adminController.getAuditLogs);
router.post("/admin/flags/toggle", requireAuth, requireAdmin, adminController.toggleFeatureFlag);
router.post("/admin/broadcast", requireAuth, requireAdmin, adminController.broadcastAlert);

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

// Screener API
router.post("/screener/filter", ScreenerController.filterAssets);
router.post("/screener/configs", requireAuth, ScreenerController.saveScreenerConfig);

// Strategies & Backtester API
router.post("/strategies/save", requireAuth, StrategyController.saveStrategy);
router.get("/strategies/list", requireAuth, StrategyController.listStrategies);
router.post("/strategies/backtest", requireAuth, StrategyController.backtestStrategy);

// Learning Center API
router.get("/learning/courses", requireAuth, LearningController.getCourses);
router.post("/learning/quiz/submit", requireAuth, LearningController.submitQuizAnswer);
router.get("/learning/badges", requireAuth, LearningController.getBadges);

// Social Investing API
router.post("/social/posts", requireAuth, SocialController.createPost);
router.get("/social/feed", SocialController.getFeed);
router.get("/social/leaderboard", SocialController.getLeaderboard);
router.post("/social/follow", requireAuth, SocialController.toggleFollow);

// SaaS Billing API
router.post("/billing/checkout", requireAuth, BillingController.createCheckout);
router.post("/billing/cancel", requireAuth, BillingController.cancelPlan);
router.get("/billing/invoices", requireAuth, BillingController.getInvoices);

export default router;
