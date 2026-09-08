import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";

const ADMIN_SESSION_KEY = "nomi-admin-session";
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN ?? "0000";

const categorySummary = [
  { name: "Coffee", items: 4, status: "Live" },
  { name: "Breakfast", items: 4, status: "Live" },
  { name: "Food", items: 3, status: "Live" },
  { name: "Desserts", items: 3, status: "Live" },
  { name: "Drinks", items: 3, status: "Live" },
];

function PinGate({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const appendDigit = (digit: string) => {
    if (pin.length >= 8) {
      return;
    }

    const nextPin = `${pin}${digit}`;
    setPin(nextPin);
    setError("");

    if (nextPin === ADMIN_PIN) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "unlocked");
      onUnlock();
      return;
    }

    if (nextPin.length >= ADMIN_PIN.length) {
      setPin("");
      setError("That access code is not valid.");
    }
  };

  return (
    <>
      <DecorativeBackground />
      <main className="nomi-admin-shell">
        <section className="nomi-admin-gate" aria-labelledby="admin-gate-title">
        <span className="nomi-admin-kicker">Nomi Café</span>
        <h1 id="admin-gate-title">Private menu access</h1>
        <p>Enter the access code to open the café dashboard.</p>
        <div>
          <label htmlFor="admin-pin">Access code</label>
          <input
            id="admin-pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            readOnly
            placeholder="----"
            aria-invalid={Boolean(error)}
          />
          <div className="nomi-admin-keypad" aria-label="Access code keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button type="button" key={digit} onClick={() => appendDigit(digit)}>
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => setPin("")}>Clear</button>
            <button type="button" onClick={() => appendDigit("0")}>0</button>
            <button type="button" onClick={() => setPin((currentPin) => currentPin.slice(0, -1))}>
              Del
            </button>
          </div>
          {error && <span className="nomi-admin-error">{error}</span>}
        </div>
        <button type="button" className="nomi-admin-back" onClick={onBack}>
          Back to menu
        </button>
        </section>
      </main>
    </>
  );
}

function Dashboard({ onLock }: { onLock: () => void }) {
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
        </header>

        <div className="nomi-admin-metrics">
          <article>
            <span>Menu sections</span>
            <strong>5</strong>
          </article>
          <article>
            <span>Visible items</span>
            <strong>17</strong>
          </article>
          <article>
            <span>Menu status</span>
            <strong>Live</strong>
          </article>
        </div>

        <section className="nomi-admin-section" aria-labelledby="category-summary-title">
          <div className="nomi-admin-section-heading">
            <h2 id="category-summary-title">Category overview</h2>
            <button type="button">Add item</button>
          </div>
          <div className="nomi-admin-table" role="table" aria-label="Menu category overview">
            {categorySummary.map((category) => (
              <div className="nomi-admin-row" role="row" key={category.name}>
                <strong role="cell">{category.name}</strong>
                <span role="cell">{category.items} items</span>
                <span className="nomi-admin-status" role="cell">{category.status}</span>
                <button type="button" role="cell" aria-label={`Edit ${category.name}`}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>
        </section>
      </main>
    </>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "unlocked",
  );

  const lockDashboard = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setUnlocked(false);
  };

  return unlocked ? (
    <Dashboard onLock={lockDashboard} />
  ) : (
    <PinGate onUnlock={() => setUnlocked(true)} onBack={() => navigate("/")} />
  );
}
