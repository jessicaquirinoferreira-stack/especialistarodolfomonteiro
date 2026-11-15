import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { SimulationForm } from '../components/common/SimulationForm';
import { BlurText } from '../components/motion/BlurText';
import { BorderBeam } from '../components/motion/BorderBeam';
import { NumberTicker } from '../components/motion/NumberTicker';
import { ParallaxFrame } from '../components/motion/ParallaxFrame';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { useSite } from '../context/SiteContext';
import { resolveAssetUrl } from '../data/seedData';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function LandingPageView() {
  const { slug } = useParams();
  const location = useLocation();
  const { settings, profile, landingPages, empreendimentos } = useSite();
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const routePrefix = location.pathname.startsWith('/campanha') ? 'campanha' : 'oportunidade';
  const lp = landingPages.find((item) => item.slug === slug);
  const linkedEmp = empreendimentos.find((e) => e.id === lp?.empreendimentoId);

  useEffect(() => {
    if (lp) {
      document.title = lp.seoTitle || lp.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && lp.seoDescription) {
        metaDesc.setAttribute('content', lp.seoDescription);
      }
      void recordAnalyticsEvent(
        'page_view',
        `/${routePrefix}/${lp.slug}`,
        lp.isPremium ? `Premium LP: ${lp.title}` : lp.title
      );
    }
  }, [lp, routePrefix]);

  if (!lp || lp.status !== 'published') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
          {lp?.status === 'paused'
            ? 'Esta campanha está temporariamente pausada'
            : 'Página de oportunidade não encontrada'}
        </h1>
        <p className="text-sm text-slate-600">
          Confira os empreendimentos disponíveis ou fale diretamente com Rodolfo Monteiro no WhatsApp.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/empreendimentos"
            className="rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ver empreendimentos
          </Link>
        </div>
      </div>
    );
  }

  const gallery =
    lp.gallery?.length > 0
      ? lp.gallery
      : linkedEmp?.gallery?.length
      ? linkedEmp.gallery
      : [lp.heroImageUrl];

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    `Olá Rodolfo! Vim pela página "${lp.title}" e quero confirmar disponibilidade e fazer minha simulação.`
  );

  // Enhanced Premium Motion Showcase when lp.isPremium is true
  return (
    <div className="bg-[#F8FAFC]">
      {/* 1. Impactful Parallax Hero */}
      <section className="relative min-h-[580px] lg:min-h-[650px] flex items-center overflow-hidden bg-[#0B1F3A]">
        <ParallaxFrame offset={40} className="absolute inset-0">
          <SafeImage
            src={lp.heroImageUrl || linkedEmp?.coverImage}
            alt={lp.heroHeadline}
            fallbackTitle={lp.title}
            className="h-[115%] w-full object-cover"
          />
        </ParallaxFrame>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/95 via-[#0B1F3A]/75 to-[#0B1F3A]/40"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C99E32]">
              {lp.isPremium && <Sparkles className="h-3.5 w-3.5" />}
              <span>{lp.heroKicker || 'Oportunidade Especial'}</span>
            </p>

            <BlurText
              as="h1"
              text={lp.heroHeadline}
              className="font-display font-extrabold tracking-tight text-white leading-[1.06] text-[clamp(2.25rem,4.2vw,3.85rem)]"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base sm:text-lg leading-relaxed text-slate-200 max-w-2xl"
            >
              {lp.heroSubheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <a
                href="#simulacao-lp"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8102E] px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#A60D25] transition-colors"
              >
                <span>{lp.ctaPrimaryText || 'Simular agora'}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  void recordAnalyticsEvent(
                    'whatsapp_click',
                    `/${routePrefix}/${lp.slug}`,
                    `LP WhatsApp: ${lp.title}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>{lp.ctaWhatsappText || 'Falar no WhatsApp'}</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Key Reference Strip (Premium Animated Numbers when linked to Aruna or numeric data) */}
      {linkedEmp && (
        <section className="relative z-20 -mt-8 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            {lp.isPremium && <BorderBeam />}
            <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="sm:pr-6 space-y-1">
                <p className="text-xs font-medium text-slate-500">Localização</p>
                <p className="font-display text-lg font-bold text-[#0B1F3A] flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#C8102E] shrink-0" />
                  <span>
                    {linkedEmp.neighborhood ? `${linkedEmp.neighborhood}, ` : ''}
                    {linkedEmp.city}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{linkedEmp.addressNote}</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-6 space-y-1">
                <p className="text-xs font-medium text-slate-500">Lazer e Tipologia</p>
                <p className="font-display text-lg font-bold text-[#0B1F3A]">
                  {linkedEmp.bedroomsSummary}
                </p>
                <p className="text-xs text-slate-600">{linkedEmp.leisureArea}</p>
              </div>

              <div className="pt-4 sm:pt-0 sm:pl-6 space-y-1">
                <p className="text-xs font-medium text-slate-500">Valor de referência</p>
                <p className="font-mono text-2xl font-bold text-[#C8102E] tabular-nums">
                  {linkedEmp.priceNumeric > 0 ? (
                    <NumberTicker value={linkedEmp.priceNumeric} prefix="R$ " />
                  ) : (
                    linkedEmp.priceDisplay
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  Sujeito à confirmação com o corretor
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Interactive Highlights Bento Grid */}
      {lp.highlights?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2 pb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Por que esta oportunidade se destaca
            </p>
            <BlurText
              as="h2"
              text="Destaques do projeto e condições"
              className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {lp.highlights.map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <SpotlightCard className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-[#C8102E] tabular-nums">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1.5">
                      <p className="font-display text-lg font-bold text-[#0B1F3A]">{item}</p>
                      <p className="text-sm text-slate-600">
                        Atendimento consultivo para avaliar entrada facilitada, uso de FGTS e eventual subsídio de acordo com seu perfil.
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Fluid Gallery with Lightbox */}
      {gallery.length > 0 && (
        <section className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
                  Galeria Visual
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                  Ambientes e perspectivas
                </h2>
              </div>
              <p className="text-xs text-slate-500">Clique em qualquer imagem para ampliar</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {gallery.map((url, idx) => (
                <motion.button
                  key={`${url}-${idx}`}
                  type="button"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setLightboxUrl(url)}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left ${
                    idx === 0 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-[16/10] md:aspect-auto md:h-full'
                  }`}
                >
                  <SafeImage
                    src={url}
                    alt={`${lp.title} - Imagem ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Optional Payment Flow Breakdown */}
      {lp.showPaymentFlow && linkedEmp && linkedEmp.paymentFlow?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1F3A] p-6 sm:p-10 text-white">
            <div className="space-y-2 max-w-2xl pb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#C99E32]">
                Fluxo de Pagamento Ilustrativo
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Exemplo de fluxo estruturado para {linkedEmp.name}
              </h2>
              <p className="text-xs text-slate-300">{linkedEmp.paymentFlowNote}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {linkedEmp.paymentFlow.map((step) => (
                <div
                  key={step.label}
                  className="rounded-xl border border-white/15 bg-white/5 p-5 space-y-1 backdrop-blur-sm"
                >
                  <p className="text-xs text-slate-300">{step.label}</p>
                  <p className="font-mono text-2xl font-bold text-white tabular-nums">
                    {step.value}
                  </p>
                  {step.detail && <p className="text-xs text-slate-300/90">{step.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Conversion Form & Broker Trust Card */}
      <section id="simulacao-lp" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 shrink-0">
                <SafeImage
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#0B1F3A]">
                  {profile.name}
                </h2>
                <p className="text-xs font-medium text-[#C8102E]">{profile.roleTitle}</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">{profile.bioShort}</p>

            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#C8102E]" />
                <span>Simulação personalizada sem compromisso</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#C8102E]" />
                <span>Confirmação de disponibilidade e tabela vigente</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#C8102E]" />
                <span>Atendimento direto pelo WhatsApp (71) 99210-6928</span>
              </li>
            </ul>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void recordAnalyticsEvent(
                  'whatsapp_click',
                  `/${routePrefix}/${lp.slug}`,
                  'LP Bottom WhatsApp'
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1FB858]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chamar Rodolfo no WhatsApp</span>
            </a>
          </div>

          <div className="lg:col-span-7">
            <SimulationForm
              defaultEmpreendimento={linkedEmp?.name || lp.title}
              sourcePage={`/${routePrefix}/${lp.slug}`}
              title="Receba sua simulação personalizada"
            />
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              aria-label="Fechar imagem"
              className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={resolveAssetUrl(lightboxUrl)}
              alt={lp.title}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-5xl rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
