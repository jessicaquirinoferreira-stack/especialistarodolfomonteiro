import { useState, type FormEvent } from 'react';
import { saveProfessionalProfile, saveSiteSettings } from '../../lib/firestoreService';
import type { MediaAsset, ProfessionalProfile, SiteSettings } from '../../types/realestate';
import { ImageUploadField } from './ImageUploadField';

interface AdminSettingsManagerProps {
  settings: SiteSettings;
  profile: ProfessionalProfile;
  media?: MediaAsset[];
  onReload: () => Promise<void>;
}

export function AdminSettingsManager({
  settings,
  profile,
  media = [],
  onReload,
}: AdminSettingsManagerProps) {
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [profileForm, setProfileForm] = useState<ProfessionalProfile>(profile);
  const [highlightsText, setHighlightsText] = useState(
    (profile.highlights || []).join(', ')
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      await Promise.all([
        saveSiteSettings(siteForm),
        saveProfessionalProfile({
          ...profileForm,
          highlights: highlightsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      ]);
      await onReload();
      setFeedback('Identidade visual, perfil de Rodolfo Monteiro, SEO e LGPD atualizados.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Visual Identity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          Identidade Visual & Marca
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Nome do Site</label>
            <input
              type="text"
              required
              value={siteForm.siteName}
              onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Tagline</label>
            <input
              type="text"
              value={siteForm.tagline}
              onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Texto do Rodapé</label>
            <input
              type="text"
              value={siteForm.footerText}
              onChange={(e) => setSiteForm({ ...siteForm, footerText: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Cor Principal (Tenda)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteForm.primaryColor}
                onChange={(e) => setSiteForm({ ...siteForm, primaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-slate-200"
              />
              <input
                type="text"
                value={siteForm.primaryColor}
                onChange={(e) => setSiteForm({ ...siteForm, primaryColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Cor Secundária (Azul)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteForm.secondaryColor}
                onChange={(e) => setSiteForm({ ...siteForm, secondaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-slate-200"
              />
              <input
                type="text"
                value={siteForm.secondaryColor}
                onChange={(e) => setSiteForm({ ...siteForm, secondaryColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Cor de Destaque (Dourado)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={siteForm.accentColor}
                onChange={(e) => setSiteForm({ ...siteForm, accentColor: e.target.value })}
                className="h-9 w-12 rounded border border-slate-200"
              />
              <input
                type="text"
                value={siteForm.accentColor}
                onChange={(e) => setSiteForm({ ...siteForm, accentColor: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <ImageUploadField
              label="Logo Oficial do Site (sem moldura/corte)"
              value={siteForm.logoUrl || ''}
              onChange={(url) => setSiteForm({ ...siteForm, logoUrl: url })}
              category="Outros"
              media={media}
              onMediaUpdated={onReload}
              previewContain
            />
          </div>
        </div>
      </div>

      {/* Professional Profile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
            Perfil Profissional · Rodolfo Monteiro
          </h2>
          <p className="text-xs text-slate-500">
            Campos como CRECI, e-mail e endereço comercial ficam em branco até serem preenchidos aqui por você.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Nome Completo</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Título / Cargo</label>
            <input
              type="text"
              required
              value={profileForm.roleTitle}
              onChange={(e) => setProfileForm({ ...profileForm, roleTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Região de Atuação</label>
            <input
              type="text"
              value={profileForm.region}
              onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">CRECI (opcional)</label>
            <input
              type="text"
              value={profileForm.creci}
              onChange={(e) => setProfileForm({ ...profileForm, creci: e.target.value })}
              placeholder="Preencha quando desejar exibir"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              E-mail de Contato (opcional)
            </label>
            <input
              type="email"
              value={profileForm.contactEmail}
              onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
              placeholder="contato@..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Endereço Comercial (opcional)
            </label>
            <input
              type="text"
              value={profileForm.commercialAddress}
              onChange={(e) => setProfileForm({ ...profileForm, commercialAddress: e.target.value })}
              placeholder="Plantão / escritório"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <ImageUploadField
          label="Foto Profissional do Corretor"
          value={profileForm.photoUrl}
          onChange={(url) => setProfileForm({ ...profileForm, photoUrl: url })}
          category="Perfil"
          media={media}
          onMediaUpdated={onReload}
        />

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Bio Curta</label>
          <textarea
            rows={2}
            value={profileForm.bioShort}
            onChange={(e) => setProfileForm({ ...profileForm, bioShort: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Bio Institucional Completa</label>
          <textarea
            rows={3}
            value={profileForm.bioFull}
            onChange={(e) => setProfileForm({ ...profileForm, bioFull: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Destaques (Highlights separados por vírgula)
          </label>
          <input
            type="text"
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* SEO, Analytics & LGPD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#0B1F3A]">
          SEO, Google Analytics / Ads & LGPD
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">SEO Title Padrão</label>
            <input
              type="text"
              value={siteForm.seoTitle}
              onChange={(e) => setSiteForm({ ...siteForm, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              SEO Meta Description
            </label>
            <input
              type="text"
              value={siteForm.seoDescription}
              onChange={(e) => setSiteForm({ ...siteForm, seoDescription: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Google Analytics 4 (Measurement ID)
            </label>
            <input
              type="text"
              value={siteForm.ga4Id}
              onChange={(e) => setSiteForm({ ...siteForm, ga4Id: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Google Tag Manager (GTM ID)
            </label>
            <input
              type="text"
              value={siteForm.gtmId}
              onChange={(e) => setSiteForm({ ...siteForm, gtmId: e.target.value })}
              placeholder="GTM-XXXXXXX"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Google Ads Conversion ID
            </label>
            <input
              type="text"
              value={siteForm.googleAdsId}
              onChange={(e) => setSiteForm({ ...siteForm, googleAdsId: e.target.value })}
              placeholder="AW-XXXXXXXXX"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Search Console Verification Meta
            </label>
            <input
              type="text"
              value={siteForm.searchConsoleVerification}
              onChange={(e) =>
                setSiteForm({ ...siteForm, searchConsoleVerification: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Texto do Aviso de Cookies / LGPD
          </label>
          <textarea
            rows={2}
            value={siteForm.lgpdNotice}
            onChange={(e) => setSiteForm({ ...siteForm, lgpdNotice: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0B1F3A] px-6 py-3 text-xs font-semibold text-white hover:bg-[#132C4E]"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações Gerais'}
        </button>
      </div>
    </form>
  );
}
