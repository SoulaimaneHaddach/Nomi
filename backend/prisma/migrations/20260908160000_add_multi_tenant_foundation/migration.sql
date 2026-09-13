CREATE TYPE "UserRole" AS ENUM ('PLATFORM_ADMIN', 'RESTAURANT_OWNER');
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'MANAGER');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RESTAURANT_OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Membership_userId_restaurantId_key" ON "Membership"("userId", "restaurantId");
CREATE INDEX "Membership_restaurantId_idx" ON "Membership"("restaurantId");

CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");
CREATE INDEX "Invitation_restaurantId_idx" ON "Invitation"("restaurantId");

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", "name");
CREATE INDEX "Category_restaurantId_idx" ON "Category"("restaurantId");

INSERT INTO "Restaurant" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('restaurant-nomi-default', 'Nomi Café', 'nomi-cafe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "User" ("id", "email", "passwordHash", "role", "createdAt", "updatedAt")
SELECT 'user-' || "id", COALESCE(NULLIF("username", ''), 'owner@nomi.local'), "passwordHash", 'RESTAURANT_OWNER'::"UserRole", "createdAt", "updatedAt"
FROM "Admin"
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = COALESCE(NULLIF("username", ''), 'owner@nomi.local'));

INSERT INTO "Membership" ("id", "userId", "restaurantId", "role")
SELECT 'membership-' || u."id", u."id", 'restaurant-nomi-default', 'OWNER'::"MembershipRole"
FROM "User" u
WHERE NOT EXISTS (SELECT 1 FROM "Membership" m WHERE m."userId" = u."id" AND m."restaurantId" = 'restaurant-nomi-default');

ALTER TABLE "Product" ADD COLUMN "restaurantId" TEXT;
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

INSERT INTO "Category" ("id", "restaurantId", "name", "createdAt", "updatedAt")
SELECT 'category-nomi-' || lower(regexp_replace("category", '[^a-zA-Z0-9]+', '-', 'g')), 'restaurant-nomi-default', "category", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Product"
GROUP BY "category";

UPDATE "Product" SET "restaurantId" = 'restaurant-nomi-default';
UPDATE "Product" p SET "categoryId" = c."id"
FROM "Category" c WHERE c."restaurantId" = p."restaurantId" AND c."name" = p."category";

ALTER TABLE "Product" ALTER COLUMN "restaurantId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
CREATE INDEX "Product_restaurantId_idx" ON "Product"("restaurantId");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;