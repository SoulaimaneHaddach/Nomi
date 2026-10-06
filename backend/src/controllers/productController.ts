import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { getCurrentRestaurantId } from "../middleware/requireAdmin.js";

type TranslationInput = {
  languageCode?: string;
  name?: string;
  description?: string;
};

const translationInclude = {
  translations: {
    include: { language: true },
    orderBy: { languageCode: "asc" as const },
  },
  sourceLanguage: true,
};

function serializeProduct(product: { price: unknown; [key: string]: unknown }) {
  return { ...product, price: Number(product.price) };
}

async function validateTranslations(translations: TranslationInput[] = []) {
  const codes = translations.map((translation) => translation.languageCode?.trim()).filter(Boolean) as string[];
  if (new Set(codes).size !== codes.length) {
    throw new Error("Duplicate translation language");
  }

  const languages = await prisma.language.findMany({ where: { code: { in: codes } } });
  if (languages.length !== codes.length) {
    throw new Error("Unsupported translation language");
  }

  if (translations.some((translation) => !translation.name?.trim() || !translation.description?.trim())) {
    throw new Error("Translation name and description are required");
  }
}

async function saveTranslations(productId: string, sourceLanguageCode: string, translations: TranslationInput[]) {
  const cleanTranslations = translations.filter((translation) => translation.languageCode !== sourceLanguageCode);
  await prisma.productTranslation.deleteMany({
    where: { productId, languageCode: { not: sourceLanguageCode, notIn: cleanTranslations.map((translation) => translation.languageCode as string) } },
  });

  for (const translation of cleanTranslations) {
    await prisma.productTranslation.upsert({
      where: { productId_languageCode: { productId, languageCode: translation.languageCode as string } },
      update: { name: translation.name?.trim() as string, description: translation.description?.trim() as string },
      create: {
        productId,
        languageCode: translation.languageCode as string,
        name: translation.name?.trim() as string,
        description: translation.description?.trim() as string,
      },
    });
  }
}

export async function listProducts(_request: Request, response: Response) {
  const slug = typeof _request.params.slug === "string" ? _request.params.slug : "";
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant || restaurant.status === "SUSPENDED") {
    response.status(404).json({ message: "Restaurant not found" });
    return;
  }

  await prisma.restaurant.update({ where: { id: restaurant.id }, data: { menuViews: { increment: 1 }, lastActivityAt: new Date() } });

  const products = await prisma.product.findMany({
    where: { restaurantId: restaurant.id, isVisible: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: translationInclude,
  });

  response.json({
    restaurant: { name: restaurant.name },
    products: products.map(serializeProduct),
  });
}

export async function listAdminProducts(_request: Request, response: Response) {
  const restaurantId = getCurrentRestaurantId(_request);
  if (!restaurantId) {
    response.status(403).json({ message: "Restaurant membership required" });
    return;
  }

  const products = await prisma.product.findMany({
    where: { restaurantId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: translationInclude,
  });

  response.json(products.map(serializeProduct));
}

export async function createProduct(request: Request, response: Response) {
  const { name, description, price, currency, imageUrl, category, isVisible, sourceLanguageCode = "en", translations = [] } = request.body as {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    category?: string;
    isVisible?: boolean;
    sourceLanguageCode?: string;
    translations?: TranslationInput[];
  };

  if (!name || !description || !imageUrl || !category || !Number.isFinite(Number(price))) {
    response.status(400).json({ message: "Name, description, price, imageUrl, and category are required" });
    return;
  }

  try {
    const restaurantId = getCurrentRestaurantId(request);
    if (!restaurantId) {
      response.status(403).json({ message: "Restaurant membership required" });
      return;
    }
    const categoryRecord = await prisma.category.upsert({
      where: { restaurantId_name: { restaurantId, name: category } },
      update: {},
      create: { restaurantId, name: category },
    });
    await validateTranslations(translations);
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sourceLanguageCode,
        restaurantId,
        categoryId: categoryRecord.id,
        price: Number(price),
        currency: currency || "DH",
        imageUrl,
        category,
        isVisible: isVisible ?? true,
        translations: {
          create: {
            languageCode: sourceLanguageCode,
            name,
            description,
          },
        },
      },
      include: translationInclude,
    });

    await saveTranslations(product.id, sourceLanguageCode, translations);
    await prisma.restaurant.update({ where: { id: restaurantId }, data: { lastActivityAt: new Date() } });
    response.status(201).json(serializeProduct(await prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: translationInclude })));
  } catch (error) {
    response.status(400).json({ message: error instanceof Error ? error.message : "Unable to create product" });
  }
}

export async function updateProduct(request: Request, response: Response) {
  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const { name, description, price, currency, imageUrl, category, isVisible, sourceLanguageCode, translations } = request.body as {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    category?: string;
    isVisible?: boolean;
    sourceLanguageCode?: string;
    translations?: TranslationInput[];
  };

  try {
    const restaurantId = getCurrentRestaurantId(request);
    if (!restaurantId) {
      response.status(403).json({ message: "Restaurant membership required" });
      return;
    }
    const existingProduct = await prisma.product.findFirst({ where: { id: productId, restaurantId } });
    if (!existingProduct) {
      response.status(404).json({ message: "Product not found" });
      return;
    }
    const categoryRecord = category !== undefined
      ? await prisma.category.upsert({
        where: { restaurantId_name: { restaurantId, name: category } },
        update: {},
        create: { restaurantId, name: category },
      })
      : undefined;
    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(currency !== undefined && { currency }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(categoryRecord && { categoryId: categoryRecord.id }),
        ...(isVisible !== undefined && { isVisible }),
        ...(sourceLanguageCode !== undefined && { sourceLanguageCode }),
      },
    });

    if (translations) {
      await validateTranslations(translations);
      const nextSourceLanguageCode = sourceLanguageCode ?? product.sourceLanguageCode;
      await prisma.productTranslation.upsert({
        where: { productId_languageCode: { productId: product.id, languageCode: nextSourceLanguageCode } },
        update: {
          name: name ?? product.name,
          description: description ?? product.description,
        },
        create: {
          productId: product.id,
          languageCode: nextSourceLanguageCode,
          name: name ?? product.name,
          description: description ?? product.description,
        },
      });
      await saveTranslations(product.id, nextSourceLanguageCode, translations);
    }

    await prisma.restaurant.update({ where: { id: restaurantId }, data: { lastActivityAt: new Date() } });

    response.json(serializeProduct(await prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: translationInclude })));
  } catch {
    response.status(404).json({ message: "Product not found" });
  }
}

export async function deleteProduct(request: Request, response: Response) {
  const productId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

  try {
    const restaurantId = getCurrentRestaurantId(request);
    if (!restaurantId) {
      response.status(403).json({ message: "Restaurant membership required" });
      return;
    }
    const product = await prisma.product.findFirst({ where: { id: productId, restaurantId } });
    if (!product) {
      response.status(404).json({ message: "Product not found" });
      return;
    }
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.restaurant.update({ where: { id: restaurantId }, data: { lastActivityAt: new Date() } });
    response.status(204).send();
  } catch {
    response.status(404).json({ message: "Product not found" });
  }
}
