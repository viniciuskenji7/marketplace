import { CatalogNavigation } from '../../components/catalog/catalog-navigation';
import { WorkshopList } from '../../components/workshop/workshop-list';

export default function WorkshopsPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1010px] px-5 pb-16 pt-12 sm:px-8 sm:pt-14">
      <section className="mb-8">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[1.6px] text-secondary-color">
          Experiências feitas com cuidado
        </p>
        <h1 className="font-display text-[42px] font-bold leading-[1.04] tracking-[-1.8px] text-[#13251a] sm:text-[54px]">
          Oficinas para <em className="font-semibold text-primary-color">fazer junto.</em>
        </h1>
      </section>
      <div className="grid gap-7 md:grid-cols-[160px_minmax(0,1fr)]">
        <CatalogNavigation active="workshops" />
        <WorkshopList />
      </div>
    </main>
  );
}
