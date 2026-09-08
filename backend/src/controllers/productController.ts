import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function listProducts(_request: Request, response: Response) {
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  response.json(
    products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  );
}
