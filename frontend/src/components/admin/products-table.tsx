import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '../../types/Product';

interface ProductsTableProps {
  products: Product[];
  deletingProductId?: number;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

const formatPrice = (value: number) =>
  Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export function ProductsTable({
  products,
  deletingProductId,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9]">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#e1d7c6] text-[13px] text-[#69746c]">
            <th className="px-6 py-5 font-medium">Produto</th>
            <th className="w-[170px] px-6 py-5 text-right font-medium">
              Preço
            </th>
            <th className="w-[145px] px-6 py-5 text-right font-medium">
              Estoque
            </th>
            <th className="w-[145px] px-6 py-5 text-right font-medium">
              Ações
            </th>
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
                  product.stock < 5
                    ? 'text-secondary-color'
                    : 'text-[#28352d]'
                }`}
              >
                {product.stock}
              </td>
              <td className="px-6 py-5">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Editar ${product.name}`}
                    className="grid size-10 place-items-center rounded-full text-[#26352a] transition-colors hover:bg-[#f1eadb]"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id)}
                    disabled={deletingProductId === product.id}
                    aria-label={`Excluir ${product.name}`}
                    className="grid size-10 place-items-center rounded-full text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingProductId === product.id ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-[#69746c]"
              >
                Nenhum produto cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
