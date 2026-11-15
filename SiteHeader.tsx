import { Menu, MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { OFFICIAL_LOGO_URL, resolveAssetUrl } from '../../data/seedData';
import { recordAnalyticsEvent } from '../../lib/firestoreService';
import { buildWhatsappUrl, cn } from '../../lib/utils';

const NAV_LINKS = [
  { label: 'Início', to: '/' },
  { label: 'Empreendimentos', to: '/empreendimentos' },
  { label: 'Lançamentos', to: '/lancamentos' },
  { label: 'Simulação', to: '/simulacao' },
  { label: 'Sobre', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
];

export function SiteHeader() {
  const { settings } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  const logoSrc = resolveAssetUrl(settings.logoUrl || OFFICIAL_LOGO_URL);

  const whatsappHref = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Vim pelo site e gostaria de fazer uma simulação de apartamento Tenda.'
  );

  const handleWhatsappClick = () => {
    void recordAnalyticsEvent('whatsapp_click', location.pathname, 'Header Fale Comigo');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Zone 1: Official 3D Logo Lockup (Freely Displayed, Unclipped) */}
        <Link
          to="/"
          aria-label={settings.siteName}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] rounded-lg"
        >
          {!logoError ? (
            <img
              src={logoSrc}
              alt={`${settings.siteName} - Especialista Tenda`}
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-11 sm:h-12 w-auto object-contain"
            />
          ) : (
            <span className="font-display text-lg font-bold tracking-tight text-[#0B1F3A]">
              {settings.siteName}
            </span>
          )}
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {NAV_LINKS.map((item) => {
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#0B1F3A]',
                  active && 'text-[#C8102E] font-semibold'
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#C8102E] rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsappClick}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#A60D25] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8102E] focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Fale comigo</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-[#0B1F3A] lg:hidden hover:bg-slate-50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => {
                const active =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[#C8102E]/10 text-[#C8102E] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleWhatsappClick();
                  setMobileOpen(false);
                }}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8102E] px-4 py-3 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Fale comigo no WhatsApp</span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
