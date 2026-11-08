import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";
import { ProductScene } from "./product-scene";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (productId: number) => void;
}

export function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  const scene = product.scene ?? "ceramic";
  const isOutOfStock = product.stock <= 0;
  const createdAt = Date.parse(product.createdAt);
  const [now, setNow] = useState<number | null>(null);
  const isNew =
    now !== null &&
    Number.isFinite(createdAt) &&
    now >= createdAt &&
    now - createdAt <= 2 * 60 * 1000;

  useEffect(() => {
    let expirationTimer: ReturnType<typeof setTimeout> | undefined;
    const initializeTimer = setTimeout(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      const remainingTime = createdAt + 2 * 60 * 1000 - currentTime;
      if (Number.isFinite(createdAt) && remainingTime > 0) {
        expirationTimer = setTimeout(() => setNow(Date.now()), remainingTime);
      }
    }, 0);

    return () => {
      clearTimeout(initializeTimer);
      if (expirationTimer) clearTimeout(expirationTimer);
    };
  }, [createdAt]);

  return (
    <article
      className={`group overflow-hidden rounded-[19px] border shadow-[0_8px_24px_rgba(47,39,23,0.07)] transition-all duration-200 ${
        isOutOfStock
          ? 'border-[#d3cec3] bg-[#f0ede6]'
          : 'border-[#e8dfd0] bg-[#fffdf9] hover:-translate-y-1'
      }`}
    >
      <div
        className={`relative aspect-[1.05/1] overflow-hidden bg-[#eadbbd] ${
          isOutOfStock ? 'grayscale opacity-65' : ''
        }`}
      >
        <ProductScene scene={scene} />
        {isOutOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#39433c]/90 px-3 py-1.5 text-xs font-semibold text-white">
            Esgotado
          </span>
        ) : product.stock <= 3 ? (
          <span className="absolute left-3 top-3 rounded-full bg-secondary-color px-3 py-1.5 text-xs font-semibold text-white">
            Últimos {product.stock}
          </span>
        ) : null}
        {isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
            Novo
          </span>
        )}
      </div>
      <div className={`p-5 ${isOutOfStock ? 'text-[#6b706b]' : ''}`}>
        <h2 className="font-display text-[18px] font-bold leading-tight tracking-[-.25px] text-[#14261b]">
          {product.name}
        </h2>
        <p className="mt-2 min-h-5 text-[13px] leading-5 text-[#788078]">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span
            className={`font-display text-[20px] font-bold ${
              isOutOfStock ? 'text-[#777c75]' : 'text-primary-color'
            }`}
          >
            {Number(product.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[12px] font-medium shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              isOutOfStock
                ? 'cursor-not-allowed bg-[#d5d2ca] text-[#777a74]'
                : 'bg-primary-color text-white hover:bg-[#123a23] focus-visible:outline-primary-color'
            }`}
            aria-label={
              isOutOfStock
                ? `${product.name} está esgotado`
                : `Adicionar ${product.name} ao carrinho`
            }
            disabled={isOutOfStock}
          >
            {!isOutOfStock && <Plus size={15} />}
            {isOutOfStock
              ? 'Indisponível'
              : quantity > 0
                ? `Adicionar (${quantity})`
                : 'Adicionar'}
          </button>
        </div>
      </div>
    </article>
  );
}
