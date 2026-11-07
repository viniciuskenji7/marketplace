'use client';

import { useMemo } from 'react';
import { ProductCard } from '../product-card';
import { useProducts } from '@/src/hooks/useProducts';
import { useAddToCart } from '@/src/hooks/useCart';

interface ProductListProps {
  search: string;
}

export const ProductList = ({ search }: ProductListProps) => {
  const { data = [], isPending } = useProducts();
  const addToCartMutation = useAddToCart();
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return data;

    return data.filter((product) =>
      `${product.name} ${product.description}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    );
  }, [data, search]);

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Carregando produtos"
        className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      >
        <span className="loading loading-spinner loading-xl text-primary-color" />
      </div>
    );
  }

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
              quantity={data.find((item) => item.id === product.id)?.stock ?? 0}
              onAdd={(productId) =>
                addToCartMutation.mutate({ productId, quantity: 1 })
              }
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
