import { Link, NavLink } from "react-router-dom";
import { Mascot } from "./Header";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold no-underline transition-colors hover:text-[#A34C3F] ${isActive ? "text-[#A34C3F]" : "text-[#2B2320]"}`;

export default function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-[#2B2320]/10 bg-[#FFFDF8]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 text-[#2B2320] no-underline" aria-label="Nomi home">
          <span className="h-10 w-10 shrink-0"><Mascot /></span>
          <span className="font-display text-2xl font-semibold">Nomi</span>
        </Link>
        <nav className="order-3 flex w-full items-center justify-center gap-7 sm:order-0 sm:w-auto" aria-label="Main navigation">
          <NavLink end to="/" className={navClass}>Home</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>
          <NavLink to="/contact" className={navClass}>Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
