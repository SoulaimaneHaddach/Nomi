export type FloatingSymbolKind = "bean" | "steam" | "spark";

export type FloatingSymbolData = {
  top: string;
  left: string;
  size: number;
  rotate: number;
  opacity: number;
  kind: FloatingSymbolKind;
  color: string;
};

export const FLOATING_SYMBOLS: FloatingSymbolData[] = [
  { top: "18%", left: "8%", size: 26, rotate: -20, opacity: 0.35, kind: "bean", color: "#D8895C" },
  { top: "62%", left: "5%", size: 20, rotate: 25, opacity: 0.3, kind: "bean", color: "#3F9C8C" },
  { top: "22%", left: "88%", size: 24, rotate: 0, opacity: 0.35, kind: "steam", color: "#D8895C" },
  { top: "70%", left: "90%", size: 22, rotate: -10, opacity: 0.3, kind: "bean", color: "#3F9C8C" },
  { top: "8%", left: "45%", size: 16, rotate: 0, opacity: 0.3, kind: "spark", color: "#F2A93B" },
];
