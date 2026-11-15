import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Instagram,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { SimulationForm } from '../components/common/SimulationForm';
import { EmpreendimentoCard } from '../components/home/EmpreendimentoCard';
import { RotatingHero } from '../components/home/RotatingHero';
import { BlurText } from '../components/motion/BlurText';
import { BorderBeam } from '../components/motion/BorderBeam';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { useSite } from '../context/SiteContext';
import { GENERATED_ASSETS, OFFICIAL_RODOLFO_PHOTO_URL } from '../data/seedData';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function HomePage() {
  const { settings, profile, empreendimentos, landingPages } = useSite();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [bedroomsFilter, setBedroomsFilter] = useState('');

  useEffect(() => {
    void recordAnalyticsEvent('page_view', '/', 'Home');
  }, []);

  const premiumPage = landingPages.find((lp) => lp.isPremium && lp.status === 'published');
  const featuredEmps = empreendimentos.filter((e) => e.featured).slice(0, 6);
  const displayEmps = featuredEmps.length > 0 ? featuredEmps : empreendimentos.slice(0, 6);

  const regions = Array.from(
    new Set(empreendimentos.map((e) => e.neighborhood || e.city).filter(Boolean))
  );

  const handleQuickSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (regionFilter) params.set('regiao', regionFilter);
    if (bedroomsFilter) params.set('quartos', bedroomsFilter);
    navigate(`/empreendimentos?${params.toString()}`);
  };

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Vim pelo seu site e quero simular meu apartamento Tenda sem compromisso.'
  );

  return (
    <div>
      {/* 1. Rotating Photo Hero */}
      <RotatingHero />

      {/* 2. Quick Search Strip */}
      <section aria-label="Busca rápida de imóveis" className="relative z-20 -mt-8 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleQuickSearch}
          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xl"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-end">
            <div className="lg:col-span-5">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Empreendimento ou bairro
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ex.: Aruna Patamares, Vila Laura, Abrantes..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Região
              </label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
              >
                <option value="">Todas as regiões</option>
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Quartos
              </label>
              <select
                value={bedroomsFilter}
                onChange={(e) => setBedroomsFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
              >
                <option value="">Qualquer</option>
                <option value="2">2 quartos</option>
                <option value="1">1 quarto</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#132C4E] transition-colors whitespace-nowrap"
              >
                <span>Buscar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 3. Featured Empreendimentos */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Salvador e Região Metropolitana
            </p>
            <BlurText
              as="h2"
              text="Empreendimentos em destaque"
              className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl"
            />
            <p className="text-sm sm:text-base text-slate-600">
              Referências em Patamares, Matatu e Abrantes/Camaçari. Confirme disponibilidade atual e tabela vigente diretamente com Rodolfo Monteiro.
            </p>
          </div>
          <Link
            to="/empreendimentos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8102E] hover:text-[#A60D25] whitespace-nowrap shrink-0"
          >
            <span>Ver todos os empreendimentos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayEmps.map((emp) => (
            <EmpreendimentoCard
              key={emp.id}
              item={emp}
              premiumSlug={premiumPage?.empreendimentoId === emp.id ? premiumPage.slug : undefined}
            />
          ))}
        </div>

        {/* Highlight Banner for the Single Premium Landing Page */}
        {premiumPage && (
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1F3A] p-6 sm:p-8 text-white">
            <BorderBeam />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-2xl">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C99E32]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Página Especial em Destaque</span>
                </p>
                <h3 className="font-display text-2xl font-bold text-white">
                  {premiumPage.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {premiumPage.heroSubheadline}
                </p>
              </div>
              <Link
                to={`/${premiumPage.routePrefix}/${premiumPage.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8102E] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#A60D25] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explorar Oportunidade</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Condições Especiais (FGTS, Entrada Facilitada, Subsídio) */}
      <section className="border-y border-slate-200/80 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
                Facilidade de acesso à casa própria
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A]">
                Condições pensadas para tirar seu plano do papel
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Cada perfil familiar tem uma combinação diferente de entrada, saldo de FGTS e eventual subsídio. A simulação gratuita mostra o cenário real antes de qualquer compromisso.
              </p>
              <div className="pt-2">
                <Link
                  to="/simulacao"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#132C4E] transition-colors"
                >
                  <span>Fazer simulação gratuita</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SpotlightCard className="p-6 sm:col-span-2">
                <p className="font-mono text-xs font-semibold text-[#C8102E]">01</p>
                <h3 className="mt-2 font-display text-xl font-bold text-[#0B1F3A]">
                  Entrada Facilitada com Fluxo Planejado
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Parcelamento da entrada durante o período de obra em condições negociadas, reduzindo o impacto no orçamento mensal até a entrega das chaves.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-6">
                <p className="font-mono text-xs font-semibold text-[#C8102E]">02</p>
                <h3 className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
                  Uso do FGTS na Entrada
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Possibilidade de utilizar o saldo do FGTS para abater o valor inicial, conforme enquadramento nas regras vigentes da Caixa.
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-6">
                <p className="font-mono text-xs font-semibold text-[#C8102E]">03</p>
                <h3 className="mt-2 font-display text-lg font-bold text-[#0B1F3A]">
                  Análise de Subsídio Habitacional
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Verificação detalhada de elegibilidade a subsídios conforme faixa de renda familiar, sujeita à aprovação de crédito bancário.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sobre Rodolfo Monteiro + Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 self-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SafeImage
              src={
                profile.photoUrl && profile.photoUrl !== GENERATED_ASSETS.rodolfo
                  ? profile.photoUrl
                  : OFFICIAL_RODOLFO_PHOTO_URL
              }
              alt={`${profile.name} - ${profile.roleTitle}`}
              fallbackTitle={profile.name}
              className="block h-auto w-full object-contain"
            />
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 py-2">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
                Atendimento Consultivo · {settings.instagramHandle}
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A]">
                {profile.name} · {profile.roleTitle}
              </h2>
              <p className="text-base leading-relaxed text-slate-700">
                {profile.bioShort}
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {profile.bioFull}
              </p>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Destaques acompanhados no Instagram
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-medium text-[#0B1F3A]">
                  {profile.highlights.map((h, i) => (
                    <span key={h} className="inline-flex items-center gap-2">
                      {i > 0 && (
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-slate-600">
                <div>
                  <span className="block font-mono text-base font-bold text-[#0B1F3A] tabular-nums">
                    {profile.instagramStatsPosts}
                  </span>
                  <span>publicações</span>
                </div>
                <div>
                  <span className="block font-mono text-base font-bold text-[#0B1F3A] tabular-nums">
                    {profile.instagramStatsFollowers}
                  </span>
                  <span>seguidores</span>
                </div>
                <div className="hidden sm:block">
                  <span className="block font-semibold text-[#0B1F3A]">Salvador e Região</span>
                  <span>Patamares · Matatu · Abrantes</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    void recordAnalyticsEvent('instagram_click', '/', 'Sobre Rodolfo Instagram')
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
                >
                  <Instagram className="h-4 w-4 text-[#E1306C]" />
                  <span>Seguir no Instagram</span>
                </a>
                <Link
                  to="/sobre"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8102E] hover:underline"
                >
                  <span>Conhecer trajetória</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Diferenciais + Embedded Simulation Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 space-y-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
                Simulação e Agendamento
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A]">
                Vamos simular seu apartamento juntos?
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Envie suas informações ou chame diretamente no WhatsApp para confirmar valores atualizados, disponibilidade de unidades e fluxo de pagamento adequado ao seu momento.
              </p>

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                  <span>Atendimento direto com Rodolfo Monteiro, sem robôs ou filas.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                  <span>Explicação transparente do fluxo de entrada, FGTS e saldo nas chaves.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                  <span>Foco em Patamares, Matatu, Abrantes/Camaçari e região de Salvador.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                  <span>Agendamento facilitado de visita ao decorado ou plantão.</span>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    void recordAnalyticsEvent('whatsapp_click', '/', 'CTA Final WhatsApp')
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1FB858] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Conversar agora no WhatsApp</span>
                </a>
              </div>
            </motion.div>

            <div className="lg:col-span-7">
              <SimulationForm sourcePage="/" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
