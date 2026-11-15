import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';

const CONSENT_KEY = 'rm_tenda_lgpd_accepted_v1';

export function LgpdBanner() {
  const { settings } = useSite();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de Privacidade e Cookies"
      className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-600">
          {settings.lgpdNotice}{' '}
          <Link to="/privacidade" className="font-semibold text-[#C8102E] underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#132C4E] whitespace-nowrap"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
