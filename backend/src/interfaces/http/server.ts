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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: "*", // Adjust in production to match frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// API versioning root
app.use("/api/v1", router);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ServerError]", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

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
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Periodic Market Broadcast Interval (3 seconds)
setInterval(() => {
  const tickData = [
    { symbol: "BTC", price: 65000 + Math.random() * 500 },
    { symbol: "ETH", price: 3500 + Math.random() * 50 },
    { symbol: "AAPL", price: 185 + Math.random() * 2 },
    { symbol: "MSFT", price: 420 + Math.random() * 3 },
    { symbol: "SOL", price: 145 + Math.random() * 4 }
  ];
  
  io.emit("price_ticks", tickData);
}, 3000);

// Startup routine
async function startServer() {
  // Connect to database
  await PrismaService.connect();

  httpServer.listen(PORT, () => {
    console.log(`[ExpressServer] Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

// Graceful shutdown hooks
process.on("SIGINT", async () => {
  console.log("[ExpressServer] SIGINT received. Shutting down gracefully...");
  await PrismaService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[ExpressServer] SIGTERM received. Shutting down gracefully...");
  await PrismaService.disconnect();
  process.exit(0);
});

startServer().catch(err => {
  console.error("[ExpressServer] Failed to start:", err);
  process.exit(1);
});
