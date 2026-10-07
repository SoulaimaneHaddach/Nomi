import { useNavigate } from "react-router-dom";
import DecorativeBackground from "../components/DecorativeBackground";
import FloatingSymbol from "../components/FloatingSymbol";
import { FLOATING_SYMBOLS } from "../components/floatingSymbols";
import { Mascot } from "../components/Header";
import NomiCornerWaves from "../components/NomiCornerWaves";
import SiteHeader from "../components/SiteHeader";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative isolate min-h-dvh overflow-hidden text-[#2B2320]">
      <div className="nomi-site-background" aria-hidden="true" />
      <DecorativeBackground />
      <NomiCornerWaves />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section className="grid min-h-[76vh] items-center gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="nomi-admin-kicker">Welcome to Nomi</span>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-[#2B2320] sm:text-6xl">A fresh way to share what’s on the menu.</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">Make it easy for guests to explore your café’s menu on a phone, tablet, or screen, while you keep every detail up to date.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="nomi-public-action" onClick={() => navigate("/login")}>Business Owner</button>
              <button type="button" className="nomi-public-action is-secondary" onClick={() => navigate("/register")}>Create Business Account</button>
            </div>
          </div>
          <div className="relative mx-auto flex min-h-64 w-full max-w-md items-center justify-center md:min-h-96">
            <div className="absolute inset-x-10 bottom-8 top-8 -rotate-3 border border-[#C97540]/25 bg-[#FFFDF8]/45" aria-hidden="true" />
            <div className="relative h-56 w-56 sm:h-72 sm:w-72"><Mascot /></div>
            <span className="absolute bottom-4 right-0 font-display text-sm font-semibold text-[#3F9C8C] sm:right-2">Menus made for your table</span>
            {FLOATING_SYMBOLS.slice(0, 2).map((symbol, index) => (
              <div key={index} className={`absolute ${index === 0 ? "left-4 top-5" : "right-2 top-12"}`} aria-hidden="true">
                <FloatingSymbol size={symbol.size * 1.3} rotate={symbol.rotate} opacity={0.8} kind={symbol.kind} color={index === 0 ? "#C97540" : "#3F9C8C"} />
              </div>
            ))}
          </div>
        </section>
        <section className="grid gap-5 border-t border-[#2B2320]/10 py-8 text-sm text-[#6E685F] sm:grid-cols-3 sm:gap-8 sm:py-10">
          <p><strong className="block font-semibold text-[#2B2320]">For the table</strong>Guests browse a clear digital menu on their own device or a shared screen.</p>
          <p><strong className="block font-semibold text-[#2B2320]">For the owner</strong>Manage products, prices, images, and categories from one dashboard.</p>
          <p><strong className="block font-semibold text-[#2B2320]">Across languages</strong>Offer menu translations so more guests can find what they love.</p>
        </section>
      </main>
    </div>
  );
}
