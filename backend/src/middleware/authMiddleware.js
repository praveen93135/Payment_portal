import { ApiError } from "../utils/apiError.js";
import { verifyAuthToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Login required");
    }

    const token = authHeader.slice("Bearer ".length);
    req.user = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid token"));
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    next(new ApiError(403, "Admin access required"));
    return;
  }

  next();
}
