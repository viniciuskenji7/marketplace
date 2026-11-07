'use client';

import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductScene } from '../../components/product-card';
import { checkoutSchema, type CheckoutFormValues } from '../../schemas/forms';
import { useDemoStore } from '../providers';

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function CartPage() {
  const router = useRouter();
  const { cartItems, setCartQuantity, removeFromCart, placeOrder } = useDemoStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', email: '' },
  });
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function submitOrder(values: CheckoutFormValues) {
    const order = placeOrder(values.name, values.email);
    if (order) router.push('/pedido-confirmado');
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1110px] px-5 pb-16 pt-9 sm:px-8 sm:pt-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-[#13251a] sm:text-[38px]">
        Seu carrinho
      </h1>

      {cartItems.length === 0 ? (
        <section className="mx-auto mt-8 flex min-h-[300px] max-w-[450px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#ded3bf] bg-[#fffdf9] px-6 py-12 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#eee6d4] text-primary-color">
            <ShoppingBag size={24} strokeWidth={1.8} />
          </span>
          <h2 className="font-display text-[24px] font-bold text-[#13251a]">
            Carrinho vazio
          </h2>
          <p className="mt-2 text-sm text-[#69746c]">
            Adicione produtos para começar sua compra.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#123a23]"
          >
            Ver produtos
          </Link>
        </section>
      ) : (
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)]">
          <section className="rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9] px-5 sm:px-6">
            {cartItems.map(({ product, quantity }, index) => (
              <article
                key={product.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-4 py-5 sm:flex-nowrap sm:gap-4 sm:py-6 ${
                  index < cartItems.length - 1 ? 'border-b border-[#e1d7c6]' : ''
                }`}
              >
                <div className="size-[78px] shrink-0 overflow-hidden rounded-[16px] bg-[#eadbbd]">
                  <ProductScene scene={product.scene ?? 'ceramic'} />
                </div>
                <div className="min-w-[145px] flex-1">
                  <h2 className="font-medium text-[#14261b]">{product.name}</h2>
                  <p className="mt-1 text-[13px] text-[#788078]">
                    {formatPrice(product.price)} / un.
                  </p>
                </div>
                <div className="flex h-9 items-center rounded-full border border-[#e1d7c6] text-sm">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${product.name}`}
                    onClick={() => setCartQuantity(product.id, quantity - 1)}
                    className="grid size-9 place-items-center text-[#657066] hover:text-primary-color"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-7 text-center">{quantity}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${product.name}`}
                    onClick={() => setCartQuantity(product.id, quantity + 1)}
                    className="grid size-9 place-items-center text-[#26352a] hover:text-primary-color"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <strong className="w-[82px] text-right text-[15px] font-semibold text-[#14261b]">
                  {formatPrice(product.price * quantity)}
                </strong>
                <button
                  type="button"
                  aria-label={`Remover ${product.name} do carrinho`}
                  onClick={() => removeFromCart(product.id)}
                  className="ml-auto grid size-9 place-items-center text-[#687267] transition-colors hover:text-red-600 sm:ml-0"
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </section>

          <form
            onSubmit={handleSubmit(submitOrder)}
            className="rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9] p-6 shadow-[0_8px_24px_rgba(47,39,23,0.06)] sm:p-7"
          >
            <h2 className="font-display text-[21px] font-bold text-[#14261b]">
              Finalizar compra
            </h2>
            <label className="mt-5 block text-sm text-[#28352d]">
              Nome
              <input
                {...register('name')}
                aria-invalid={Boolean(errors.name)}
                className="mt-1 block h-10 w-full rounded-[11px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
              />
              {errors.name && <span className="mt-1 block text-xs text-error">{errors.name.message}</span>}
            </label>
            <label className="mt-4 block text-sm text-[#28352d]">
              E-mail
              <input
                type="email"
                {...register('email')}
                aria-invalid={Boolean(errors.email)}
                className="mt-1 block h-10 w-full rounded-[11px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
              />
              {errors.email && <span className="mt-1 block text-xs text-error">{errors.email.message}</span>}
            </label>
            <div className="mt-5 flex items-center justify-between border-t border-[#e1d7c6] pt-4">
              <span className="text-sm text-[#69746c]">Total</span>
              <strong className="font-display text-[26px] font-bold text-primary-color">
                {formatPrice(total)}
              </strong>
            </div>
            <button
              type="submit"
              className="mt-4 h-11 w-full rounded-full bg-primary-color px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123a23]"
            >
              Confirmar pedido
            </button>
            <p className="mt-4 text-center text-xs text-[#788078]">
              Você receberá a confirmação por e-mail.
            </p>
          </form>
        </div>
      )}
    </main>
  );
}
