import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

type AdminToken = {
  sub: string;
  username: string;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AdminToken;
    }
  }
}

export function requireAdmin(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;

  if (!token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string"
    ) {
      response.status(401).json({ message: "Invalid token payload" });
      return;
    }

    request.admin = { sub: payload.sub, username: payload.username };
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}
