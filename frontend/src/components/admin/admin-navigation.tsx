import { CalendarDays, Package } from 'lucide-react';
import Link from 'next/link';

export function AdminNavigation({
  active,
}: {
  active: 'products' | 'workshops';
}) {
  const links = [
    { href: '/admin', label: 'Produtos', key: 'products' as const, icon: Package },
    {
      href: '/admin/oficinas',
      label: 'Oficinas',
      key: 'workshops' as const,
      icon: CalendarDays,
    },
  ];

  return (
    <aside
      aria-label="Navegação da administração"
      className="md:sticky md:top-[5.75rem] md:self-start"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[1.4px] text-[#788078]">
        Gerenciar
      </p>
      <nav className="flex gap-2 md:flex-col">
        {links.map(({ href, label, key, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={active === key ? 'page' : undefined}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
              active === key
                ? 'bg-[#e6eddf] text-primary-color'
                : 'text-[#69746c] hover:bg-[#f1eadb] hover:text-primary-color'
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
