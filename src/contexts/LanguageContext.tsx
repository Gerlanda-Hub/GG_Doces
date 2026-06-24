import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'pt' | 'en';

type Dict = Record<string, { pt: string; en: string }>;

// Central translation dictionary
export const translations: Dict = {
  // Navbar / Bottom nav
  'nav.home': { pt: 'Início', en: 'Home' },
  'nav.order': { pt: 'Encomendar', en: 'Order' },
  'nav.track': { pt: 'Consultar Pedido', en: 'Track Order' },
  'nav.trackShort': { pt: 'Consultar', en: 'Track' },
  'nav.account': { pt: 'Conta', en: 'Account' },
  'nav.settings': { pt: 'Definições', en: 'Settings' },
  'nav.clientArea': { pt: 'Área do Cliente', en: 'Client Area' },

  // Home Hero
  'home.badge': { pt: 'Confeitaria Artesanal', en: 'Artisan Confectionery' },
  'home.heroSubtitle': { pt: 'Sabores criados para tornar cada celebração especial.', en: 'Flavors crafted to make every celebration special.' },
  'home.orderNow': { pt: 'Fazer Encomenda', en: 'Place Order' },
  'home.getQuote': { pt: 'Solicitar Orçamento', en: 'Request Quote' },
  'home.talkToUs': { pt: 'Falar com a Gestão', en: 'Talk to Us' },
  'home.share': { pt: 'Partilhar', en: 'Share' },

  // Home Services
  'home.servicesLabel': { pt: 'Nossos Serviços', en: 'Our Services' },
  'home.servicesTitle': { pt: 'O que oferecemos', en: 'What we offer' },
  'home.servicesDesc': { pt: 'Cuidamos de cada detalhe para tornar o seu evento inesquecível com os melhores sabores.', en: 'We take care of every detail to make your event unforgettable with the best flavors.' },
  'service.order': { pt: 'Encomendar →', en: 'Order →' },

  // Home About
  'home.aboutLabel': { pt: 'Sobre Nós', en: 'About Us' },
  'home.aboutTitle': { pt: 'Quem somos', en: 'Who we are' },

  // Home Mission
  'home.mission': { pt: 'Missão', en: 'Mission' },
  'home.vision': { pt: 'Visão', en: 'Vision' },
  'home.values': { pt: 'Valores', en: 'Values' },

  // Home CTA
  'home.ctaTitle': { pt: 'Pronto para tornar a sua celebração especial?', en: 'Ready to make your celebration special?' },
  'home.ctaDesc': { pt: 'Faça já a sua encomenda ou solicite um orçamento personalizado.', en: 'Place your order now or request a custom quote.' },

  // Settings
  'settings.title': { pt: 'Definições', en: 'Settings' },
  'settings.subtitle': { pt: 'Gerência a sua conta e as preferências da aplicação', en: 'Manage your account and app preferences' },
  'settings.account': { pt: 'Conta', en: 'Account' },
  'settings.login': { pt: 'Iniciar Sessão / Criar Conta', en: 'Sign In / Create Account' },
  'settings.loginDesc': { pt: 'Aceda à sua área de cliente', en: 'Access your client area' },
  'settings.appearance': { pt: 'Aparência', en: 'Appearance' },
  'settings.theme': { pt: 'Tema', en: 'Theme' },
  'settings.light': { pt: 'Claro', en: 'Light' },
  'settings.dark': { pt: 'Escuro', en: 'Dark' },
  'settings.langSection': { pt: 'Preferências de Idioma', en: 'Language Preferences' },
  'settings.language': { pt: 'Idioma', en: 'Language' },
  'settings.languageDesc': { pt: 'Escolha o idioma da aplicação', en: 'Choose the app language' },
  'settings.support': { pt: 'Apoio', en: 'Support' },
  'settings.contacts': { pt: 'Contactos', en: 'Contacts' },
  'settings.contactsDesc': { pt: 'Fale connosco', en: 'Get in touch' },
  'settings.phone': { pt: 'Telefone / WhatsApp', en: 'Phone / WhatsApp' },
  'settings.email': { pt: 'E-mail', en: 'Email' },
  'settings.location': { pt: 'Localização', en: 'Location' },
  'settings.hours': { pt: 'Horário de Atendimento', en: 'Business Hours' },
  'settings.hoursValue': { pt: 'Segunda a Sábado, das 08:00 às 20:00', en: 'Monday to Saturday, 08:00 to 20:00' },
  'settings.info': { pt: 'Informações', en: 'Information' },
  'settings.privacy': { pt: 'Política de Privacidade', en: 'Privacy Policy' },
  'settings.version': { pt: 'Versão da Aplicação', en: 'App Version' },
  'settings.notifications': { pt: 'Notificações', en: 'Notifications' },
  'settings.notificationsDesc': { pt: 'Receber alertas sobre as encomendas', en: 'Receive order alerts' },

  // Common
  'common.back': { pt: 'Voltar ao Início', en: 'Back to Home' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('mundodedoces_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  });

  useEffect(() => {
    localStorage.setItem('mundodedoces_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.pt;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
