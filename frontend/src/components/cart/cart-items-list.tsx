import { CalendarDays, Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types/Cart';
import { ProductScene } from '../product-card/product-scene';
import { formatCentsAsCurrency } from '@/src/utils/format';

interface CartItemsListProps {
  items: CartItem[];
  isUpdating: boolean;
  onQuantityChange: (item: CartItem, quantity: number) => void;
}

export function CartItemsList({
  items,
  isUpdating,
  onQuantityChange,
}: CartItemsListProps) {
  return (
    <section
      aria-label="Itens do carrinho"
      className="rounded-[20px] border border-[#e1d7c6] bg-[#fffdf9] px-5 sm:px-6"
    >
      {items.map((item, index) => (
        <article
          key={`${item.productId}-${item.sessionId ?? 'physical'}`}
          className={`flex flex-wrap items-center gap-x-4 gap-y-4 py-5 sm:flex-nowrap sm:gap-4 sm:py-6 ${
            index < items.length - 1 ? 'border-b border-[#e1d7c6]' : ''
          }`}
        >
          <div className="grid size-[78px] shrink-0 place-items-center overflow-hidden rounded-[16px] bg-[#eadbbd]">
            {item.type === 'workshop' ? (
              <CalendarDays size={28} className="text-[#907b58]" />
            ) : (
              <ProductScene scene="ceramic" />
            )}
          </div>
          <div className="min-w-[145px] flex-1">
            <h2 className="font-medium text-[#14261b]">{item.name}</h2>
            <p className="mt-1 text-[13px] text-[#788078]">
              {formatCentsAsCurrency(item.unitPriceCents)} /{' '}
              {item.type === 'workshop' ? 'participante' : 'un.'}
            </p>
            {item.type === 'workshop' && (
              <div className="mt-2 space-y-0.5 text-xs text-[#69746c]">
                {item.startsAt && (
                  <p>
                    {new Intl.DateTimeFormat('pt-BR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(item.startsAt))}
                  </p>
                )}
                {item.location && <p>{item.location}</p>}
                <p>{item.quantity} participante(s)</p>
              </div>
            )}
          </div>
          <div className="flex h-9 items-center rounded-full border border-[#e1d7c6] text-sm">
            <button
              type="button"
              aria-label={`Diminuir quantidade de ${item.name}`}
              disabled={isUpdating}
              onClick={() => onQuantityChange(item, item.quantity - 1)}
              className="grid size-9 place-items-center text-[#657066] hover:text-primary-color disabled:opacity-50"
            >
              <Minus size={15} />
            </button>
            <span className="w-7 text-center">{item.quantity}</span>
            <button
              type="button"
              aria-label={`Aumentar quantidade de ${item.name}`}
              disabled={isUpdating}
              onClick={() => onQuantityChange(item, item.quantity + 1)}
              className="grid size-9 place-items-center text-[#26352a] hover:text-primary-color disabled:opacity-50"
            >
              <Plus size={15} />
            </button>
          </div>
          <strong className="w-[82px] text-right text-[15px] font-semibold text-[#14261b]">
            {formatCentsAsCurrency(item.subTotalCents)}
          </strong>
          <button
            type="button"
            aria-label={`Remover ${item.name} do carrinho`}
            disabled={isUpdating}
            onClick={() => onQuantityChange(item, 0)}
            className="ml-auto grid size-9 place-items-center text-[#687267] transition-colors hover:text-red-600 disabled:opacity-50 sm:ml-0"
          >
            <Trash2 size={17} />
          </button>
        </article>
      ))}
    </section>
  );
}
