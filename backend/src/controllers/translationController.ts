import type { Request, Response } from "express";

type TranslateResponse = { translatedText?: string };
type MyMemoryResponse = { responseData?: { translatedText?: string } };

function cleanTranslatedText(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function translateText(text: string, sourceLanguageCode: string, targetLanguageCode: string) {
  const configuredEndpoint = process.env.TRANSLATION_API_URL;

  if (!configuredEndpoint) {
    const parameters = new URLSearchParams({
      q: text,
      langpair: `${sourceLanguageCode}|${targetLanguageCode}`,
    });
    const response = await fetch(`https://api.mymemory.translated.net/get?${parameters}`);
    if (!response.ok) throw new Error("Default translation provider request failed");

    const data = (await response.json()) as MyMemoryResponse;
    if (!data.responseData?.translatedText) throw new Error("Default translation provider returned no translation");
    return cleanTranslatedText(data.responseData.translatedText);
  }

  const body = new URLSearchParams({
    q: text,
    source: sourceLanguageCode,
    target: targetLanguageCode,
    format: "text",
  });
  if (process.env.TRANSLATION_API_KEY) {
    body.set("api_key", process.env.TRANSLATION_API_KEY);
  }

  const response = await fetch(configuredEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Translation provider request failed");
  }

  const data = (await response.json()) as TranslateResponse;
  if (!data.translatedText) {
    throw new Error("Translation provider returned no translation");
  }
  return cleanTranslatedText(data.translatedText);
}

export async function autoTranslateProduct(request: Request, response: Response) {
  const { name, description, sourceLanguageCode, targetLanguageCode } = request.body as {
    name?: string;
    description?: string;
    sourceLanguageCode?: string;
    targetLanguageCode?: string;
  };

  if (!name || !description || !sourceLanguageCode || !targetLanguageCode || sourceLanguageCode === targetLanguageCode) {
    response.status(400).json({ message: "Source and target product language data are required" });
    return;
  }

  try {
    const [translatedName, translatedDescription] = await Promise.all([
      translateText(name, sourceLanguageCode, targetLanguageCode),
      translateText(description, sourceLanguageCode, targetLanguageCode),
    ]);
    response.json({ name: translatedName, description: translatedDescription });
  } catch (error) {
    response.status(503).json({ message: error instanceof Error ? error.message : "Unable to translate product" });
  }
}