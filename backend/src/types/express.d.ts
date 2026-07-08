// ==============================================================================
// Global Express TypeScript Declarations
// ==============================================================================

import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
      correlationId?: string;
    }
  }
}
