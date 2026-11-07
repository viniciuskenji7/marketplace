'use client';

import { useMemo } from 'react';
import { useDemoStore } from '../../app/providers';
import { ProductCard } from '../product-card';

interface ProductListProps {
  search: string;
}

export const ProductList = ({ search }: ProductListProps) => {
  const { products, cartItems, addToCart } = useDemoStore();
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.description}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    );
  }, [products, search]);

  return (
    <div>
      {filteredProducts.length > 0 ? (
        <section
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Produtos"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cartItems.find((item) => item.product.id === product.id)?.quantity ?? 0}
              onAdd={addToCart}
            />
          ))}
        </section>
      ) : (
        <p className="rounded-2xl border border-[#e8dfd0] bg-[#fffdf9] p-8 text-center text-sm text-[#69746c]">
          Nenhum produto encontrado para “{search}”.
        </p>
      )}
    </div>
  );
};
