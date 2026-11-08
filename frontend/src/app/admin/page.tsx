'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ProductFormModal } from '../../components/admin/product-form-modal';
import { ProductsTable } from '../../components/admin/products-table';
import { PaginationControls } from '../../components/pagination/pagination-controls';
import type { ProductFormValues } from '../../schemas/forms';
import type { RegisterProductDTO } from '../../dto/product/registerProductDTO';
import type { updateProductDTO } from '../../dto/product/updateProductDTO';
import type { Product } from '../../types/Product';
import {
  useCreateProduct,
  useDeleteProduct,
  useProductCatalog,
  useUpdateProduct,
} from '../../hooks/useProducts';
import { getErrorMessage } from '../../utils/get-error-message';
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from '../../utils/toast';
import { AdminNavigation } from '../../components/admin/admin-navigation';
import { PRODUCTS_PER_PAGE } from '../../services/products';

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const productsQuery = useProductCatalog(page, PRODUCTS_PER_PAGE);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function openCreateForm() {
    setEditingProduct(null);
    createProduct.reset();
    updateProduct.reset();
    setIsFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    createProduct.reset();
    updateProduct.reset();
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
  }

  function submitProduct(values: ProductFormValues) {
    if (editingProduct) {
      const toastId = showLoadingToast('Salvando alterações do produto...');
      const payload: updateProductDTO = {
        name: values.name,
        description: values.description,
        price: values.price,
        stock: values.stock,
        image_url: values.imageUrl,
      };
      updateProduct.mutate(
        { id: editingProduct.id, product: payload },
        {
          onSuccess: () => {
            showSuccessToast('Produto atualizado com sucesso.', toastId);
            closeForm();
          },
          onError: (error) =>
            showErrorToast(
              getErrorMessage(error, 'Não foi possível atualizar o produto.'),
              toastId,
            ),
        },
      );
      return;
    }

    const toastId = showLoadingToast('Criando produto...');
    const payload: RegisterProductDTO = {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      image_url: values.imageUrl,
    };
    createProduct.mutate(payload, {
      onSuccess: () => {
        showSuccessToast('Produto criado com sucesso.', toastId);
        setPage(1);
        closeForm();
      },
      onError: (error) =>
        showErrorToast(
          getErrorMessage(error, 'Não foi possível criar o produto.'),
          toastId,
        ),
    });
  }

  function handleDeleteProduct(productId: number) {
    const product = productsQuery.data?.items.find((item) => item.id === productId);
    const toastId = showLoadingToast(
      `Removendo ${product?.name ?? 'produto'} da vitrine...`,
    );

    deleteProduct.mutate(productId, {
      onSuccess: () => {
        showSuccessToast(
          `${product?.name ?? 'Produto'} removido da vitrine.`,
          toastId,
        );
        if (page > 1 && productsQuery.data?.items.length === 1) {
          setPage(page - 1);
        }
      },
      onError: (error) =>
        showErrorToast(
          getErrorMessage(error, 'Não foi possível remover o produto.'),
          toastId,
        ),
    });
  }

  const mutationError = createProduct.isError
    ? getErrorMessage(createProduct.error, 'Não foi possível criar o produto.')
    : updateProduct.isError
      ? getErrorMessage(
          updateProduct.error,
          'Não foi possível atualizar o produto.',
        )
      : undefined;

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1160px] px-5 pb-16 pt-9 sm:px-8 sm:pt-10">
      <div className="grid gap-7 md:grid-cols-[190px_minmax(0,1fr)]">
        <AdminNavigation active="products" />
        <div>
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

          {productsQuery.isPending ? (
            <div
              role="status"
              aria-label="Carregando produtos"
              className="flex min-h-[300px] items-center justify-center"
            >
              <span className="loading loading-spinner loading-lg text-primary-color" />
            </div>
          ) : productsQuery.isError ? (
            <section
              role="alert"
              className="rounded-[20px] border border-red-200 bg-[#fffdf9] p-6 text-center"
            >
              <p className="text-sm text-[#69746c]">
                {getErrorMessage(
                  productsQuery.error,
                  'Não foi possível carregar os produtos.',
                )}
              </p>
              <button
                type="button"
                onClick={() => void productsQuery.refetch()}
                className="mt-4 h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white hover:bg-[#123a23]"
              >
                Tentar novamente
              </button>
            </section>
          ) : (
            <>
              {deleteProduct.isError && (
                <p role="alert" className="mb-4 text-sm text-error">
                  {getErrorMessage(
                    deleteProduct.error,
                    'Não foi possível excluir o produto.',
                  )}
                </p>
              )}
              <ProductsTable
                products={productsQuery.data.items}
                deletingProductId={
                  deleteProduct.isPending ? deleteProduct.variables : undefined
                }
                onEdit={openEditForm}
                onDelete={handleDeleteProduct}
              />
              <PaginationControls
                page={productsQuery.data.page}
                totalPages={productsQuery.data.totalPages}
                total={productsQuery.data.total}
                itemLabel="produtos"
                onPageChange={setPage}
              />
            </>
          )}

          {isFormOpen && (
            <ProductFormModal
              product={editingProduct}
              isSaving={createProduct.isPending || updateProduct.isPending}
              error={mutationError}
              onClose={closeForm}
              onSubmit={submitProduct}
            />
          )}
        </div>
      </div>
    </main>
  );
}
