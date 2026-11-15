import { Calendar, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SimulationForm } from '../components/common/SimulationForm';
import { useSite } from '../context/SiteContext';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function ContatoPage() {
  const { settings, profile } = useSite();
  const [mode, setMode] = useState<'visit' | 'simulation'>('visit');

  useEffect(() => {
    void recordAnalyticsEvent('page_view', '/contato', 'Contato');
  }, []);

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Gostaria de agendar uma visita ou tirar dúvidas sobre os empreendimentos Tenda.'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Contato e Visitas
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Fale com {profile.name}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Agende uma visita presencial ou solicite atendimento rápido pelo WhatsApp para confirmar disponibilidade em Salvador e região.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void recordAnalyticsEvent('whatsapp_click', '/contato', 'Contato WhatsApp')
              }
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-[#25D366] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1F3A]">WhatsApp Direto</p>
                  <p className="text-xs text-slate-500">(71) 99210-6928</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#25D366]">Abrir</span>
            </a>

            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void recordAnalyticsEvent('instagram_click', '/contato', 'Contato Instagram')
              }
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-[#E1306C] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E1306C]/10 text-[#E1306C]">
                  <Instagram className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1F3A]">Instagram</p>
                  <p className="text-xs text-slate-500">{settings.instagramHandle}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#E1306C]">Seguir</span>
            </a>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#0B1F3A] shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B1F3A]">Região de Atendimento</p>
                <p className="text-xs text-slate-600">{profile.region}</p>
                {profile.commercialAddress && (
                  <p className="text-xs text-slate-500 mt-1">{profile.commercialAddress}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setMode('visit')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold border transition-colors ${
                mode === 'visit'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Agendar Visita</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('simulation')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold border transition-colors ${
                mode === 'simulation'
                  ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              Fazer Simulação
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <SimulationForm
            mode={mode}
            sourcePage="/contato"
            title={
              mode === 'visit'
                ? 'Agendar visita ao empreendimento'
                : 'Solicitar simulação personalizada'
            }
            subtitle={
              mode === 'visit'
                ? 'Escolha o empreendimento e seu melhor período para confirmarmos a disponibilidade de atendimento.'
                : 'Envie seus dados para analisarmos FGTS, entrada facilitada e subsídio.'
            }
          />
        </div>
      </div>
    </div>
  );
}
