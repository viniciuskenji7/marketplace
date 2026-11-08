'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  checkoutSchema,
  type CheckoutFormValues,
} from '../../schemas/forms';
import { showErrorToast } from '../../utils/toast';
import { formatCentsAsCurrency } from '../../utils/format';

interface CheckoutFormProps {
  totalCents: number;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: CheckoutFormValues) => void | Promise<void>;
}

export function CheckoutForm({
  totalCents,
  isSubmitting,
  submitError,
  onSubmit,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () =>
        showErrorToast('Revise os campos destacados antes de continuar.'),
      )}
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
        {errors.name && (
          <span className="mt-1 block text-xs text-error">
            {errors.name.message}
          </span>
        )}
      </label>
      <label className="mt-4 block text-sm text-[#28352d]">
        E-mail
        <input
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          className="mt-1 block h-10 w-full rounded-[11px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
        />
        {errors.email && (
          <span className="mt-1 block text-xs text-error">
            {errors.email.message}
          </span>
        )}
      </label>
      {submitError && (
        <p role="alert" className="mt-4 text-sm text-error">
          {submitError}
        </p>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-[#e1d7c6] pt-4">
        <span className="text-sm text-[#69746c]">Total</span>
        <strong className="font-display text-[26px] font-bold text-primary-color">
          {formatCentsAsCurrency(totalCents)}
        </strong>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 h-11 w-full rounded-full bg-primary-color px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123a23] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Processando...' : 'Confirmar pedido'}
      </button>
      <p className="mt-4 text-center text-xs text-[#788078]">
        Você receberá a confirmação por e-mail.
      </p>
    </form>
  );
}
