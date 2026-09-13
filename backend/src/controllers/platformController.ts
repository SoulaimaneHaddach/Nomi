import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function listRestaurants(request: Request, response: Response) {
  const search = typeof request.query.search === "string" ? request.query.search.trim() : "";
  const status = request.query.status === "ACTIVE" || request.query.status === "SUSPENDED" ? request.query.status : undefined;
  const restaurants = await prisma.restaurant.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { memberships: { some: { user: { email: { contains: search, mode: "insensitive" } } } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      memberships: { where: { role: "OWNER" }, include: { user: { select: { name: true, email: true } } } },
      _count: { select: { products: true, categories: true } },
    },
  });

  response.json(restaurants.map(({ memberships, _count, ...restaurant }) => ({
    ...restaurant,
    owner: memberships[0]?.user ?? null,
    products: _count.products,
    categories: _count.categories,
  })));
}

export async function updateRestaurantStatus(request: Request, response: Response) {
  const restaurantId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const { status } = request.body as { status?: string };
  if (status !== "ACTIVE" && status !== "SUSPENDED") {
    response.status(400).json({ message: "Status must be ACTIVE or SUSPENDED" });
    return;
  }

  const restaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { status },
    select: { id: true, status: true },
  }).catch(() => null);
  if (!restaurant) {
    response.status(404).json({ message: "Business not found" });
    return;
  }

  response.json(restaurant);
}
