// ==============================================================================
// Social Investing REST Controller (Posts feed & leaderboards)
// ==============================================================================

import { Request, Response } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

export class SocialController {
  private static prisma = PrismaService.getClient();

  /**
   * Publishes an investment idea or analysis post
   * POST /social/posts
   */
  public static async createPost(req: Request, res: Response): Promise<Response> {
    try {
      const { content, symbol } = req.body;
      const authorId = req.user?.userId || "mock-user-id";

      const post = await this.prisma.socialPost.create({
        data: {
          content,
          symbol,
          authorId
        }
      });

      return res.status(201).json({ success: true, data: post });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Retrieves chronological community ideas feed
   * GET /social/feed
   */
  public static async getFeed(_req: Request, res: Response): Promise<Response> {
    try {
      const posts = await this.prisma.socialPost.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        }
      });
      return res.status(200).json({ success: true, data: posts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Returns top investors based on portfolio valuations gains
   * GET /social/leaderboard
   */
  public static async getLeaderboard(_req: Request, res: Response): Promise<Response> {
    try {
      // Fetch portfolios showing highest balances/valuations
      const portfolios = await this.prisma.portfolio.findMany({
        take: 5,
        orderBy: { balance: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          }
        }
      });

      const rankings = portfolios.map((p, idx) => ({
        rank: idx + 1,
        userName: p.user.firstName ? `${p.user.firstName} ${p.user.lastName || ""}` : p.user.email,
        portfolioName: p.name,
        pnlGain: ((p.balance - 100000.0) / 100000.0) * 100.0,
        valuation: p.balance
      }));

      return res.status(200).json({ success: true, data: rankings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Follows/Unfollows a user profile
   * POST /social/follow
   */
  public static async toggleFollow(req: Request, res: Response): Promise<Response> {
    try {
      const { targetUserId } = req.body;
      const followerId = req.user?.userId || "mock-user-id";

      if (followerId === targetUserId) {
        return res.status(400).json({ success: false, error: "You cannot follow your own profile." });
      }

      const existing = await this.prisma.userFollow.findUnique({
        where: {
          followerId_followingId: { followerId, followingId: targetUserId }
        }
      });

      if (existing) {
        await this.prisma.userFollow.delete({
          where: { id: existing.id }
        });
        return res.status(200).json({ success: true, message: "Unfollowed user successfully." });
      } else {
        await this.prisma.userFollow.create({
          data: { followerId, followingId: targetUserId }
        });
        return res.status(200).json({ success: true, message: "Followed user successfully." });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
