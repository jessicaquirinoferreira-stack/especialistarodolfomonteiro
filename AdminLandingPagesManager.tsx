import { Copy, ExternalLink, Pause, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { GalleryUploadField } from './GalleryUploadField';
import { ImageUploadField } from './ImageUploadField';
import { removeLandingPage, saveLandingPage } from '../../lib/firestoreService';
import { generateSafeId, slugify } from '../../lib/utils';
import type { Empreendimento, LandingPage, MediaAsset } from '../../types/realestate';

interface AdminLandingPagesManagerProps {
  landingPages: LandingPage[];
  empreendimentos: Empreendimento[];
  media: MediaAsset[];
  onReload: () => Promise<void>;
}

const EMPTY_LP: LandingPage = {
  id: '',
  title: '',
  slug: '',
  routePrefix: 'oportunidade',
  isPremium: false,
  status: 'draft',
  empreendimentoId: '',
  heroKicker: 'Oportunidade Exclusiva',
  heroHeadline: '',
  heroSubheadline: '',
  heroImageUrl: '',
  ctaPrimaryText: 'Fazer Simulação Agora',
  ctaWhatsappText: 'Falar no WhatsApp',
  highlights: [],
  gallery: [],
  showPaymentFlow: true,
  seoTitle: '',
  seoDescription: '',
  ogImageUrl: '',
  utmCampaign: '',
};

export function AdminLandingPagesManager({
  landingPages,
  empreendimentos,
  media,
  onReload,
}: AdminLandingPagesManagerProps) {
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [highlightsText, setHighlightsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const activePremium = landingPages.find((lp) => lp.isPremium);

  const openEditor = (lp?: LandingPage) => {
    const target = lp
      ? { ...lp, gallery: [...(lp.gallery || [])] }
      : {
          ...EMPTY_LP,
          id: generateSafeId('lp'),
          empreendimentoId: empreendimentos[0]?.id || '',
          heroImageUrl: empreendimentos[0]?.coverImage || '',
        };
    setEditing(target);
    setHighlightsText((target.highlights || []).join('\n'));
    setFeedback('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await saveLandingPage({
        ...editing,
        slug: slugify(editing.slug || editing.title),
        highlights: highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
        gallery: (editing.gallery || []).filter(Boolean),
      });
      setEditing(null);
      await onReload();
      setFeedback(
        editing.isPremium
          ? 'Landing Page Premium salva! Ela é agora a única Landing Page Premium ativa no sistema.'
          : 'Landing page salva com sucesso.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (lp: LandingPage) => {
    await saveLandingPage(
      {
        ...lp,
        id: generateSafeId('lp'),
        title: `${lp.title} (Cópia)`,
        slug: `${lp.slug}-copia-${Date.now().toString().slice(-4)}`,
        isPremium: false,
        status: 'draft',
      },
      true
    );
    await onReload();
    setFeedback('Landing page duplicada como rascunho.');
  };

  const handleToggleStatus = async (lp: LandingPage) => {
    const nextStatus = lp.status === 'published' ? 'paused' : 'published';
    await saveLandingPage({ ...lp, status: nextStatus });
    await onReload();
  };

  const handleDelete = async (id: string) => {
    await removeLandingPage(id);
    await onReload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
            Landing Pages & Página Premium
          </h2>
          <p className="text-xs text-slate-600">
            Crie campanhas compartilháveis (/oportunidade/slug ou /campanha/slug). O sistema mantém{' '}
            <strong>exatamente 1 Landing Page Premium</strong> ativa com efeitos avançados de motion e parallax.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A60D25]"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Landing Page</span>
        </button>
      </div>

      {activePremium && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              Landing Page Premium ativa: <strong>{activePremium.title}</strong> (/{activePremium.routePrefix}/{activePremium.slug})
            </span>
          </div>
          <a
            href={`/${activePremium.routePrefix}/${activePremium.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0B1F3A] underline"
          >
            Visualizar Página Premium
          </a>
        </div>
      )}

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
              {editing.title ? `Editar: ${editing.title}` : 'Nova Landing Page'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-xs font-semibold text-slate-500"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Título *</label>
              <input
                type="text"
                required
                value={editing.title}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    title: e.target.value,
                    slug: editing.slug || slugify(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Prefixo da URL</label>
              <select
                value={editing.routePrefix}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    routePrefix: e.target.value as 'oportunidade' | 'campanha',
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="oportunidade">/oportunidade/</option>
                <option value="campanha">/campanha/</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Slug *</label>
              <input
                type="text"
                required
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Empreendimento associado
              </label>
              <select
                value={editing.empreendimentoId}
                onChange={(e) => setEditing({ ...editing, empreendimentoId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">Campanha Geral</option>
                {empreendimentos.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    status: e.target.value as LandingPage['status'],
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="published">Publicada</option>
                <option value="paused">Pausada</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                UTM Campaign
              </label>
              <input
                type="text"
                value={editing.utmCampaign}
                onChange={(e) => setEditing({ ...editing, utmCampaign: e.target.value })}
                placeholder="ex: aruna-patamares-insta"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Headline do Hero *
            </label>
            <input
              type="text"
              required
              value={editing.heroHeadline}
              onChange={(e) => setEditing({ ...editing, heroHeadline: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ImageUploadField
              label="Imagem Principal do Hero"
              value={editing.heroImageUrl}
              onChange={(url) => setEditing({ ...editing, heroImageUrl: url })}
              category="Landing"
              media={media}
              onMediaUpdated={onReload}
            />
            <ImageUploadField
              label="Imagem Open Graph (WhatsApp / Redes Sociais)"
              value={editing.ogImageUrl}
              onChange={(url) => setEditing({ ...editing, ogImageUrl: url })}
              category="Landing"
              media={media}
              onMediaUpdated={onReload}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Subheadline</label>
            <textarea
              rows={2}
              value={editing.heroSubheadline}
              onChange={(e) => setEditing({ ...editing, heroSubheadline: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Destaques (1 por linha)
            </label>
            <textarea
              rows={4}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
            />
          </div>

          <GalleryUploadField
            label="Galeria de Fotos da Landing Page"
            images={editing.gallery || []}
            onChange={(imgs) => setEditing({ ...editing, gallery: imgs })}
            category="Landing"
            media={media}
            onMediaUpdated={onReload}
            coverUrl={editing.heroImageUrl}
            onSetAsCover={(url) => setEditing({ ...editing, heroImageUrl: url })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                SEO Title (Open Graph)
              </label>
              <input
                type="text"
                value={editing.seoTitle}
                onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                SEO Description
              </label>
              <input
                type="text"
                value={editing.seoDescription}
                onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isPremium}
                onChange={(e) => setEditing({ ...editing, isPremium: e.target.checked })}
              />
              <span>
                Definir como a Landing Page Premium do site (substitui a anterior para manter exatamente 1 Premium)
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.showPaymentFlow}
                onChange={(e) => setEditing({ ...editing, showPaymentFlow: e.target.checked })}
              />
              <span>Exibir bloco de Fluxo de Pagamento</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#0B1F3A] px-5 py-2 text-xs font-semibold text-white"
            >
              {saving ? 'Salvando...' : 'Salvar Landing Page'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Página</th>
              <th className="px-4 py-3 font-semibold">Rota</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {landingPages.map((lp) => (
              <tr key={lp.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-[#0B1F3A]">{lp.title}</td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  /{lp.routePrefix}/{lp.slug}
                </td>
                <td className="px-4 py-3">
                  {lp.isPremium ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Premium</span>
                    </span>
                  ) : (
                    <span className="text-slate-600">Padrão</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {lp.status === 'published'
                    ? 'Publicada'
                    : lp.status === 'paused'
                    ? 'Pausada'
                    : 'Rascunho'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(lp)}
                      title={lp.status === 'published' ? 'Pausar' : 'Publicar'}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                    >
                      {lp.status === 'published' ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(lp)}
                      title="Duplicar"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a
                      href={`/${lp.routePrefix}/${lp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditor(lp)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-[#0B1F3A]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(lp.id)}
                      title="Excluir"
                      className="rounded-lg border border-red-200 p-1.5 text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
