// ==============================================================================
// Express & Socket.IO HTTP Server Entrypoint
// ==============================================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import router from "./router";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { logger } from "../../infrastructure/logging/logger";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { rateLimiter } from "./middleware/rate-limiter.middleware";
import { errorHandler } from "./middleware/error-handler.middleware";
import { jobQueueService } from "../../application/services/job-queue.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Security & Request Logging
app.use(helmet());
app.use(loggingMiddleware);
app.use(rateLimiter({ windowMs: 60 * 1000, limit: 120 })); // 120 requests/min limit

app.use(cors({
  origin: "*", // Adjust in production to match frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// API versioning root
app.use("/api/v1", router);

// Error Handling Middleware
app.use(errorHandler);

// Create HTTP Server and Socket.IO Server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  logger.info(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Periodic Market Broadcast Interval (3 seconds)
setInterval(() => {
  const tickData = [
    { symbol: "RELIANCE", price: 2450 + Math.random() * 15 },
    { symbol: "TCS", price: 3820 + Math.random() * 20 },
    { symbol: "INFY", price: 1540 + Math.random() * 10 },
    { symbol: "TATAMOTORS", price: 980 + Math.random() * 8 },
    { symbol: "HDFCBANK", price: 1620 + Math.random() * 12 },
    { symbol: "BTC", price: 65000 + Math.random() * 500 },
    { symbol: "ETH", price: 3500 + Math.random() * 50 }
  ];
  
  io.emit("price_ticks", tickData);
}, 3000);

// Startup routine
async function startServer() {
  // Connect to database
  await PrismaService.connect();

  // Start background cron jobs / sweeps
  jobQueueService.startBackgroundWorker();

  httpServer.listen(PORT, () => {
    logger.info(`[ExpressServer] Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

// Graceful shutdown hooks
process.on("SIGINT", async () => {
  logger.info("[ExpressServer] SIGINT received. Shutting down gracefully...");
  jobQueueService.stopBackgroundWorker();
  await PrismaService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("[ExpressServer] SIGTERM received. Shutting down gracefully...");
  jobQueueService.stopBackgroundWorker();
  await PrismaService.disconnect();
  process.exit(0);
});

startServer().catch(err => {
  logger.error("[ExpressServer] Failed to start:", err);
  process.exit(1);
});
