// ==============================================================================
// Concrete Portfolio Repository (Prisma Implementation)
// ==============================================================================

import { Portfolio, Prisma, Transaction, AssetType } from "@prisma/client";
import { IPortfolioRepository } from "../../domain/repositories/portfolio-repository.interface";
import { PrismaService } from "../database/prisma.service";

export class PortfolioRepository implements IPortfolioRepository {
  private readonly db = PrismaService.getClient();

  public async findById(id: string): Promise<Portfolio | null> {
    return this.db.portfolio.findUnique({
      where: { id }
    });
  }

  public async findByUserId(userId: string): Promise<Portfolio[]> {
    return this.db.portfolio.findMany({
      where: { userId }
    });
  }

  public async create(data: Prisma.PortfolioUncheckedCreateInput): Promise<Portfolio> {
    return this.db.portfolio.create({
      data
    });
  }

  public async update(id: string, data: Prisma.PortfolioUpdateInput): Promise<Portfolio> {
    return this.db.portfolio.update({
      where: { id },
      data
    });
  }

  public async delete(id: string): Promise<Portfolio> {
    return this.db.portfolio.delete({
      where: { id }
    });
  }

  public async findWithTransactions(id: string): Promise<(Portfolio & { transactions: (Transaction & { asset: { symbol: string; name: string; type: AssetType } })[] }) | null> {
    return this.db.portfolio.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            asset: {
              select: {
                symbol: true,
                name: true,
                type: true
              }
            }
          },
          orderBy: {
            transactionDate: "desc"
          }
        }
      }
    });
  }
}
