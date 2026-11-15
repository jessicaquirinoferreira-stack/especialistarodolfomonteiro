import { Copy, ExternalLink, Eye, EyeOff, Plus, Star, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { SafeImage } from '../common/SafeImage';
import { GalleryUploadField } from './GalleryUploadField';
import { ImageUploadField } from './ImageUploadField';
import {
  removeEmpreendimento,
  removeProperty,
  saveEmpreendimento,
  saveProperty,
} from '../../lib/firestoreService';
import { generateSafeId, slugify } from '../../lib/utils';
import type { Empreendimento, EmpreendimentoStatus, MediaAsset, Property } from '../../types/realestate';

interface AdminCatalogManagerProps {
  empreendimentos: Empreendimento[];
  properties: Property[];
  media: MediaAsset[];
  onReload: () => Promise<void>;
}

const EMPTY_EMP: Empreendimento = {
  id: '',
  name: '',
  slug: '',
  neighborhood: '',
  city: 'Salvador',
  addressNote: '',
  nearbyHighlights: [],
  status: 'A confirmar',
  featured: true,
  published: true,
  confirmationPending: true,
  priceDisplay: 'Sob consulta (a confirmar)',
  priceNumeric: 0,
  bedroomsSummary: '2 quartos',
  leisureArea: 'A confirmar',
  description: '',
  features: [],
  coverImage: '',
  gallery: [],
  paymentFlow: [],
  paymentFlowNote: '',
  tendaConditions: ['FGTS', 'Entrada facilitada', 'Subsídio (a confirmar)'],
};

const EMPTY_PROP: Property = {
  id: '',
  title: '',
  slug: '',
  empreendimentoId: '',
  empreendimentoName: '',
  neighborhood: '',
  city: 'Salvador',
  bedrooms: 2,
  bathrooms: 'A confirmar',
  areaText: 'A confirmar',
  parkingText: 'A confirmar',
  priceNumeric: 0,
  priceDisplay: 'A confirmar',
  entryCondition: 'FGTS · Entrada facilitada',
  acceptsFgts: true,
  acceptsSubsidy: true,
  confirmationPending: true,
  isLaunch: true,
  featured: true,
  published: true,
  coverImage: '',
  gallery: [],
  description: '',
  features: [],
};

export function AdminCatalogManager({
  empreendimentos,
  properties,
  media,
  onReload,
}: AdminCatalogManagerProps) {
  const [subTab, setSubTab] = useState<'empreendimentos' | 'unidades'>('empreendimentos');
  const [editingEmp, setEditingEmp] = useState<Empreendimento | null>(null);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Text helpers for line-separated lists
  const [empFeaturesText, setEmpFeaturesText] = useState('');
  const [empNearbyText, setEmpNearbyText] = useState('');

  const openEmpEditor = (emp?: Empreendimento) => {
    const target = emp ? { ...emp, gallery: [...(emp.gallery || [])] } : { ...EMPTY_EMP, id: generateSafeId('emp') };
    setEditingEmp(target);
    setEmpFeaturesText((target.features || []).join('\n'));
    setEmpNearbyText((target.nearbyHighlights || []).join('\n'));
    setFeedback('');
  };

  const handleSaveEmp = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setSaving(true);
    try {
      const payload: Empreendimento = {
        ...editingEmp,
        slug: slugify(editingEmp.slug || editingEmp.name),
        features: empFeaturesText.split('\n').map((s) => s.trim()).filter(Boolean),
        nearbyHighlights: empNearbyText.split('\n').map((s) => s.trim()).filter(Boolean),
        gallery: (editingEmp.gallery || []).filter(Boolean),
      };
      await saveEmpreendimento(payload);
      setEditingEmp(null);
      await onReload();
      setFeedback('Empreendimento salvo com sucesso.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateEmp = async (emp: Empreendimento) => {
    const copy: Empreendimento = {
      ...emp,
      id: generateSafeId('emp'),
      name: `${emp.name} (Cópia)`,
      slug: `${emp.slug}-copia-${Date.now().toString().slice(-4)}`,
      published: false,
    };
    await saveEmpreendimento(copy, true);
    await onReload();
    setFeedback('Empreendimento duplicado como rascunho.');
  };

  const handleToggleEmpPublished = async (emp: Empreendimento) => {
    await saveEmpreendimento({ ...emp, published: !emp.published });
    await onReload();
  };

  const handleToggleEmpFeatured = async (emp: Empreendimento) => {
    await saveEmpreendimento({ ...emp, featured: !emp.featured });
    await onReload();
  };

  const handleDeleteEmp = async (id: string) => {
    await removeEmpreendimento(id);
    await onReload();
    setFeedback('Empreendimento removido.');
  };

  const openPropEditor = (prop?: Property) => {
    const target = prop
      ? { ...prop }
      : {
          ...EMPTY_PROP,
          id: generateSafeId('prop'),
          empreendimentoId: empreendimentos[0]?.id || '',
          empreendimentoName: empreendimentos[0]?.name || '',
          coverImage: empreendimentos[0]?.coverImage || '',
        };
    setEditingProp(target);
    setFeedback('');
  };

  const handleSaveProp = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSaving(true);
    try {
      const parent = empreendimentos.find((emp) => emp.id === editingProp.empreendimentoId);
      await saveProperty({
        ...editingProp,
        slug: slugify(editingProp.slug || editingProp.title),
        empreendimentoName: parent?.name || editingProp.empreendimentoName,
      });
      setEditingProp(null);
      await onReload();
      setFeedback('Unidade salva no Firestore com sucesso.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateProp = async (prop: Property) => {
    await saveProperty(
      {
        ...prop,
        id: generateSafeId('prop'),
        title: `${prop.title} (Cópia)`,
        slug: `${prop.slug}-copia-${Date.now().toString().slice(-4)}`,
        published: false,
      },
      true
    );
    await onReload();
  };

  const handleDeleteProp = async (id: string) => {
    await removeProperty(id);
    await onReload();
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Primary Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab('empreendimentos')}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              subTab === 'empreendimentos' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-600'
            }`}
          >
            Empreendimentos ({empreendimentos.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('unidades')}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
              subTab === 'unidades' ? 'bg-white text-[#0B1F3A] shadow-sm' : 'text-slate-600'
            }`}
          >
            Imóveis / Unidades ({properties.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => (subTab === 'empreendimentos' ? openEmpEditor() : openPropEditor())}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A60D25]"
        >
          <Plus className="h-4 w-4" />
          <span>
            {subTab === 'empreendimentos' ? 'Novo Empreendimento' : 'Nova Unidade'}
          </span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Empreendimentos Table / Editor */}
      {subTab === 'empreendimentos' && (
        <>
          {editingEmp && (
            <form
              onSubmit={handleSaveEmp}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                  {editingEmp.name ? `Editar: ${editingEmp.name}` : 'Novo Empreendimento'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nome *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.name}
                    onChange={(e) =>
                      setEditingEmp({
                        ...editingEmp,
                        name: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.slug}
                    onChange={(e) => setEditingEmp({ ...editingEmp, slug: slugify(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={editingEmp.status}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, status: e.target.value as EmpreendimentoStatus })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="Lançamento">Lançamento</option>
                    <option value="Breve lançamento">Breve lançamento</option>
                    <option value="Em obras">Em obras</option>
                    <option value="Pronto">Pronto</option>
                    <option value="A confirmar">A confirmar</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bairro</label>
                  <input
                    type="text"
                    value={editingEmp.neighborhood}
                    onChange={(e) => setEditingEmp({ ...editingEmp, neighborhood: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.city}
                    onChange={(e) => setEditingEmp({ ...editingEmp, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Referência de Endereço
                  </label>
                  <input
                    type="text"
                    value={editingEmp.addressNote}
                    onChange={(e) => setEditingEmp({ ...editingEmp, addressNote: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Valor Exibido
                  </label>
                  <input
                    type="text"
                    value={editingEmp.priceDisplay}
                    onChange={(e) => setEditingEmp({ ...editingEmp, priceDisplay: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Valor Numérico (filtro)
                  </label>
                  <input
                    type="number"
                    value={editingEmp.priceNumeric}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, priceNumeric: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Tipologia / Quartos
                  </label>
                  <input
                    type="text"
                    value={editingEmp.bedroomsSummary}
                    onChange={(e) => setEditingEmp({ ...editingEmp, bedroomsSummary: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Área de Lazer
                </label>
                <input
                  type="text"
                  value={editingEmp.leisureArea}
                  onChange={(e) => setEditingEmp({ ...editingEmp, leisureArea: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <ImageUploadField
                label="Foto de Capa do Empreendimento"
                value={editingEmp.coverImage}
                onChange={(url) => setEditingEmp({ ...editingEmp, coverImage: url })}
                category="Empreendimento"
                media={media}
                onMediaUpdated={onReload}
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Descrição</label>
                <textarea
                  rows={3}
                  value={editingEmp.description}
                  onChange={(e) => setEditingEmp({ ...editingEmp, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Diferenciais (1 por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={empFeaturesText}
                    onChange={(e) => setEmpFeaturesText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Proximidades (1 por linha)
                  </label>
                  <textarea
                    rows={4}
                    value={empNearbyText}
                    onChange={(e) => setEmpNearbyText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <GalleryUploadField
                label="Galeria de Fotos do Empreendimento"
                images={editingEmp.gallery || []}
                onChange={(imgs) => setEditingEmp({ ...editingEmp, gallery: imgs })}
                category="Empreendimento"
                media={media}
                onMediaUpdated={onReload}
                coverUrl={editingEmp.coverImage}
                onSetAsCover={(url) => setEditingEmp({ ...editingEmp, coverImage: url })}
              />

              {/* Payment Flow Steps */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">
                    Fluxo de Pagamento (opcional)
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingEmp({
                        ...editingEmp,
                        paymentFlow: [
                          ...(editingEmp.paymentFlow || []),
                          { label: 'Parcela', value: 'R$ 0', detail: '' },
                        ],
                      })
                    }
                    className="text-xs font-semibold text-[#C8102E] hover:underline"
                  >
                    + Adicionar etapa
                  </button>
                </div>
                {(editingEmp.paymentFlow || []).map((step, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      value={step.label}
                      placeholder="Etapa (ex: Ato)"
                      onChange={(e) => {
                        const next = [...editingEmp.paymentFlow];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setEditingEmp({ ...editingEmp, paymentFlow: next });
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={step.value}
                      placeholder="Valor"
                      onChange={(e) => {
                        const next = [...editingEmp.paymentFlow];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setEditingEmp({ ...editingEmp, paymentFlow: next });
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={step.detail || ''}
                      placeholder="Detalhe"
                      onChange={(e) => {
                        const next = [...editingEmp.paymentFlow];
                        next[idx] = { ...next[idx], detail: e.target.value };
                        setEditingEmp({ ...editingEmp, paymentFlow: next });
                      }}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingEmp({
                          ...editingEmp,
                          paymentFlow: editingEmp.paymentFlow.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-xs text-red-600 hover:underline text-left sm:text-center"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingEmp.published}
                    onChange={(e) => setEditingEmp({ ...editingEmp, published: e.target.checked })}
                  />
                  <span>Publicado no site</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingEmp.featured}
                    onChange={(e) => setEditingEmp({ ...editingEmp, featured: e.target.checked })}
                  />
                  <span>Destacar na Home</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingEmp.confirmationPending}
                    onChange={(e) =>
                      setEditingEmp({ ...editingEmp, confirmationPending: e.target.checked })
                    }
                  />
                  <span>Exibir aviso de confirmação pendente</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0B1F3A] px-5 py-2 text-xs font-semibold text-white hover:bg-[#132C4E]"
                >
                  {saving ? 'Salvando...' : 'Salvar Empreendimento'}
                </button>
              </div>
            </form>
          )}

          {/* List of Empreendimentos */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Empreendimento</th>
                  <th className="px-4 py-3 font-semibold">Localização</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Referência</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empreendimentos.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100 shrink-0">
                          <SafeImage src={emp.coverImage} alt={emp.name} className="h-full w-full" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0B1F3A]">{emp.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">/{emp.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {emp.neighborhood ? `${emp.neighborhood} · ` : ''}
                      {emp.city}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">
                        {emp.published ? 'Publicado' : 'Rascunho'} · {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-700">
                      {emp.priceDisplay}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleEmpFeatured(emp)}
                          title="Alternar destaque"
                          className={`rounded-lg p-1.5 border ${
                            emp.featured
                              ? 'border-amber-200 bg-amber-50 text-amber-600'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleEmpPublished(emp)}
                          title={emp.published ? 'Despublicar' : 'Publicar'}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          {emp.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateEmp(emp)}
                          title="Duplicar"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={`/empreendimento/${emp.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir página"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEmpEditor(emp)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-[#0B1F3A] hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmp(emp.id)}
                          title="Excluir"
                          className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
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
        </>
      )}

      {/* Unidades / Properties Manager */}
      {subTab === 'unidades' && (
        <>
          {editingProp && (
            <form
              onSubmit={handleSaveProp}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-lg font-bold text-[#0B1F3A]">
                  {editingProp.title ? `Editar Unidade: ${editingProp.title}` : 'Nova Unidade'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="text-xs font-semibold text-slate-500"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Título *</label>
                  <input
                    type="text"
                    required
                    value={editingProp.title}
                    onChange={(e) =>
                      setEditingProp({
                        ...editingProp,
                        title: e.target.value,
                        slug: slugify(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Empreendimento vinculado
                  </label>
                  <select
                    value={editingProp.empreendimentoId}
                    onChange={(e) => setEditingProp({ ...editingProp, empreendimentoId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Sem vínculo</option>
                    {empreendimentos.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Quartos</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={editingProp.bedrooms}
                    onChange={(e) =>
                      setEditingProp({ ...editingProp, bedrooms: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bairro</label>
                  <input
                    type="text"
                    value={editingProp.neighborhood}
                    onChange={(e) => setEditingProp({ ...editingProp, neighborhood: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={editingProp.city}
                    onChange={(e) => setEditingProp({ ...editingProp, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Valor Exibido
                  </label>
                  <input
                    type="text"
                    value={editingProp.priceDisplay}
                    onChange={(e) => setEditingProp({ ...editingProp, priceDisplay: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Área</label>
                  <input
                    type="text"
                    value={editingProp.areaText}
                    onChange={(e) => setEditingProp({ ...editingProp, areaText: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Vaga</label>
                  <input
                    type="text"
                    value={editingProp.parkingText}
                    onChange={(e) => setEditingProp({ ...editingProp, parkingText: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Foto de Capa do Imóvel / Unidade"
                value={editingProp.coverImage}
                onChange={(url) => setEditingProp({ ...editingProp, coverImage: url })}
                category="Empreendimento"
                media={media}
                onMediaUpdated={onReload}
              />

              <GalleryUploadField
                label="Galeria de Fotos do Imóvel / Unidade"
                images={editingProp.gallery || []}
                onChange={(imgs) => setEditingProp({ ...editingProp, gallery: imgs })}
                category="Empreendimento"
                media={media}
                onMediaUpdated={onReload}
                coverUrl={editingProp.coverImage}
                onSetAsCover={(url) => setEditingProp({ ...editingProp, coverImage: url })}
              />

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Descrição</label>
                <textarea
                  rows={3}
                  value={editingProp.description}
                  onChange={(e) => setEditingProp({ ...editingProp, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={editingProp.published}
                    onChange={(e) => setEditingProp({ ...editingProp, published: e.target.checked })}
                  />
                  <span>Publicado</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={editingProp.acceptsFgts}
                    onChange={(e) => setEditingProp({ ...editingProp, acceptsFgts: e.target.checked })}
                  />
                  <span>Aceita FGTS</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={editingProp.acceptsSubsidy}
                    onChange={(e) =>
                      setEditingProp({ ...editingProp, acceptsSubsidy: e.target.checked })
                    }
                  />
                  <span>Elegível a Subsídio</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={editingProp.isLaunch}
                    onChange={(e) => setEditingProp({ ...editingProp, isLaunch: e.target.checked })}
                  />
                  <span>Lançamento</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#0B1F3A] px-5 py-2 text-xs font-semibold text-white"
                >
                  {saving ? 'Salvando...' : 'Salvar Unidade'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Unidade</th>
                  <th className="px-4 py-3 font-semibold">Empreendimento</th>
                  <th className="px-4 py-3 font-semibold">Quartos</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100 shrink-0">
                          <SafeImage src={prop.coverImage} alt={prop.title} className="h-full w-full" />
                        </div>
                        <span className="font-semibold text-[#0B1F3A]">{prop.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{prop.empreendimentoName || '—'}</td>
                    <td className="px-4 py-3 font-mono tabular-nums">{prop.bedrooms}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {prop.published ? 'Publicado' : 'Rascunho'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicateProp(prop)}
                          title="Duplicar"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openPropEditor(prop)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-[#0B1F3A]"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProp(prop.id)}
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
        </>
      )}
    </div>
  );
}
