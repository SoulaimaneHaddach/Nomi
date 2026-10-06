import { startTransition, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import Header from "../components/Header";
import { Mascot } from "../components/Header";
import FloatingSymbol from "../components/FloatingSymbol";
import { FLOATING_SYMBOLS } from "../components/floatingSymbols";
import CategoryNav from "../components/CategoryNav";
import DecorativeBackground from "../components/DecorativeBackground";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  category: string;
};

type Language = {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
};

type ApiProduct = Omit<Product, "image" | "name" | "description"> & {
  imageUrl: string;
  name: string;
  description: string;
  sourceLanguageCode: string;
  translations: Array<{ languageCode: string; name: string; description: string }>;
};

type ApiMenu = {
  restaurant: { name: string };
  products: ApiProduct[];
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
type MenuState = "loading" | "ready" | "not-found" | "error";

function PublicState({ title, children, actions }: { title: string; children: string; actions?: ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden text-[#2B2320]">
      <div className="nomi-site-background" aria-hidden="true" />
      <DecorativeBackground />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl items-center justify-center px-5 py-10 sm:px-8">
        <section className="nomi-window nomi-paper w-full rounded-[1.75rem] px-6 py-12 text-center sm:rounded-[2.25rem] sm:px-12 sm:py-16">
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="h-20 w-20 sm:h-28 sm:w-28">
              <Mascot />
            </div>
            <span className="font-display text-5xl font-semibold text-[#2B2320] sm:text-7xl">Nomi</span>
          </div>
          <h1 className="mt-8 font-display text-2xl font-semibold leading-tight text-[#2B2320] sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#6E685F] sm:text-base">{children}</p>
          {actions}
        </section>
      </main>
    </div>
  );
}

export function EmptyNomiState() {
  const navigate = useNavigate();
  return (
    <PublicState
      title="Digital menus for cafés & businesses."
      actions={(
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="nomi-public-action" onClick={() => navigate("/login")}>Owner Login</button>
          <button type="button" className="nomi-public-action is-secondary" onClick={() => navigate("/register")}>Create Business Account</button>
        </div>
      )}
    >
      Nomi lets businesses create and manage their digital menu and lets customers access it easily from their phone or tablet.
    </PublicState>
  );
}

function BusinessNotFound() {
  return (
    <PublicState title="Business not found">
      This menu link does not point to an existing business. Check the link and try again.
    </PublicState>
  );
}

function localizeProduct(product: ApiProduct, languageCode: string): Product {
  const translation = product.translations.find(({ languageCode: code }) => code === languageCode)
    ?? product.translations.find(({ languageCode: code }) => code === product.sourceLanguageCode);

  return {
    id: product.id,
    name: translation?.name ?? product.name,
    description: translation?.description ?? product.description,
    price: product.price,
    currency: product.currency,
    image: product.imageUrl,
    category: product.category,
  };
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [pageDirection, setPageDirection] = useState<"next" | "previous">("next");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [activeLanguageCode, setActiveLanguageCode] = useState("");
  const { slug } = useParams();
  const [menuState, setMenuState] = useState<MenuState>("loading");

  useEffect(() => {
    startTransition(() => setMenuState("loading"));
    fetch(`${API_URL}/api/products/${slug}`)
      .then(async (productResponse) => {
        if (productResponse.status === 404) {
          setMenuState("not-found");
          return null;
        }
        if (!productResponse.ok) throw new Error("Unable to load the latest menu.");
        const menu = await productResponse.json() as ApiMenu;
        const languageResponse = await fetch(`${API_URL}/api/languages/menu/${slug}`);
        if (!languageResponse.ok) throw new Error("Unable to load menu languages.");
        return { menu, loadedLanguages: await languageResponse.json() as Language[] };
      })
      .then((result) => {
        if (!result) return;
        startTransition(() => {
          setRestaurantName(result.menu.restaurant.name);
          setApiProducts(result.menu.products);
          setLanguages(result.loadedLanguages);
          setActiveLanguageCode((current) => current || result.loadedLanguages[0]?.code || "");
          setMenuState("ready");
        });
      })
      .catch(() => {
        setApiProducts([]);
        setLanguages([]);
        setMenuState("error");
      });
  }, [slug]);

  const products = apiProducts.map((product) => localizeProduct(product, activeLanguageCode));
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const selectedCategory = categories.includes(activeCategory) ? activeCategory : "All";
  const popular = products.slice(0, 3);
  const visibleProducts = selectedCategory === "All"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  if (menuState === "not-found") return <BusinessNotFound />;
  if (menuState === "error") {
    return <PublicState title="Unable to load this menu">Please try this business link again in a moment.</PublicState>;
  }

  const handleCategorySelect = (category: string) => {
    const currentIndex = categories.indexOf(selectedCategory);
    const nextIndex = categories.indexOf(category);
    if (nextIndex === currentIndex) return;
    setPageDirection(nextIndex > currentIndex ? "next" : "previous");
    setActiveCategory(category);
  };

  return (
    <div className="relative isolate min-h-dvh w-full overflow-x-hidden text-[#2B2320]">
      <div className="nomi-site-background" aria-hidden="true" />
      <DecorativeBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-screen-2xl flex-col px-3 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
        <main className="nomi-window nomi-paper mx-auto w-full max-w-6xl overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
          <Header
            name={restaurantName}
            languages={languages}
            activeLanguageCode={activeLanguageCode}
            onLanguageChange={setActiveLanguageCode}
          />
          <div className="nomi-notebook">
            <div aria-hidden="true" className="nomi-menu-symbols">
              {FLOATING_SYMBOLS.map((symbol, index) => (
                <div key={index} className="pointer-events-none absolute" style={{ top: symbol.top, left: symbol.left }}>
                  <FloatingSymbol size={symbol.size} rotate={symbol.rotate} opacity={symbol.opacity * 0.65} kind={symbol.kind} color={symbol.color} />
                </div>
              ))}
            </div>
            <CategoryNav categories={categories} active={selectedCategory} onSelect={handleCategorySelect} />
            <div className="nomi-notebook-page">
              <div key={`${selectedCategory}-${activeLanguageCode}`} className={`nomi-notebook-page-content is-${pageDirection} px-4 pb-12 pt-1 sm:px-8 sm:pb-16 lg:px-10`}>
                {selectedCategory === "All" && popular.length > 0 && (
                  <section className="mt-8 sm:mt-10">
                    <h2 className="font-display text-xl font-semibold text-[#2B2320]">Popular</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5 md:grid-cols-3">
                      {popular.map((product) => <ProductCard key={product.id} product={product} onSelect={() => setSelectedProduct(product)} />)}
                    </div>
                  </section>
                )}
                <section className="mt-10 sm:mt-12">
                  <h2 className="font-display text-xl font-semibold text-[#2B2320]">{selectedCategory === "All" ? "Full menu" : selectedCategory}</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onSelect={() => setSelectedProduct(product)} />)}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
