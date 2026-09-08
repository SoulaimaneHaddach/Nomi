// components/ProductModal.tsx
import { useEffect } from "react";
import type { Product } from "../pages/Menu";

type ProductModalProps = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[#2B2320]/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-t-4xl border-2 border-[#2B2320]/10 bg-white sm:max-h-[calc(100dvh-2rem)] sm:rounded-4xl sm:shadow-[6px_6px_0_0_rgba(43,35,32,0.15)]"
      >
        <div className="relative aspect-square max-h-[55dvh] w-full bg-[#FBF4E8]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#2B2320]/10 bg-white text-[#2B2320] shadow-[2px_2px_0_0_rgba(43,35,32,0.15)]"
          >
            ✕
          </button>
          <span className="absolute left-4 top-4 rounded-full border-2 border-[#2B2320]/10 bg-white px-3 py-1.5 text-sm font-semibold text-[#2B2320] shadow-[2px_2px_0_0_rgba(43,35,32,0.15)]">
            {product.price} {product.currency}
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 sm:p-6">
          <h2 className="wrap-break-word font-display text-xl font-semibold text-[#2B2320] sm:text-2xl">
            {product.name}
          </h2>
          <p className="text-sm text-[#6E685F]">{product.description}</p>
        </div>
      </div>
    </div>
  );
}