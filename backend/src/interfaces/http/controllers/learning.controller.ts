// ==============================================================================
// Learning Center REST Controller (Course Management & Quizzes)
// ==============================================================================

import { Request, Response } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

export class LearningController {
  private static prisma = PrismaService.getClient();

  /**
   * Retrieves all catalogued educational courses with nested quizzes
   * GET /learning/courses
   */
  public static async getCourses(_req: Request, res: Response): Promise<Response> {
    try {
      let courses = await this.prisma.course.findMany({
        include: { quizzes: true }
      });

      if (courses.length === 0) {
        // Seed mock courses for initial sandbox development
        await this.prisma.course.create({
          data: {
            title: "Stock Market Foundations",
            category: "Stock Market Basics",
            description: "Learn how ticker feeds, order books, and exchanges coordinate globally.",
            level: "BEGINNER",
            quizzes: {
              create: [
                {
                  question: "What does the bid price represent in an order book?",
                  options: ["Maximum price a buyer will pay", "Minimum price a seller accepts", "Average volume matching price"],
                  correctAnswerIndex: 0
                }
              ]
            }
          }
        });
        courses = await this.prisma.course.findMany({
          include: { quizzes: true }
        });
      }

      return res.status(200).json({ success: true, data: courses });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Submits a quiz answer and logs completion progress
   * POST /learning/quiz/submit
   */
  public static async submitQuizAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const { quizId, selectedAnswerIndex } = req.body;
      const userId = req.user?.userId || "mock-user-id";

      const quiz = await this.prisma.quiz.findUnique({
        where: { id: quizId }
      });

      if (!quiz) {
        return res.status(404).json({ success: false, error: "Quiz question not found." });
      }

      const isCorrect = quiz.correctAnswerIndex === selectedAnswerIndex;
      const score = isCorrect ? 100.0 : 0.0;

      const progress = await this.prisma.userQuizProgress.create({
        data: {
          userId,
          quizId,
          completed: true,
          score
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          isCorrect,
          correctAnswerIndex: quiz.correctAnswerIndex,
          progress
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Retrieves unlocked user learning badges
   * GET /learning/badges
   */
  public static async getBadges(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId || "mock-user-id";
      const progress = await this.prisma.userQuizProgress.findMany({
        where: { userId, completed: true }
      });

      // Simple metric determining badge levels:
      const badges = [];
      if (progress.length >= 1) {
        badges.push({ name: "Novice Scholar", description: "Completed your first quiz challenge.", icon: "Award" });
      }
      if (progress.length >= 5) {
        badges.push({ name: "Quant Apprentice", description: "Answered 5 technical finance questions.", icon: "BookOpen" });
      }

      return res.status(200).json({ success: true, data: badges });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
