import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Pause, Play } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { recordAnalyticsEvent } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';
import { BlurText } from '../motion/BlurText';

export function RotatingHero() {
  const { settings, empreendimentos } = useSite();
  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = useMemo(() => {
    const selectedUrls = settings.heroImageUrls?.filter(Boolean) || [];
    const fallbackUrls = empreendimentos.map((e) => e.coverImage).filter(Boolean);
    const merged = selectedUrls.length > 0 ? selectedUrls : fallbackUrls;
    return merged.map((url, idx) => {
      const matched = empreendimentos.find(
        (e) => e.coverImage === url || e.gallery.includes(url)
      );
      return {
        url,
        caption: matched
          ? `${matched.name} · ${matched.neighborhood ? `${matched.neighborhood}, ` : ''}${matched.city}`
          : `Empreendimentos Tenda · Salvador e Região (${idx + 1})`,
        slug: matched?.slug,
      };
    });
  }, [settings.heroImageUrls, empreendimentos]);

  useEffect(() => {
    if (slides.length <= 1 || paused || prefersReduced) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, settings.heroIntervalMs || 5500);
    return () => clearInterval(interval);
  }, [slides.length, paused, prefersReduced, settings.heroIntervalMs]);

  const currentSlide = slides[index % Math.max(1, slides.length)];
  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Vim pelo site e quero fazer uma simulação sem compromisso.'
  );

  const transitionType = settings.heroTransition || 'crossfade';

  const getMotionProps = () => {
    if (prefersReduced) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      };
    }
    if (transitionType === 'slide') {
      return {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
      };
    }
    if (transitionType === 'zoom') {
      return {
        initial: { opacity: 0, scale: 1.06 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.85, ease: 'easeInOut' as const },
    };
  };

  return (
    <section
      aria-label="Destaques de empreendimentos"
      className="relative min-h-[600px] lg:min-h-[680px] flex items-center overflow-hidden bg-[#0B1F3A]"
    >
      {/* Rotating Property Background Photos */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {currentSlide && (
            <motion.img
              key={currentSlide.url}
              src={currentSlide.url}
              alt={currentSlide.caption}
              referrerPolicy="no-referrer"
              {...getMotionProps()}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
        {/* Measured Contrast Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A]/92 via-[#0B1F3A]/72 to-[#0B1F3A]/35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/85 via-transparent to-[#0B1F3A]/30"
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold tracking-wider text-[#C99E32] uppercase">
            Rodolfo Monteiro · Especialista Tenda em Salvador e Região
          </p>

          <BlurText
            as="h1"
            text={settings.heroTitle}
            className="font-display text-white font-extrabold tracking-tight leading-[1.08] text-[clamp(2.25rem,4vw,3.75rem)]"
          />

          <p className="text-base sm:text-lg leading-relaxed text-slate-200 max-w-xl">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/simulacao"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8102E] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors duration-150 hover:bg-[#A60D25] whitespace-nowrap"
            >
              <span>Faça sua simulação</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void recordAnalyticsEvent('whatsapp_click', '/', 'Hero WhatsApp CTA')
              }
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>Fale no WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs font-medium text-slate-300">
            <span>FGTS na entrada</span>
            <span aria-hidden="true">·</span>
            <span>Entrada facilitada</span>
            <span aria-hidden="true">·</span>
            <span>Subsídio conforme perfil</span>
            <span aria-hidden="true">·</span>
            <span>Simulação sem compromisso</span>
          </div>
        </div>

        {/* Slide Controls & Active Property Caption */}
        {slides.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
            <div className="flex items-center gap-3 text-xs text-slate-200">
              {currentSlide.slug ? (
                <Link
                  to={`/empreendimento/${currentSlide.slug}`}
                  className="font-medium hover:text-[#C99E32] transition-colors"
                >
                  Em destaque na foto: <strong className="text-white">{currentSlide.caption}</strong>
                </Link>
              ) : (
                <span>{currentSlide.caption}</span>
              )}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                  aria-label="Foto anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5 px-1">
                  {slides.map((s, idx) => (
                    <button
                      key={`${s.url}-${idx}`}
                      type="button"
                      onClick={() => setIndex(idx)}
                      aria-label={`Ver slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === index % slides.length ? 'w-6 bg-[#C99E32]' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
                  aria-label="Próxima foto"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? 'Retomar rotação' : 'Pausar rotação'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
