import { Calendar, CheckCircle2, MessageCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { submitLead, submitVisitRequest } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';

interface SimulationFormProps {
  defaultEmpreendimento?: string;
  sourcePage?: string;
  mode?: 'simulation' | 'visit';
  title?: string;
  subtitle?: string;
}

export function SimulationForm({
  defaultEmpreendimento = '',
  sourcePage,
  mode = 'simulation',
  title = 'Faça sua simulação sem compromisso',
  subtitle = 'Informe seus dados básicos para analisarmos entrada facilitada, uso de FGTS e eventual subsídio.',
}: SimulationFormProps) {
  const { settings, empreendimentos } = useSite();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [hasFgts, setHasFgts] = useState(true);
  const [fgtsEstimate, setFgtsEstimate] = useState('');
  const [interest, setInterest] = useState(
    defaultEmpreendimento || empreendimentos[0]?.name || 'Aruna Patamares'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredPeriod, setPreferredPeriod] = useState<'Manhã' | 'Tarde' | 'Fim de semana'>('Manhã');
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setError('Informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (!lgpdConsent) {
      setError('Confirme a concordância com a Política de Privacidade para prosseguir.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'visit') {
        await submitVisitRequest({
          name,
          phone,
          preferredDate,
          preferredPeriod,
          empreendimentoName: interest,
          notes: message,
          sourcePage,
        });
      } else {
        await submitLead({
          name,
          phone,
          email,
          monthlyIncome,
          hasFgts,
          fgtsEstimate,
          interestEmpreendimento: interest,
          message,
          sourcePage,
          lgpdConsent,
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError('Não foi possível registrar agora. Você pode falar diretamente pelo WhatsApp abaixo.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappFollowup = buildWhatsappUrl(
    settings.whatsappNumber,
    `Olá Rodolfo! Meu nome é ${name || 'cliente'}, enviei uma ${
      mode === 'visit' ? 'solicitação de visita' : 'simulação'
    } no site para ${interest}.`
  );

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
          {mode === 'visit' ? 'Solicitação de visita recebida!' : 'Simulação enviada com sucesso!'}
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Rodolfo Monteiro recebeu seus dados e fará o atendimento consultivo sem compromisso. Para agilizar, você também pode abrir seu atendimento agora no WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={whatsappFollowup}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1FB858]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Agilizar no WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Enviar outra solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4"
    >
      <div className="space-y-1">
        <h3 className="font-display text-xl font-bold text-[#0B1F3A]">{title}</h3>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Nome completo *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            WhatsApp com DDD *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(71) 99999-9999"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Empreendimento de interesse
          </label>
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
          >
            {empreendimentos.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name} · {emp.neighborhood || emp.city}
              </option>
            ))}
            <option value="Outro / Quero indicação">Outro / Quero indicação</option>
          </select>
        </div>

        {mode === 'simulation' ? (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Renda familiar aproximada
            </label>
            <input
              type="text"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="Ex.: R$ 3.500 a R$ 6.000"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Data preferida para visita
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
            />
          </div>
        )}
      </div>

      {mode === 'simulation' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              E-mail (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Pretende usar FGTS?
            </label>
            <div className="flex items-center gap-3 pt-1.5">
              <button
                type="button"
                onClick={() => setHasFgts(true)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors ${
                  hasFgts
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Sim, tenho FGTS
              </button>
              <button
                type="button"
                onClick={() => setHasFgts(false)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors ${
                  !hasFgts
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                Não / Ainda vou verificar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Período preferido
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Manhã', 'Tarde', 'Fim de semana'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setPreferredPeriod(period)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold border transition-colors ${
                  preferredPeriod === period
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'simulation' && hasFgts && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Saldo aproximado de FGTS (opcional)
          </label>
          <input
            type="text"
            value={fgtsEstimate}
            onChange={(e) => setFgtsEstimate(e.target.value)}
            placeholder="Ex.: R$ 15.000"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Observações (opcional)
        </label>
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Conte o bairro de preferência ou dúvida sobre entrada facilitada..."
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={lgpdConsent}
          onChange={(e) => setLgpdConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#C8102E] focus:ring-[#C8102E]"
        />
        <span>
          Concordo em receber minha simulação e contato de atendimento por WhatsApp conforme a{' '}
          <Link to="/privacidade" className="font-semibold text-[#0B1F3A] underline">
            Política de Privacidade (LGPD)
          </Link>
          .
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8102E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A60D25] disabled:opacity-60"
        >
          {mode === 'visit' && <Calendar className="h-4 w-4" />}
          <span>
            {submitting
              ? 'Enviando...'
              : mode === 'visit'
              ? 'Solicitar Agendamento de Visita'
              : 'Enviar Simulação sem Compromisso'}
          </span>
        </button>

        <a
          href={whatsappFollowup}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-100"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span>WhatsApp Direto</span>
        </a>
      </div>
      <p className="text-[11px] text-slate-500">
        Simulação informativa sem compromisso. Aprovação de crédito e valores finais dependem da análise bancária vigente.
      </p>
    </form>
  );
}
