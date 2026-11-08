interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  total,
  itemLabel,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={`Paginação de ${itemLabel}`}
      className="mt-8 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-sm text-[#69746c]">
        {total} {itemLabel} · página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-10 rounded-full border border-[#ded4c2] px-4 text-sm font-medium text-[#28352d] hover:bg-[#eee6d4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-10 rounded-full border border-[#ded4c2] px-4 text-sm font-medium text-[#28352d] hover:bg-[#eee6d4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </nav>
  );
}
