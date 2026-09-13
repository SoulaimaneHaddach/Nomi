import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const jwtSecret = process.env.JWT_SECRET ?? "";
const pinPattern = /^\d{4}$/;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

function validatePin(pin: string | undefined) {
  return Boolean(pin && pinPattern.test(pin));
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "restaurant";
}

async function uniqueRestaurantSlug(name: string, transaction: Prisma.TransactionClient) {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (await transaction.restaurant.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { include: { restaurant: true } } },
  });
  const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;
  return user && validPassword ? user : null;
}

function issueAuthToken(user: { id: string; role: "PLATFORM_ADMIN" | "RESTAURANT_OWNER" }) {
  return jwt.sign({ role: user.role }, jwtSecret, { subject: user.id, expiresIn: "8h" });
}

export async function registerOwner(request: Request, response: Response) {
  const { restaurantName, ownerName, email, password, confirmPassword } = request.body as {
    restaurantName?: string;
    ownerName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!restaurantName?.trim() || !ownerName?.trim() || !normalizedEmail?.includes("@") || !password || password.length < 12 || password !== confirmPassword) {
    response.status(400).json({ message: "Restaurant name, owner name, valid email, and matching 12+ character passwords are required" });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: { name: ownerName.trim(), email: normalizedEmail, passwordHash, role: "RESTAURANT_OWNER" },
      });
      const restaurant = await transaction.restaurant.create({
        data: { name: restaurantName.trim(), slug: await uniqueRestaurantSlug(restaurantName, transaction) },
      });
      await transaction.membership.create({
        data: { userId: user.id, restaurantId: restaurant.id, role: "OWNER" },
      });
      return { user, restaurant };
    });

    response.status(201).json({
      token: issueAuthToken(result.user),
      restaurant: result.restaurant,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      response.status(409).json({ message: "That email is already registered" });
      return;
    }
    response.status(500).json({ message: "Unable to create restaurant account" });
  }
}

export async function getPinStatus(request: Request, response: Response) {
  const userId = request.user?.id;
  if (!userId) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true } });
  if (!user) {
    response.status(404).json({ message: "User account not found" });
    return;
  }

  response.json({ configured: Boolean(user.pinHash) });
}

export async function setupPin(request: Request, response: Response) {
  const { pin, confirmPin } = request.body as { pin?: string; confirmPin?: string };
  const userId = request.user?.id;
  if (!userId || !validatePin(pin) || pin !== confirmPin) {
    response.status(400).json({ message: "PIN must be exactly 4 digits and both entries must match" });
    return;
  }

  const updated = await prisma.user.updateMany({
    where: { id: userId, pinHash: null },
    data: { pinHash: await bcrypt.hash(pin as string, 12) },
  });
  if (updated.count !== 1) {
    response.status(409).json({ message: "A PIN is already configured. Use Change PIN instead." });
    return;
  }

  response.status(201).json({ configured: true });
}

export async function verifyPin(request: Request, response: Response) {
  const { pin } = request.body as { pin?: string };
  const userId = request.user?.id;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true } }) : null;
  if (!user?.pinHash) {
    response.status(400).json({ message: "Set up a dashboard PIN first" });
    return;
  }

  if (!pin || !(await bcrypt.compare(pin, user.pinHash))) {
    response.status(401).json({ message: "Incorrect PIN" });
    return;
  }

  response.json({ verified: true });
}

export async function changePin(request: Request, response: Response) {
  const { currentPin, newPin, confirmPin } = request.body as { currentPin?: string; newPin?: string; confirmPin?: string };
  const userId = request.user?.id;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true } }) : null;
  if (!user?.pinHash) {
    response.status(400).json({ message: "Set up a dashboard PIN first" });
    return;
  }
  if (!currentPin || !(await bcrypt.compare(currentPin, user.pinHash))) {
    response.status(401).json({ message: "Current PIN is incorrect" });
    return;
  }
  if (!validatePin(newPin) || newPin !== confirmPin) {
    response.status(400).json({ message: "New PIN must be exactly 4 digits and both entries must match" });
    return;
  }

  await prisma.user.update({ where: { id: userId }, data: { pinHash: await bcrypt.hash(newPin as string, 12) } });
  response.json({ configured: true });
}

export async function loginAdmin(request: Request, response: Response) {
  const { email, username, password } = request.body as {
    email?: string;
    username?: string;
    password?: string;
  };
  const login = email?.trim().toLowerCase() ?? username?.trim().toLowerCase();

  if (!login || !password) {
    response.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = login && password ? await authenticateUser(login, password) : null;

  if (!user || user.role !== "PLATFORM_ADMIN") {
    response.status(401).json({ message: "Platform administrator credentials are required" });
    return;
  }

  const token = issueAuthToken(user);

  response.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurants: user.memberships.map(({ restaurant, role }) => ({ ...restaurant, role })),
    },
  });
}

export async function loginOwner(request: Request, response: Response) {
  const { email, password } = request.body as { email?: string; password?: string };
  const login = email?.trim().toLowerCase();
  const user = login && password ? await authenticateUser(login, password) : null;

  if (!user || user.role !== "RESTAURANT_OWNER" || user.memberships.length === 0) {
    response.status(401).json({ message: "Invalid restaurant owner credentials" });
    return;
  }

  response.json({
    token: issueAuthToken(user),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurants: user.memberships.map(({ restaurant, role }) => ({ ...restaurant, role })),
    },
  });
}

export async function changeAdminCredentials(request: Request, response: Response) {
  const { currentPassword, newEmail, newPassword } = request.body as {
    currentPassword?: string;
    newEmail?: string;
    newPassword?: string;
  };
  const userId = request.user?.id;

  if (!userId || !currentPassword || !newEmail || !newEmail.includes("@") || !newPassword || newPassword.length < 12) {
    response.status(400).json({ message: "Use a valid email and a password with 12+ characters" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const validCurrentPassword = user
    ? await bcrypt.compare(currentPassword, user.passwordHash)
    : false;

  if (!user || !validCurrentPassword) {
    response.status(401).json({ message: "Current password is invalid" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(newPassword, 12),
      },
    });

    const token = jwt.sign({ role: updatedUser.role }, jwtSecret, {
      subject: updatedUser.id,
      expiresIn: "8h",
    });

    response.json({ token, user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      response.status(409).json({ message: "That email is already in use" });
      return;
    }

    response.status(500).json({ message: "Unable to update credentials" });
  }
}

export async function getCurrentUser(request: Request, response: Response) {
  const userId = request.user?.id;
  if (!userId) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { restaurant: true } } },
  });
  if (!user) {
    response.status(404).json({ message: "User account not found" });
    return;
  }

  response.json({
    id: user.id,
    email: user.email,
    role: user.role,
    restaurants: user.memberships.map(({ restaurant, role }) => ({ ...restaurant, role })),
  });
}
