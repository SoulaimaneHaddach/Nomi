const DEMO_MODE = import.meta.env.VITE_USE_DEMO !== "false";
const DEMO_PIN = "1234";
let demoPinConfigured = false;

const demoLanguages = [
  { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
];

const demoProducts = [
  {
    id: "prod-1",
    name: "Cappuccino",
    description: "A smooth espresso with creamy milk foam.",
    price: 5.5,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    category: "Coffee",
    isVisible: true,
    sourceLanguageCode: "en",
    translations: [
      { languageCode: "en", name: "Cappuccino", description: "A smooth espresso with creamy milk foam.", language: demoLanguages[0] },
      { languageCode: "es", name: "Cappuccino", description: "Un espresso suave con espuma cremosa.", language: demoLanguages[1] },
      { languageCode: "fr", name: "Cappuccino", description: "Un espresso doux avec de la mousse crémeuse.", language: demoLanguages[2] },
      { languageCode: "ar", name: "كابوتشينو", description: "إسبريسو ناعم مع رغوة حليب كريمية.", language: demoLanguages[3] },
    ],
  },
  {
    id: "prod-2",
    name: "Avocado Toast",
    description: "Sourdough toast, smashed avocado, herbs, and a sunny egg.",
    price: 9.75,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    category: "Breakfast",
    isVisible: true,
    sourceLanguageCode: "en",
    translations: [
      { languageCode: "en", name: "Avocado Toast", description: "Sourdough toast, smashed avocado, herbs, and a sunny egg.", language: demoLanguages[0] },
      { languageCode: "es", name: "Tostada de aguacate", description: "Pan de masa madre, aguacate machacado, hierbas y huevo.", language: demoLanguages[1] },
      { languageCode: "fr", name: "Toast à l’avocat", description: "Toast au pain de seigle, avocat écrasé, herbes et œuf.", language: demoLanguages[2] },
      { languageCode: "ar", name: "توست الأفوكادو", description: "توست خبز الحنطة، أفوكادو مطحون، أعشاب وبيضة.", language: demoLanguages[3] },
    ],
  },
  {
    id: "prod-3",
    name: "Berry Cheesecake",
    description: "Creamy cheesecake topped with a berry compote.",
    price: 7.25,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    category: "Desserts",
    isVisible: true,
    sourceLanguageCode: "en",
    translations: [
      { languageCode: "en", name: "Berry Cheesecake", description: "Creamy cheesecake topped with a berry compote.", language: demoLanguages[0] },
      { languageCode: "es", name: "Pastel de queso con bayas", description: "Pastel de queso cremoso con compota de bayas.", language: demoLanguages[1] },
      { languageCode: "fr", name: "Gâteau au fromage aux baies", description: "Cheesecake crémeux garni de compote de baies.", language: demoLanguages[2] },
      { languageCode: "ar", name: "تشيز كيك بالتوت", description: "تشيز كيك كريمي مغطى بكمبوت التوت.", language: demoLanguages[3] },
    ],
  },
];

const demoRestaurants = [
  {
    id: "restaurant-1",
    name: "Nomi Coffee House",
    slug: "nomi-coffee-house",
    status: "ACTIVE",
    menuViews: 1432,
    createdAt: "2024-01-12T08:00:00.000Z",
    lastActivityAt: "2026-09-18T10:15:00.000Z",
    owner: { name: "Amina Rahman", email: "owner@nomi.demo" },
    products: 18,
    categories: 5,
  },
  {
    id: "restaurant-2",
    name: "Harbor Table",
    slug: "harbor-table",
    status: "ACTIVE",
    menuViews: 986,
    createdAt: "2024-03-21T11:00:00.000Z",
    lastActivityAt: "2026-09-15T18:30:00.000Z",
    owner: { name: "Liam Clarke", email: "harbor@nomi.demo" },
    products: 12,
    categories: 4,
  },
  {
    id: "restaurant-3",
    name: "Sunset Bistro",
    slug: "sunset-bistro",
    status: "SUSPENDED",
    menuViews: 512,
    createdAt: "2023-10-02T13:00:00.000Z",
    lastActivityAt: "2026-08-07T09:00:00.000Z",
    owner: { name: "Nora Shah", email: "sunset@nomi.demo" },
    products: 10,
    categories: 4,
  },
];

const getJsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const resolveRequestUrl = (input: RequestInfo | URL) => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

const parseBody = (body: string | undefined) => {
  if (!body || body.trim() === "") return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const parseStatusFilter = (url: string) => {
  const queryIndex = url.indexOf("?");
  if (queryIndex === -1) return "ALL";
  const query = url.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  return (params.get("status") ?? "ALL") as "ALL" | "ACTIVE" | "SUSPENDED";
};

const getAuthorizationToken = (headers?: HeadersInit) => {
  const headerMap = new Headers(headers ?? {});
  const auth = headerMap.get("Authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
};

if (DEMO_MODE && typeof window !== "undefined") {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = resolveRequestUrl(input);
    const path = url.replace(/^https?:\/\/[^/]+/i, "");
    const method = (init?.method ?? "GET").toUpperCase();
    const body = parseBody(typeof init?.body === "string" ? init.body : undefined);

    if (path.startsWith("/api/")) {
      const lowerPath = path.toLowerCase();
      const authToken = getAuthorizationToken(init?.headers);

      if (lowerPath.includes("/api/auth/owner-login")) {
        return getJsonResponse({ token: "demo-owner-token" });
      }

      if (lowerPath.includes("/api/auth/register")) {
        return getJsonResponse({ token: "demo-owner-token" });
      }

      if (lowerPath.includes("/api/auth/login")) {
        return getJsonResponse({
          token: "demo-platform-token",
          user: { role: "PLATFORM_ADMIN", name: "Platform Admin", email: "admin@nomi.demo" },
        });
      }

      if (lowerPath.includes("/api/auth/pin/verify")) {
        const pinValue = (body as { pin?: string })?.pin ?? "";
        if (pinValue === DEMO_PIN) {
          return getJsonResponse({ message: "PIN verified." });
        }
        return getJsonResponse({ message: "Incorrect PIN" }, 400);
      }

      if (lowerPath.includes("/api/auth/pin/recover")) {
        demoPinConfigured = true;
        return getJsonResponse({ message: "PIN reset successfully." });
      }

      if (lowerPath.includes("/api/auth/pin")) {
        if (method === "GET") {
          return getJsonResponse({ configured: demoPinConfigured });
        }

        demoPinConfigured = true;
        return getJsonResponse({ configured: true, message: "PIN saved in demo mode." });
      }

      if (lowerPath.includes("/api/auth/password/forgot")) {
        return getJsonResponse({ message: "If that email exists, a reset link has been prepared for the demo." });
      }

      if (lowerPath.includes("/api/auth/password/reset")) {
        return getJsonResponse({ message: "Password updated successfully." });
      }

      if (lowerPath.includes("/api/auth/me")) {
        if (authToken === "demo-platform-token") {
          return getJsonResponse({ name: "Platform Admin", email: "admin@nomi.demo", role: "PLATFORM_ADMIN" });
        }
        return getJsonResponse({
          name: "Demo Owner",
          email: "owner@nomi.demo",
          role: "RESTAURANT_OWNER",
          restaurants: [
            {
              id: "restaurant-1",
              name: "Nomi Coffee House",
              slug: "nomi-coffee-house",
              logo: null,
              role: "RESTAURANT_OWNER",
            },
          ],
        });
      }

      if (lowerPath.includes("/api/platform/restaurants")) {
        if (method === "PATCH") {
          const restaurantId = path.split("/").at(-2) ?? "";
          const nextStatus = (body as { status?: string })?.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE";
          const targetRestaurant = demoRestaurants.find((restaurant) => restaurant.id === restaurantId);
          if (targetRestaurant) targetRestaurant.status = nextStatus as "ACTIVE" | "SUSPENDED";
          return getJsonResponse({ message: "Status updated." });
        }

        const filter = parseStatusFilter(url);
        const filteredRestaurants = filter === "ALL"
          ? demoRestaurants
          : demoRestaurants.filter((restaurant) => restaurant.status === filter);

        return getJsonResponse(filteredRestaurants);
      }

      if (lowerPath.includes("/api/products/admin")) {
        return getJsonResponse(demoProducts);
      }

      if (lowerPath.includes("/api/products/")) {
        const slug = path.split("/").filter(Boolean).at(-1) ?? "";

        if (method === "DELETE") {
          const productId = path.split("/").at(-1) ?? "";
          const index = demoProducts.findIndex((product) => product.id === productId);
          if (index >= 0) demoProducts.splice(index, 1);
          return getJsonResponse({ success: true });
        }

        if (method === "PUT" || method === "POST") {
          const product = body as Record<string, unknown>;
          if (product && typeof product.id === "string" && product.id) {
            const index = demoProducts.findIndex((item) => item.id === product.id);
            if (index >= 0) demoProducts[index] = { ...demoProducts[index], ...product } as (typeof demoProducts)[number];
          }
          return getJsonResponse({ success: true });
        }

        if (slug && slug !== "admin") {
          return getJsonResponse({
            restaurant: { name: "Nomi Coffee House" },
            products: demoProducts.map((product) => ({
              ...product,
              imageUrl: product.imageUrl,
            })),
          });
        }

        return getJsonResponse(demoProducts);
      }

      if (lowerPath.includes("/api/languages/menu/")) {
        return getJsonResponse(demoLanguages);
      }

      if (lowerPath.includes("/api/languages")) {
        return getJsonResponse(demoLanguages);
      }

      if (lowerPath.includes("/api/translations/auto")) {
        return getJsonResponse({
          text: "Demo translation ready.",
          translations: [{ languageCode: "es", translatedText: "Traducción de demostración." }],
        });
      }

      if (lowerPath.includes("/api/uploads")) {
        return getJsonResponse({ url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80" });
      }

      if (lowerPath.includes("/api/auth/credentials")) {
        return getJsonResponse({ message: "Credentials updated in demo mode." });
      }
    }

    return originalFetch(input, init);
  }) as typeof window.fetch;
}

export { DEMO_MODE };
