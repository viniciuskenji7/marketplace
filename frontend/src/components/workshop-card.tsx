'use client';

import { CalendarDays, Clock3, MapPin, Plus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Workshop, WorkshopSession } from '../types/Workshop';
import { formatCentsAsCurrency } from '../utils/format';

interface WorkshopCardProps {
  workshop: Workshop;
  onAdd: (workshop: Workshop, sessionId: number, quantity: number) => void;
}

function formatSessionDate(startsAt: string) {
  const date = new Date(startsAt);
  return {
    date: new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
    }).format(date),
    time: new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  };
}

function sessionLabel(session: WorkshopSession) {
  const { date, time } = formatSessionDate(session.startsAt);
  const endTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(
    new Date(
      new Date(session.startsAt).getTime() +
        session.durationMinutes * 60_000,
    ),
  );
  return `${date} · ${time}–${endTime} · ${session.availableSpots} vaga${
    session.availableSpots === 1 ? '' : 's'
  }`;
}

export function WorkshopCard({ workshop, onAdd }: WorkshopCardProps) {
  const availableSessions = useMemo(
    () => workshop.sessions.filter((session) => session.availableSpots > 0),
    [workshop.sessions],
  );
  const hasUpcomingSessions = workshop.sessions.length > 0;
  const [selectedSessionId, setSelectedSessionId] = useState<number | undefined>(
    availableSessions[0]?.id,
  );
  const [quantity, setQuantity] = useState(1);
  const [now, setNow] = useState<number | null>(null);
  const selectedSession =
    availableSessions.find((session) => session.id === selectedSessionId) ??
    availableSessions[0];
  const isSoldOut = hasUpcomingSessions && availableSessions.length === 0;
  const createdAt = Date.parse(workshop.createdAt);
  const isNew =
    now !== null &&
    Number.isFinite(createdAt) &&
    now >= createdAt &&
    now - createdAt <= 30 * 24 * 60 * 60 * 1000;
  const isLowOnSpots =
    !isSoldOut &&
    Math.min(...availableSessions.map((session) => session.availableSpots)) <= 3;

  useEffect(() => {
    let expirationTimer: ReturnType<typeof setTimeout> | undefined;
    const initializeTimer = setTimeout(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      const remainingTime = createdAt + 30 * 24 * 60 * 60 * 1000 - currentTime;
      if (Number.isFinite(createdAt) && remainingTime > 0) {
        expirationTimer = setTimeout(() => setNow(Date.now()), remainingTime);
      }
    }, 0);

    return () => {
      clearTimeout(initializeTimer);
      if (expirationTimer) clearTimeout(expirationTimer);
    };
  }, [createdAt]);

  return (
    <article className="overflow-hidden rounded-[19px] border border-[#e8dfd0] bg-[#fffdf9] shadow-[0_8px_24px_rgba(47,39,23,0.07)]">
      <div
        role={workshop.imageUrl ? 'img' : undefined}
        aria-label={workshop.imageUrl ? workshop.name : undefined}
        className="relative aspect-[1.4/1] bg-[#eadbbd] bg-cover bg-center"
        style={
          workshop.imageUrl
            ? { backgroundImage: `url("${workshop.imageUrl.replaceAll('"', '%22')}")` }
            : undefined
        }
      >
        {!workshop.imageUrl && (
          <div className="grid h-full place-items-center text-[#907b58]">
            <CalendarDays size={44} strokeWidth={1.2} />
          </div>
        )}
        {isSoldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#39433c]/90 px-3 py-1.5 text-xs font-semibold text-white">
            Esgotada
          </span>
        ) : !hasUpcomingSessions ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#687267]/90 px-3 py-1.5 text-xs font-semibold text-white">
            Sem datas
          </span>
        ) : isLowOnSpots ? (
          <span className="absolute left-3 top-3 rounded-full bg-secondary-color px-3 py-1.5 text-xs font-semibold text-white">
            Últimas vagas
          </span>
        ) : null}
        {isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
            Novo
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="font-display text-[20px] font-bold leading-tight text-[#14261b]">
          {workshop.name}
        </h2>
        <p className="mt-2 min-h-10 text-[13px] leading-5 text-[#788078]">
          {workshop.description}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#69746c]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            {workshop.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} />
            <span className="truncate">{workshop.location}</span>
          </span>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#788078]">
            Sessão e disponibilidade
          </p>
          <select
            aria-label={`Escolher sessão de ${workshop.name}`}
            value={selectedSession?.id ?? ''}
            disabled={!selectedSession}
            onChange={(event) => {
              setSelectedSessionId(Number(event.target.value));
              setQuantity(1);
            }}
            className="mt-1 h-10 w-full rounded-[10px] border border-[#ded4c2] bg-[#fffdf9] px-3 text-xs text-[#28352d] outline-none focus:border-primary-color disabled:opacity-60"
          >
            {isSoldOut ? (
              <option value="">Nenhuma sessão disponível</option>
            ) : (
              availableSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {sessionLabel(session)}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <span className="block text-[11px] text-[#788078]">
              por participante
            </span>
            <strong className="font-display text-[20px] font-bold text-primary-color">
              {formatCentsAsCurrency(Math.round(workshop.price * 100))}
            </strong>
          </div>
          <label className="flex items-center gap-1.5 text-xs text-[#69746c]">
            <Users size={15} />
            <span className="sr-only">Participantes</span>
            <input
              type="number"
              min={1}
              max={Math.min(99, selectedSession?.availableSpots ?? 1)}
              value={quantity}
              disabled={!selectedSession}
              onChange={(event) => {
                const nextQuantity = Number(event.target.value);
                setQuantity(
                  Math.min(
                    Math.max(1, Number.isNaN(nextQuantity) ? 1 : nextQuantity),
                    Math.min(99, selectedSession?.availableSpots ?? 1),
                  ),
                );
              }}
              className="h-9 w-16 rounded-lg border border-[#ded4c2] bg-transparent px-2 text-center text-sm text-[#28352d] outline-none focus:border-primary-color disabled:opacity-60"
              aria-label={`Quantidade de participantes para ${workshop.name}`}
            />
          </label>
        </div>
        <p className="mt-1 text-right text-[11px] text-[#788078]">
          {selectedSession
            ? `${selectedSession.availableSpots} vaga${
                selectedSession.availableSpots === 1 ? '' : 's'
              } disponível(is)`
            : 'Sem vagas disponíveis'}
        </p>
        <button
          type="button"
          disabled={isSoldOut || !selectedSession}
          onClick={() =>
            selectedSession &&
            onAdd(workshop, selectedSession.id, quantity)
          }
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary-color px-4 text-sm font-medium text-white hover:bg-[#123a23] disabled:cursor-not-allowed disabled:bg-[#d5d2ca] disabled:text-[#777a74]"
        >
          {!isSoldOut && <Plus size={16} />}
          {isSoldOut
            ? 'Esgotada'
            : selectedSession
              ? 'Adicionar reserva'
              : 'Sem datas'}
        </button>
      </div>
    </article>
  );
}
