'use client';

import { useMemo } from 'react';
import { ProductCard } from '../product-card';
import { useProducts } from '@/src/hooks/useProducts';
import { useAddToCart, useCart } from '@/src/hooks/useCart';
import { getErrorMessage } from '@/src/utils/get-error-message';
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from '@/src/utils/toast';

interface ProductListProps {
  search: string;
}

export const ProductList = ({ search }: ProductListProps) => {
  const { data: products = [], isPending } = useProducts();
  const { data: cart } = useCart();
  const addToCartMutation = useAddToCart();
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');

    return products
      .filter(
      (product) =>
        product.isActive === 1 &&
        (!query ||
          `${product.name} ${product.description}`
            .toLocaleLowerCase('pt-BR')
            .includes(query)),
      )
      .sort(
        (a, b) =>
          Number(a.stock <= 0) - Number(b.stock <= 0),
      );
  }, [products, search]);

  function addProductToCart(productId: number) {
    const product = products.find((item) => item.id === productId);
    const toastId = showLoadingToast(
      `Adicionando ${product?.name ?? 'produto'} ao carrinho...`,
    );

    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () =>
          showSuccessToast(
            `${product?.name ?? 'Produto'} adicionado ao carrinho.`,
            toastId,
          ),
        onError: (error) =>
          showErrorToast(
            getErrorMessage(error, 'Não foi possível adicionar o produto ao carrinho.'),
            toastId,
          ),
      },
    );
  }

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
              quantity={cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0}
              onAdd={addProductToCart}
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
