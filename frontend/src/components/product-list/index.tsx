'use client';

import { useMemo } from 'react';
import { useAddToCart, useCart } from '@/src/hooks/useCart';
import { useProducts } from '@/src/hooks/useProducts';
import { getErrorMessage } from '@/src/services/api';
import { ProductCard } from '../product-card';

interface ProductListProps {
  search: string;
}

export const ProductList = ({ search }: ProductListProps) => {
  const { data: products = [], isPending, error } = useProducts();
  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.description}`
        .toLocaleLowerCase('pt-BR')
        .includes(query),
    );
  }, [products, search]);

  if (isPending) return <p>Carregando...</p>;
  if (error) return <p>{getErrorMessage(error)}</p>;

  return (
    <div>
      {addToCart.error && (
        <p role="alert" className="mb-4 text-sm text-error">
          {getErrorMessage(addToCart.error)}
        </p>
      )}
      {filteredProducts.length > 0 ? (
        <section
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Produtos"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={
                cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0
              }
              onAdd={(productId) =>
                addToCart.mutate({ productId, quantity: 1 })
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
