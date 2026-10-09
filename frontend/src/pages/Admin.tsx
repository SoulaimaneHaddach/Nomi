import { startTransition, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";
import type { FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";

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
  sourceLanguageCode: string;
  translations: Array<{
    languageCode: string;
    name: string;
    description: string;
    language: Language;
  }>;
};

type Language = {
  code: string;
  name: string;
  nativeName: string;
  direction: string;
};

type TranslationDraft = {
  languageCode: string;
  name: string;
  description: string;
};

type Workspace = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  role: string;
};

const categories = ["Coffee", "Breakfast", "Food", "Desserts", "Drinks"];

function LoginGate({ onUnlock, onBack, onForgotPassword }: { onUnlock: (token: string) => void; onBack: () => void; onForgotPassword: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/owner-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        <span className="nomi-admin-kicker">Nomi / Private</span>
        <h1 id="admin-gate-title">Private menu access</h1>
        <p className="nomi-demo-note">Demo access: use any email and password. PIN is 1234.</p>
        <form onSubmit={(event) => { event.preventDefault(); void handleLogin(); }}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="owner@example.com"
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
          <button className="nomi-admin-submit" type="submit" disabled={isSubmitting || !email || !password}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
          <button type="button" className="nomi-admin-back" onClick={onForgotPassword}>Forgot password?</button>
        <button type="button" className="nomi-admin-back" onClick={onBack}>
          Back to menu
        </button>
        </section>
      </main>
    </>
  );
}

function PinGate({ token, onUnlock, onBack }: { token: string; onUnlock: () => void; onBack: () => void }) {
  const [pin, setPin] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pressKey = (key: string) => {
    if (isSubmitting || pin.length >= 4) return;
    const nextPin = `${pin}${key}`;
    setPin(nextPin);
    setError("");
    if (nextPin.length === 4) void verify(nextPin);
  };

  const verify = async (value = pin) => {
    if (value.length !== 4) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/pin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pin: value }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "Incorrect PIN");
      onUnlock();
    } catch (verifyError) {
      setPin("");
      setError(verifyError instanceof Error ? verifyError.message : "Incorrect PIN");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recover = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/auth/pin/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: accountPassword, newPin, confirmPin }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "Unable to reset dashboard PIN.");
      onUnlock();
    } catch (recoveryError) {
      setError(recoveryError instanceof Error ? recoveryError.message : "Unable to reset dashboard PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-gate nomi-pin-gate" aria-labelledby="pin-gate-title">
          <span className="nomi-admin-kicker">Nomi / Private</span>
          {!isRecovering ? (
            <>
              <h1 id="pin-gate-title">Unlock dashboard</h1>
              <p>Enter your dashboard PIN to continue.</p>
              <div className="nomi-pin-display" aria-label={`${pin.length} of 4 digits entered`}>
                {Array.from({ length: 4 }, (_, index) => <span key={index} className={index < pin.length ? "is-filled" : ""} />)}
              </div>
              <div className="nomi-pin-keypad" aria-label="PIN keypad">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
                  <button type="button" key={key} onClick={() => pressKey(key)} disabled={isSubmitting}>{key}</button>
                ))}
                <button type="button" onClick={() => setPin("")} disabled={isSubmitting}>Clear</button>
                <button type="button" onClick={() => pressKey("0")} disabled={isSubmitting}>0</button>
                <button type="button" onClick={() => setPin((current) => current.slice(0, -1))} disabled={isSubmitting}>Back</button>
              </div>
              <button type="button" className="nomi-admin-back" onClick={() => { setError(""); setIsRecovering(true); }}>Forgot PIN?</button>
            </>
          ) : (
            <form onSubmit={(event) => void recover(event)}>
              <h1 id="pin-gate-title">Reset dashboard PIN</h1>
              <p>Verify your account password, then choose a new 4-digit PIN.</p>
              <label htmlFor="pin-recovery-password">Account password</label>
              <input id="pin-recovery-password" type="password" autoComplete="current-password" required value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} />
              <label htmlFor="pin-recovery-new">New 4-digit PIN</label>
              <input id="pin-recovery-new" type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required value={newPin} onChange={(event) => setNewPin(event.target.value)} />
              <label htmlFor="pin-recovery-confirm">Confirm PIN</label>
              <input id="pin-recovery-confirm" type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required value={confirmPin} onChange={(event) => setConfirmPin(event.target.value)} />
              <button className="nomi-admin-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Resetting PIN..." : "Reset PIN"}</button>
              <button type="button" className="nomi-admin-back" onClick={() => { setError(""); setIsRecovering(false); }}>Back to PIN</button>
            </form>
          )}
          {error && <span className="nomi-admin-error">{error}</span>}
          {isSubmitting && !isRecovering && <p className="nomi-pin-status">Checking PIN...</p>}
          <button type="button" className="nomi-admin-back" onClick={onBack}>Back to menu</button>
        </section>
      </main>
    </>
  );
}

function Dashboard({ token, onLock, onLogout, onTokenChange }: { token: string; onLock: (slug?: string) => void; onLogout: () => void; onTokenChange: (token: string) => void }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCredentialsEditorOpen, setIsCredentialsEditorOpen] = useState(false);
  const [isPinEditorOpen, setIsPinEditorOpen] = useState(false);
  const [pinConfigured, setPinConfigured] = useState<boolean | null>(null);
  const [pinError, setPinError] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [sourceLanguageCode, setSourceLanguageCode] = useState("");
  const [translationDrafts, setTranslationDrafts] = useState<TranslationDraft[]>([]);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");
  const [isTranslating, setIsTranslating] = useState<number | null>(null);
  const productEditorRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

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

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json() as Promise<{ restaurants?: Workspace[] }>)
      .then((data) => setWorkspace(data.restaurants?.[0] ?? null))
      .catch(() => setWorkspace(null));
  }, [token]);

  useEffect(() => {
    fetch(`${API_URL}/api/auth/pin`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json() as Promise<{ configured?: boolean }>)
      .then((data) => setPinConfigured(Boolean(data.configured)))
      .catch(() => setPinConfigured(false));
  }, [token]);

  useEffect(() => {
    fetch(`${API_URL}/api/languages`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load supported languages.");
        return response.json() as Promise<Language[]>;
      })
      .then((loadedLanguages) => {
        setLanguages(loadedLanguages);
        setSourceLanguageCode((current) => current || loadedLanguages[0]?.code || "");
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load supported languages.");
      });
  }, []);

  const openProductEditor = (product: AdminProduct | null) => {
    setEditingProduct(product);
    setSourceLanguageCode(product?.sourceLanguageCode ?? languages[0]?.code ?? "");
    setTranslationDrafts(product?.translations
      .filter((translation) => translation.languageCode !== product.sourceLanguageCode)
      .map(({ languageCode, name, description }) => ({ languageCode, name, description })) ?? []);
    setTranslationSearch("");
    setIsLanguagePickerOpen(false);
    setIsEditorOpen(true);
  };

  const addTranslation = (languageCode: string) => {
    if (languageCode === sourceLanguageCode || translationDrafts.some((translation) => translation.languageCode === languageCode)) return;
    setTranslationDrafts((current) => [...current, { languageCode, name: "", description: "" }]);
    setTranslationSearch("");
    setIsLanguagePickerOpen(false);
  };

  const updateTranslation = (index: number, field: "name" | "description", value: string) => {
    setTranslationDrafts((current) => current.map((translation, translationIndex) => translationIndex === index ? { ...translation, [field]: value } : translation));
  };

  const autoTranslate = async (index: number) => {
    const draft = translationDrafts[index];
    const form = productEditorRef.current;
    const name = form?.elements.namedItem("name") as HTMLInputElement | null;
    const description = form?.elements.namedItem("description") as HTMLInputElement | null;
    if (!draft || !name?.value || !description?.value || !sourceLanguageCode) {
      setError("Enter the original product name and description first.");
      return;
    }

    setIsTranslating(index);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/translations/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.value,
          description: description.value,
          sourceLanguageCode,
          targetLanguageCode: draft.languageCode,
        }),
      });
      const data = (await response.json().catch(() => null)) as { name?: string; description?: string; message?: string } | null;
      if (!response.ok || !data?.name || !data.description) throw new Error(data?.message ?? "Unable to auto translate.");
      setTranslationDrafts((current) => current.map((translation, translationIndex) => translationIndex === index ? { ...translation, name: data.name as string, description: data.description as string } : translation));
    } catch (translationError) {
      setError(translationError instanceof Error ? translationError.message : "Unable to auto translate.");
    } finally {
      setIsTranslating(null);
    }
  };

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
      sourceLanguageCode,
      translations: translationDrafts,
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
        newEmail: formData.get("newEmail"),
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

  const savePin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${API_URL}/api/auth/pin`, {
      method: pinConfigured ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currentPin: formData.get("currentPin"),
        pin: formData.get("newPin"),
        newPin: formData.get("newPin"),
        confirmPin: formData.get("confirmPin"),
      }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setPinError(data?.message ?? "Unable to save PIN.");
      return;
    }
    setPinConfigured(true);
    setPinError("");
    setIsPinEditorOpen(false);
    event.currentTarget.reset();
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-dashboard" aria-labelledby="admin-title">
        <header className="nomi-admin-header nomi-owner-admin-header">
          <div>
            <span className="nomi-admin-kicker">Nomi / Private</span>
            <h1 id="admin-title">Menu dashboard</h1>
            <p>Keep your business menu current from one quiet workspace.</p>
          </div>
          <button type="button" className="nomi-admin-lock nomi-admin-logout" onClick={onLogout}>
            Log out
          </button>
          <div className="nomi-admin-header-actions">
            <button type="button" className="nomi-admin-lock" onClick={() => onLock(workspace?.slug)}>
              Show Menu
            </button>
            <button type="button" className="nomi-admin-lock" onClick={() => setIsCredentialsEditorOpen((open) => !open)}>
              Change username &amp; password
            </button>
            <button type="button" className="nomi-admin-lock" onClick={() => { setPinError(""); setIsPinEditorOpen((open) => !open); }}>
              {pinConfigured ? "Change PIN" : "Set up PIN"}
            </button>
          </div>
        </header>

        {workspace && (
          <section className="nomi-admin-workspace" aria-labelledby="workspace-title">
            <div>
              <span className="nomi-admin-kicker">Current workspace</span>
              <h2 id="workspace-title">{workspace.name}</h2>
              <p>Public menu: {window.location.origin}/{workspace.slug}</p>
            </div>
            <QRCodeSVG value={`${window.location.origin}/${workspace.slug}`} size={96} bgColor="#fffdf8" fgColor="#2b2320" level="M" />
          </section>
        )}

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
              New email
              <input name="newEmail" required type="email" autoComplete="username" />
            </label>
            <label>
              New password
              <input name="newPassword" required minLength={12} type="password" autoComplete="new-password" />
            </label>
            <button type="submit">Save credentials</button>
          </form>
        )}

        {isPinEditorOpen && (
          <form className="nomi-admin-credentials-editor" onSubmit={(event) => void savePin(event)}>
            <div>
              <span className="nomi-admin-kicker">Dashboard security</span>
              <h2>{pinConfigured ? "Change PIN" : "Set up PIN"}</h2>
              <p>Use exactly 4 digits. Your PIN is stored securely and is separate from your account password.</p>
            </div>
            {pinConfigured && <label>Current PIN<input name="currentPin" required inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} type="password" /></label>}
            <label>New PIN<input name="newPin" required inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} type="password" /></label>
            <label>Confirm PIN<input name="confirmPin" required inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} type="password" /></label>
            {pinError && <span className="nomi-admin-error">{pinError}</span>}
            <button type="submit">Save PIN</button>
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
            <button type="button" onClick={() => openProductEditor(null)}>
              Add item
            </button>
          </div>
          {error && <span className="nomi-admin-error">{error}</span>}
          {isEditorOpen && (
            <form ref={productEditorRef} className="nomi-admin-editor" onSubmit={(event) => void saveProduct(event)}>
              <input name="name" required placeholder="Product name" defaultValue={editingProduct?.name ?? ""} />
              <input name="description" required placeholder="Description" defaultValue={editingProduct?.description ?? ""} />
              <input name="price" required type="number" min="0" step="0.01" placeholder="Price" defaultValue={editingProduct?.price ?? ""} />
              <input name="image" type="file" accept="image/*" />
              <input name="imageUrl" placeholder="Existing image URL (optional)" defaultValue={editingProduct?.imageUrl ?? ""} />
              <select name="sourceLanguageCode" value={sourceLanguageCode} onChange={(event) => setSourceLanguageCode(event.target.value)} required>
                {languages.map((language) => <option key={language.code} value={language.code}>{language.nativeName} ({language.name})</option>)}
              </select>
              <select name="category" defaultValue={editingProduct?.category ?? categories[0]}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <label className="nomi-admin-availability">
                <input name="isVisible" type="checkbox" defaultChecked={editingProduct?.isVisible ?? true} />
                Available on public menu
              </label>
              <section className="nomi-admin-translations" aria-labelledby="translations-title">
                <div className="nomi-admin-translations-heading">
                  <div>
                    <span className="nomi-admin-kicker">Product content</span>
                    <h3 id="translations-title">Translations</h3>
                  </div>
                  <button type="button" className="nomi-admin-add-language" onClick={() => setIsLanguagePickerOpen((open) => !open)}>+ Add language</button>
                </div>
                {isLanguagePickerOpen && (
                  <div className="nomi-admin-language-picker">
                    <input value={translationSearch} onChange={(event) => setTranslationSearch(event.target.value)} placeholder="Search languages" aria-label="Search languages" autoFocus />
                    <div className="nomi-admin-language-options">
                      {languages
                        .filter((language) => language.code !== sourceLanguageCode && !translationDrafts.some((translation) => translation.languageCode === language.code))
                        .filter((language) => `${language.name} ${language.nativeName} ${language.code}`.toLowerCase().includes(translationSearch.toLowerCase()))
                        .map((language) => <button type="button" key={language.code} onClick={() => addTranslation(language.code)}>{language.nativeName} <span>{language.name}</span></button>)}
                    </div>
                  </div>
                )}
                {translationDrafts.map((translation, index) => {
                  const language = languages.find((item) => item.code === translation.languageCode);
                  return (
                    <div className="nomi-admin-translation-row" key={translation.languageCode}>
                      <div className="nomi-admin-translation-label"><strong>{language?.nativeName ?? translation.languageCode}</strong><span>{language?.name}</span></div>
                      <input value={translation.name} onChange={(event) => updateTranslation(index, "name", event.target.value)} placeholder="Translated name" required />
                      <textarea value={translation.description} onChange={(event) => updateTranslation(index, "description", event.target.value)} placeholder="Translated description" required />
                      <button type="button" onClick={() => void autoTranslate(index)} disabled={isTranslating === index}>{isTranslating === index ? "Translating..." : "Auto translate"}</button>
                      <button type="button" className="nomi-admin-remove-translation" onClick={() => setTranslationDrafts((current) => current.filter((_, translationIndex) => translationIndex !== index))}>Remove</button>
                    </div>
                  );
                })}
              </section>
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
                  <button type="button" onClick={() => openProductEditor(product)}>
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
  const [requiresPin, setRequiresPin] = useState(() => Boolean(sessionStorage.getItem(ADMIN_SESSION_KEY)));
  const [pinStatus, setPinStatus] = useState<"checking" | "configured" | "missing">("checking");

  useEffect(() => {
    if (!token || !requiresPin) return;
    fetch(`${API_URL}/api/auth/pin`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json() as Promise<{ configured?: boolean }>)
      .then((data) => setPinStatus(data.configured ? "configured" : "missing"))
      .catch(() => setPinStatus("missing"));
  }, [token, requiresPin]);

  const lockDashboard = (slug?: string) => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setToken(null);
    setRequiresPin(false);

    const nextSlug = typeof slug === "string" && slug.trim() ? slug.trim() : "";
    navigate(nextSlug ? `/${nextSlug}` : "/");
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setToken(null);
    setRequiresPin(false);
    navigate("/admin");
  };

  const unlockDashboard = (token: string) => {
    sessionStorage.setItem(ADMIN_SESSION_KEY, token);
    setRequiresPin(true);
    setToken(token);
    navigate("/admin");
  };

  if (!token) return <LoginGate onUnlock={unlockDashboard} onBack={() => navigate("/")} onForgotPassword={() => navigate("/password-recovery")} />;
  if (requiresPin && pinStatus === "checking") return <LoginGate onUnlock={unlockDashboard} onBack={() => navigate("/")} onForgotPassword={() => navigate("/password-recovery")} />;
  if (requiresPin && pinStatus === "configured") return <PinGate token={token} onUnlock={() => setRequiresPin(false)} onBack={() => navigate("/")} />;
  return <Dashboard token={token} onLock={lockDashboard} onLogout={logout} onTokenChange={unlockDashboard} />;
}
