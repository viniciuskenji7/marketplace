import { Plus } from "lucide-react";
import type { Product } from "../../types/Product";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (productId: number) => void;
}

type ProductSceneName = NonNullable<Product["scene"]>;

const sceneColors: Record<ProductSceneName, { bag: string; pot: string; mug: string }> = {
  ceramic: { bag: "#d8c6a9", pot: "#d9cdb6", mug: "#c5a77d" },
  linen: { bag: "#c7b596", pot: "#e1d5bf", mug: "#b9996b" },
  stone: { bag: "#d5c3a5", pot: "#aaa79b", mug: "#c3a67e" },
  honey: { bag: "#d1b993", pot: "#ddd0b8", mug: "#b28c5e" },
};

export function ProductScene({ scene }: { scene: ProductSceneName }) {
  const colors = sceneColors[scene];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 340"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`wall-${scene}`} x2="0" y2="1">
          <stop stopColor="#eadbbd" />
          <stop offset="1" stopColor="#e4d0aa" />
        </linearGradient>
        <linearGradient id={`fabric-${scene}`} x2="1" y2="1">
          <stop stopColor="#f4ead7" />
          <stop offset="1" stopColor={colors.bag} />
        </linearGradient>
      </defs>
      <rect width="420" height="340" fill={`url(#wall-${scene})`} />
      <ellipse cx="225" cy="292" rx="188" ry="25" fill="#9d8053" opacity=".14" />

      <path
        d="M253 104c0-41 19-64 45-64s45 23 45 64"
        fill="none"
        stroke="#c5b394"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M234 112c0-42 20-65 45-65s45 23 45 65"
        fill="none"
        stroke="#efe5d3"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M205 102q0-12 13-12h122q13 0 13 12l18 179q2 17-16 17H202q-18 0-16-17z"
        fill={`url(#fabric-${scene})`}
      />
      <path d="M225 103v175m107-175v172" stroke="#bfae90" strokeWidth="2" opacity=".32" />
      <path d="M205 112q70 12 148 0M207 282q72 10 151 0" stroke="#fff9ee" strokeWidth="2" opacity=".42" />

      <path d="M69 232q-8-43-34-62 32 2 43 31-4-38 17-59 8 34-8 61 24-28 51-25-18 28-49 37z" fill="#536c32" />
      <path d="M74 225q3-45 26-65 3 35-16 63 25-23 51-17-20 24-54 31z" fill="#718449" />
      <path d="M70 219q-21-35-20-64 25 21 29 54 9-35 33-46-5 33-31 57z" fill="#879354" />
      <path d="M48 233h65l-8 66q-2 14-24 14t-25-14z" fill="#d9cbb2" />
      <ellipse cx="80.5" cy="233" rx="32.5" ry="8" fill="#ede2cf" />
      <path d="M58 247q21 8 45 0" fill="none" stroke="#c0ad8e" strokeWidth="2" opacity=".6" />

      <path d="M117 260h67v41q0 12-33.5 12T117 301z" fill={colors.mug} />
      <ellipse cx="150.5" cy="260" rx="33.5" ry="9" fill="#e7d8be" />
      <ellipse cx="150.5" cy="261" rx="26" ry="5" fill="#715b3d" />
      <path d="M184 271q25-4 22 17-2 14-21 10" fill="none" stroke="#b99c70" strokeWidth="8" />
      <path d="M126 294q23 7 49 0" stroke="#f4e8d0" strokeWidth="2" opacity=".55" />
    </svg>
  );
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
