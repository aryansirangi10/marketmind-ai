// ==============================================================================
// Domain Interface for Portfolio Repository
// ==============================================================================

import { Portfolio, Prisma, Transaction, AssetType } from "@prisma/client";

export interface IPortfolioRepository {
  findById(id: string): Promise<Portfolio | null>;
  findByUserId(userId: string): Promise<Portfolio[]>;
  create(data: Prisma.PortfolioUncheckedCreateInput): Promise<Portfolio>;
  update(id: string, data: Prisma.PortfolioUpdateInput): Promise<Portfolio>;
  delete(id: string): Promise<Portfolio>;
  
  // Custom queries
  findWithTransactions(id: string): Promise<(Portfolio & { transactions: (Transaction & { asset: { symbol: string; name: string; type: AssetType } })[] }) | null>;
}
