// pages/Menu.tsx
import { useState } from "react";
import Header from "../components/Header";
import FloatingSymbol from "../components/FloatingSymbol";
import { FLOATING_SYMBOLS } from "../components/floatingSymbols";
import CategoryNav from "../components/CategoryNav";
import DecorativeBackground from "../components/DecorativeBackground";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

// --- Mock data (swap for real API data later) ---

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
};

const CATEGORIES = ["All", "Coffee", "Breakfast", "Food", "Desserts", "Drinks"];

const PRODUCTS: Product[] = [
  // Coffee
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Smooth espresso with steamed milk and foam",
    price: 22,
    currency: "DH",
    image: "/imgs/webp/cappuccino.webp",
    category: "Coffee",
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Cold espresso, milk, over ice",
    price: 24,
    currency: "DH",
    image: "/imgs/webp/iced-latte.webp",
    category: "Coffee",
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "Rich, concentrated shot with a golden crema",
    price: 15,
    currency: "DH",
    image: "/imgs/webp/espresso.webp",
    category: "Coffee",
  },
  {
    id: "flat-white",
    name: "Flat White",
    description: "Double espresso with silky microfoam milk",
    price: 23,
    currency: "DH",
    image: "/imgs/webp/flat-white.webp",
    category: "Coffee",
  },
  // Breakfast
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    description: "Sourdough, smashed avocado, chili flakes, lemon",
    price: 38,
    currency: "DH",
    image: "/imgs/webp/avocado-toast.webp",
    category: "Breakfast",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    description: "Flaky, buttery, baked fresh every morning",
    price: 15,
    currency: "DH",
    image: "/imgs/webp/croissant.webp",
    category: "Breakfast",
  },
  {
    id: "granola-bowl",
    name: "Granola Bowl",
    description: "Yogurt, house granola, honey, seasonal fruit",
    price: 32,
    currency: "DH",
    image: "/imgs/webp/granola-bowl.webp",
    category: "Breakfast",
  },
  {
    id: "shakshuka",
    name: "Shakshuka",
    description: "Poached eggs in spiced tomato sauce, warm bread",
    price: 42,
    currency: "DH",
    image: "/imgs/webp/shakshuka.webp",
    category: "Breakfast",
  },
  // Food
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    description: "Chicken, egg, lettuce, tomato, toasted bread",
    price: 45,
    currency: "DH",
    image: "/imgs/webp/club-sandwich.webp",
    category: "Food",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    description: "Romaine, parmesan, croutons, house Caesar dressing",
    price: 40,
    currency: "DH",
    image: "/imgs/webp/caesar-salad.webp",
    category: "Food",
  },
  {
    id: "margherita-panini",
    name: "Margherita Panini",
    description: "Mozzarella, tomato, basil, pressed on ciabatta",
    price: 36,
    currency: "DH",
    image: "/imgs/webp/margherita-panini.webp",
    category: "Food",
  },
  // Desserts
  {
    id: "chocolate-brownie",
    name: "Chocolate Brownie",
    description: "Dense, fudgy, served warm",
    price: 20,
    currency: "DH",
    image: "/imgs/webp/chocolate-brownie.webp",
    category: "Desserts",
  },
  {
    id: "cheesecake",
    name: "Cheesecake",
    description: "Creamy New York style, biscuit base",
    price: 28,
    currency: "DH",
    image: "/imgs/webp/cheesecake.webp",
    category: "Desserts",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Espresso-soaked ladyfingers, mascarpone, cocoa",
    price: 30,
    currency: "DH",
    image: "/imgs/webp/tiramisu.webp",
    category: "Desserts",
  },
  // Drinks
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    description: "Cold-pressed, no sugar added",
    price: 20,
    currency: "DH",
    image: "/imgs/webp/orange-juice.webp",
    category: "Drinks",
  },
  {
    id: "mint-lemonade",
    name: "Mint Lemonade",
    description: "Fresh lemon, mint, lightly sparkling",
    price: 22,
    currency: "DH",
    image: "/imgs/webp/mint-lemonade.webp",
    category: "Drinks",
  },
  {
    id: "iced-tea",
    name: "Iced Tea",
    description: "House-brewed, lightly sweetened, over ice",
    price: 18,
    currency: "DH",
    image: "/imgs/webp/iced-tea.webp",
    category: "Drinks",
  },
];

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [pageDirection, setPageDirection] = useState<"next" | "previous">(
    "next",
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const popular = PRODUCTS.slice(0, 3);

  const visibleProducts =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const handleCategorySelect = (category: string) => {
    const currentIndex = CATEGORIES.indexOf(activeCategory);
    const nextIndex = CATEGORIES.indexOf(category);

    if (nextIndex === currentIndex) {
      return;
    }

    setPageDirection(nextIndex > currentIndex ? "next" : "previous");
    setActiveCategory(category);
  };

  return (
    <div className="relative isolate min-h-dvh w-full overflow-x-hidden text-[#2B2320]">
      {/* LAYER 1 — website background, full-screen, sits behind the window */}
      <div className="nomi-site-background" aria-hidden="true" />
      <DecorativeBackground />

      {/* LAYER 2 — the menu window, the main object on the page */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-3 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        <main className="nomi-window nomi-paper mx-auto w-full max-w-6xl overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
          <Header
            name="Nomi Café"
            tagline="Good coffee. Good vibes. No rush."
          />

          <div className="nomi-notebook">
            <div aria-hidden="true" className="nomi-menu-symbols">
              {FLOATING_SYMBOLS.map((symbol, index) => (
                <div
                  key={index}
                  className="pointer-events-none absolute"
                  style={{ top: symbol.top, left: symbol.left }}
                >
                  <FloatingSymbol
                    size={symbol.size}
                    rotate={symbol.rotate}
                    opacity={symbol.opacity * 0.65}
                    kind={symbol.kind}
                    color={symbol.color}
                  />
                </div>
              ))}
            </div>

            <CategoryNav
              categories={CATEGORIES}
              active={activeCategory}
              onSelect={handleCategorySelect}
            />

            <div className="nomi-notebook-page">
              <div aria-hidden="true" className="nomi-menu-symbols">
                {FLOATING_SYMBOLS.map((symbol, index) => (
                  <div
                    key={index}
                    className="pointer-events-none absolute"
                    style={{ top: symbol.top, left: symbol.left }}
                  >
                    <FloatingSymbol
                      size={symbol.size}
                      rotate={symbol.rotate}
                      opacity={symbol.opacity}
                      kind={symbol.kind}
                      color={symbol.color}
                    />
                  </div>
                ))}
                {FLOATING_SYMBOLS.slice(0, 3).map((symbol, index) => (
                  <div
                    key={`extra-${index}`}
                    className="pointer-events-none absolute"
                    style={{
                      top: ["10%", "48%", "78%"][index],
                      left: ["88%", "4%", "90%"][index],
                    }}
                  >
                    <FloatingSymbol
                      size={symbol.size * 0.9}
                      rotate={symbol.rotate}
                      opacity={symbol.opacity * 0.85}
                      kind={symbol.kind}
                      color={symbol.color}
                    />
                  </div>
                ))}
                {FLOATING_SYMBOLS.map((symbol, index) => (
                  <div
                    key={`ambient-${index}`}
                    className="pointer-events-none absolute"
                    style={{
                      top: ["6%", "28%", "44%", "68%", "92%"][index],
                      left: ["52%", "94%", "2%", "52%", "8%"][index],
                    }}
                  >
                    <FloatingSymbol
                      size={symbol.size * 0.72}
                      rotate={symbol.rotate}
                      opacity={Math.min(symbol.opacity * 1.15, 0.42)}
                      kind={symbol.kind}
                      color={symbol.color}
                    />
                  </div>
                ))}
              </div>

              <div
                key={activeCategory}
                className={`nomi-notebook-page-content is-${pageDirection} px-4 pb-12 pt-1 sm:px-8 sm:pb-16 lg:px-10`}
              >
                {activeCategory === "All" && (
                  <section className="mt-8 sm:mt-10">
                    <h2 className="font-display text-xl font-semibold text-[#2B2320]">
                      Popular
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5 md:grid-cols-3">
                      {popular.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={() => setSelectedProduct(product)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                <section className="mt-10 sm:mt-12">
                  <h2 className="font-display text-xl font-semibold text-[#2B2320]">
                    {activeCategory === "All" ? "Full menu" : activeCategory}
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}