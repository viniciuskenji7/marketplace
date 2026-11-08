import Link from 'next/link';

export function CatalogNavigation({ active }: { active: 'products' | 'workshops' }) {
  const links = [
    { href: '/', label: 'Produtos', key: 'products' as const },
    { href: '/oficinas', label: 'Oficinas', key: 'workshops' as const },
  ];

  return (
    <aside
      aria-label="Catálogo"
      className="md:sticky md:top-[5.75rem] md:self-start"
    >
      <nav className="flex gap-2 md:flex-col">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            aria-current={active === link.key ? 'page' : undefined}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              active === link.key
                ? 'bg-[#e6eddf] text-primary-color'
                : 'text-[#69746c] hover:bg-[#f1eadb] hover:text-primary-color'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
