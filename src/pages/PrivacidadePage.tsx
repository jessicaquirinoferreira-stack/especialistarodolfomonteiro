import { useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { recordAnalyticsEvent } from '../lib/firestoreService';

export function PrivacidadePage() {
  const { settings, profile } = useSite();

  useEffect(() => {
    void recordAnalyticsEvent('page_view', '/privacidade', 'Privacidade LGPD');
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 space-y-6">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#C8102E]">
            Conformidade LGPD (Lei nº 13.709/2018)
          </p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F3A]">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-xs text-slate-500">
            Responsável pelo atendimento: {profile.name} · {profile.roleTitle}
          </p>
        </div>

        <div className="space-y-5 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              1. Coleta e Finalidade dos Dados
            </h2>
            <p>
              Os dados informados voluntariamente nos formulários de simulação e agendamento de visita (nome, telefone/WhatsApp, e-mail opcional, faixa de renda e preferência de empreendimento) são utilizados exclusivamente para realizar o atendimento imobiliário solicitado e apresentar simulações compatíveis com seu perfil.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              2. Segurança e Acesso Restrito
            </h2>
            <p>
              Os registros de leads e solicitações de visita são armazenados no Google Cloud Firestore com regras de segurança restritas, permitindo leitura e gerenciamento exclusivamente ao administrador autenticado do site. Nenhum dado pessoal é exibido publicamente ou comercializado com terceiros.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              3. Cookies e Métricas
            </h2>
            <p>{settings.lgpdNotice}</p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              4. Direitos do Titular
            </h2>
            <p>
              A qualquer momento você pode solicitar a atualização, confirmação ou exclusão dos seus dados de contato entrando em contato diretamente pelo WhatsApp (71) 99210-6928.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
