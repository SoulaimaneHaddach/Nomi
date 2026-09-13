ALTER TABLE "Product" ADD COLUMN "sourceLanguageCode" TEXT NOT NULL DEFAULT 'en';

CREATE TABLE "Language" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "ProductTranslation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductTranslation_productId_languageCode_key" ON "ProductTranslation"("productId", "languageCode");
CREATE INDEX "ProductTranslation_languageCode_idx" ON "ProductTranslation"("languageCode");

ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "Language"("code") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Language" ("code", "name", "nativeName", "direction", "updatedAt") VALUES
  ('en', 'English', 'English', 'ltr', CURRENT_TIMESTAMP),
  ('fr', 'French', 'Français', 'ltr', CURRENT_TIMESTAMP),
  ('ar', 'Arabic', 'العربية', 'rtl', CURRENT_TIMESTAMP),
  ('es', 'Spanish', 'Español', 'ltr', CURRENT_TIMESTAMP),
  ('de', 'German', 'Deutsch', 'ltr', CURRENT_TIMESTAMP),
  ('tr', 'Turkish', 'Türkçe', 'ltr', CURRENT_TIMESTAMP),
  ('ja', 'Japanese', '日本語', 'ltr', CURRENT_TIMESTAMP),
  ('it', 'Italian', 'Italiano', 'ltr', CURRENT_TIMESTAMP),
  ('pt', 'Portuguese', 'Português', 'ltr', CURRENT_TIMESTAMP),
  ('nl', 'Dutch', 'Nederlands', 'ltr', CURRENT_TIMESTAMP),
  ('ko', 'Korean', '한국어', 'ltr', CURRENT_TIMESTAMP),
  ('zh', 'Chinese', '中文', 'ltr', CURRENT_TIMESTAMP),
  ('ru', 'Russian', 'Русский', 'ltr', CURRENT_TIMESTAMP),
  ('hi', 'Hindi', 'हिन्दी', 'ltr', CURRENT_TIMESTAMP),
  ('ur', 'Urdu', 'اردو', 'rtl', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

ALTER TABLE "Product" ADD CONSTRAINT "Product_sourceLanguageCode_fkey" FOREIGN KEY ("sourceLanguageCode") REFERENCES "Language"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "ProductTranslation" ("id", "productId", "languageCode", "name", "description", "updatedAt")
SELECT 'source-' || "id", "id", "sourceLanguageCode", "name", "description", CURRENT_TIMESTAMP
FROM "Product"
ON CONFLICT ("productId", "languageCode") DO NOTHING;