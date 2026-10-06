import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function listLanguages(_request: Request, response: Response) {
  response.json(await prisma.language.findMany({ orderBy: { name: "asc" } }));
}

export async function listMenuLanguages(_request: Request, response: Response) {
  const slug = typeof _request.params.slug === "string" ? _request.params.slug : "";
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant || restaurant.status === "SUSPENDED") {
    response.status(404).json({ message: "Restaurant not found" });
    return;
  }
  const products = await prisma.product.findMany({
    where: { restaurantId: restaurant.id, isVisible: true },
    select: {
      sourceLanguage: true,
      translations: { select: { language: true } },
    },
  });

  const languages = new Map<string, (typeof products)[number]["sourceLanguage"]>();
  for (const product of products) {
    languages.set(product.sourceLanguage.code, product.sourceLanguage);
    for (const translation of product.translations) {
      languages.set(translation.language.code, translation.language);
    }
  }

  response.json([...languages.values()].sort((left, right) => left.name.localeCompare(right.name)));
}