import type { ReactNode } from "react";
import DecorativeBackground from "./DecorativeBackground";
import FloatingSymbol from "./FloatingSymbol";
import { FLOATING_SYMBOLS } from "./floatingSymbols";
import { Mascot } from "./Header";
import NomiCornerWaves from "./NomiCornerWaves";
import SiteHeader from "./SiteHeader";

type SitePageLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function SitePageLayout({ title, children }: SitePageLayoutProps) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden text-[#2B2320]">
      <div className="nomi-site-background" aria-hidden="true" />
      <DecorativeBackground />
      <NomiCornerWaves />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section className="grid min-h-[76vh] items-center gap-8 py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="nomi-admin-kicker">Nomi</span>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-[#2B2320] sm:text-6xl">{title}</h1>
            <div className="mt-5 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">{children}</div>
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
      </main>
    </div>
  );
}
