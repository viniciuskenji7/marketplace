'use client';

import { useState } from 'react';
import { ProductCard } from '../product-card';
import { useProductCatalog } from '@/src/hooks/useProducts';
import { useAddToCart, useCart } from '@/src/hooks/useCart';
import { PaginationControls } from '../pagination/pagination-controls';
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
  const [pagination, setPagination] = useState({ page: 1, search });
  const page = pagination.search === search ? pagination.page : 1;
  const { data, isPending, isError, error, refetch } = useProductCatalog(
    page,
    12,
    search.trim(),
  );
  const products = data?.items ?? [];
  const { data: cart } = useCart();
  const addToCartMutation = useAddToCart();
  const filteredProducts = products
    .filter((product) => product.isActive === 1)
    .sort((a, b) => Number(a.stock <= 0) - Number(b.stock <= 0));

  function addProductToCart(productId: number) {
    const product = products.find((item) => item.id === productId);
    const toastId = showLoadingToast(
      `Adicionando ${product?.name ?? 'produto'} ao carrinho...`,
    );

    addToCartMutation.mutate(
      { productId, quantity: 1, optimisticProduct: product },
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

  if (isError) {
    return (
      <section role="alert" className="rounded-2xl border border-red-200 bg-[#fffdf9] p-8 text-center">
        <p className="text-sm text-[#69746c]">
          {getErrorMessage(error, 'Não foi possível carregar os produtos.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </section>
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
      {data && (
        <PaginationControls
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          itemLabel="produtos"
          onPageChange={(nextPage) =>
            setPagination({ page: nextPage, search })
          }
        />
      )}
    </div>
  );
};
