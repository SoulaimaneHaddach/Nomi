// components/Header.tsx
import LanguageSwitcher from "./LanguageSwitcher";
import FloatingSymbol from "./FloatingSymbol";
import { FLOATING_SYMBOLS } from "./floatingSymbols";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

type HeaderProps = {
  name: string;
  tagline: string;
};

function Mascot() {
  return (
    <svg width="120" height="120" viewBox="0 0 150 150" className="mx-auto h-full w-full">
      <path
        d="M40 50 Q35 30 45 20"
        stroke="#D8895C"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M60 44 Q57 26 65 16"
        stroke="#D8895C"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M80 50 Q84 30 76 20"
        stroke="#D8895C"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect x="70" y="46" width="4" height="90" rx="2" fill="#C97540" />
      <path
        d="M28 58 h84 l-8 60 a12 12 0 0 1 -12 10 h-44 a12 12 0 0 1 -12 -10 z"
        fill="#D8895C"
      />
      <path d="M28 58 h84 l-2 16 h-80 z" fill="#C97540" />
      <path
        d="M112 68 q22 -2 22 20 q0 22 -24 22"
        fill="none"
        stroke="#D8895C"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="52" cy="90" r="5" fill="#2B2320" />
      <circle cx="76" cy="90" r="5" fill="#2B2320" />
      <circle cx="46" cy="98" r="6" fill="#F2A93B" opacity="0.55" />
      <circle cx="82" cy="98" r="6" fill="#F2A93B" opacity="0.55" />
      <path
        d="M54 106 Q64 116 74 106"
        stroke="#2B2320"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header({ name, tagline }: HeaderProps) {
  const navigate = useNavigate();
  const secretClicks = useRef(0);
  const resetSecretClicks = useRef<number | undefined>(undefined);

  const handleSecretClick = () => {
    secretClicks.current += 1;

    if (resetSecretClicks.current !== undefined) {
      window.clearTimeout(resetSecretClicks.current);
    }

    if (secretClicks.current === 3) {
      secretClicks.current = 0;
      navigate("/admin");
      return;
    }

    resetSecretClicks.current = window.setTimeout(() => {
      secretClicks.current = 0;
    }, 900);
  };

  return (
    <header className="relative overflow-hidden bg-[#FFFDF8] px-4 pb-6 pt-5 text-center sm:px-8 sm:pb-8 sm:pt-7">
      {FLOATING_SYMBOLS.map((s, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{ top: s.top, left: s.left }}
        >
          <FloatingSymbol
            size={s.size}
            rotate={s.rotate}
            opacity={s.opacity}
            kind={s.kind}
            color={s.color}
          />
        </div>
      ))}

      <div className="relative flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-10 w-10 shrink-0 sm:h-14 sm:w-14">
            <Mascot />
          </div>
          <h1 className="font-display truncate text-xl font-semibold text-[#2B2320] sm:text-3xl">
            {name}
          </h1>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="relative mt-4 text-center sm:mt-5">
        <p className="text-sm font-medium text-[#6E685F] sm:text-base">
          {tagline}
        </p>
      </div>

      <button
        type="button"
        className="nomi-admin-trigger"
        aria-label="Private access"
        onClick={handleSecretClick}
      >
        ...
      </button>
    </header>
  );
}