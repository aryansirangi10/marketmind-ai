// ==============================================================================
// Portfolio Service Unit Tests (Jest Mocks & Math Logic)
// ==============================================================================

import { PortfolioService } from "./portfolio.service";
import { AssetType } from "@prisma/client";

// Define mock Prisma client. Variables prefixed with "mock" are allowed in jest.mock
const mockPrismaClient = {
  $transaction: (callback: any) => callback(mockPrismaClient),
  transaction: {
    create: jest.fn().mockResolvedValue({ id: "tx-1", type: "BUY", quantity: 10, pricePerUnit: 150 }),
    findMany: jest.fn(),
  },
  portfolio: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  asset: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
};

// Setup mock for database service
jest.mock("../../infrastructure/database/prisma.service", () => ({
  PrismaService: {
    getClient: () => mockPrismaClient
  }
}));

describe("PortfolioService Unit Tests", () => {
  let portfolioService: PortfolioService;

  beforeEach(() => {
    jest.clearAllMocks();
    portfolioService = new PortfolioService();
  });

  describe("Asset Purchase Calculations (BUY)", () => {
    it("should fail transaction if portfolio cash balance is insufficient", async () => {
      // Mock portfolio with $500 balance inside transaction
      const mockPortfolio = {
        id: "portfolio-123",
        userId: "user-1",
        name: "Test Portfolio",
        description: "Desc",
        type: "PAPER",
        balance: 500.0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.portfolio.findUnique as jest.Mock).mockResolvedValue(mockPortfolio);

      // Attempt to buy $1500 worth of stock (10 shares @ $150)
      await expect(
        portfolioService.buyAsset("portfolio-123", "AAPL", 10, 150.0, AssetType.STOCK)
      ).rejects.toThrow("Insufficient funds. Required: $1501.50, Available: $500.00");
    });
  });

  describe("Asset Disposal Verification (SELL)", () => {
    it("should fail transaction if asset is not present in holdings", async () => {
      const mockPortfolio = {
        id: "portfolio-123",
        userId: "user-1",
        name: "Test Portfolio",
        description: "Desc",
        type: "PAPER",
        balance: 10000.0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.portfolio.findUnique as jest.Mock).mockResolvedValue(mockPortfolio);
      // Mock findUnique on asset to return null (no holding)
      (mockPrismaClient.asset.findUnique as jest.Mock).mockResolvedValue(null);

      // Attempt to sell AAPL when owning none
      await expect(
        portfolioService.sellAsset("portfolio-123", "AAPL", 5, 185.00)
      ).rejects.toThrow("Asset AAPL not found in database.");
    });

    it("should fail transaction if owned quantity is less than requested quantity", async () => {
      const mockPortfolio = {
        id: "portfolio-123",
        userId: "user-1",
        name: "Test Portfolio",
        description: "Desc",
        type: "PAPER",
        balance: 10000.0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockAsset = {
        id: "asset-1",
        portfolioId: "portfolio-123",
        symbol: "AAPL",
        name: "Apple Inc.",
        type: AssetType.STOCK,
        quantity: 2, // Owns 2 shares
        averageBuyPrice: 150.0,
        totalCost: 300.0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.portfolio.findUnique as jest.Mock).mockResolvedValue(mockPortfolio);
      (mockPrismaClient.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      // Mock transaction query to return a single buy transaction of 2 shares
      (mockPrismaClient.transaction.findMany as jest.Mock).mockResolvedValue([
        { type: "BUY", quantity: 2, pricePerUnit: 150.0 }
      ]);

      // Attempt to sell 5 shares when owning only 2
      await expect(
        portfolioService.sellAsset("portfolio-123", "AAPL", 5, 185.00)
      ).rejects.toThrow("Insufficient asset quantity. Owned: 2.0000, Attempted Sell: 5");
    });
  });
});
