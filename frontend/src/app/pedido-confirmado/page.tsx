'use client';

import { CircleCheck } from 'lucide-react';
import Link from 'next/link';
import { useDemoStore } from '../providers';

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrderConfirmedPage() {
  const { latestOrder } = useDemoStore();

  if (!latestOrder) {
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

  return (
    <main className="mx-auto w-full max-w-[650px] px-5 py-12 sm:py-16">
      <section className="rounded-[22px] border border-[#e1d7c6] bg-[#fffdf9] p-7 shadow-[0_8px_24px_rgba(47,39,23,0.06)] sm:p-9">
        <CircleCheck size={42} strokeWidth={2} className="text-primary-color" />
        <h1 className="mt-4 font-display text-[30px] font-bold text-[#14261b]">
          Obrigado, {latestOrder.customerName}!
        </h1>
        <p className="mt-2 text-sm text-[#69746c]">
          Enviamos a confirmação para {latestOrder.email}.
        </p>
        <p className="mt-4 rounded-xl bg-[#eee6d4] px-4 py-3 font-mono text-xs text-[#475349]">
          Pedido #{latestOrder.id}
        </p>

        <div className="mt-6">
          {latestOrder.items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-4 border-b border-[#e1d7c6] py-3 text-sm"
            >
              <span>
                {quantity}× {product.name}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-medium">Total</span>
          <strong className="font-display text-[25px] font-bold text-primary-color">
            {formatPrice(latestOrder.total)}
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
