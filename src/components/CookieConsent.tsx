import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isNative } from '../utils/nativeFeatures';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No native app: cookies notice is not needed
    if (isNative()) return;
    const consent = localStorage.getItem('mundodedoces_cookie_consent');
    if (!consent) {
      // Slight delay so it animates in after page load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('mundodedoces_cookie_consent', 'accepted');
    localStorage.setItem('mundodedoces_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('mundodedoces_cookie_consent', 'essential');
    localStorage.setItem('mundodedoces_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  const denyAll = () => {
    localStorage.setItem('mundodedoces_cookie_consent', 'denied');
    localStorage.setItem('mundodedoces_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto bg-white border border-rosa-100 rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-rosa-50 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-rosa-500" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
              🍪 Nós usamos cookies
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Utilizamos cookies para melhorar a sua experiência, guardar as suas preferências (como o tema e os seus dados de encomenda) e analisar o tráfego do site. Ao continuar a navegar, concorda com a nossa utilização de cookies. Consulte a nossa{' '}
              <Link to="/politica-privacidade" className="text-rosa-500 font-semibold hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={denyAll}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-200 hover:text-red-500 transition-all whitespace-nowrap"
            >
              Negar
            </button>
            <button
              onClick={acceptEssential}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all whitespace-nowrap"
            >
              Apenas Essenciais
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md shadow-rosa-200 transition-all whitespace-nowrap"
            >
              Aceitar Tudo
            </button>
          </div>

          {/* Close = deny on mobile */}
          <button
            onClick={denyAll}
            className="absolute top-3 right-3 sm:static sm:hidden text-gray-400 hover:text-gray-600"
            aria-label="Negar e fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
