/// <reference types="node" />

import bcrypt from "bcryptjs";
import "dotenv/config";
import prisma from "../src/lib/prisma.js";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD are required");
}

const email = username.includes("@") ? username.toLowerCase() : `${username.toLowerCase()}@nomi.local`;
const passwordHash = await bcrypt.hash(password, 12);

const platformAdmin = await prisma.user.upsert({
  where: { email },
  update: { passwordHash, role: "PLATFORM_ADMIN" },
  create: { email, passwordHash, role: "PLATFORM_ADMIN" },
});

const defaultRestaurant = await prisma.restaurant.findUnique({ where: { slug: "nomi-cafe" } });
if (defaultRestaurant) {
  await prisma.membership.upsert({
    where: { userId_restaurantId: { userId: platformAdmin.id, restaurantId: defaultRestaurant.id } },
    update: { role: "OWNER" },
    create: { userId: platformAdmin.id, restaurantId: defaultRestaurant.id, role: "OWNER" },
  });
}

console.log(`Platform account ready: ${platformAdmin.email}`);
await prisma.$disconnect();
