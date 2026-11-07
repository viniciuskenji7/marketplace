'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDemoStore } from '../providers';
import { productSchema, type ProductFormValues } from '../../schemas/forms';
import type { Product } from '../../types/Product';

const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyProduct: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  isActive: 1,
  imageUrl: '',
  scene: 'ceramic',
};

export default function AdminPage() {
  const { products, saveProduct, deleteProduct } = useDemoStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyProduct,
  });

  function openCreateForm() {
    setEditingProduct(null);
    reset(emptyProduct);
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    const { id: _id, ...values } = product;
    reset(values);
    setIsFormOpen(true);
  }

  function submitProduct(values: ProductFormValues) {
    saveProduct(values, editingProduct?.id);
    setIsFormOpen(false);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1160px] px-5 pb-16 pt-9 sm:px-8 sm:pt-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[1.6px] text-secondary-color">
            Administração
          </p>
          <h1 className="mt-1 font-display text-[36px] font-bold text-[#14261b]">
            Produtos
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm hover:bg-[#123a23]"
        >
          <Plus size={17} />
          Novo produto
        </button>
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9]">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e1d7c6] text-[13px] text-[#69746c]">
              <th className="px-6 py-5 font-medium">Produto</th>
              <th className="w-[170px] px-6 py-5 text-right font-medium">Preço</th>
              <th className="w-[145px] px-6 py-5 text-right font-medium">Estoque</th>
              <th className="w-[145px] px-6 py-5 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-[#e8dfd0] last:border-0"
              >
                <td className="px-6 py-5">
                  <p className="font-medium text-[#14261b]">{product.name}</p>
                  <p className="mt-1 text-[13px] text-[#788078]">
                    {product.description}
                  </p>
                </td>
                <td className="px-6 py-5 text-right text-sm text-[#28352d]">
                  {formatPrice(product.price)}
                </td>
                <td
                  className={`px-6 py-5 text-right text-sm ${
                    product.stock < 5 ? 'text-secondary-color' : 'text-[#28352d]'
                  }`}
                >
                  {product.stock}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(product)}
                      aria-label={`Editar ${product.name}`}
                      className="grid size-10 place-items-center rounded-full text-[#26352a] transition-colors hover:bg-[#f1eadb]"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      aria-label={`Excluir ${product.name}`}
                      className="grid size-10 place-items-center rounded-full text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-[#69746c]">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsFormOpen(false);
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
                {editingProduct ? 'Editar produto' : 'Novo produto'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Fechar formulário"
                className="grid size-9 place-items-center rounded-full text-[#69746c] hover:bg-[#eee6d4]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(submitProduct)} className="space-y-4">
              <label className="block text-sm text-[#28352d]">
                Nome
                <input
                  {...register('name')}
                  aria-invalid={Boolean(errors.name)}
                  className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
                />
                {errors.name && <span className="mt-1 block text-xs text-error">{errors.name.message}</span>}
              </label>
              <label className="block text-sm text-[#28352d]">
                Descrição
                <textarea
                  rows={3}
                  {...register('description')}
                  aria-invalid={Boolean(errors.description)}
                  className="mt-1 block w-full resize-y rounded-[10px] border border-[#ded4c2] bg-transparent px-3 py-2 outline-none shadow-sm focus:border-primary-color"
                />
                {errors.description && <span className="mt-1 block text-xs text-error">{errors.description.message}</span>}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-[#28352d]">
                  Preço (R$)
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    aria-invalid={Boolean(errors.price)}
                    className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
                  />
                  {errors.price && <span className="mt-1 block text-xs text-error">{errors.price.message}</span>}
                </label>
                <label className="block text-sm text-[#28352d]">
                  Estoque
                  <input
                    type="number"
                    step="1"
                    {...register('stock', { valueAsNumber: true })}
                    aria-invalid={Boolean(errors.stock)}
                    className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
                  />
                  {errors.stock && <span className="mt-1 block text-xs text-error">{errors.stock.message}</span>}
                </label>
              </div>
              <label className="block text-sm text-[#28352d]">
                URL da imagem (opcional)
                <input
                  type="url"
                  {...register('imageUrl')}
                  aria-invalid={Boolean(errors.imageUrl)}
                  placeholder="https://..."
                  className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color"
                />
                {errors.imageUrl && <span className="mt-1 block text-xs text-error">{errors.imageUrl.message}</span>}
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="h-10 rounded-full border border-[#ded4c2] px-5 text-sm text-[#48564c] hover:bg-[#eee6d4]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white hover:bg-[#123a23]"
                >
                  {editingProduct ? 'Salvar alterações' : 'Criar produto'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
