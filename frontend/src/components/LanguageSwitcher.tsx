// components/LanguageSwitcher.tsx
import { useState } from "react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "العربية" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

export default function LanguageSwitcher() {
  const [active, setActive] = useState<LanguageCode>("en");

  return (
    <div
      aria-label="Choose language"
      className="flex items-center gap-1 rounded-full border border-[#2B2320]/15 bg-[#FFFDF8] p-1.5 shadow-[0_2px_8px_rgba(43,35,32,0.06)]"
      role="group"
    >
      {LANGUAGES.map((lang) => {
        const isActive = active === lang.code;
        return (
          <button
            key={lang.code}
            aria-pressed={isActive}
            onClick={() => setActive(lang.code)}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide transition-[background-color,color,box-shadow] duration-200 min-[400px]:px-2.5 sm:px-3.5 sm:py-2 sm:text-sm ${
              isActive
                ? "bg-[#3F9C8C] text-white shadow-[0_2px_5px_rgba(43,35,32,0.14)]"
                : "text-[#6E685F] hover:bg-[#F4EBDD] hover:text-[#2B2320]"
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}