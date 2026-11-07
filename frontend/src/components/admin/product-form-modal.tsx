'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormValues } from '../../schemas/forms';
import type { Product } from '../../types/Product';
import { showErrorToast } from '../../utils/toast';

interface ProductFormModalProps {
  product: Product | null;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

const emptyProduct: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  isActive: 1,
  imageUrl: '',
  scene: 'ceramic',
};

const inputClassName =
  'mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color';

export function ProductFormModal({
  product,
  isSaving,
  error,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyProduct,
  });

  useEffect(() => {
    if (!product) {
      reset(emptyProduct);
      return;
    }

    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      scene: product.scene ?? 'ceramic',
    });
  }, [product, reset]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="my-auto w-full max-w-[500px] rounded-[18px] border border-[#e1d7c6] bg-background p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="product-form-title"
            className="font-display text-[22px] font-bold text-[#14261b]"
          >
            {product ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar formulário"
            className="grid size-9 place-items-center rounded-full text-[#69746c] hover:bg-[#eee6d4] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, () =>
            showErrorToast('Revise os campos destacados do produto.'),
          )}
          className="space-y-4"
          noValidate
        >
          <label className="block text-sm text-[#28352d]">
            Nome
            <input
              {...register('name')}
              aria-invalid={Boolean(errors.name)}
              className={inputClassName}
            />
            {errors.name && (
              <span className="mt-1 block text-xs text-error">
                {errors.name.message}
              </span>
            )}
          </label>
          <label className="block text-sm text-[#28352d]">
            Descrição
            <textarea
              rows={3}
              {...register('description')}
              aria-invalid={Boolean(errors.description)}
              className="mt-1 block w-full resize-y rounded-[10px] border border-[#ded4c2] bg-transparent px-3 py-2 outline-none shadow-sm focus:border-primary-color"
            />
            {errors.description && (
              <span className="mt-1 block text-xs text-error">
                {errors.description.message}
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm text-[#28352d]">
              Preço (R$)
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.price)}
                className={inputClassName}
              />
              {errors.price && (
                <span className="mt-1 block text-xs text-error">
                  {errors.price.message}
                </span>
              )}
            </label>
            <label className="block text-sm text-[#28352d]">
              Estoque
              <input
                type="number"
                step="1"
                {...register('stock', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.stock)}
                className={inputClassName}
              />
              {errors.stock && (
                <span className="mt-1 block text-xs text-error">
                  {errors.stock.message}
                </span>
              )}
            </label>
          </div>
          <label className="block text-sm text-[#28352d]">
            URL da imagem (opcional)
            <input
              type="url"
              {...register('imageUrl')}
              aria-invalid={Boolean(errors.imageUrl)}
              placeholder="https://..."
              className={inputClassName}
            />
            {errors.imageUrl && (
              <span className="mt-1 block text-xs text-error">
                {errors.imageUrl.message}
              </span>
            )}
          </label>
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-10 rounded-full border border-[#ded4c2] px-5 text-sm text-[#48564c] hover:bg-[#eee6d4] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white hover:bg-[#123a23] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? 'Salvando...'
                : product
                  ? 'Salvar alterações'
                  : 'Criar produto'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
