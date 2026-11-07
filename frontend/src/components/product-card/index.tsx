import { Plus } from "lucide-react";
import type { Product } from "../../types/Product";
import { ProductScene } from "./product-scene";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (productId: number) => void;
}

export function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  const scene = product.scene ?? "ceramic";

  return (
    <article className="group overflow-hidden rounded-[19px] border border-[#e8dfd0] bg-[#fffdf9] shadow-[0_8px_24px_rgba(47,39,23,0.07)] transition-transform duration-200 hover:-translate-y-1">
      <div className="aspect-[1.05/1] overflow-hidden bg-[#eadbbd]">
        <ProductScene scene={scene} />
      </div>
      <div className="p-5">
        <h2 className="font-display text-[18px] font-bold leading-tight tracking-[-.25px] text-[#14261b]">
          {product.name}
        </h2>
        <p className="mt-2 min-h-5 text-[13px] leading-5 text-[#788078]">
          {product.description}
        </p>
        <p className="mt-2 min-h-5 text-[13px] leading-5 text-[#788078]">
          Quantidade no estoque: <strong>{product.stock}</strong>
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-[20px] font-bold text-primary-color">
            {Number(product.price).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-color px-3.5 text-[12px] font-medium text-white shadow-sm transition-colors hover:bg-[#123a23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={15} />
            {quantity > 0 ? `Adicionar (${quantity})` : "Adicionar"}
          </button>
        </div>
      </div>
    </article>
  );
}
