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
  for (const [id, name, description, price, imageUrl, category] of products) {
    await prisma.product.upsert({
      where: { id },
      update: { name, description, price, imageUrl, category, currency: "DH", isVisible: true },
      create: { id, name, description, price, imageUrl, category, currency: "DH", isVisible: true },
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
