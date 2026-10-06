import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/password/${token ? "reset" : "forgot"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password, confirmPassword } : { email }),
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? "Unable to process password recovery.");

      if (token) {
        setIsComplete(true);
        setMessage(data?.message ?? "Password reset successfully.");
      } else {
        setMessage(data?.message ?? "If an account exists for that email, reset instructions will be sent.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to process password recovery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-gate" aria-labelledby="password-recovery-title">
          <span className="nomi-admin-kicker">Nomi / Account recovery</span>
          <h1 id="password-recovery-title">{isComplete ? "Password updated" : token ? "Choose a new password" : "Forgot your password?"}</h1>
          {!token && <p>Enter your account email and we’ll send a password reset link if an account exists.</p>}
          {token && !isComplete && <p>Choose a new password with at least 12 characters.</p>}
          {isComplete ? (
            <>
              <p>{message}</p>
              <button type="button" className="nomi-admin-submit" onClick={() => navigate("/admin")}>Owner sign in</button>
              <button type="button" className="nomi-admin-back" onClick={() => navigate("/platform")}>Platform sign in</button>
            </>
          ) : (
            <form onSubmit={(event) => void submit(event)}>
              {!token ? (
                <>
                  <label htmlFor="recovery-email">Account email</label>
                  <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                </>
              ) : (
                <>
                  <label htmlFor="recovery-password">New password</label>
                  <input id="recovery-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
                  <label htmlFor="recovery-confirm-password">Confirm new password</label>
                  <input id="recovery-confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </>
              )}
              {error && <span className="nomi-admin-error">{error}</span>}
              {message && <p role="status">{message}</p>}
              <button className="nomi-admin-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : token ? "Reset password" : "Send reset link"}
              </button>
              <button type="button" className="nomi-admin-back" onClick={() => navigate("/admin")}>Back to sign in</button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
