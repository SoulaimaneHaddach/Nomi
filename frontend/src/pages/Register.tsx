import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";
import { Mascot } from "../components/Header";
import type { FormEvent } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const ADMIN_SESSION_KEY = "nomi-admin-session";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: formData.get("restaurantName"),
          ownerName: formData.get("ownerName"),
          email: formData.get("email"),
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const data = (await response.json().catch(() => null)) as { token?: string; message?: string } | null;
      if (!response.ok || !data?.token) throw new Error(data?.message ?? "Unable to create business account.");
      sessionStorage.setItem(ADMIN_SESSION_KEY, data.token);
      navigate("/admin");
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Unable to create business account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-gate nomi-register-gate" aria-labelledby="registration-title">
          <div className="nomi-register-brand">
            <div className="nomi-register-mascot"><Mascot /></div>
            <div>
              <span className="nomi-admin-kicker">Nomi for businesses</span>
              <span className="nomi-register-brand-name">Nomi</span>
            </div>
          </div>
          <h1 id="registration-title">Create your business account</h1>
          <p>Build your digital menu and share it with every guest.</p>
          <form className="nomi-register-form" onSubmit={(event) => void register(event)}>
            <label htmlFor="restaurant-name"><span>Business name</span><input id="restaurant-name" name="restaurantName" required autoComplete="organization" placeholder="e.g. Nomi Coffee" /></label>
            <label htmlFor="owner-name"><span>Owner name</span><input id="owner-name" name="ownerName" required autoComplete="name" placeholder="Your full name" /></label>
            <label className="nomi-register-wide" htmlFor="owner-email"><span>Email address</span><input id="owner-email" name="email" type="email" required autoComplete="email" placeholder="you@business.com" /></label>
            <label htmlFor="owner-password"><span>Password</span><input id="owner-password" name="password" type="password" minLength={12} required autoComplete="new-password" placeholder="At least 12 characters" /></label>
            <label htmlFor="confirm-password"><span>Confirm password</span><input id="confirm-password" name="confirmPassword" type="password" minLength={12} required autoComplete="new-password" placeholder="Repeat your password" /></label>
            {error && <span className="nomi-admin-error">{error}</span>}
            <button className="nomi-admin-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create business account"}
            </button>
          </form>
          <button type="button" className="nomi-admin-back" onClick={() => navigate("/")}>Back to Nomi</button>
        </section>
      </main>
    </>
  );
}
