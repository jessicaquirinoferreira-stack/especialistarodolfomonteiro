import { ArrowRight, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { EmpreendimentoCard } from '../components/home/EmpreendimentoCard';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { useSite } from '../context/SiteContext';
import { recordAnalyticsEvent } from '../lib/firestoreService';

export function EmpreendimentosPage() {
  const { empreendimentos, properties, landingPages } = useSite();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isLancamentosRoute = location.pathname.startsWith('/lancamentos');

  const [viewMode, setViewMode] = useState<'empreendimentos' | 'unidades'>('empreendimentos');
  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [region, setRegion] = useState(searchParams.get('regiao') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('quartos') || '');
  const [condition, setCondition] = useState('');
  const [onlyLaunches, setOnlyLaunches] = useState(isLancamentosRoute);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'alpha'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setOnlyLaunches(isLancamentosRoute);
    void recordAnalyticsEvent(
      'page_view',
      location.pathname,
      isLancamentosRoute ? 'Lançamentos' : 'Empreendimentos'
    );
  }, [isLancamentosRoute, location.pathname]);

  const premiumPage = landingPages.find((lp) => lp.isPremium && lp.status === 'published');

  const regions = useMemo(() => {
    const list = new Set<string>();
    empreendimentos.forEach((e) => {
      if (e.neighborhood) list.add(e.neighborhood);
      if (e.city) list.add(e.city);
    });
    return Array.from(list);
  }, [empreendimentos]);

  const filteredEmps = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const list = empreendimentos.filter((item) => {
      if (q) {
        const hay = `${item.name} ${item.neighborhood} ${item.city} ${item.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (region) {
        if (item.neighborhood !== region && item.city !== region) return false;
      }
      if (bedrooms) {
        if (!item.bedroomsSummary.includes(bedrooms)) return false;
      }
      if (condition === 'fgts' && !item.tendaConditions.some((c) => c.toLowerCase().includes('fgts'))) {
        return false;
      }
      if (condition === 'subsidio' && !item.tendaConditions.some((c) => c.toLowerCase().includes('subs'))) {
        return false;
      }
      if (onlyLaunches && !(item.featured || item.status === 'Lançamento' || item.status === 'Breve lançamento')) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      if (sortBy === 'price_asc') return (a.priceNumeric || 9999999) - (b.priceNumeric || 9999999);
      if (sortBy === 'price_desc') return (b.priceNumeric || 0) - (a.priceNumeric || 0);
      return Number(b.featured) - Number(a.featured);
    });
  }, [empreendimentos, queryText, region, bedrooms, condition, onlyLaunches, sortBy]);

  const filteredProps = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return properties.filter((item) => {
      if (q) {
        const hay = `${item.title} ${item.empreendimentoName} ${item.neighborhood} ${item.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (region && item.neighborhood !== region && item.city !== region) return false;
      if (bedrooms && String(item.bedrooms) !== bedrooms) return false;
      if (condition === 'fgts' && !item.acceptsFgts) return false;
      if (condition === 'subsidio' && !item.acceptsSubsidy) return false;
      if (onlyLaunches && !item.isLaunch) return false;
      return true;
    });
  }, [properties, queryText, region, bedrooms, condition, onlyLaunches]);

  const clearFilters = () => {
    setQueryText('');
    setRegion('');
    setBedrooms('');
    setCondition('');
    setOnlyLaunches(false);
    setSortBy('featured');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-8">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
            Salvador e Região Metropolitana
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            {isLancamentosRoute ? 'Lançamentos e Destaques Tenda' : 'Empreendimentos e Unidades'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Explore por região, quantidade de quartos ou condições com FGTS e subsídio. Valores e disponibilidade vigentes são confirmados diretamente com o corretor.
          </p>
        </div>

        {/* Interactive Segmented Tab Control */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setViewMode('empreendimentos')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'empreendimentos'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            Empreendimentos ({filteredEmps.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('unidades')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'unidades'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-[#0B1F3A]'
            }`}
          >
            Unidades ({filteredProps.length})
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 lg:hidden">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Buscar por nome ou bairro..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-[#0B1F3A]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>

        <div
          className={`${
            mobileFiltersOpen ? 'mt-4 grid' : 'hidden lg:grid'
          } grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-end`}
        >
          <div className="hidden lg:block lg:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Busca</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Nome, bairro ou cidade..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Região</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0B1F3A]"
            >
              <option value="">Todas</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Quartos</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0B1F3A]"
            >
              <option value="">Todos</option>
              <option value="2">2 quartos</option>
              <option value="1">1 quarto</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Condições</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0B1F3A]"
            >
              <option value="">Todas</option>
              <option value="fgts">Aceita FGTS</option>
              <option value="subsidio">Subsídio</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Ordenar</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0B1F3A]"
            >
              <option value="featured">Destaques</option>
              <option value="alpha">Nome A–Z</option>
              <option value="price_asc">Menor referência</option>
              <option value="price_desc">Maior referência</option>
            </select>
          </div>

          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={clearFilters}
              title="Limpar filtros"
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              <span className="lg:hidden">Limpar</span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setOnlyLaunches((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
              onlyLaunches
                ? 'border-[#C8102E] bg-[#C8102E] text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Apenas Destaques e Lançamentos
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {viewMode === 'empreendimentos' ? (
        filteredEmps.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmps.map((emp) => (
              <EmpreendimentoCard
                key={emp.id}
                item={emp}
                premiumSlug={premiumPage?.empreendimentoId === emp.id ? premiumPage.slug : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-[#0B1F3A]">
              Nenhum empreendimento encontrado com esses filtros.
            </p>
            <p className="text-sm text-slate-600">
              Ajuste os filtros ou fale com Rodolfo Monteiro para verificar novas oportunidades na sua região.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
            >
              Limpar filtros
            </button>
          </div>
        )
      ) : filteredProps.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProps.map((prop) => {
            const parent = empreendimentos.find((e) => e.id === prop.empreendimentoId);
            return (
              <SpotlightCard key={prop.id} className="flex flex-col h-full">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <SafeImage
                    src={prop.coverImage}
                    alt={prop.title}
                    fallbackTitle={prop.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-[#C8102E]" />
                      <span>
                        {prop.neighborhood ? `${prop.neighborhood} · ` : ''}
                        {prop.city}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{prop.bedrooms} quartos</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                      {prop.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{prop.description}</p>
                    <p className="text-xs text-slate-500">
                      Área: {prop.areaText} · Vaga: {prop.parkingText}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Referência</span>
                      <span className="font-mono text-sm font-semibold text-[#0B1F3A] tabular-nums">
                        {prop.priceDisplay}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {parent && (
                        <Link
                          to={`/empreendimento/${parent.slug}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#0B1F3A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#132C4E]"
                        >
                          <span>Ver empreendimento</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <Link
                        to={`/simulacao?empreendimento=${encodeURIComponent(prop.empreendimentoName || prop.title)}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
                      >
                        Simular
                      </Link>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-[#0B1F3A]">
            Nenhuma unidade encontrada para esses critérios.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
