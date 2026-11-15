import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SimulationForm } from '../components/common/SimulationForm';
import { SpotlightCard } from '../components/motion/SpotlightCard';
import { useSite } from '../context/SiteContext';
import { recordAnalyticsEvent } from '../lib/firestoreService';
import { buildWhatsappUrl } from '../lib/utils';

export function SimulacaoPage() {
  const { settings } = useSite();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('empreendimento') || '';

  useEffect(() => {
    void recordAnalyticsEvent('page_view', '/simulacao', 'Simulação');
  }, []);

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Gostaria de fazer minha simulação Tenda sem compromisso pelo WhatsApp.'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
              Simulação sem compromisso
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
              Descubra como usar seu FGTS e entrada facilitada
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Preencha seus dados básicos para simular parcelas, uso de FGTS e eventual enquadramento em subsídio nos empreendimentos Tenda em Salvador e região.
            </p>
          </div>

          <SpotlightCard className="p-5 space-y-3">
            <h2 className="font-display text-base font-bold text-[#0B1F3A]">
              O que avaliamos na sua simulação
            </h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                <span>Potencial de entrada facilitada e parcelamento durante a obra.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                <span>Abatimento utilizando seu saldo de FGTS disponível.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8102E]" />
                <span>Verificação de subsídio habitacional conforme sua faixa de renda.</span>
              </li>
            </ul>
          </SpotlightCard>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              void recordAnalyticsEvent('whatsapp_click', '/simulacao', 'Simulação WhatsApp')
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1FB858] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Prefiro simular direto no WhatsApp</span>
          </a>
        </div>

        <div className="lg:col-span-7">
          <SimulationForm
            defaultEmpreendimento={preselected}
            sourcePage="/simulacao"
            mode="simulation"
          />
        </div>
      </div>
    </div>
  );
}
