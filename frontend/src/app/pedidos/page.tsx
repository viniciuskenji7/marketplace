'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSearchSchema, type OrderSearchFormValues } from '../../schemas/forms';
import { useDemoStore } from '../providers';

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function OrdersPage() {
  const { orders } = useDemoStore();
  const [searchedEmail, setSearchedEmail] = useState('');
  const [searched, setSearched] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderSearchFormValues>({
    resolver: zodResolver(orderSearchSchema),
    defaultValues: { email: '' },
  });

  function searchOrders(values: OrderSearchFormValues) {
    setSearchedEmail(values.email.trim().toLocaleLowerCase());
    setSearched(true);
  }

  const matchingOrders = orders.filter(
    (order) => order.email.toLocaleLowerCase() === searchedEmail,
  );

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1120px] px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-[36px] font-bold text-[#14261b]">
        Meus pedidos
      </h1>
      <p className="mt-1 text-sm text-[#69746c]">
        Digite o e-mail usado na compra.
      </p>
      <form
        onSubmit={handleSubmit(searchOrders)}
        className="mt-7 flex max-w-[520px] gap-2"
      >
        <input
          type="email"
          {...register('email')}
          placeholder="voce@email.com"
          className="h-10 min-w-0 flex-1 rounded-[11px] border border-[#ded4c2] bg-transparent px-3 text-sm outline-none shadow-sm focus:border-primary-color"
          aria-label="E-mail usado na compra"
          aria-invalid={Boolean(errors.email)}
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm hover:bg-[#123a23]"
        >
          <Search size={16} />
          Buscar
        </button>
      </form>
      {errors.email && (
        <p role="alert" className="mt-2 text-sm text-error">
          {errors.email.message}
        </p>
      )}

      {searched && (
        <section className="mt-7 space-y-3" aria-label="Resultados dos pedidos">
          {matchingOrders.length ? (
            matchingOrders.map((order) => (
              <article
                key={order.id}
                className="flex flex-col gap-3 rounded-[18px] border border-[#e1d7c6] bg-[#fffdf9] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div>
                  <p className="font-mono text-[11px] text-[#69746c]">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-[#28352d]">
                    {order.items
                      .map(({ product, quantity }) => `${quantity}× ${product.name}`)
                      .join(', ')}
                  </p>
                </div>
                <strong className="font-display text-xl text-primary-color">
                  {formatPrice(order.total)}
                </strong>
              </article>
            ))
          ) : (
            <p className="rounded-[18px] border border-dashed border-[#ded3bf] bg-[#fffdf9] px-6 py-8 text-sm text-[#69746c]">
              Não encontramos pedidos para este e-mail nesta demonstração.
            </p>
          )}
        </section>
      )}
    </main>
  );
}
