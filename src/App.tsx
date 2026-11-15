import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LgpdBanner } from './components/common/LgpdBanner';
import { FloatingSocialButtons } from './components/floating/FloatingSocialButtons';
import { VirtualAssistantWidget } from './components/floating/VirtualAssistantWidget';
import { CinematicIntro } from './components/intro/CinematicIntro';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteProvider, useSite } from './context/SiteContext';
import { AdminPage } from './pages/admin/AdminPage';
import { ContatoPage } from './pages/ContatoPage';
import { EmpreendimentoDetailPage } from './pages/EmpreendimentoDetailPage';
import { EmpreendimentosPage } from './pages/EmpreendimentosPage';
import { HomePage } from './pages/HomePage';
import { LandingPageView } from './pages/LandingPageView';
import { PrivacidadePage } from './pages/PrivacidadePage';
import { SimulacaoPage } from './pages/SimulacaoPage';
import { SobrePage } from './pages/SobrePage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function TrackingScripts() {
  const { settings } = useSite();

  useEffect(() => {
    if (settings.searchConsoleVerification) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.searchConsoleVerification);
    }

    if (settings.ga4Id && !document.getElementById('rm-ga4-script')) {
      const script = document.createElement('script');
      script.id = 'rm-ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4Id)}`;
      document.head.appendChild(script);

      const inline = document.createElement('script');
      inline.innerHTML = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${settings.ga4Id}');`;
      document.head.appendChild(inline);
    }
  }, [settings.ga4Id, settings.searchConsoleVerification]);

  return null;
}

function PublicLayout({
  children,
  showIntro,
  onIntroComplete,
}: {
  children: ReactNode;
  showIntro: boolean;
  onIntroComplete: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1F3A]">
      {showIntro && <CinematicIntro onComplete={onIntroComplete} />}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingSocialButtons />
      <VirtualAssistantWidget />
      <LgpdBanner />
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <SiteProvider>
      <BrowserRouter>
        <ScrollToTop />
        <TrackingScripts />
        <Routes>
          <Route
            path="/"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/empreendimentos"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <EmpreendimentosPage />
              </PublicLayout>
            }
          />
          <Route
            path="/lancamentos"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <EmpreendimentosPage />
              </PublicLayout>
            }
          />
          <Route
            path="/empreendimento/:slug"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <EmpreendimentoDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/oportunidade/:slug"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <LandingPageView />
              </PublicLayout>
            }
          />
          <Route
            path="/campanha/:slug"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <LandingPageView />
              </PublicLayout>
            }
          />
          <Route
            path="/simulacao"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <SimulacaoPage />
              </PublicLayout>
            }
          />
          <Route
            path="/sobre"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <SobrePage />
              </PublicLayout>
            }
          />
          <Route
            path="/contato"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <ContatoPage />
              </PublicLayout>
            }
          />
          <Route
            path="/privacidade"
            element={
              <PublicLayout showIntro={showIntro} onIntroComplete={handleIntroComplete}>
                <PrivacidadePage />
              </PublicLayout>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
