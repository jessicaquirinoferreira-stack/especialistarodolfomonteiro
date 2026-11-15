import {
  Building2,
  ExternalLink,
  FileImage,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquareMore,
  Palette,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogManager } from '../../components/admin/AdminCatalogManager';
import { AdminExperienceManager } from '../../components/admin/AdminExperienceManager';
import { AdminLandingPagesManager } from '../../components/admin/AdminLandingPagesManager';
import { AdminLeadsManager } from '../../components/admin/AdminLeadsManager';
import { AdminSettingsManager } from '../../components/admin/AdminSettingsManager';
import { useSite } from '../../context/SiteContext';
import {
  fetchAllAnalytics,
  fetchAllEmpreendimentos,
  fetchAllLandingPages,
  fetchAllLeads,
  fetchAllMedia,
  fetchAllProperties,
  fetchAllVisitRequests,
} from '../../lib/firestoreService';
import type {
  AnalyticsEvent,
  Empreendimento,
  LandingPage,
  Lead,
  MediaAsset,
  Property,
  VisitRequest,
} from '../../types/realestate';

type AdminTab =
  | 'dashboard'
  | 'catalogo'
  | 'landing-pages'
  | 'leads'
  | 'hero-assistente'
  | 'midia'
  | 'configuracoes';

const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalogo', label: 'Empreendimentos & Imóveis', icon: Building2 },
  { id: 'landing-pages', label: 'Landing Pages & Premium', icon: Sparkles },
  { id: 'leads', label: 'Leads & Visitas', icon: Users },
  { id: 'hero-assistente', label: 'Hero, Assistente & Botões', icon: Sliders },
  { id: 'midia', label: 'Mídia (Vercel Blob)', icon: FileImage },
  { id: 'configuracoes', label: 'Identidade, Perfil & SEO', icon: Palette },
];

export function AdminPage() {
  const {
    settings,
    profile,
    user,
    adminEmail,
    isAdmin,
    isFirebaseAdmin,
    authReady,
    loginWithCredentials,
    loginWithGoogle,
    logout,
    refreshPublicData,
  } = useSite();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  const [emps, setEmps] = useState<Empreendimento[]>([]);
  const [propsList, setPropsList] = useState<Property[]>([]);
  const [lps, setLps] = useState<LandingPage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminData(true);
    try {
      const [e, p, lp, ld, vs, md, an] = await Promise.all([
        fetchAllEmpreendimentos(),
        fetchAllProperties(),
        fetchAllLandingPages(),
        fetchAllLeads(),
        fetchAllVisitRequests(),
        fetchAllMedia(),
        fetchAllAnalytics(),
      ]);
      setEmps(e);
      setPropsList(p);
      setLps(lp);
      setLeads(ld);
      setVisits(vs);
      setMedia(md);
      setAnalytics(an);
      await refreshPublicData();
    } finally {
      setLoadingAdminData(false);
    }
  }, [isAdmin, refreshPublicData]);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin, loadAdminData]);

  const handleCredentialsLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSubmittingLogin(true);
    try {
      await loginWithCredentials(emailInput, passwordInput);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'E-mail ou senha inválidos.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await loginWithGoogle();
    } catch {
      setAuthError(
        'Não foi possível concluir o login com o Google. Verifique se popups estão liberados.'
      );
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600">
        Verificando acesso...
      </div>
    );
  }

  // Protected Route Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1F3A] text-white">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0B1F3A]">
              Painel Administrativo
            </h1>
            <p className="text-xs text-slate-600">
              Entre com seu login administrativo para editar imóveis, textos, fotos do Hero, assistente virtual e landing pages.
            </p>
          </div>

          {user && !isAdmin && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 space-y-2">
              <p>
                A conta <strong>{user.email}</strong> não possui permissão de administrador configurada.
              </p>
              <button type="button" onClick={logout} className="font-semibold underline">
                Sair e tentar outra conta
              </button>
            </div>
          )}

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {authError}
            </div>
          )}

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                E-mail do Administrador
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@x.com"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Senha
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full rounded-lg bg-[#C8102E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A60D25] transition-colors disabled:opacity-60"
            >
              {submittingLogin ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="mx-3 shrink-0 text-[11px] text-slate-400">ou sincronizar com</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 transition-colors"
          >
            <span>Entrar com Google (Firebase Auth)</span>
          </button>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <a
              href="https://accounts.google.com/signin/recovery"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0B1F3A] underline"
            >
              Recuperar conta Google
            </a>
            <Link to="/" className="font-semibold text-[#C8102E] hover:underline">
              Voltar ao site público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pageViews = analytics.filter((a) => a.eventType === 'page_view').length;
  const whatsappClicks = analytics.filter((a) => a.eventType === 'whatsapp_click').length;
  const totalConversions = leads.length + visits.length + whatsappClicks;
  const conversionRate = pageViews > 0 ? ((totalConversions / pageViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="px-2 pt-1">
            <p className="font-display text-base font-bold text-[#0B1F3A]">
              Rodolfo Monteiro
            </p>
            <p className="text-xs text-slate-500">Gestão do Site Tenda</p>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#0B1F3A] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block border-t border-slate-100 pt-4 space-y-3">
          <p className="px-2 text-[11px] text-slate-500 truncate">{adminEmail}</p>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Painel Admin / {TABS.find((t) => t.id === activeTab)?.label}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isFirebaseAdmin && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap"
              >
                Conectar Google para ver Leads do Firestore
              </button>
            )}
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-50 whitespace-nowrap"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Ver Site Público</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
          {loadingAdminData && (
            <p className="text-xs text-slate-500">Carregando dados do painel...</p>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
                  <p className="text-xs text-slate-500">Empreendimentos</p>
                  <p className="font-mono text-2xl font-bold text-[#0B1F3A] tabular-nums">
                    {emps.length}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {emps.filter((e) => e.published).length} publicados
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
                  <p className="text-xs text-slate-500">Leads e Simulações</p>
                  <p className="font-mono text-2xl font-bold text-[#C8102E] tabular-nums">
                    {leads.length}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {visits.length} solicitações de visita
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
                  <p className="text-xs text-slate-500">Visualizações</p>
                  <p className="font-mono text-2xl font-bold text-[#0B1F3A] tabular-nums">
                    {pageViews}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {whatsappClicks} cliques no WhatsApp
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
                  <p className="text-xs text-slate-500">Taxa de Conversão</p>
                  <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {conversionRate}%
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Leads + visitas + WhatsApp
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-bold text-[#0B1F3A]">
                      Leads Recentes
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-semibold text-[#C8102E] hover:underline"
                    >
                      Gerenciar todos
                    </button>
                  </div>
                  {!isFirebaseAdmin ? (
                    <div className="space-y-3 text-xs text-slate-600">
                      <p>
                        Você entrou via acesso direto (<strong>{adminEmail}</strong>). Todas as alterações de empreendimentos, textos, imagens e configurações funcionam normalmente.
                      </p>
                      <p>
                        Para visualizar os leads privados protegidos pelas regras do Firestore, conecte também sua conta Google verificada:
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white"
                      >
                        Conectar Google (Firestore Leads)
                      </button>
                    </div>
                  ) : leads.length === 0 ? (
                    <p className="text-xs text-slate-500">Nenhum lead registrado ainda.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {leads.slice(0, 5).map((l) => (
                        <div key={l.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-[#0B1F3A]">{l.name}</p>
                            <p className="text-slate-500">
                              {l.interestEmpreendimento} · {l.phone}
                            </p>
                          </div>
                          <span className="font-medium text-slate-600">{l.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-base font-bold text-[#0B1F3A]">
                    Atalhos Rápidos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalogo')}
                      className="rounded-xl border border-slate-200 p-4 text-left hover:border-[#0B1F3A]"
                    >
                      <Building2 className="h-4 w-4 text-[#C8102E] mb-2" />
                      <p className="text-xs font-bold text-[#0B1F3A]">Gerenciar Empreendimentos</p>
                      <p className="text-[11px] text-slate-500">Adicionar, editar ou remover</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('landing-pages')}
                      className="rounded-xl border border-slate-200 p-4 text-left hover:border-[#0B1F3A]"
                    >
                      <Sparkles className="h-4 w-4 text-[#C99E32] mb-2" />
                      <p className="text-xs font-bold text-[#0B1F3A]">Landing Page Premium</p>
                      <p className="text-[11px] text-slate-500">Configurar página especial</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('hero-assistente')}
                      className="rounded-xl border border-slate-200 p-4 text-left hover:border-[#0B1F3A]"
                    >
                      <MessageSquareMore className="h-4 w-4 text-[#0B1F3A] mb-2" />
                      <p className="text-xs font-bold text-[#0B1F3A]">Assistente & Hero</p>
                      <p className="text-[11px] text-slate-500">Fotos do Hero e chat</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('midia')}
                      className="rounded-xl border border-slate-200 p-4 text-left hover:border-[#0B1F3A]"
                    >
                      <FileImage className="h-4 w-4 text-[#0B1F3A] mb-2" />
                      <p className="text-xs font-bold text-[#0B1F3A]">Upload de Mídia</p>
                      <p className="text-[11px] text-slate-500">Vercel Blob / galeria</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'catalogo' && (
            <AdminCatalogManager
              empreendimentos={emps}
              properties={propsList}
              media={media}
              onReload={loadAdminData}
            />
          )}

          {activeTab === 'landing-pages' && (
            <AdminLandingPagesManager
              landingPages={lps}
              empreendimentos={emps}
              media={media}
              onReload={loadAdminData}
            />
          )}

          {activeTab === 'leads' && (
            <div className="space-y-4">
              {!isFirebaseAdmin && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
                  <span>
                    Para listar e atualizar os leads privados armazenados no Firestore, conecte sua conta Google verificada.
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="rounded-lg bg-[#0B1F3A] px-3.5 py-2 font-semibold text-white"
                  >
                    Conectar Google
                  </button>
                </div>
              )}
              <AdminLeadsManager
                leads={leads}
                visits={visits}
                whatsappNumber={settings.whatsappNumber}
                onReload={loadAdminData}
              />
            </div>
          )}

          {(activeTab === 'hero-assistente' || activeTab === 'midia') && (
            <AdminExperienceManager
              settings={settings}
              empreendimentos={emps}
              media={media}
              onReload={loadAdminData}
              activeSection={activeTab}
            />
          )}

          {activeTab === 'configuracoes' && (
            <AdminSettingsManager
              settings={settings}
              profile={profile}
              media={media}
              onReload={loadAdminData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
