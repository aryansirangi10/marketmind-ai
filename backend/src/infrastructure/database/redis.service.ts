// ==============================================================================
// Redis Caching and Queue Client Service
// ==============================================================================

import { createClient, RedisClientType } from "redis";
import { logger } from "../logging/logger";

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.client = createClient({ url: redisUrl }) as RedisClientType;

    this.client.on("connect", () => {
      this.isConnected = true;
      logger.info("Connected to Redis successfully.");
    });

    this.client.on("error", (err) => {
      this.isConnected = false;
      logger.warn(`Redis connection issue: ${err.message}. Dynamic in-memory fallback enabled.`);
    });

    this.client.connect().catch((err) => {
      logger.warn(`Redis connection failed: ${err.message}. Operating in offline memory mode.`);
    });
  }

  public getClient(): RedisClientType | null {
    return this.isConnected ? this.client : null;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const redisService = new RedisService();
export default redisService;
