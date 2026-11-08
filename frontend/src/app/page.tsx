"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { ProductList } from "../components/product-list";
import { CatalogNavigation } from "../components/catalog/catalog-navigation";

export default function Home() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1010px] px-5 pb-16 pt-12 sm:px-8 sm:pt-14">
        <section className="mb-10 flex flex-col justify-between gap-7 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[1.6px] text-secondary-color">
              Mini marketplace
            </p>
            <h1 className="max-w-[530px] font-display text-[42px] font-bold leading-[1.04] tracking-[-1.8px] text-[#13251a] sm:text-[54px]">
              Coisas boas, feitas
              <br />
              <em className="font-semibold text-primary-color">devagar.</em>
            </h1>
          </div>

          <label className="flex h-11 w-full items-center gap-2.5 rounded-full border border-[#e3dac9] bg-transparent px-4 text-[#617066] shadow-[0_2px_5px_rgba(49,42,27,0.06)] focus-within:border-primary-color sm:mb-1 sm:w-[260px]">
            <Search size={16} strokeWidth={1.8} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produtos"
              className="w-full bg-transparent text-[13px] text-[#1b2a20] outline-none placeholder:text-[#7b8179]"
              aria-label="Buscar produtos"
            />
          </label>
        </section>

        <div className="grid gap-7 md:grid-cols-[160px_minmax(0,1fr)]">
          <CatalogNavigation active="products" />
          <ProductList search={search} />
        </div>
      </main>
    </div>
  );
}