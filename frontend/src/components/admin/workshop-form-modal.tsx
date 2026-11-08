'use client';

import { X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { Workshop, WorkshopInput } from '../../types/Workshop';

interface WorkshopFormModalProps {
  workshop: Workshop | null;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (input: WorkshopInput) => void;
}

const fieldClass =
  'mt-1 block h-10 w-full rounded-[10px] border border-[#ded4c2] bg-transparent px-3 outline-none shadow-sm focus:border-primary-color';

export function WorkshopFormModal({
  workshop,
  isSaving,
  error,
  onClose,
  onSubmit,
}: WorkshopFormModalProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      name: String(formData.get('name')).trim(),
      description: String(formData.get('description')).trim(),
      image_url: String(formData.get('image_url')).trim(),
      price: Number(formData.get('price')),
      duration_minutes: Number(formData.get('duration_minutes')),
      location: String(formData.get('location')).trim(),
    });
  }

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
        aria-labelledby="workshop-form-title"
        className="my-auto w-full max-w-[560px] rounded-[18px] border border-[#e1d7c6] bg-background p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="workshop-form-title"
            className="font-display text-[22px] font-bold text-[#14261b]"
          >
            {workshop ? 'Editar oficina' : 'Nova oficina'}
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
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-[#28352d]">
            Nome
            <input
              name="name"
              required
              minLength={2}
              defaultValue={workshop?.name ?? ''}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm text-[#28352d]">
            Descrição
            <textarea
              name="description"
              required
              minLength={5}
              rows={3}
              defaultValue={workshop?.description ?? ''}
              className="mt-1 block w-full resize-y rounded-[10px] border border-[#ded4c2] bg-transparent px-3 py-2 outline-none shadow-sm focus:border-primary-color"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[#28352d]">
              Preço por participante (R$)
              <input
                type="number"
                name="price"
                required
                min="0.01"
                step="0.01"
                defaultValue={workshop?.price ?? ''}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm text-[#28352d]">
              Duração (minutos)
              <input
                type="number"
                name="duration_minutes"
                required
                min="1"
                step="1"
                defaultValue={workshop?.durationMinutes ?? ''}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="block text-sm text-[#28352d]">
            Local
            <input
              name="location"
              required
              minLength={2}
              defaultValue={workshop?.location ?? ''}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm text-[#28352d]">
            URL da imagem
            <input
              type="url"
              name="image_url"
              defaultValue={workshop?.imageUrl ?? ''}
              placeholder="https://..."
              className={fieldClass}
            />
          </label>
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
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
              {isSaving ? 'Salvando...' : 'Salvar oficina'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
