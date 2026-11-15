import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useSite } from '../../context/SiteContext';

interface CinematicIntroProps {
  onComplete: () => void;
}

const PARTICLES = [
  { x: '14%', y: '24%', size: 3, delay: 0.2, duration: 4.8 },
  { x: '26%', y: '68%', size: 2, delay: 0.9, duration: 5.2 },
  { x: '38%', y: '18%', size: 2.5, delay: 0.5, duration: 4.5 },
  { x: '62%', y: '22%', size: 3, delay: 1.1, duration: 5.0 },
  { x: '76%', y: '64%', size: 2, delay: 0.4, duration: 4.6 },
  { x: '84%', y: '30%', size: 3, delay: 1.4, duration: 5.1 },
  { x: '48%', y: '80%', size: 2, delay: 0.7, duration: 4.9 },
  { x: '19%', y: '48%', size: 2.5, delay: 1.6, duration: 4.4 },
  { x: '72%', y: '45%', size: 2.5, delay: 0.3, duration: 5.3 },
];

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const { settings } = useSite();
  const prefersReduced = useReducedMotion();
  const [exiting, setExiting] = useState(false);

  const siteName = settings.siteName || 'Rodolfo Monteiro';
  const tagline = settings.tagline || 'Especialista Tenda em Salvador e Região';
  const letters = Array.from(siteName);

  useEffect(() => {
    const exitDelay = prefersReduced ? 1200 : 5400;
    const finishDelay = prefersReduced ? 1600 : 6000;

    const exitTimer = setTimeout(() => setExiting(true), exitDelay);
    const doneTimer = setTimeout(() => onComplete(), finishDelay);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, prefersReduced]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(onComplete, 260);
  };

  return (
    <AnimatePresence>
      <motion.div
        role="presentation"
        aria-label="Abertura institucional Rodolfo Monteiro"
        initial={{ opacity: 1 }}
        animate={exiting ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050E1D] px-6 select-none"
      >
        {/* Atmospheric Volumetric Lighting (Completely Free, No Box/Card) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(201, 158, 50, 0.16) 0%, rgba(200, 16, 46, 0.09) 34%, rgba(5, 14, 29, 0.98) 76%)',
          }}
        />

        {/* Subtle Architectural Depth Floor Horizon */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(201, 158, 50, 0.12), transparent 70%)',
          }}
        />

        {/* Subtle Drifting Ambient Light Particles */}
        {!prefersReduced &&
          PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ opacity: 0, y: 18 }}
              animate={{
                opacity: [0, 0.75, 0],
                y: [18, -36],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
              className="pointer-events-none absolute rounded-full bg-[#E8C872] blur-[0.5px]"
            />
          ))}

        {/* Free-Floating Center Stage (No Square, No Circle, No Card) */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center text-center">
          {/* 1. Large Live-Drawn Architectural House */}
          <div className="relative w-full max-w-[520px] sm:max-w-[600px]">
            <svg
              viewBox="0 0 640 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-auto w-full overflow-visible drop-shadow-[0_0_18px_rgba(201,158,50,0.35)]"
            >
              <defs>
                <linearGradient id="houseGoldStroke" x1="60" y1="30" x2="580" y2="240" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F5E3A1" />
                  <stop offset="50%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#C99E32" />
                </linearGradient>
                <linearGradient id="houseCrimsonAccent" x1="180" y1="80" x2="460" y2="240" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E30613" />
                  <stop offset="100%" stopColor="#C99E32" />
                </linearGradient>
                <radialGradient id="windowWarmGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(253, 224, 130, 0.52)" />
                  <stop offset="100%" stopColor="rgba(253, 224, 130, 0.04)" />
                </radialGradient>
              </defs>

              {/* Main Pitched Contemporary Roofline */}
              <motion.path
                d="M78 148 L320 34 L562 148"
                stroke="url(#houseGoldStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.25, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Secondary Upper Architectural Eave & Chimney Volume */}
              <motion.path
                d="M118 130 L320 48 L522 130 M430 85 L430 52 L462 52 L462 100"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Exterior Walls & Modern Side Wing */}
              <motion.path
                d="M142 138 L142 238 M498 138 L498 238 M96 164 L142 164 M498 164 L544 164 L544 238"
                stroke="url(#houseGoldStroke)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.15, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Glass Balcony & Contemporary Upper Terrace */}
              <motion.path
                d="M214 148 L426 148 M214 148 L214 176 L426 176 L426 148 M258 148 L258 176 M320 148 L320 176 M382 148 L382 176"
                stroke="url(#houseCrimsonAccent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.95, delay: 1.45, ease: 'easeInOut' }}
              />

              {/* Double-Height Entrance Door & Sunlit Windows */}
              <motion.path
                d="M286 238 L286 186 L354 186 L354 238 M174 176 L234 176 L234 216 L174 216 Z M406 176 L466 176 L466 216 L406 216 Z"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.0, delay: 1.75, ease: 'easeInOut' }}
              />

              {/* Warm Interior Light Illuminating Windows */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 2.3 }}
              >
                <rect x="176" y="178" width="56" height="36" fill="url(#windowWarmGlow)" />
                <rect x="408" y="178" width="56" height="36" fill="url(#windowWarmGlow)" />
                <rect x="288" y="188" width="64" height="48" fill="url(#windowWarmGlow)" />
              </motion.g>

              {/* Expansive Architectural Horizon Line */}
              <motion.path
                d="M28 238 L612 238"
                stroke="url(#houseGoldStroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 1.1, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </div>

          {/* 2. Kinetic Writing of the Site Name */}
          <div className="relative mt-4 overflow-hidden py-1">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              {letters.map((char, idx) => (
                <motion.span
                  key={`${char}-${idx}`}
                  initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.32,
                    delay: prefersReduced ? 0 : 2.75 + idx * 0.065,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h1>

            {/* Subtle Cinematic Light Sweep Across Written Name */}
            {!prefersReduced && (
              <motion.div
                aria-hidden="true"
                initial={{ x: '-120%', opacity: 0 }}
                animate={{ x: '130%', opacity: [0, 0.65, 0] }}
                transition={{ duration: 1.25, delay: 3.85, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg]"
              />
            )}
          </div>

          {/* Golden Line & Subtitle Reveal */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: prefersReduced ? 0.2 : 3.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 h-px w-48 sm:w-64 bg-gradient-to-r from-transparent via-[#C99E32] to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: prefersReduced ? 0.3 : 4.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#E8C872]"
          >
            {tagline}
          </motion.p>
        </div>

        {/* Bottom 6-second Progress Hairline & Discreet Skip Control */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: prefersReduced ? 1.2 : 5.8, ease: 'linear' }}
            className="h-full origin-left bg-gradient-to-r from-[#C8102E] via-[#C99E32] to-white"
          />
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="absolute bottom-5 right-5 z-20 rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/15 hover:text-white"
        >
          Pular intro
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
