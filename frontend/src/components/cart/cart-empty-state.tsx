import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartEmptyState() {
  return (
    <section className="mx-auto mt-8 flex min-h-[300px] max-w-[450px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#ded3bf] bg-[#fffdf9] px-6 py-12 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#eee6d4] text-primary-color">
        <ShoppingBag size={24} strokeWidth={1.8} />
      </span>
      <h2 className="font-display text-[24px] font-bold text-[#13251a]">
        Carrinho vazio
      </h2>
      <p className="mt-2 text-sm text-[#69746c]">
        Adicione produtos para começar sua compra.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex h-10 items-center rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#123a23]"
      >
        Ver produtos
      </Link>
    </section>
  );
}
