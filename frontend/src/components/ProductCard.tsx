// components/ProductCard.tsx
import type { Product } from "../pages/Menu";

type ProductCardProps = {
  product: Product;
  onSelect: () => void;
};

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border-2 border-[#2B2320]/10 bg-white text-left shadow-[4px_4px_0_0_rgba(43,35,32,0.08)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[#3F9C8C]/30 hover:shadow-[7px_8px_0_0_rgba(43,35,32,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3F9C8C] active:translate-y-0"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FBF4E8]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <span className="absolute right-3 top-3 whitespace-nowrap rounded-full border-2 border-[#3F9C8C]/20 bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#2F8175] shadow-[2px_2px_0_0_rgba(43,35,32,0.1)] sm:text-xs">
          {product.price} {product.currency}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3F9C8C]">
          {product.category}
        </span>
        <h3 className="wrap-break-word font-display text-base font-semibold leading-tight text-[#2B2320]">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-[#6E685F]">
          {product.description}
        </p>
      </div>
    </button>
  );
}