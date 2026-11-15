import { CheckCircle2, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/common/SafeImage';
import { useSite } from '../context/SiteContext';
import { GENERATED_ASSETS, OFFICIAL_RODOLFO_PHOTO_URL } from '../data/seedData';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function SobrePage() {
  const { settings, profile } = useSite();

  useEffect(() => {
    void recordAnalyticsEvent('page_view', '/sobre', 'Sobre Rodolfo Monteiro');
  }, []);

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Conheci seu trabalho pelo site e gostaria de conversar sobre um apartamento Tenda.'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5 self-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SafeImage
            src={
              profile.photoUrl && profile.photoUrl !== GENERATED_ASSETS.rodolfo
                ? profile.photoUrl
                : OFFICIAL_RODOLFO_PHOTO_URL
            }
            alt={profile.name}
            fallbackTitle={profile.name}
            className="block h-auto w-full object-contain"
          />
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Sobre o Especialista
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              {profile.name} · {profile.roleTitle}
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              {profile.bioShort}
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              {profile.bioFull}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                <p className="text-xs text-slate-500">Região de atuação</p>
                <p className="text-sm font-semibold text-[#0B1F3A] flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#C8102E] shrink-0" />
                  <span>{profile.region}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                <p className="text-xs text-slate-500">Instagram Oficial</p>
                <p className="text-sm font-semibold text-[#0B1F3A]">
                  {settings.instagramHandle} · {profile.instagramStatsPosts} posts ·{' '}
                  {profile.instagramStatsFollowers} seguidores
                </p>
              </div>
              {profile.creci && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                  <p className="text-xs text-slate-500">Registro Profissional</p>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{profile.creci}</p>
                </div>
              )}
              {profile.commercialAddress && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                  <p className="text-xs text-slate-500">Endereço Comercial</p>
                  <p className="text-sm font-semibold text-[#0B1F3A]">
                    {profile.commercialAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Destaques acompanhados
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-[#0B1F3A]">
                {profile.highlights.map((h, i) => (
                  <span key={h} className="inline-flex items-center gap-2">
                    {i > 0 && <span className="text-slate-300">·</span>}
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  void recordAnalyticsEvent('whatsapp_click', '/sobre', 'Sobre WhatsApp')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1FB858]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Falar no WhatsApp</span>
              </a>
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  void recordAnalyticsEvent('instagram_click', '/sobre', 'Sobre Instagram')
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50"
              >
                <Instagram className="h-4 w-4 text-[#E1306C]" />
                <span>Instagram</span>
              </a>
              <Link
                to="/simulacao"
                className="inline-flex items-center rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#132C4E]"
              >
                Fazer Simulação
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Principles */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 space-y-6">
        <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
          Como funciona o atendimento
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold text-[#C8102E]">01</p>
            <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
              Diagnóstico sem compromisso
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conversa inicial para entender o bairro desejado, renda familiar e saldo de FGTS antes de qualquer proposta.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold text-[#C8102E]">02</p>
            <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
              Confirmação transparente
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conferência das tabelas vigentes, unidades disponíveis e fluxo de entrada diretamente junto à construtora.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold text-[#C8102E]">03</p>
            <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
              Acompanhamento completo
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Suporte próximo na visita ao empreendimento, documentação e etapas de aprovação bancária.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
          <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Nenhuma aprovação de crédito é garantida antecipadamente; todas as condições dependem da análise documental e bancária.
          </span>
        </div>
      </section>
    </div>
  );
}
