import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

function serializeProduct(product: { price: unknown; [key: string]: unknown }) {
  return { ...product, price: Number(product.price) };
}

export async function listProducts(_request: Request, response: Response) {
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  response.json(products.map(serializeProduct));
}

export async function createProduct(request: Request, response: Response) {
  const { name, description, price, currency, imageUrl, category, isVisible } = request.body;

  if (!name || !description || !imageUrl || !category || !Number.isFinite(Number(price))) {
    response.status(400).json({ message: "Name, description, price, imageUrl, and category are required" });
    return;
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      currency: currency || "DH",
      imageUrl,
      category,
      isVisible: isVisible ?? true,
    },
  });

  response.status(201).json(serializeProduct(product));
}

export async function updateProduct(request: Request, response: Response) {
  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const { name, description, price, currency, imageUrl, category, isVisible } = request.body;

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(currency !== undefined && { currency }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(isVisible !== undefined && { isVisible }),
      },
    });

    response.json(serializeProduct(product));
  } catch {
    response.status(404).json({ message: "Product not found" });
  }
}

export async function deleteProduct(request: Request, response: Response) {
  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

  try {
    await prisma.product.delete({ where: { id: productId } });
    response.status(204).send();
  } catch {
    response.status(404).json({ message: "Product not found" });
  }
}
