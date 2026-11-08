'use client';

import { useRouter } from 'next/navigation';
import { CartEmptyState } from '../../components/cart/cart-empty-state';
import { CartItemsList } from '../../components/cart/cart-items-list';
import { CheckoutForm } from '../../components/cart/checkout-form';
import type { CheckoutFormValues } from '../../schemas/forms';
import type { CheckoutResult } from '../../types/Checkout';
import type { CartItem } from '../../types/Cart';
import { useCart, useCheckout, useUpdateCartItem } from '../../hooks/useCart';
import { getErrorMessage } from '../../utils/get-error-message';
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from '../../utils/toast';

export default function CartPage() {
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItem = useUpdateCartItem();
  const checkout = useCheckout();
  const items = cartQuery.data?.items ?? [];

  function handleQuantityChange(item: CartItem, quantity: number) {
    const toastId = showLoadingToast(
      quantity === 0
        ? `Removendo ${item?.name ?? 'produto'} do carrinho...`
        : 'Atualizando quantidade...',
    );

    updateCartItem.mutate(
      { productId: item.productId, sessionId: item.sessionId, quantity },
      {
        onSuccess: () =>
          showSuccessToast(
            quantity === 0
              ? `${item?.name ?? 'Produto'} removido do carrinho.`
              : 'Quantidade atualizada.',
            toastId,
          ),
        onError: (error) =>
          showErrorToast(
            getErrorMessage(error, 'Não foi possível atualizar o carrinho.'),
            toastId,
          ),
      },
    );
  }

  function handleCheckout(values: CheckoutFormValues) {
    const toastId = showLoadingToast('Finalizando seu pedido...');
    checkout.mutate(values, {
      onSuccess: (result: CheckoutResult) => {
        sessionStorage.setItem(
          'marketplace-checkout-result',
          JSON.stringify({ result, customer: values }),
        );
        showSuccessToast('Pedido realizado com sucesso.', toastId);
        router.push('/pedido-confirmado');
      },
      onError: (error) =>
        showErrorToast(
          getErrorMessage(error, 'Não foi possível finalizar seu pedido.'),
          toastId,
        ),
    });
  }

  if (checkout.isPending || checkout.isSuccess) {
    return (
      <main
        role="status"
        aria-label="Finalizando pedido"
        className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center gap-4 px-5 text-center"
      >
        <span className="loading loading-spinner loading-lg text-primary-color" />
        <p className="text-sm text-[#69746c]">
          Estamos processando seu pedido...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1110px] px-5 pb-16 pt-9 sm:px-8 sm:pt-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#13251a] sm:text-[38px]">
        Seu carrinho
      </h1>

      {cartQuery.isPending ? (
        <div
          role="status"
          aria-label="Carregando carrinho"
          className="flex min-h-[55vh] items-center justify-center"
        >
          <span className="loading loading-spinner loading-lg text-primary-color" />
        </div>
      ) : cartQuery.isError ? (
        <section
          role="alert"
          className="mx-auto mt-8 max-w-[550px] rounded-[20px] border border-red-200 bg-[#fffdf9] p-6 text-center"
        >
          <h2 className="font-display text-xl font-bold text-[#14261b]">
            Não foi possível carregar o carrinho
          </h2>
          <p className="mt-2 text-sm text-[#69746c]">
            {cartQuery.error instanceof Error
              ? cartQuery.error.message
              : 'Tente novamente em alguns instantes.'}
          </p>
          <button
            type="button"
            onClick={() => void cartQuery.refetch()}
            className="mt-5 h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white hover:bg-[#123a23]"
          >
            Tentar novamente
          </button>
        </section>
      ) : items.length === 0 ? (
        <CartEmptyState />
      ) : (
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)]">
          <div className="space-y-3">
            <CartItemsList
              items={items}
              isUpdating={updateCartItem.isPending}
              onQuantityChange={handleQuantityChange}
            />
            {updateCartItem.isError && (
              <p role="alert" className="text-sm text-error">
                Não foi possível atualizar o carrinho. Tente novamente.
              </p>
            )}
          </div>
          <CheckoutForm
            totalCents={cartQuery.data?.totalCents ?? 0}
            isSubmitting={checkout.isPending}
            submitError={
              checkout.isError
                ? getErrorMessage(
                    checkout.error,
                    'Não foi possível finalizar o pedido. Tente novamente.',
                  )
                : undefined
            }
            onSubmit={handleCheckout}
          />
        </div>
      )}
    </main>
  );
}
