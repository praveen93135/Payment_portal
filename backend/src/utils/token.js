import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const TOKEN_EXPIRES_IN = "7d";

export function signAuthToken(user) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is required for authentication");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

export function verifyAuthToken(token) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is required for authentication");
  }

  return jwt.verify(token, env.jwtSecret);
}
