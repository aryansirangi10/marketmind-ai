// ==============================================================================
// Concrete User Repository (Prisma Implementation)
// ==============================================================================

import { User, Prisma } from "@prisma/client";
import { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { PrismaService } from "../database/prisma.service";

export class UserRepository implements IUserRepository {
  private readonly db = PrismaService.getClient();

  public async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id }
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  }

  public async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase()
      }
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({
      where: { id },
      data
    });
  }
}
