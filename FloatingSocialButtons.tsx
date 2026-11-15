import { useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { recordAnalyticsEvent } from '../../lib/firestoreService';
import { buildWhatsappUrl } from '../../lib/utils';

export function FloatingSocialButtons() {
  const { settings } = useSite();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;
  if (!settings.floatingWhatsappEnabled && !settings.floatingInstagramEnabled) return null;

  const whatsappUrl = buildWhatsappUrl(
    settings.whatsappNumber,
    'Olá Rodolfo! Vim pelo site e gostaria de fazer uma simulação sem compromisso.'
  );

  return (
    <div
      aria-label="Atalhos de contato rápido"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5"
    >
      {settings.floatingInstagramEnabled && (
        <a
          href={settings.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram oficial de Rodolfo Monteiro"
          onClick={() =>
            void recordAnalyticsEvent('instagram_click', location.pathname, 'Botão Flutuante Instagram')
          }
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-lg ring-2 ring-white transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2A7B]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-current"
            aria-hidden="true"
          >
            <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM17.5 5.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          </svg>
        </a>
      )}

      {settings.floatingWhatsappEnabled && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp com Rodolfo Monteiro"
          onClick={() =>
            void recordAnalyticsEvent('whatsapp_click', location.pathname, 'Botão Flutuante WhatsApp')
          }
          className="group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-2 ring-white transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-current"
            aria-hidden="true"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2Zm5.81 14.07c-.24.69-1.42 1.31-1.97 1.39-.51.08-1.15.11-1.85-.11-.43-.14-.98-.32-1.69-.63-2.96-1.28-4.89-4.27-5.04-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.38 1.47.3.15.47.12.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.07.12.07.7-.17 1.39Z" />
          </svg>
        </a>
      )}
    </div>
  );
}
