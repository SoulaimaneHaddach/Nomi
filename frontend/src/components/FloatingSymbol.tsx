import type { FloatingSymbolKind } from "./floatingSymbols";

export default function FloatingSymbol({
  size,
  rotate,
  opacity,
  kind,
  color,
}: {
  size: number;
  rotate: number;
  opacity: number;
  kind: FloatingSymbolKind;
  color: string;
}) {
  if (kind === "steam") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
        <path
          d="M6 20c2-6 2-10 6-16m-3 8c3 1 5 1 8 4"
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "spark") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
        <path
          d="M12 2l1.8 5.6H20l-4.6 3.4 1.8 5.6L12 13.2 6.8 16.6l1.8-5.6L4 8h6.2z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ opacity, transform: `rotate(${rotate}deg)` }}
    >
      <ellipse cx="12" cy="12" rx="10" ry="7" fill={color} />
      <path d="M12 6 L12 18" stroke="#FBF4E8" strokeWidth="1.5" />
    </svg>
  );
}
