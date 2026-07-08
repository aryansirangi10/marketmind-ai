// ==============================================================================
// Domain Interface for Asset Repository
// ==============================================================================

import { Asset, Prisma, AssetType } from "@prisma/client";

export interface IAssetRepository {
  findBySymbol(symbol: string): Promise<Asset | null>;
  findAllActive(): Promise<Asset[]>;
  create(data: Prisma.AssetCreateInput): Promise<Asset>;
  upsert(symbol: string, name: string, type: AssetType, exchange?: string): Promise<Asset>;
}
