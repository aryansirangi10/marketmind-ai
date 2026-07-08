// ==============================================================================
// Authentication Middleware (Route Guarding & RBAC)
// ==============================================================================

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";

export interface JWTPayload {
  userId: string;
  role: string;
}

/**
 * Guards routes by requiring a valid JWT Access Token in the Authorization header
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid or expired access token." });
  }
};

/**
 * Guards routes by requiring administrative privileges (RBAC check)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Unauthorized. Authentication required." });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Forbidden. Administrative access required." });
    return;
  }

  next();
};
