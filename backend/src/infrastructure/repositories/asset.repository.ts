// ==============================================================================
// Concrete Asset Repository (Prisma Implementation)
// ==============================================================================

import { Asset, Prisma, AssetType } from "@prisma/client";
import { IAssetRepository } from "../../domain/repositories/asset-repository.interface";
import { PrismaService } from "../database/prisma.service";

export class AssetRepository implements IAssetRepository {
  private readonly db = PrismaService.getClient();

  public async findBySymbol(symbol: string): Promise<Asset | null> {
    return this.db.asset.findUnique({
      where: { symbol: symbol.toUpperCase() }
    });
  }

  public async findAllActive(): Promise<Asset[]> {
    return this.db.asset.findMany({
      where: { isActive: true }
    });
  }

  public async create(data: Prisma.AssetCreateInput): Promise<Asset> {
    return this.db.asset.create({
      data: {
        ...data,
        symbol: data.symbol.toUpperCase()
      }
    });
  }

  public async upsert(symbol: string, name: string, type: AssetType, exchange?: string): Promise<Asset> {
    const cleanSymbol = symbol.toUpperCase();
    return this.db.asset.upsert({
      where: { symbol: cleanSymbol },
      update: { name, type, exchange, isActive: true },
      create: { symbol: cleanSymbol, name, type, exchange, isActive: true }
    });
  }
}
