import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { SimulationForm } from '../components/common/SimulationForm';
import { useSite } from '../context/SiteContext';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function EmpreendimentoDetailPage() {
  const { slug } = useParams();
  const { settings, empreendimentos, properties, landingPages } = useSite();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [formMode, setFormMode] = useState<'simulation' | 'visit'>('simulation');
  const [copied, setCopied] = useState(false);

  const item = empreendimentos.find((e) => e.slug === slug);

  useEffect(() => {
    if (item) {
      document.title = `${item.name} | ${settings.siteName}`;
      void recordAnalyticsEvent('page_view', `/empreendimento/${item.slug}`, item.name);
    }
  }, [item, settings.siteName]);

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Empreendimento não encontrado
        </h1>
        <p className="text-sm text-slate-600">
          O empreendimento solicitado não está disponível ou foi atualizado no catálogo.
        </p>
        <Link
          to="/empreendimentos"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para empreendimentos</span>
        </Link>
      </div>
    );
  }

  const gallery = item.gallery?.length > 0 ? item.gallery : [item.coverImage];
  const linkedProps = properties.filter((p) => p.empreendimentoId === item.id);
  const linkedLanding = landingPages.find(
    (lp) => lp.empreendimentoId === item.id && lp.status === 'published'
  );

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    `Olá Rodolfo! Tenho interesse no empreendimento ${item.name} (${item.neighborhood || item.city}) e gostaria de confirmar disponibilidade e fazer uma simulação.`
  );

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} · Rodolfo Monteiro Especialista Tenda`,
          text: item.description,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb & Share */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/empreendimentos"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0B1F3A]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Todos os empreendimentos</span>
        </Link>

        <div className="flex items-center gap-2">
          {linkedLanding && (
            <Link
              to={`/${linkedLanding.routePrefix}/${linkedLanding.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8102E] px-3.5 py-2 text-xs font-semibold text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Abrir Landing Page</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Link copiado' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>

      {/* Header + Gallery */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <SafeImage
              src={gallery[selectedPhoto] || item.coverImage}
              alt={`${item.name} - Foto ${selectedPhoto + 1}`}
              fallbackTitle={item.name}
              className="h-full w-full object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((photo, idx) => (
                <button
                  key={`${photo}-${idx}`}
                  type="button"
                  onClick={() => setSelectedPhoto(idx)}
                  className={`aspect-[16/10] overflow-hidden rounded-lg border-2 transition-all ${
                    selectedPhoto === idx ? 'border-[#C8102E]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={photo}
                    alt={`${item.name} miniatura ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1 text-[#C8102E] font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {item.neighborhood ? `${item.neighborhood} · ` : ''}
                  {item.city}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Status: {item.status}</span>
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A]">
              {item.name}
            </h1>

            {item.addressNote && (
              <p className="text-xs text-slate-500">{item.addressNote}</p>
            )}
          </div>

          <div className="border-y border-slate-100 py-4 space-y-1">
            <span className="text-xs text-slate-500">Valor de referência</span>
            <p className="font-mono text-2xl font-bold text-[#0B1F3A] tabular-nums">
              {item.priceDisplay || 'A confirmar'}
            </p>
            <p className="text-xs text-slate-500">
              Tipologia: {item.bedroomsSummary || 'A confirmar'} · Lazer: {item.leisureArea || 'A confirmar'}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-slate-700">{item.description}</p>

          {item.features?.length > 0 && (
            <ul className="space-y-2 text-sm text-slate-700">
              {item.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {item.confirmationPending && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <span>
                Dados históricos de referência. Disponibilidade atual, unidades, metragens e tabela vigente devem ser confirmados diretamente com o corretor.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void recordAnalyticsEvent('whatsapp_click', `/empreendimento/${item.slug}`, item.name)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1FB858] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Confirmar e Simular no WhatsApp</span>
            </a>
            <a
              href="#simular-empreendimento"
              className="inline-flex items-center justify-center rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#132C4E] transition-colors"
            >
              Preencher Simulação no Site
            </a>
          </div>
        </div>
      </div>

      {/* Payment Flow (when available, e.g., Aruna Patamares) */}
      {item.paymentFlow?.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Exemplo de fluxo de pagamento (Referência)
            </p>
            <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
              Condições ilustradas para {item.name}
            </h2>
            {item.paymentFlowNote && (
              <p className="text-xs text-slate-600 max-w-3xl">{item.paymentFlowNote}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {item.paymentFlow.map((step) => (
              <div
                key={`${step.label}-${step.value}`}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1"
              >
                <p className="text-xs font-semibold text-slate-500">{step.label}</p>
                <p className="font-mono text-xl font-bold text-[#0B1F3A] tabular-nums">
                  {step.value}
                </p>
                {step.detail && <p className="text-xs text-slate-600">{step.detail}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Highlights & Linked Units */}
      {(item.nearbyHighlights?.length > 0 || linkedProps.length > 0) && (
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {item.nearbyHighlights?.length > 0 && (
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                Localização e Proximidades
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {item.nearbyHighlights.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {linkedProps.length > 0 && (
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                Unidades e Tipologias Vinculadas
              </h2>
              <div className="divide-y divide-slate-100">
                {linkedProps.map((prop) => (
                  <div key={prop.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-[#0B1F3A]">{prop.title}</p>
                      <p className="text-xs text-slate-500">
                        {prop.bedrooms} quartos · Área: {prop.areaText} · Vaga: {prop.parkingText}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-sm font-bold text-[#0B1F3A] tabular-nums">
                        {prop.priceDisplay}
                      </p>
                      <p className="text-[11px] text-slate-500">{prop.entryCondition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Simulation & Visit Request Section */}
      <section id="simular-empreendimento" className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
            Simular ou agendar visita para {item.name}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Escolha entre simular suas condições de FGTS/entrada ou agendar uma visita acompanhada por Rodolfo Monteiro.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormMode('simulation')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold border transition-colors ${
                formMode === 'simulation'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              Simulação Financeira
            </button>
            <button
              type="button"
              onClick={() => setFormMode('visit')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold border transition-colors ${
                formMode === 'visit'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Agendar Visita</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <SimulationForm
            mode={formMode}
            defaultEmpreendimento={item.name}
            sourcePage={`/empreendimento/${item.slug}`}
            title={
              formMode === 'visit'
                ? `Agendar visita · ${item.name}`
                : `Simulação sem compromisso · ${item.name}`
            }
          />
        </div>
      </section>
    </div>
  );
}
