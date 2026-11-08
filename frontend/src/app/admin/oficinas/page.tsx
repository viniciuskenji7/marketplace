'use client';

import { CalendarDays, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { AdminNavigation } from '../../../components/admin/admin-navigation';
import { WorkshopFormModal } from '../../../components/admin/workshop-form-modal';
import { WorkshopSessionsModal } from '../../../components/admin/workshop-sessions-modal';
import {
  useCreateWorkshop,
  useUpdateWorkshop,
  useWorkshops,
} from '../../../hooks/useWorkshops';
import type { Workshop, WorkshopInput } from '../../../types/Workshop';
import { formatCentsAsCurrency } from '../../../utils/format';
import { getErrorMessage } from '../../../utils/get-error-message';
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from '../../../utils/toast';
import { PaginationControls } from '../../../components/pagination/pagination-controls';
import { WORKSHOPS_PER_PAGE } from '../../../services/workshops';

export default function AdminWorkshopsPage() {
  const [page, setPage] = useState(1);
  const workshopsQuery = useWorkshops(page, WORKSHOPS_PER_PAGE);
  const createWorkshop = useCreateWorkshop();
  const updateWorkshop = useUpdateWorkshop();
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessionsWorkshop, setSessionsWorkshop] = useState<Workshop | null>(
    null,
  );

  function openCreateForm() {
    setEditingWorkshop(null);
    createWorkshop.reset();
    updateWorkshop.reset();
    setIsFormOpen(true);
  }

  function openEditForm(workshop: Workshop) {
    setEditingWorkshop(workshop);
    createWorkshop.reset();
    updateWorkshop.reset();
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingWorkshop(null);
  }

  function saveWorkshop(input: WorkshopInput) {
    const toastId = showLoadingToast(
      editingWorkshop ? 'Salvando alterações...' : 'Criando oficina...',
    );
    if (editingWorkshop) {
      updateWorkshop.mutate(
        { id: editingWorkshop.id, input },
        {
          onSuccess: () => {
            showSuccessToast('Oficina atualizada com sucesso.', toastId);
            closeForm();
          },
          onError: (error) =>
            showErrorToast(
              getErrorMessage(error, 'Não foi possível atualizar a oficina.'),
              toastId,
            ),
        },
      );
      return;
    }

    createWorkshop.mutate(input, {
      onSuccess: () => {
        showSuccessToast('Oficina criada com sucesso.', toastId);
        closeForm();
      },
      onError: (error) =>
        showErrorToast(
          getErrorMessage(error, 'Não foi possível criar a oficina.'),
          toastId,
        ),
    });
  }

  const saving = createWorkshop.isPending || updateWorkshop.isPending;
  const formError = createWorkshop.isError
    ? getErrorMessage(createWorkshop.error, 'Não foi possível criar a oficina.')
    : updateWorkshop.isError
      ? getErrorMessage(
          updateWorkshop.error,
          'Não foi possível atualizar a oficina.',
        )
      : undefined;

  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1160px] px-5 pb-16 pt-9 sm:px-8 sm:pt-10">
      <div className="grid gap-7 md:grid-cols-[190px_minmax(0,1fr)]">
        <AdminNavigation active="workshops" />
        <div>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[1.6px] text-secondary-color">
                Administração
              </p>
              <h1 className="mt-1 font-display text-[36px] font-bold text-[#14261b]">
                Oficinas
              </h1>
              <p className="mt-1 text-sm text-[#69746c]">
                Cadastre as oficinas e gerencie suas sessões e capacidades.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-color px-5 text-sm font-medium text-white shadow-sm hover:bg-[#123a23]"
            >
              <Plus size={17} />
              Nova oficina
            </button>
          </div>

          {workshopsQuery.isPending ? (
            <div
              role="status"
              aria-label="Carregando oficinas"
              className="flex min-h-[300px] items-center justify-center"
            >
              <span className="loading loading-spinner loading-lg text-primary-color" />
            </div>
          ) : workshopsQuery.isError ? (
            <section
              role="alert"
              className="rounded-[20px] border border-red-200 bg-[#fffdf9] p-6 text-center"
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
          ) : (
            <>
              <div className="overflow-x-auto rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9]">
                <table className="w-full min-w-[650px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#e1d7c6] text-[13px] text-[#69746c]">
                      <th className="px-6 py-5 font-medium">Oficina</th>
                      <th className="px-6 py-5 text-right font-medium">Preço</th>
                      <th className="px-6 py-5 text-right font-medium">Sessões</th>
                      <th className="px-6 py-5 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshopsQuery.data.items.map((workshop) => (
                      <tr
                        key={workshop.id}
                        className="border-b border-[#e8dfd0] last:border-0"
                      >
                        <td className="px-6 py-5">
                          <p className="font-medium text-[#14261b]">
                            {workshop.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-[13px] text-[#788078]">
                            {workshop.description}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-[#28352d]">
                          {formatCentsAsCurrency(
                            Math.round(workshop.price * 100),
                          )}
                        </td>
                        <td className="px-6 py-5 text-right text-sm text-[#28352d]">
                          {workshop.sessions.length}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSessionsWorkshop(workshop)}
                              aria-label={`Gerenciar sessões de ${workshop.name}`}
                              className="grid size-10 place-items-center rounded-full text-primary-color transition-colors hover:bg-[#e6eddf]"
                            >
                              <CalendarDays size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditForm(workshop)}
                              aria-label={`Editar ${workshop.name}`}
                              className="grid size-10 place-items-center rounded-full text-[#26352a] transition-colors hover:bg-[#f1eadb]"
                            >
                              <Pencil size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {workshopsQuery.data.items.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-[#69746c]"
                        >
                          Nenhuma oficina cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls
                page={workshopsQuery.data.page}
                totalPages={workshopsQuery.data.totalPages}
                total={workshopsQuery.data.total}
                itemLabel="oficinas"
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
      {isFormOpen && (
        <WorkshopFormModal
          workshop={editingWorkshop}
          isSaving={saving}
          error={formError}
          onClose={closeForm}
          onSubmit={saveWorkshop}
        />
      )}
      {sessionsWorkshop && (
        <WorkshopSessionsModal
          workshop={sessionsWorkshop}
          onClose={() => setSessionsWorkshop(null)}
        />
      )}
    </main>
  );
}
