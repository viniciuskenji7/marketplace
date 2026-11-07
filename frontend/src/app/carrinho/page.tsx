'use client';

import { useRouter } from 'next/navigation';
import { CartEmptyState } from '../../components/cart/cart-empty-state';
import { CartItemsList } from '../../components/cart/cart-items-list';
import { CheckoutForm } from '../../components/cart/checkout-form';
import type { CheckoutFormValues } from '../../schemas/forms';
import type { CheckoutResult } from '../../types/Checkout';
import { useCart, useCheckout, useUpdateCartItem } from '../../hooks/useCart';

export default function CartPage() {
  const router = useRouter();
  const cartQuery = useCart();
  const updateCartItem = useUpdateCartItem();
  const checkout = useCheckout();
  const items = cartQuery.data?.items ?? [];

  function handleQuantityChange(productId: number, quantity: number) {
    updateCartItem.mutate({ productId, quantity });
  }

  function handleCheckout(values: CheckoutFormValues) {
    checkout.mutate(values, {
      onSuccess: (result: CheckoutResult) => {
        sessionStorage.setItem(
          'marketplace-checkout-result',
          JSON.stringify({ result, customer: values }),
        );
        router.push('/pedido-confirmado');
      },
    });
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
            total={cartQuery.data?.totalCents ?? 0}
            isSubmitting={checkout.isPending}
            submitError={
              checkout.isError
                ? checkout.error instanceof Error
                  ? checkout.error.message
                  : 'Não foi possível finalizar o pedido. Tente novamente.'
                : undefined
            }
            onSubmit={handleCheckout}
          />
        </div>
      )}
    </main>
  );
}
