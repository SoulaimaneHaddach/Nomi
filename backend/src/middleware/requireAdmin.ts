import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const jwtSecret = process.env.JWT_SECRET ?? "";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

type AuthenticatedUser = {
  id: string;
  email: string;
  role: "PLATFORM_ADMIN" | "RESTAURANT_OWNER";
  memberships: Array<{ restaurantId: string; role: "OWNER" | "MANAGER" }>;
};

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedUser;
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAdmin(request: Request, response: Response, next: NextFunction) {
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
      typeof payload.sub !== "string"
    ) {
      response.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { memberships: { select: { restaurantId: true, role: true } } },
    });
    if (!user) {
      response.status(401).json({ message: "User account not found" });
      return;
    }
    const tokenAuthVersion = typeof payload.authVersion === "number" ? payload.authVersion : 0;
    if (tokenAuthVersion !== user.authVersion) {
      response.status(401).json({ message: "Session expired. Please sign in again." });
      return;
    }

    const authenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      authVersion: user.authVersion,
      memberships: user.memberships,
    };
    request.user = authenticatedUser;
    request.admin = authenticatedUser;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRestaurantMembership(request: Request, response: Response, next: NextFunction) {
  if (!request.user || (request.user.role !== "PLATFORM_ADMIN" && request.user.memberships.length === 0)) {
    response.status(403).json({ message: "Restaurant membership required" });
    return;
  }
  next();
}

export function requirePlatformAdmin(request: Request, response: Response, next: NextFunction) {
  if (request.user?.role !== "PLATFORM_ADMIN") {
    response.status(403).json({ message: "Platform administrator access required" });
    return;
  }
  next();
}

export function getCurrentRestaurantId(request: Request) {
  return request.user?.memberships[0]?.restaurantId;
}
