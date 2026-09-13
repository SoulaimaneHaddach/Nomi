import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";
import type { FormEvent } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const PLATFORM_SESSION_KEY = "nomi-platform-session";

type PlatformRestaurant = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  menuViews: number;
  createdAt: string;
  lastActivityAt: string;
  owner: { name: string | null; email: string } | null;
  products: number;
  categories: number;
};

export default function Platform() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() =>
    sessionStorage.getItem(PLATFORM_SESSION_KEY),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurants, setRestaurants] = useState<PlatformRestaurant[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => null)) as {
      token?: string;
      user?: { role?: string };
      message?: string;
    } | null;
    if (!response.ok || !data?.token || data.user?.role !== "PLATFORM_ADMIN") {
      setError("Platform administrator credentials are required.");
      return;
    }
    sessionStorage.setItem(PLATFORM_SESSION_KEY, data.token);
    setToken(data.token);
  };

  useEffect(() => {
    if (!token) return;
    const query = new URLSearchParams({ ...(search && { search }), ...(statusFilter !== "ALL" && { status: statusFilter }) });
    fetch(`${API_URL}/api/platform/restaurants?${query}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load business workspaces.");
        return response.json() as Promise<PlatformRestaurant[]>;
      })
      .then(setRestaurants)
      .catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : "Unable to load business workspaces."))
      .finally(() => setIsLoading(false));
  }, [token, search, statusFilter]);

  const updateStatus = async (restaurant: PlatformRestaurant) => {
    const nextStatus = restaurant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const response = await fetch(`${API_URL}/api/platform/restaurants/${restaurant.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!response.ok) {
      setError("Unable to update business status.");
      return;
    }
    setRestaurants((current) => current.map((item) => item.id === restaurant.id ? { ...item, status: nextStatus } : item));
  };

  const totalViews = restaurants.reduce((sum, restaurant) => sum + restaurant.menuViews, 0);
  const activeCount = restaurants.filter((restaurant) => restaurant.status === "ACTIVE").length;
  const suspendedCount = restaurants.length - activeCount;

  if (!token) {
    return (
      <>
        <DecorativeBackground />
        <main className="nomi-admin-shell">
          <section className="nomi-admin-gate">
            <span className="nomi-admin-kicker">Nomi Platform</span>
            <h1>Platform access</h1>
            <p>Manage business workspaces created by their owners.</p>
            <form onSubmit={(event) => void login(event)}>
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && <span className="nomi-admin-error">{error}</span>}
              <button className="nomi-admin-submit" type="submit">
                Sign in
              </button>
            </form>
            <button
              type="button"
              className="nomi-admin-back"
              onClick={() => navigate("/")}>
              Back to menu
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-dashboard">
          <header className="nomi-admin-header">
            <div>
              <span className="nomi-admin-kicker">Nomi Platform</span>
              <h1>Platform Admin dashboard</h1>
              <p>
                Business owners create their own accounts from the Nomi homepage.
              </p>
            </div>
            <button
              type="button"
              className="nomi-admin-lock"
              onClick={() => {
                sessionStorage.removeItem(PLATFORM_SESSION_KEY);
                setToken(null);
              }}>
              Lock platform
            </button>
          </header>
          <div className="nomi-admin-metrics">
            <article><span>Total businesses</span><strong>{restaurants.length}</strong></article>
            <article><span>Active</span><strong>{activeCount}</strong></article>
            <article><span>Suspended</span><strong>{suspendedCount}</strong></article>
            <article><span>Menu views</span><strong>{totalViews}</strong></article>
          </div>
          <section className="nomi-admin-section" aria-labelledby="platform-workspaces-title">
            <div className="nomi-admin-section-heading">
              <div>
                <span className="nomi-admin-kicker">Platform operations</span>
                <h2 id="platform-workspaces-title">Business workspaces</h2>
              </div>
              <div className="nomi-platform-filters">
                <input aria-label="Search businesses" placeholder="Search businesses or owners" value={search} onChange={(event) => setSearch(event.target.value)} />
                <select aria-label="Filter business status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            {error && <span className="nomi-admin-error">{error}</span>}
            {isLoading && <p className="nomi-platform-empty">Loading workspaces...</p>}
            {!isLoading && restaurants.length === 0 && <p className="nomi-platform-empty">No businesses match this view.</p>}
            <div className="nomi-platform-table" role="table" aria-label="Business workspaces">
              {restaurants.map((restaurant) => (
                <article className="nomi-platform-row" role="row" key={restaurant.id}>
                  <div className="nomi-platform-business"><strong>{restaurant.name}</strong><span>/{restaurant.slug}</span></div>
                  <div><strong>{restaurant.owner?.name ?? "Owner"}</strong><span>{restaurant.owner?.email ?? "No owner email"}</span></div>
                  <div><span>Products · {restaurant.products}</span><span>Categories · {restaurant.categories}</span></div>
                  <div><span>Views · {restaurant.menuViews}</span><span>Created · {new Date(restaurant.createdAt).toLocaleDateString()}</span><span>Active · {new Date(restaurant.lastActivityAt).toLocaleDateString()}</span></div>
                  <div className="nomi-platform-status-actions"><span className={`nomi-platform-status is-${restaurant.status.toLowerCase()}`}>{restaurant.status}</span><button type="button" onClick={() => void updateStatus(restaurant)}>{restaurant.status === "ACTIVE" ? "Suspend" : "Activate"}</button></div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
