'use client';

import { useState } from 'react';
import { useAddToCart } from '../hooks/useCart';
import { useWorkshops } from '../hooks/useWorkshops';
import { WORKSHOPS_PER_PAGE } from '../services/workshops';
import type { Workshop } from '../types/Workshop';
import { getErrorMessage } from '../utils/get-error-message';
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from '../utils/toast';
import { PaginationControls } from './pagination/pagination-controls';
import { WorkshopCard } from './workshop/workshop-card';

export function WorkshopList() {
  const [page, setPage] = useState(1);
  const workshopsQuery = useWorkshops(page, WORKSHOPS_PER_PAGE);
  const addToCart = useAddToCart();

  function addReservation(
    workshop: Workshop,
    sessionId: number,
    quantity: number,
  ) {
    const toastId = showLoadingToast('Adicionando reserva ao carrinho...');
    addToCart.mutate(
      {
        productId: workshop.id,
        sessionId,
        quantity,
        optimisticWorkshop: workshop,
      },
      {
        onSuccess: () =>
          showSuccessToast(
            `${workshop.name} adicionado ao carrinho.`,
            toastId,
          ),
        onError: (error) =>
          showErrorToast(
            getErrorMessage(
              error,
              'Não foi possível adicionar a reserva ao carrinho.',
            ),
            toastId,
          ),
      },
    );
  }

  if (workshopsQuery.isPending) {
    return (
      <div
        role="status"
        aria-label="Carregando oficinas"
        className="flex min-h-[300px] items-center justify-center"
      >
        <span className="loading loading-spinner loading-lg text-primary-color" />
      </div>
    );
  }

  if (workshopsQuery.isError) {
    return (
      <section
        role="alert"
        className="rounded-2xl border border-red-200 bg-[#fffdf9] p-8 text-center"
      >
        <p className="text-sm text-[#69746c]">
          {getErrorMessage(
            workshopsQuery.error,
            'Não foi possível carregar as oficinas.',
          )}
        </p>
        <button
          type="button"
          onClick={() => void workshopsQuery.refetch()}
          className="mt-4 h-10 rounded-full bg-primary-color px-5 text-sm font-medium text-white"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const pageData = workshopsQuery.data;

  return (
    <>
      {pageData.items.length > 0 ? (
        <section
          aria-label="Oficinas"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pageData.items.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              onAdd={addReservation}
            />
          ))}
        </section>
      ) : (
        <p className="rounded-2xl border border-[#e8dfd0] bg-[#fffdf9] p-8 text-center text-sm text-[#69746c]">
          Nenhuma oficina disponível no momento.
        </p>
      )}
      <PaginationControls
        page={pageData.page}
        totalPages={pageData.totalPages}
        total={pageData.total}
        itemLabel="oficinas"
        onPageChange={setPage}
      />
    </>
  );
}
