// ==============================================================================
// Express Request Tracing & Structured Logging Middleware
// ==============================================================================

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../../../infrastructure/logging/logger";

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers["x-correlation-id"] as string) || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  const start = Date.now();

  logger.info({
    msg: `Incoming: ${req.method} ${req.url}`,
    method: req.method,
    url: req.url,
    ip: req.ip,
    correlationId,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      msg: `Outgoing: ${req.method} ${req.url} - Status ${res.statusCode}`,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      correlationId,
    });
  });

  next();
}
export default loggingMiddleware;
