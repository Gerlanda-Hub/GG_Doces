import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Settings, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/encomendar', label: t('nav.order'), icon: ShoppingBag },
    { to: '/consultar', label: t('nav.trackShort'), icon: Search },
    { to: '/cliente', label: t('nav.account'), icon: User },
    { to: '/definicoes', label: t('nav.settings'), icon: Settings },
  ];

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all"
            >
              <div className={`flex items-center justify-center transition-all duration-200 ${
                active ? 'text-rosa-500 -translate-y-0.5' : 'text-gray-400'
              }`}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                active ? 'text-rosa-500 font-semibold' : 'text-gray-400'
              }`}>
                {label}
              </span>
              {active && <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-rosa-500" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
