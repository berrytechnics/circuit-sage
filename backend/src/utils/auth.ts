import jwt from "jsonwebtoken";
import logger from "../config/logger";
import userService, { UserWithoutPassword } from "../services/user.service";

/** Generate a JWT token with the user and company_id. */
export function generateNewJWTToken(user: UserWithoutPassword) {
  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
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
    };
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
