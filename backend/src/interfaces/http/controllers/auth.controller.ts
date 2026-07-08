// ==============================================================================
// Authentication Controller (HTTP Requests Handler)
// ==============================================================================

import { Request, Response } from "express";
import { AuthService } from "../../../application/services/auth.service";
import { z } from "zod";

// Zod schemas for input validation
const signupSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(1, "Password is required.")
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required.")
});

export class AuthController {
  private readonly authService = new AuthService();

  /**
   * POST /api/v1/auth/signup
   */
  public signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedBody = signupSchema.parse(req.body);
      const result = await this.authService.signup(
        parsedBody.email,
        parsedBody.password,
        parsedBody.firstName,
        parsedBody.lastName
      );
      
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: result
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(400).json({ success: false, error: err.message });
      }
    }
  };

  /**
   * POST /api/v1/auth/login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedBody = loginSchema.parse(req.body);
      
      const deviceInfo = req.headers["user-agent"] || "unknown";
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      const result = await this.authService.login(
        parsedBody.email,
        parsedBody.password,
        deviceInfo,
        ipAddress
      );
      
      res.status(200).json({
        success: true,
        message: "Logged in successfully.",
        data: result
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(401).json({ success: false, error: err.message });
      }
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  public refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      // Support taking refresh token from body
      const parsedBody = refreshSchema.parse(req.body);
      
      const deviceInfo = req.headers["user-agent"] || "unknown";
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      const result = await this.authService.rotateTokens(
        parsedBody.refreshToken,
        deviceInfo,
        ipAddress
      );
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(401).json({ success: false, error: err.message });
      }
    }
  };

  /**
   * POST /api/v1/auth/logout
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsedBody = refreshSchema.parse(req.body);
      await this.authService.logout(parsedBody.refreshToken);
      
      res.status(200).json({
        success: true,
        message: "Logged out successfully."
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(500).json({ success: false, error: err.message });
      }
    }
  };
}
