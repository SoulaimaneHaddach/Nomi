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
