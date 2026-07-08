// ==============================================================================
// Prisma Service (Database Context Wrapper)
// ==============================================================================

import { PrismaClient } from "@prisma/client";

export class PrismaService {
  private static clientInstance: PrismaClient;

  public static getClient(): PrismaClient {
    if (!this.clientInstance) {
      this.clientInstance = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
      });
    }
    return this.clientInstance;
  }

  public static async connect(): Promise<void> {
    try {
      const client = this.getClient();
      await client.$connect();
      console.log("[PrismaService] Successfully connected to PostgreSQL Database.");
    } catch (err) {
      console.error("[PrismaService] Database connection error:", err);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    if (this.clientInstance) {
      await this.clientInstance.$disconnect();
      console.log("[PrismaService] Database connection closed.");
    }
  }
}
