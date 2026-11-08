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
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-[#69746c]" aria-live="polite">
        {total} {itemLabel} · página {page} de {totalPages}
      </p>
      <nav aria-label={`Paginação de ${itemLabel}`} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-sm border-[#ded4c2] bg-[#fffdf9] text-[#28352d] hover:bg-[#eee6d4]"
          aria-label="Página anterior"
        >
          Anterior
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-label={`Página ${pageNumber}`}
              aria-current={pageNumber === page ? 'page' : undefined}
              className={`btn btn-sm ${
                pageNumber === page
                  ? 'border-primary-color bg-primary-color text-white hover:bg-primary-color'
                  : 'border-[#ded4c2] bg-[#fffdf9] text-[#28352d] hover:bg-[#eee6d4]'
              }`}
            >
              {pageNumber}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-sm border-[#ded4c2] bg-[#fffdf9] text-[#28352d] hover:bg-[#eee6d4]"
          aria-label="Próxima página"
        >
          Próxima
        </button>
      </nav>
    </div>
  );
}
