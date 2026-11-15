import { Download, MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { removeLead, updateLeadStatus, updateVisitStatus } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';
import type { Lead, LeadStatus, VisitRequest, VisitStatus } from '../../types/realestate';

interface AdminLeadsManagerProps {
  leads: Lead[];
  visits: VisitRequest[];
  whatsappNumber: string;
  onReload: () => Promise<void>;
}

const LEAD_STATUSES: LeadStatus[] = [
  'Novo',
  'Em atendimento',
  'Simulação enviada',
  'Visita agendada',
  'Concluído',
];

const VISIT_STATUSES: VisitStatus[] = ['Pendente', 'Confirmada', 'Realizada', 'Cancelada'];

export function AdminLeadsManager({
  leads,
  visits,
  whatsappNumber,
  onReload,
}: AdminLeadsManagerProps) {
  const [subTab, setSubTab] = useState<'leads' | 'visitas'>('leads');
  const [statusFilter, setStatusFilter] = useState('');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const filteredLeads = leads.filter((l) => !statusFilter || l.status === statusFilter);

  const exportCsv = () => {
    const header = ['Nome', 'Telefone', 'Email', 'Empreendimento', 'Renda', 'FGTS', 'Origem', 'UTM Campaign', 'Status'];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      l.email,
      l.interestEmpreendimento,
      l.monthlyIncome,
      l.hasFgts ? `Sim (${l.fgtsEstimate || 'não informado'})` : 'Não',
      l.sourcePage,
      l.utmCampaign,
      l.status,
    ]);
    const csvContent =
      [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-rodolfo-monteiro-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab('leads')}
            className={`rounded-md px-4 py-2 text-xs font-semibold ${
              subTab === 'leads' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-600'
            }`}
          >
            Leads e Simulações ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('visitas')}
            className={`rounded-md px-4 py-2 text-xs font-semibold ${
              subTab === 'visitas' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-600'
            }`}
          >
            Visitas Agendadas ({visits.length})
          </button>
        </div>

        {subTab === 'leads' && (
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
            >
              <option value="">Todos os status</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        )}
      </div>

      {subTab === 'leads' ? (
        filteredLeads.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Nenhum lead encontrado até o momento. Assim que os visitantes enviarem simulações pelo site, aparecerão aqui com origem e UTMs.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const currentNotes = notesDraft[lead.id] ?? lead.adminNotes ?? '';
              const replyUrl = buildWhatsappUrl(
                lead.phone || whatsappNumber,
                `Olá ${lead.name}! Sou Rodolfo Monteiro, Especialista Tenda. Recebi sua simulação para ${lead.interestEmpreendimento || 'nosso empreendimento'} e estou à disposição.`
              );

              return (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display text-base font-bold text-[#0B1F3A]">
                        {lead.name}
                      </h3>
                      <p className="text-xs text-slate-600 font-mono tabular-nums">
                        {lead.phone} {lead.email ? `· ${lead.email}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        Interesse: <strong className="text-[#0B1F3A]">{lead.interestEmpreendimento || 'Geral'}</strong> · Renda: {lead.monthlyIncome || 'Não informada'} · FGTS:{' '}
                        {lead.hasFgts ? `Sim (${lead.fgtsEstimate || 'não informado'})` : 'Não'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Origem: {lead.sourcePage || '/'} {lead.utmCampaign ? `· UTM: ${lead.utmCampaign}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={lead.status}
                        onChange={async (e) => {
                          await updateLeadStatus(lead.id, e.target.value as LeadStatus, currentNotes);
                          await onReload();
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B1F3A]"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>

                      <a
                        href={replyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Responder</span>
                      </a>

                      <button
                        type="button"
                        onClick={async () => {
                          await removeLead(lead.id);
                          await onReload();
                        }}
                        title="Excluir lead"
                        className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {lead.message && (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      Mensagem do cliente: {lead.message}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentNotes}
                      onChange={(e) => setNotesDraft({ ...notesDraft, [lead.id]: e.target.value })}
                      placeholder="Observações internas do atendimento..."
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        await updateLeadStatus(lead.id, lead.status, currentNotes);
                        await onReload();
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
                    >
                      Salvar nota
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : visits.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Nenhuma solicitação de visita recebida ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-display text-base font-bold text-[#0B1F3A]">{visit.name}</p>
                <p className="text-xs font-mono text-slate-600">{visit.phone}</p>
                <p className="text-xs text-slate-600">
                  Empreendimento: <strong>{visit.empreendimentoName}</strong> · Data: {visit.preferredDate || 'A combinar'} ({visit.preferredPeriod})
                </p>
                {visit.notes && <p className="text-xs text-slate-500">Obs: {visit.notes}</p>}
              </div>

              <select
                value={visit.status}
                onChange={async (e) => {
                  await updateVisitStatus(visit.id, e.target.value as VisitStatus, visit.notes || '');
                  await onReload();
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0B1F3A]"
              >
                {VISIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
