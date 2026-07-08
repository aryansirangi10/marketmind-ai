// ==============================================================================
// Authentication Service (Credentials & JWT Session Manager)
// ==============================================================================

import { User, UserSession, PortfolioType } from "@prisma/client";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export interface AuthResponse {
  user: Omit<User, "passwordHash">;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly userRepo = new UserRepository();
  private readonly db = PrismaService.getClient();

  private readonly jwtSecret = process.env.JWT_SECRET || "access_secret";
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "refresh_secret";
  private readonly accessExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
  private readonly refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

  /**
   * Registers a new user and provisions a default paper trading portfolio with $100,000 cash
   */
  public async signup(
    email: string,
    passwordPlain: string,
    firstName?: string,
    lastName?: string
  ): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error("A user with this email address already exists.");
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 12);

    // Create user and portfolio in a single transaction
    const result = await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName
        }
      });

      // Initialize default paper portfolio
      await tx.portfolio.create({
        data: {
          userId: user.id,
          name: "Default Paper Portfolio",
          description: "Primary training environment for paper trading stocks and cryptos.",
          type: PortfolioType.PAPER,
          balance: 100000.0 // Starting balance
        }
      });

      return user;
    });

    const tokens = await this.generateTokens(result.id, result.role);
    await this.saveSession(result.id, tokens.refreshToken);

    const { passwordHash: _, ...userWithoutPassword } = result;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  /**
   * Logins a user and issues new JWT tokens
   */
  public async login(
    email: string,
    passwordPlain: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    const tokens = await this.generateTokens(user.id, user.role);
    await this.saveSession(user.id, tokens.refreshToken, deviceInfo, ipAddress);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  /**
   * Rotates access and refresh tokens, invalidating the old session
   */
  public async rotateTokens(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string; role: string };
      const session = await this.db.userSession.findFirst({
        where: {
          userId: decoded.userId
        }
      });

      if (!session) {
        throw new Error("Session not found or expired.");
      }

      // Verify refresh token hash matches database
      const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (!match) {
        // Potential reuse attack: clear sessions of the user to be safe
        await this.db.userSession.deleteMany({ where: { userId: decoded.userId } });
        throw new Error("Invalid session. Revoking all sessions for security.");
      }

      // Generate new pair
      const tokens = await this.generateTokens(decoded.userId, decoded.role as any);
      
      // Update session in DB
      const hash = await bcrypt.hash(tokens.refreshToken, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await this.db.userSession.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: hash,
          expiresAt,
          deviceInfo,
          ipAddress
        }
      });

      return tokens;
    } catch (err: any) {
      throw new Error(err.message || "Failed to rotate tokens.");
    }
  }

  /**
   * Destroys active refresh session
   */
  public async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as { userId: string };
      const sessions = await this.db.userSession.findMany({
        where: { userId: decoded.userId }
      });

      for (const session of sessions) {
        const match = await bcrypt.compare(refreshToken, session.refreshTokenHash);
        if (match) {
          await this.db.userSession.delete({
            where: { id: session.id }
          });
          break;
        }
      }
    } catch (err) {
      // Fail silently on logout token verify issues
    }
  }

  private async generateTokens(userId: string, role: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId, role }, this.jwtSecret, { expiresIn: this.accessExpiry as any });
    const refreshToken = jwt.sign({ userId, role }, this.jwtRefreshSecret, { expiresIn: this.refreshExpiry as any });
    return { accessToken, refreshToken };
  }

  private async saveSession(
    userId: string,
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<UserSession> {
    const hash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Upsert session (simplifies to single active session per user for now, customizable)
    const existing = await this.db.userSession.findFirst({
      where: { userId }
    });

    if (existing) {
      return this.db.userSession.update({
        where: { id: existing.id },
        data: {
          refreshTokenHash: hash,
          deviceInfo,
          ipAddress,
          expiresAt
        }
      });
    }

    return this.db.userSession.create({
      data: {
        userId,
        refreshTokenHash: hash,
        deviceInfo,
        ipAddress,
        expiresAt
      }
    });
  }
}
