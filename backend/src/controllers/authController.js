import { ApiError } from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/token.js";
import {
  createUser,
  findUserByEmailWithPassword,
  findUserById
} from "../repositories/userRepository.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };
}

function validateRegisterBody(body) {
  const name = String(body.name || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (name.length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters");
  }

  if (!email.includes("@") || email.length < 5) {
    throw new ApiError(400, "Valid email is required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  return { name, email, password };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = validateRegisterBody(req.body);
    const existingUser = await findUserByEmailWithPassword(email);

    if (existingUser) {
      throw new ApiError(409, "Email is already registered");
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });
    const token = signAuthToken(user);

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await findUserByEmailWithPassword(email);
    const passwordMatches = user
      ? await comparePassword(password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signAuthToken(user);

    res.json({
      success: true,
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.sub);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
}
