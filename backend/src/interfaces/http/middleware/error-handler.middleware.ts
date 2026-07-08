// ==============================================================================
// Centralized Express Error Handling Middleware
// ==============================================================================

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../infrastructure/logging/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.correlationId || "no-correlation-id";

  // Log full error stack details
  logger.error({
    msg: `Unhandled exception caught on route ${req.method} ${req.url}: ${err.message}`,
    error: err.stack,
    correlationId,
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    correlationId,
  });
}

export default errorHandler;
