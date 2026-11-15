import { Instagram, Lock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { OFFICIAL_LOGO_URL } from '../../data/seedData';
import { recordAnalyticsEvent } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';

export function SiteFooter() {
  const { settings, profile } = useSite();
  const whatsappHref = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Gostaria de saber mais sobre os empreendimentos Tenda em Salvador e região.'
  );

  return (
    <footer className="border-t border-slate-200 bg-[#0B1F3A] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={settings.logoUrl || OFFICIAL_LOGO_URL}
                alt={`${profile.name} - Especialista Tenda`}
                referrerPolicy="no-referrer"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-300/90 max-w-md">
              {profile.bioShort}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
              <span>{profile.region}</span>
              {profile.creci && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>CRECI: {profile.creci}</span>
                </>
              )}
              {profile.commercialAddress && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{profile.commercialAddress}</span>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/empreendimentos" className="hover:text-white transition-colors">
                  Empreendimentos
                </Link>
              </li>
              <li>
                <Link to="/lancamentos" className="hover:text-white transition-colors">
                  Lançamentos e Oportunidades
                </Link>
              </li>
              <li>
                <Link to="/simulacao" className="hover:text-white transition-colors">
                  Simulação sem Compromisso
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Sobre Rodolfo Monteiro
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Contato e Visitas
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Legal */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Atendimento Direto
            </h3>
            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void recordAnalyticsEvent('whatsapp_click', '/footer', 'Footer WhatsApp')}
                className="inline-flex items-center gap-2.5 text-sm font-medium text-white hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>WhatsApp: (71) 99210-6928</span>
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void recordAnalyticsEvent('instagram_click', '/footer', 'Footer Instagram')}
                className="inline-flex items-center gap-2.5 text-sm font-medium text-white hover:text-[#C99E32] transition-colors"
              >
                <Instagram className="h-4 w-4 text-[#E1306C]" />
                <span>{settings.instagramHandle}</span>
              </a>
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  {profile.contactEmail}
                </a>
              )}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Valores, condições de entrada, uso de FGTS e subsídios estão sujeitos à análise de crédito e confirmação prévia das tabelas vigentes junto ao corretor.
            </p>
          </div>
        </div>

        {/* Bottom Legal & Discreet Admin Link */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>{settings.footerText}</p>
          <div className="flex items-center gap-5">
            <Link to="/privacidade" className="hover:text-white transition-colors">
              Política de Privacidade & LGPD
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-slate-400/80 hover:text-white transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
