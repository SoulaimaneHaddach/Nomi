/// <reference types="node" />

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  ["cappuccino", "Cappuccino", "Smooth espresso with steamed milk and foam", 22, "/imgs/webp/cappuccino.webp", "Coffee"],
  ["iced-latte", "Iced Latte", "Cold espresso, milk, over ice", 24, "/imgs/webp/iced-latte.webp", "Coffee"],
  ["espresso", "Espresso", "Rich, concentrated shot with a golden crema", 15, "/imgs/webp/espresso.webp", "Coffee"],
  ["flat-white", "Flat White", "Double espresso with silky microfoam milk", 23, "/imgs/webp/flat-white.webp", "Coffee"],
  ["avocado-toast", "Avocado Toast", "Sourdough, smashed avocado, chili flakes, lemon", 38, "/imgs/webp/avocado-toast.webp", "Breakfast"],
  ["croissant", "Butter Croissant", "Flaky, buttery, baked fresh every morning", 15, "/imgs/webp/croissant.webp", "Breakfast"],
  ["granola-bowl", "Granola Bowl", "Yogurt, house granola, honey, seasonal fruit", 32, "/imgs/webp/granola-bowl.webp", "Breakfast"],
  ["shakshuka", "Shakshuka", "Poached eggs in spiced tomato sauce, warm bread", 42, "/imgs/webp/shakshuka.webp", "Breakfast"],
  ["club-sandwich", "Club Sandwich", "Chicken, egg, lettuce, tomato, toasted bread", 45, "/imgs/webp/club-sandwich.webp", "Food"],
  ["caesar-salad", "Caesar Salad", "Romaine, parmesan, croutons, house Caesar dressing", 40, "/imgs/webp/caesar-salad.webp", "Food"],
  ["margherita-panini", "Margherita Panini", "Mozzarella, tomato, basil, pressed on ciabatta", 36, "/imgs/webp/margherita-panini.webp", "Food"],
  ["chocolate-brownie", "Chocolate Brownie", "Dense, fudgy, served warm", 20, "/imgs/webp/chocolate-brownie.webp", "Desserts"],
  ["cheesecake", "Cheesecake", "Creamy New York style, biscuit base", 28, "/imgs/webp/cheesecake.webp", "Desserts"],
  ["tiramisu", "Tiramisu", "Espresso-soaked ladyfingers, mascarpone, cocoa", 30, "/imgs/webp/tiramisu.webp", "Desserts"],
  ["orange-juice", "Fresh Orange Juice", "Cold-pressed, no sugar added", 20, "/imgs/webp/orange-juice.webp", "Drinks"],
  ["mint-lemonade", "Mint Lemonade", "Fresh lemon, mint, lightly sparkling", 22, "/imgs/webp/mint-lemonade.webp", "Drinks"],
  ["iced-tea", "Iced Tea", "House-brewed, lightly sweetened, over ice", 18, "/imgs/webp/iced-tea.webp", "Drinks"],
] as const;

async function main() {
  await prisma.language.createMany({
    data: [
      ["en", "English", "English", "ltr"],
      ["fr", "French", "Français", "ltr"],
      ["ar", "Arabic", "العربية", "rtl"],
      ["es", "Spanish", "Español", "ltr"],
      ["de", "German", "Deutsch", "ltr"],
      ["tr", "Turkish", "Türkçe", "ltr"],
      ["ja", "Japanese", "日本語", "ltr"],
      ["it", "Italian", "Italiano", "ltr"],
      ["pt", "Portuguese", "Português", "ltr"],
      ["nl", "Dutch", "Nederlands", "ltr"],
      ["ko", "Korean", "한국어", "ltr"],
      ["zh", "Chinese", "中文", "ltr"],
      ["ru", "Russian", "Русский", "ltr"],
      ["hi", "Hindi", "हिन्दी", "ltr"],
      ["ur", "Urdu", "اردو", "rtl"],
    ].map(([code, name, nativeName, direction]) => ({ code, name, nativeName, direction })),
    skipDuplicates: true,
  });

  const restaurantId = "restaurant-nomi-default";

  for (const [id, name, description, price, imageUrl, category] of products) {
    const categoryRecord = await prisma.category.upsert({
      where: { restaurantId_name: { restaurantId, name: category } },
      update: {},
      create: { restaurantId, name: category },
    });
    await prisma.product.upsert({
      where: { id },
      update: { name, description, sourceLanguageCode: "en", restaurantId, categoryId: categoryRecord.id, price, imageUrl, category, currency: "DH", isVisible: true },
      create: {
        id,
        name,
        description,
        sourceLanguageCode: "en",
        restaurantId,
        categoryId: categoryRecord.id,
        price,
        imageUrl,
        category,
        currency: "DH",
        isVisible: true,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_languageCode: { productId: id, languageCode: "en" } },
      update: { name, description },
      create: { productId: id, languageCode: "en", name, description },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
