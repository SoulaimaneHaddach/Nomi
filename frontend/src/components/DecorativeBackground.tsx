import FloatingSymbol from "./FloatingSymbol";
import { FLOATING_SYMBOLS } from "./floatingSymbols";

function CoffeeMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`nomi-coffee-mark ${className}`}
      viewBox="0 0 80 80"
      fill="none"
    >
      <path
        d="M18 31h39v19c0 9-7 16-16 16H34c-9 0-16-7-16-16V31Z"
        fill="#FFFDF8"
        stroke="#C97540"
        strokeWidth="2"
      />
      <path
        d="M57 37h6c7 0 11 4 11 10s-4 10-11 10h-6"
        stroke="#C97540"
        strokeWidth="2"
      />
      <path d="M12 68h54" stroke="#2B2320" strokeWidth="2" />
      <path d="M29 23c-3-5 4-7 1-13M42 23c-3-5 4-7 1-13" stroke="#3F9C8C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function DecorativeBackground() {
  return (
    <div
      aria-hidden="true"
      className="nomi-background pointer-events-none fixed inset-0 z-1 overflow-hidden"
    >
      <div className="absolute -left-20 top-[12%] h-64 w-64 rounded-full border border-[#C97540]/20 sm:h-96 sm:w-96" />
      <div className="absolute -right-24 bottom-[8%] h-72 w-72 rounded-[42%] border border-[#3F9C8C]/20 sm:h-112 sm:w-md" />
      <div className="absolute inset-x-0 top-[18%] h-px bg-[#2B2320]/[0.07]" />
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-[#2B2320]/5" />
      <div className="absolute left-[12%] top-0 h-full w-px bg-[#2B2320]/[0.035] sm:left-[18%]" />
      <div className="absolute right-[12%] top-0 h-full w-px bg-[#2B2320]/[0.035] sm:right-[18%]" />
      <div className="absolute left-[7%] top-[31%] h-2 w-2 rounded-full bg-[#C97540]/25" />
      <div className="absolute right-[8%] top-[67%] h-2 w-2 rounded-full bg-[#3F9C8C]/25" />
      <div className="absolute left-[7%] top-[33%] h-px w-12 bg-[#C97540]/20 sm:w-20" />
      <div className="absolute right-[8%] top-[69%] h-px w-12 bg-[#3F9C8C]/20 sm:w-20" />
      {FLOATING_SYMBOLS.map((symbol, index) => (
        <div
          key={`background-symbol-${index}`}
          className="pointer-events-none absolute"
          style={{
            top: ["12%", "40%", "64%", "78%", "28%"][index],
            left: ["7%", "92%", "7%", "92%", "50%"][index],
          }}
        >
          <FloatingSymbol
            size={symbol.size * 1.15}
            rotate={symbol.rotate}
            opacity={symbol.opacity * 0.85}
            kind={symbol.kind}
            color={symbol.color}
          />
        </div>
      ))}
      <div className="nomi-background-drift absolute left-[18%] top-[24%] h-20 w-32 rounded-[45%] bg-[#D8895C]/8 blur-2xl sm:h-32 sm:w-52" />
      <CoffeeMark className="absolute -left-2 top-[21%] w-16 rotate-[-14deg] opacity-35 sm:left-[5%] sm:w-20" />
      <CoffeeMark className="absolute -right-3 bottom-[20%] w-20 rotate-[12deg] opacity-25 sm:right-[5%] sm:w-24" />
    </div>
  );
}
