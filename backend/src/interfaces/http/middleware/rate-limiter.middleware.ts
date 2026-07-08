// ==============================================================================
// Redis & In-Memory Hybrid Sliding Window Rate Limiting Middleware
// ==============================================================================

import { Request, Response, NextFunction } from "express";
import { redisService } from "../../../infrastructure/database/redis.service";

// In-Memory Storage Fallback
const memoryStore = new Map<string, number[]>();

export interface RateLimiterOptions {
  windowMs: number;
  limit: number;
}

export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, limit } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    const client = redisService.getClient();

    if (client) {
      try {
        // Redis Sliding-Window Transaction
        const multi = client.multi();
        multi.zRemRangeByScore(key, 0, now - windowMs);
        multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
        multi.zCard(key);
        multi.expire(key, Math.ceil(windowMs / 1000));

        const results = await multi.exec();
        // The 3rd operation (index 2) is zCard
        const requestCount = results[2] as number;

        if (requestCount > limit) {
          res.status(429).json({
            error: "Too Many Requests",
            message: `Rate limit exceeded. Maximum is ${limit} requests per ${windowMs / 1000}s.`
          });
          return;
        }
      } catch (err) {
        // Fallback silently to memory store if Redis operation fails mid-flight
        runMemoryLimiter(ip, now, windowMs, limit, res, next);
        return;
      }
    } else {
      // Offline fallback: Run local sliding window
      runMemoryLimiter(ip, now, windowMs, limit, res, next);
      return;
    }

    next();
  };
}

function runMemoryLimiter(
  ip: string,
  now: number,
  windowMs: number,
  limit: number,
  res: Response,
  next: NextFunction
) {
  let timestamps = memoryStore.get(ip) || [];

  // Filter out elements older than window threshold
  timestamps = timestamps.filter((time) => time > now - windowMs);
  timestamps.push(now);
  memoryStore.set(ip, timestamps);

  if (timestamps.length > limit) {
    res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded (in-memory mode). Maximum is ${limit} requests per ${windowMs / 1000}s.`
    });
    return;
  }

  next();
}

export default rateLimiter;
