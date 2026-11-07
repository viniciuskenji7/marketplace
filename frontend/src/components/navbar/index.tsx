import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  cartCount?: number;
}

export const Navbar = ({ cartCount = 0 }: NavbarProps) => (
  <header className="border-b border-[#e4ddce] bg-background">
    <nav className="mx-auto flex h-[68px] max-w-[1010px] items-center justify-between px-5 sm:px-8">
      <Link
        href="/"
        className="font-display text-[25px] font-bold tracking-[-1.5px] text-primary-color"
        aria-label="Feira - página inicial"
      >
        feira<span className="text-secondary-color">.</span>
      </Link>

      <div className="flex items-center gap-5 text-[13px] text-[#59675d] sm:gap-8">
        <a className="transition-colors hover:text-primary-color" href="#pedidos">
          Pedidos
        </a>
        <a className="transition-colors hover:text-primary-color" href="#admin">
          Admin
        </a>
        <a
          href="#carrinho"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#e4ddce] bg-[#fffcf6] px-4 font-medium text-[#1b2a20] transition-colors hover:border-primary-color"
        >
          <ShoppingBag size={15} strokeWidth={1.8} />
          <span>Carrinho</span>
          {cartCount > 0 && (
            <span className="ml-0.5 min-w-5 rounded-full bg-primary-color px-1.5 py-0.5 text-center text-[11px] text-white">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </nav>
  </header>
);
