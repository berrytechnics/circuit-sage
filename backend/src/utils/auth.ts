import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import userService, { UserWithoutPassword } from "../services/user.service.js";

/** Generate a JWT access token with the user and company_id. */
export function generateNewJWTToken(user: UserWithoutPassword) {
  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, type: "access" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    }
  );
  return token;
}

/** Generate a refresh token with longer expiration. */
export function generateRefreshToken(user: UserWithoutPassword) {
  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, type: "refresh" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d", // Refresh tokens last 7 days
    }
  );
  return token;
}

export async function verifyJWTToken(
  token: string
): Promise<UserWithoutPassword | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      companyId: string;
      type?: string;
    };
    
    // Ensure this is an access token, not a refresh token
    if (decoded.type === "refresh") {
      logger.error("Attempted to use refresh token as access token");
      return null;
    }
    
    const user = await userService.findById(decoded.userId);
    
    // Verify user still belongs to the company from token
    if (!user || (user.company_id as unknown as string) !== decoded.companyId) {
      logger.error("User company mismatch in token");
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error("Invalid JWT token:", error);
    return null;
  }
}

/** Verify a refresh token and return the user. */
export async function verifyRefreshToken(
  token: string
): Promise<UserWithoutPassword | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      companyId: string;
      type?: string;
    };
    
    // Ensure this is a refresh token
    if (decoded.type !== "refresh") {
      logger.error("Invalid token type for refresh");
      return null;
    }
    
    const user = await userService.findById(decoded.userId);
    
    // Verify user still belongs to the company from token
    if (!user || (user.company_id as unknown as string) !== decoded.companyId) {
      logger.error("User company mismatch in refresh token");
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error("Invalid refresh token:", error);
    return null;
  }
}
