'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { storedCheckoutSchema } from '@/src/schemas/storedCheckoutSchema';

const subscribeToCheckout = () => () => {};
const getCheckoutSnapshot = () =>
  typeof window === 'undefined'
    ? null
    : sessionStorage.getItem('marketplace-checkout-result');
const getServerCheckoutSnapshot = () => null;

const formatPrice = (value: number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrderConfirmedPage() {
  const rawCheckout = useSyncExternalStore(
    subscribeToCheckout,
    getCheckoutSnapshot,
    getServerCheckoutSnapshot,
  );
  const { storedCheckout, storageError } = useMemo(() => {
    if (!rawCheckout) return { storedCheckout: null, storageError: false };

    try {
      const parsed = storedCheckoutSchema.safeParse(JSON.parse(rawCheckout));
      return parsed.success
        ? { storedCheckout: parsed.data, storageError: false }
        : { storedCheckout: null, storageError: true };
    } catch {
      return { storedCheckout: null, storageError: true };
    }
  }, [rawCheckout]);

  useEffect(() => {
    if (storedCheckout) {
      sessionStorage.removeItem('marketplace-checkout-result');
    }
  }, [storedCheckout]);

  if (storageError) {
    return (
      <main className="mx-auto w-full max-w-[650px] px-5 py-16">
        <section
          role="alert"
          className="rounded-[22px] border border-[#e1d7c6] bg-[#fffdf9] p-8 sm:p-10"
        >
          <h1 className="font-display text-3xl font-bold text-[#14261b]">
            Não foi possível carregar os detalhes do pedido
          </h1>
          <p className="mt-3 text-sm text-[#69746c]">
            Os dados de confirmação estão inválidos. Consulte seu e-mail para
            ver os detalhes do pedido.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-primary-color px-5 text-sm font-medium text-white"
          >
            Voltar à loja
          </Link>
        </section>
      </main>
    );
  }

  if (!storedCheckout) {
    return (
      <main className="mx-auto w-full max-w-[650px] px-5 py-16">
        <section className="rounded-[22px] border border-[#e1d7c6] bg-[#fffdf9] p-8 sm:p-10">
          <h1 className="font-display text-3xl font-bold text-[#14261b]">
            Nenhum pedido recente
          </h1>
          <p className="mt-3 text-sm text-[#69746c]">
            Faça um pedido para ver a confirmação nesta tela.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-primary-color px-5 text-sm font-medium text-white"
          >
            Ver produtos
          </Link>
        </section>
      </main>
    );
  }

  const orderItems = storedCheckout.result.items.map((item) => ({
    key: item.productId,
    label: `${item.quantity}× ${item.name}`,
    total: item.subTotalCents,
  }));
  const customerName = storedCheckout.customer.name;
  const customerEmail = storedCheckout.customer.email;
  const orderId = storedCheckout.result.orderId;
  const orderTotal = storedCheckout.result.totalCents;

  return (
    <main className="mx-auto w-full max-w-[650px] px-5 py-12 sm:py-16">
      <section className="rounded-[22px] border border-[#e1d7c6] bg-[#fffdf9] p-7 shadow-[0_8px_24px_rgba(47,39,23,0.06)] sm:p-9">
        <CircleCheck size={42} strokeWidth={2} className="text-primary-color" />
        <h1 className="mt-4 font-display text-[30px] font-bold text-[#14261b]">
          Obrigado, {customerName}!
        </h1>
        <p className="mt-2 text-sm text-[#69746c]">
          Enviamos a confirmação para {customerEmail}.
        </p>
        <p className="mt-4 rounded-xl bg-[#eee6d4] px-4 py-3 font-mono text-xs text-[#475349]">
          Pedido #{orderId}
        </p>

        <div className="mt-6">
          {orderItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 border-b border-[#e1d7c6] py-3 text-sm"
            >
              <span>{item.label}</span>
              <span>{formatPrice(item.total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">Total</span>
          <strong className="font-display text-[25px] font-bold text-primary-color">
            {formatPrice(orderTotal)}
          </strong>
        </div>
        <Link
          href="/"
          className="mt-7 inline-flex h-10 items-center rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm hover:bg-[#123a23]"
        >
          Continuar comprando
        </Link>
      </section>
    </main>
  );
}
