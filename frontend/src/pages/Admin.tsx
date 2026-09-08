import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";
import type { FormEvent } from "react";

const ADMIN_SESSION_KEY = "nomi-admin-session";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  isVisible: boolean;
};

const categories = ["Coffee", "Breakfast", "Food", "Desserts", "Drinks"];

function LoginGate({ onUnlock, onBack }: { onUnlock: (token: string) => void; onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password.");
      }

      const data = (await response.json()) as { token: string };
      onUnlock(data.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-gate" aria-labelledby="admin-gate-title">
        <span className="nomi-admin-kicker">Nomi Café</span>
        <h1 id="admin-gate-title">Private menu access</h1>
        <p>Sign in to manage the café menu.</p>
        <form onSubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            aria-invalid={Boolean(error)}
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            aria-invalid={Boolean(error)}
          />
          {error && <span className="nomi-admin-error">{error}</span>}
          <button className="nomi-admin-submit" type="submit" disabled={isSubmitting || !username || !password}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <button type="button" className="nomi-admin-back" onClick={onBack}>
          Back to menu
        </button>
        </section>
      </main>
    </>
  );
}

function Dashboard({ token, onLock, onTokenChange }: { token: string; onLock: () => void; onTokenChange: (token: string) => void }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCredentialsEditorOpen, setIsCredentialsEditorOpen] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    const response = await fetch(`${API_URL}/api/products/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Unable to load products.");
    }
    setProducts((await response.json()) as AdminProduct[]);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/products/admin`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load products.");
        }
        return response.json() as Promise<AdminProduct[]>;
      })
      .then((loadedProducts) => {
        startTransition(() => setProducts(loadedProducts));
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load products.");
      });
  }, [token]);

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let imageUrl = String(formData.get("imageUrl") ?? "");
    const imageFile = formData.get("image") as File | null;

    if (imageFile?.size) {
      const uploadData = new FormData();
      uploadData.append("image", imageFile);
      const uploadResponse = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      if (!uploadResponse.ok) {
        setError("Unable to upload image.");
        return;
      }

      const uploaded = (await uploadResponse.json()) as { imageUrl: string };
      imageUrl = uploaded.imageUrl;
    }

    const payload = {
      name: String(formData.get("name")),
      description: String(formData.get("description")),
      price: Number(formData.get("price")),
      imageUrl,
      category: String(formData.get("category")),
      currency: "DH",
      isVisible: formData.get("isVisible") === "on",
    };

    const response = await fetch(
      editingProduct ? `${API_URL}/api/products/${editingProduct.id}` : `${API_URL}/api/products`,
      {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      setError("Unable to save product.");
      return;
    }

    setIsEditorOpen(false);
    setEditingProduct(null);
    setError("");
    await loadProducts();
  };

  const removeProduct = async (product: AdminProduct) => {
    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setProductToDelete(null);
    } else {
      setError("Unable to delete product.");
    }
  };

  const toggleProductVisibility = async (product: AdminProduct) => {
    const isVisible = !product.isVisible;
    setProducts((currentProducts) => currentProducts.map((item) => item.id === product.id ? { ...item, isVisible } : item));

    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isVisible }),
    });

    if (!response.ok) {
      setProducts((currentProducts) => currentProducts.map((item) => item.id === product.id ? product : item));
      setError("Unable to update public menu availability.");
    }
  };

  const changeCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${API_URL}/api/auth/credentials`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newUsername: formData.get("newUsername"),
        newPassword: formData.get("newPassword"),
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message ?? "Unable to update username and password.");
      return;
    }

    const data = (await response.json()) as { token: string };
    onTokenChange(data.token);
    setError("");
    setIsCredentialsEditorOpen(false);
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-dashboard" aria-labelledby="admin-title">
        <header className="nomi-admin-header">
          <div>
            <span className="nomi-admin-kicker">Nomi Café / Private</span>
            <h1 id="admin-title">Menu dashboard</h1>
            <p>Keep the café menu current from one quiet workspace.</p>
          </div>
          <button type="button" className="nomi-admin-lock" onClick={onLock}>
            Lock dashboard
          </button>
          <button type="button" className="nomi-admin-lock" onClick={() => setIsCredentialsEditorOpen((open) => !open)}>
            Change username &amp; password
          </button>
        </header>

        {isCredentialsEditorOpen && (
          <form className="nomi-admin-credentials-editor" onSubmit={(event) => void changeCredentials(event)}>
            <div>
              <span className="nomi-admin-kicker">Account security</span>
              <h2>Update owner access</h2>
              <p>Use a strong password. This replaces the old PIN shortcut.</p>
            </div>
            <label>
              Current password
              <input name="currentPassword" required type="password" autoComplete="current-password" />
            </label>
            <label>
              New username
              <input name="newUsername" required minLength={3} autoComplete="username" />
            </label>
            <label>
              New password
              <input name="newPassword" required minLength={12} type="password" autoComplete="new-password" />
            </label>
            <button type="submit">Save credentials</button>
          </form>
        )}

        <div className="nomi-admin-metrics">
          <article>
            <span>Menu sections</span>
            <strong>5</strong>
          </article>
          <article>
            <span>Visible items</span>
            <strong>{products.filter((product) => product.isVisible).length}</strong>
          </article>
          <article>
            <span>Menu status</span>
            <strong>Live</strong>
          </article>
        </div>

        <section className="nomi-admin-section" aria-labelledby="category-summary-title">
          <div className="nomi-admin-section-heading">
            <h2 id="category-summary-title">Category overview</h2>
            <button type="button" onClick={() => { setEditingProduct(null); setIsEditorOpen(true); }}>
              Add item
            </button>
          </div>
          {error && <span className="nomi-admin-error">{error}</span>}
          {isEditorOpen && (
            <form className="nomi-admin-editor" onSubmit={(event) => void saveProduct(event)}>
              <input name="name" required placeholder="Product name" defaultValue={editingProduct?.name ?? ""} />
              <input name="description" required placeholder="Description" defaultValue={editingProduct?.description ?? ""} />
              <input name="price" required type="number" min="0" step="0.01" placeholder="Price" defaultValue={editingProduct?.price ?? ""} />
              <input name="image" type="file" accept="image/*" />
              <input name="imageUrl" placeholder="Existing image URL (optional)" defaultValue={editingProduct?.imageUrl ?? ""} />
              <select name="category" defaultValue={editingProduct?.category ?? categories[0]}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <label className="nomi-admin-availability">
                <input name="isVisible" type="checkbox" defaultChecked={editingProduct?.isVisible ?? true} />
                Available on public menu
              </label>
              <button type="submit">Save product</button>
              <button type="button" className="nomi-admin-cancel" onClick={() => setIsEditorOpen(false)}>Cancel</button>
            </form>
          )}
          <div className="nomi-admin-table" role="table" aria-label="Menu category overview">
            {products.map((product) => (
              <div className="nomi-admin-row" role="row" key={product.id}>
                <strong role="cell">{product.name}</strong>
                <span role="cell">{product.category} · {product.price} DH</span>
                <span className="nomi-admin-status" role="cell">{product.isVisible ? "Live" : "Hidden"}</span>
                <label className="nomi-admin-row-availability" role="cell">
                  <input
                    type="checkbox"
                    checked={product.isVisible}
                    aria-label={`Make ${product.name} available on the public menu`}
                    onChange={() => void toggleProductVisibility(product)}
                  />
                  <span className="nomi-admin-switch" aria-hidden="true" />
                  <span className="nomi-admin-availability-copy">
                    <strong>Public menu</strong>
                    <small>{product.isVisible ? "On" : "Off"}</small>
                  </span>
                </label>
                <div className="nomi-admin-actions" role="cell">
                  <button type="button" onClick={() => { setEditingProduct(product); setIsEditorOpen(true); }}>
                    Edit
                  </button>
                  <button type="button" className="nomi-admin-delete" onClick={() => setProductToDelete(product)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        {productToDelete && (
          <div className="nomi-admin-confirm-backdrop" role="presentation">
            <section className="nomi-admin-confirm" role="dialog" aria-modal="true" aria-labelledby="delete-title">
              <span className="nomi-admin-kicker">Permanent action</span>
              <h2 id="delete-title">Delete {productToDelete.name}?</h2>
              <p>This removes the product from the database and public menu.</p>
              <div className="nomi-admin-confirm-actions">
                <button type="button" className="nomi-admin-cancel" onClick={() => setProductToDelete(null)}>
                  Keep item
                </button>
                <button type="button" className="nomi-admin-delete-confirm" onClick={() => void removeProduct(productToDelete)}>
                  Delete item
                </button>
              </div>
            </section>
          </div>
        )}
        </section>
      </main>
    </>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY));

  const lockDashboard = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setToken(null);
  };

  const unlockDashboard = (token: string) => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, token);
    setToken(token);
  };

  return token ? (
    <Dashboard token={token} onLock={lockDashboard} onTokenChange={unlockDashboard} />
  ) : (
    <LoginGate onUnlock={unlockDashboard} onBack={() => navigate("/")} />
  );
}
