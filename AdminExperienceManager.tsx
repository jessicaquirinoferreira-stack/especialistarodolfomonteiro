import { Check, Cloud, Copy, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { SafeImage } from '../common/SafeImage';
import { GalleryUploadField } from './GalleryUploadField';
import { ImageUploadField } from './ImageUploadField';
import {
  fetchStorageStatus,
  removeMediaAsset,
  saveMediaAsset,
  saveSiteSettings,
  uploadMediaFile,
} from '../../lib/firestoreService';
import { generateSafeId } from '../../lib/utils';
import type {
  Empreendimento,
  HeroTransitionType,
  MediaAsset,
  SiteSettings,
} from '../../types/realestate';

interface AdminExperienceManagerProps {
  settings: SiteSettings;
  empreendimentos: Empreendimento[];
  media: MediaAsset[];
  onReload: () => Promise<void>;
  activeSection: 'hero-assistente' | 'midia';
}

export function AdminExperienceManager({
  settings,
  empreendimentos,
  media,
  onReload,
  activeSection,
}: AdminExperienceManagerProps) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [vercelBlobConfigured, setVercelBlobConfigured] = useState<boolean | null>(null);

  // External media URL add
  const [newMediaName, setNewMediaName] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaAsset['category']>('Empreendimento');

  useEffect(() => {
    void fetchStorageStatus().then((status) => {
      setVercelBlobConfigured(status.vercelBlobConfigured);
    });
  }, []);

  const availableImages = Array.from(
    new Set([
      ...empreendimentos.map((e) => e.coverImage),
      ...empreendimentos.flatMap((e) => e.gallery || []),
      ...media.map((m) => m.url),
    ].filter(Boolean))
  );

  const toggleHeroImage = (url: string) => {
    const exists = form.heroImageUrls.includes(url);
    const next = exists
      ? form.heroImageUrls.filter((u) => u !== url)
      : [...form.heroImageUrls, url];
    setForm({ ...form, heroImageUrls: next });
  };

  const handleSaveExperience = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await saveSiteSettings(form);
      await onReload();
      setFeedback('Configurações do Hero, Assistente Virtual e Botões Flutuantes salvas.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setFeedback('');
    setErrorMsg('');
    try {
      for (let i = 0; i < files.length; i += 1) {
        setUploadStatusText(`Enviando ${i + 1} de ${files.length}...`);
        await uploadMediaFile(files[i], newMediaCategory);
      }
      await onReload();
      setFeedback(
        files.length > 1
          ? `${files.length} imagens enviadas do dispositivo e registradas na biblioteca.`
          : 'Imagem enviada do dispositivo e registrada na biblioteca.'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Erro ao enviar arquivo. Verifique o tamanho (máx 15MB) ou formato.'
      );
    } finally {
      setUploading(false);
      setUploadStatusText('');
    }
  };

  const handleAddExternalMedia = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMediaName.trim() || !newMediaUrl.trim()) return;
    await saveMediaAsset({
      name: newMediaName.trim(),
      url: newMediaUrl.trim(),
      category: newMediaCategory,
      storageProvider: 'external',
    });
    setNewMediaName('');
    setNewMediaUrl('');
    await onReload();
    setFeedback('Mídia adicionada à biblioteca.');
  };

  if (activeSection === 'midia') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
                Biblioteca de Mídia & Upload (Dispositivo · Vercel Blob)
              </h2>
              <p className="text-xs text-slate-600">
                Envie uma ou várias fotos direto do celular ou computador. Todas as alterações e exclusões sincronizam com o Storage.
              </p>
            </div>
            {vercelBlobConfigured !== null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold ${
                  vercelBlobConfigured
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>
                  {vercelBlobConfigured
                    ? 'Vercel Blob Storage Ativo'
                    : 'Storage Preview (Vercel Blob ativo com BLOB_READ_WRITE_TOKEN)'}
                </span>
              </span>
            )}
          </div>

          {feedback && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
              {feedback}
            </div>
          )}

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 space-y-3">
              <p className="text-xs font-semibold text-[#0B1F3A]">
                Enviar uma ou mais fotos do dispositivo
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={newMediaCategory}
                  onChange={(e) => setNewMediaCategory(e.target.value as MediaAsset['category'])}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="Empreendimento">Empreendimento</option>
                  <option value="Hero">Hero</option>
                  <option value="Perfil">Perfil</option>
                  <option value="Landing">Landing</option>
                  <option value="Outros">Outros</option>
                </select>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#132C4E]">
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>{uploading ? uploadStatusText || 'Enviando...' : 'Selecionar Imagens'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleAddExternalMedia} className="rounded-xl border border-slate-200 p-5 space-y-3">
              <p className="text-xs font-semibold text-[#0B1F3A]">Ou cadastrar por URL direta</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newMediaName}
                  onChange={(e) => setNewMediaName(e.target.value)}
                  placeholder="Nome da foto"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  required
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar URL</span>
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[16/10] bg-slate-100">
                <SafeImage src={item.url} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm font-semibold text-[#0B1F3A] truncate">{item.name}</p>
                <p className="text-[11px] text-slate-500">
                  {item.category} · {item.storageProvider}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.url);
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(''), 2000);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedId === item.id ? 'Copiada' : 'Copiar URL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await removeMediaAsset(item.id);
                      await onReload();
                    }}
                    className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveExperience} className="space-y-6">
      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* 1. Hero Carousel Photos & Texts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
            Carrossel Automático do Hero
          </h2>
          <p className="text-xs text-slate-600">
            Selecione quais fotos dos empreendimentos e da biblioteca entram na rotação automática do Hero da Home.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Título do Hero</label>
            <input
              type="text"
              required
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Efeito de troca</label>
              <select
                value={form.heroTransition}
                onChange={(e) =>
                  setForm({ ...form, heroTransition: e.target.value as HeroTransitionType })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="crossfade">Crossfade suave</option>
                <option value="slide">Slide elegante</option>
                <option value="zoom">Zoom suave</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Intervalo (ms)</label>
              <input
                type="number"
                min={2500}
                max={15000}
                step={500}
                value={form.heroIntervalMs}
                onChange={(e) => setForm({ ...form, heroIntervalMs: Number(e.target.value) || 5500 })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Subtítulo do Hero</label>
          <textarea
            rows={2}
            value={form.heroSubtitle}
            onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <GalleryUploadField
          label="Fotos Ativas no Carrossel do Hero (Dispositivo, Ordem & Remoção)"
          images={form.heroImageUrls}
          onChange={(imgs) => setForm({ ...form, heroImageUrls: imgs })}
          category="Hero"
          media={media}
          onMediaUpdated={onReload}
        />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            Ou marque/desmarque rapidamente fotos já cadastradas ({form.heroImageUrls.length} selecionadas)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {availableImages.map((url) => {
              const selected = form.heroImageUrls.includes(url);
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => toggleHeroImage(url)}
                  className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 text-left transition-all ${
                    selected ? 'border-[#C8102E]' : 'border-slate-200 opacity-65 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={url} alt="Foto Hero" className="h-full w-full object-cover" />
                  <span
                    className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      selected ? 'bg-[#C8102E] text-white' : 'bg-white/90 text-slate-500'
                    }`}
                  >
                    {selected ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Floating Buttons (Right Side) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          Botões Flutuantes (Lado Direito)
        </h2>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.floatingWhatsappEnabled}
              onChange={(e) => setForm({ ...form, floatingWhatsappEnabled: e.target.checked })}
            />
            <span>Exibir botão flutuante do WhatsApp</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.floatingInstagramEnabled}
              onChange={(e) => setForm({ ...form, floatingInstagramEnabled: e.target.checked })}
            />
            <span>Exibir botão flutuante do Instagram</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              WhatsApp (com DDI 55)
            </label>
            <input
              type="text"
              required
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">URL do Instagram</label>
            <input
              type="text"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">@ Handle</label>
            <input
              type="text"
              value={form.instagramHandle}
              onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Humanized Virtual Assistant (Left Side) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
              Assistente Virtual Humanizada (Lado Esquerdo)
            </h2>
            <p className="text-xs text-slate-600">
              Ative/desative e edite o nome, foto e respostas rápidas da assistente.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A]">
            <input
              type="checkbox"
              checked={form.assistantEnabled}
              onChange={(e) => setForm({ ...form, assistantEnabled: e.target.checked })}
            />
            <span>Assistente ativa no site</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nome da Assistente
            </label>
            <input
              type="text"
              value={form.assistantName}
              onChange={(e) => setForm({ ...form, assistantName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <ImageUploadField
            label="Foto / Avatar da Assistente Virtual"
            value={form.assistantAvatarUrl}
            onChange={(url) => setForm({ ...form, assistantAvatarUrl: url })}
            category="Perfil"
            media={media}
            onMediaUpdated={onReload}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Mensagem de Boas-vindas
          </label>
          <textarea
            rows={2}
            value={form.assistantGreeting}
            onChange={(e) => setForm({ ...form, assistantGreeting: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              Respostas rápidas configuráveis
            </p>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  assistantFaqs: [
                    ...form.assistantFaqs,
                    {
                      id: generateSafeId('faq'),
                      question: 'Nova dúvida',
                      keywords: ['duvida'],
                      answer: 'Resposta configurada...',
                      suggestWhatsapp: true,
                    },
                  ],
                })
              }
              className="text-xs font-semibold text-[#C8102E] hover:underline"
            >
              + Adicionar resposta
            </button>
          </div>

          {form.assistantFaqs.map((faq, idx) => (
            <div key={faq.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={faq.question}
                  placeholder="Botão / Pergunta"
                  onChange={(e) => {
                    const next = [...form.assistantFaqs];
                    next[idx] = { ...next[idx], question: e.target.value };
                    setForm({ ...form, assistantFaqs: next });
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                />
                <input
                  type="text"
                  value={faq.keywords.join(', ')}
                  placeholder="Palavras-chave (separadas por vírgula)"
                  onChange={(e) => {
                    const next = [...form.assistantFaqs];
                    next[idx] = {
                      ...next[idx],
                      keywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                    };
                    setForm({ ...form, assistantFaqs: next });
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                />
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const next = [...form.assistantFaqs];
                  next[idx] = { ...next[idx], answer: e.target.value };
                  setForm({ ...form, assistantFaqs: next });
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={Boolean(faq.suggestWhatsapp)}
                      onChange={(e) => {
                        const next = [...form.assistantFaqs];
                        next[idx] = { ...next[idx], suggestWhatsapp: e.target.checked };
                        setForm({ ...form, assistantFaqs: next });
                      }}
                    />
                    <span>Sugerir WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={Boolean(faq.suggestInstagram)}
                      onChange={(e) => {
                        const next = [...form.assistantFaqs];
                        next[idx] = { ...next[idx], suggestInstagram: e.target.checked };
                        setForm({ ...form, assistantFaqs: next });
                      }}
                    />
                    <span>Sugerir Instagram</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      assistantFaqs: form.assistantFaqs.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#C8102E] px-6 py-3 text-xs font-semibold text-white hover:bg-[#A60D25]"
        >
          {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </button>
      </div>
    </form>
  );
}
