import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../config/errors";
import { UserWithoutPassword } from "../services/user.service";

/**
 * Middleware to extract and validate tenant (company) context
 * Ensures all requests are scoped to the user's company
 * Must be used after validateRequest middleware
 */
export function requireTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = req.user as UserWithoutPassword | undefined;

  if (!user || !user.company_id) {
    throw new ForbiddenError("User must belong to a company");
  }

  // Attach company_id to request for easy access in services
  req.companyId = user.company_id as unknown as string;
  next();
}

