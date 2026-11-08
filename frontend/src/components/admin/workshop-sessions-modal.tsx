'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  useCreateWorkshopSession,
  useDeleteWorkshopSession,
  useUpdateWorkshopSession,
  useWorkshopSessions,
} from '../../hooks/useWorkshops';
import type { Workshop } from '../../types/Workshop';
import { getErrorMessage } from '../../utils/get-error-message';

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

export function WorkshopSessionsModal({
  workshop,
  onClose,
}: {
  workshop: Workshop;
  onClose: () => void;
}) {
  const sessionsQuery = useWorkshopSessions(workshop.id);
  const createSession = useCreateWorkshopSession();
  const updateSession = useUpdateWorkshopSession();
  const deleteSession = useDeleteWorkshopSession();
  const [startsAt, setStartsAt] = useState('');
  const [capacity, setCapacity] = useState(1);
  const isSaving =
    createSession.isPending || updateSession.isPending || deleteSession.isPending;
  const error =
    createSession.error ?? updateSession.error ?? deleteSession.error;

  function addSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createSession.mutate(
      {
        workshopId: workshop.id,
        input: { starts_at: toIsoDateTime(startsAt), capacity },
      },
      {
        onSuccess: () => {
          setStartsAt('');
          setCapacity(1);
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workshop-sessions-title"
        className="my-auto w-full max-w-[720px] rounded-[18px] border border-[#e1d7c6] bg-background p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Agenda da oficina
            </p>
            <h2
              id="workshop-sessions-title"
              className="font-display text-[22px] font-bold text-[#14261b]"
            >
              {workshop.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar sessões"
            className="grid size-9 shrink-0 place-items-center rounded-full text-[#69746c] hover:bg-[#eee6d4]"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={addSession}
          className="grid gap-3 rounded-xl border border-[#e1d7c6] bg-[#fffdf9] p-4 sm:grid-cols-[1fr_130px_auto] sm:items-end"
        >
          <label className="text-sm text-[#28352d]">
            Data e hora
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 text-sm outline-none focus:border-primary-color"
            />
          </label>
          <label className="text-sm text-[#28352d]">
            Vagas
            <input
              type="number"
              min={1}
              required
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
              className="mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none focus:border-primary-color"
            />
          </label>
          <button
            type="submit"
            disabled={isSaving || !startsAt || capacity < 1}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary-color px-4 text-sm font-medium text-white hover:bg-[#123a23] disabled:opacity-50"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </form>
        <p className="mt-2 text-xs text-[#788078]">
          O horário de término é calculado pela duração cadastrada nos dados da
          oficina.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {getErrorMessage(error, 'Não foi possível salvar a sessão.')}
          </p>
        )}

        <div className="mt-5 max-h-[45vh] space-y-3 overflow-y-auto">
          {sessionsQuery.isPending ? (
            <div role="status" className="py-8 text-center text-sm text-[#69746c]">
              Carregando sessões...
            </div>
          ) : sessionsQuery.isError ? (
            <p role="alert" className="py-8 text-center text-sm text-error">
              {getErrorMessage(
                sessionsQuery.error,
                'Não foi possível carregar as sessões.',
              )}
            </p>
          ) : sessionsQuery.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#69746c]">
              Nenhuma sessão cadastrada.
            </p>
          ) : (
            sessionsQuery.data.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                disabled={isSaving}
                onSave={(startsAtValue, capacityValue) =>
                  updateSession.mutate({
                    sessionId: session.id,
                    workshopId: workshop.id,
                    input: {
                      starts_at: toIsoDateTime(startsAtValue),
                      capacity: capacityValue,
                    },
                  })
                }
                onDelete={() => {
                  if (window.confirm('Excluir esta sessão?')) {
                    deleteSession.mutate({
                      sessionId: session.id,
                      workshopId: workshop.id,
                    });
                  }
                }}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SessionRow({
  session,
  disabled,
  onSave,
  onDelete,
}: {
  session: {
    id: number;
    startsAt: string;
    capacity: number;
    bookedCount: number;
    availableSpots: number;
    durationMinutes: number;
  };
  disabled: boolean;
  onSave: (startsAt: string, capacity: number) => void;
  onDelete: () => void;
}) {
  const [startsAt, setStartsAt] = useState(toLocalDateTime(session.startsAt));
  const [capacity, setCapacity] = useState(session.capacity);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(startsAt, capacity);
      }}
      className="grid gap-3 rounded-xl border border-[#e1d7c6] bg-[#fffdf9] p-4 sm:grid-cols-[1fr_100px_110px_auto] sm:items-end"
    >
      <label className="text-xs text-[#69746c]">
        Data e hora
        <input
          type="datetime-local"
          required
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          className="mt-1 block h-9 w-full rounded-lg border border-[#ded4c2] bg-transparent px-2 text-sm text-[#28352d]"
        />
      </label>
      <label className="text-xs text-[#69746c]">
        Capacidade
        <input
          type="number"
          min={Math.max(1, session.bookedCount)}
          required
          value={capacity}
          onChange={(event) => setCapacity(Number(event.target.value))}
          className="mt-1 block h-9 w-full rounded-lg border border-[#ded4c2] bg-transparent px-2 text-sm text-[#28352d]"
        />
      </label>
      <p className="pb-2 text-xs text-[#69746c]">
        {session.availableSpots} vagas livres
        <br />
        Termina às{' '}
        {new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(
          new Date(
            new Date(session.startsAt).getTime() +
              session.durationMinutes * 60_000,
          ),
        )}
      </p>
      <div className="flex justify-end gap-1">
        <button
          type="submit"
          disabled={disabled || capacity < session.bookedCount}
          aria-label="Salvar sessão"
          className="grid size-9 place-items-center rounded-full text-primary-color hover:bg-[#e6eddf] disabled:opacity-50"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Excluir sessão"
          className="grid size-9 place-items-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </form>
  );
}
