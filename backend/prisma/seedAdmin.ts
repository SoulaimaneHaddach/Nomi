import bcrypt from "bcryptjs";
import "dotenv/config";
import prisma from "../src/lib/prisma.js";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required");
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.admin.upsert({
  where: { username },
  update: { passwordHash },
  create: { username, passwordHash },
});

console.log(`Admin account ready: ${username}`);
await prisma.$disconnect();
