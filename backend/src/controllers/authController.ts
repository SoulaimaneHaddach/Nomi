import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const jwtSecret = process.env.JWT_SECRET ?? "";

if (!jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

export async function loginAdmin(request: Request, response: Response) {
  const { username, password } = request.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    response.status(400).json({ message: "Username and password are required" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  const validPassword = admin
    ? await bcrypt.compare(password, admin.passwordHash)
    : false;

  if (!admin || !validPassword) {
    response.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { username: admin.username },
    jwtSecret,
    { subject: admin.id, expiresIn: "8h" },
  );

  response.json({ token, admin: { id: admin.id, username: admin.username } });
}

export async function changeAdminCredentials(request: Request, response: Response) {
  const { currentPassword, newUsername, newPassword } = request.body as {
    currentPassword?: string;
    newUsername?: string;
    newPassword?: string;
  };
  const adminId = request.admin?.sub;

  if (!adminId || !currentPassword || !newUsername || !newPassword || newUsername.length < 3 || newPassword.length < 12) {
    response.status(400).json({ message: "Use a username with 3+ characters and a password with 12+ characters" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  const validCurrentPassword = admin
    ? await bcrypt.compare(currentPassword, admin.passwordHash)
    : false;

  if (!admin || !validCurrentPassword) {
    response.status(401).json({ message: "Current password is invalid" });
    return;
  }

  try {
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        username: newUsername.trim(),
        passwordHash: await bcrypt.hash(newPassword, 12),
      },
    });

    const token = jwt.sign({ username: updatedAdmin.username }, jwtSecret, {
      subject: updatedAdmin.id,
      expiresIn: "8h",
    });

    response.json({ token, admin: { id: updatedAdmin.id, username: updatedAdmin.username } });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      response.status(409).json({ message: "That username is already in use" });
      return;
    }

    response.status(500).json({ message: "Unable to update credentials" });
  }
}
