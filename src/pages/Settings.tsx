import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon, User, Moon, Sun, Globe, Info, Phone, Mail, MapPin,
  ChevronRight, LogIn, MessageCircle, Smartphone,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';

const APP_VERSION = '1.0.0';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currentClient } = useApp();
  const { lang, setLang, t } = useLanguage();
  const [showContacts, setShowContacts] = useState(false);

  const changeLang = (l: 'pt' | 'en') => setLang(l);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rosa-50 flex items-center justify-center mx-auto mb-3">
            <SettingsIcon className="w-7 h-7 text-rosa-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* CONTA / LOGIN */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.account')}</h2>
          </div>
          <Link
            to="/cliente"
            className="flex items-center gap-3 px-5 py-4 hover:bg-rosa-50/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rosa-50 flex items-center justify-center flex-shrink-0">
              {currentClient ? <User className="w-5 h-5 text-rosa-500" /> : <LogIn className="w-5 h-5 text-rosa-500" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {currentClient ? currentClient.name : t('settings.login')}
              </p>
              <p className="text-xs text-gray-400">
                {currentClient ? currentClient.email : t('settings.loginDesc')}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </Link>
        </div>

        {/* APARÊNCIA / TEMA */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.appearance')}</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-rosa-50/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-dourado-50 flex items-center justify-center flex-shrink-0">
              {theme === 'light' ? <Moon className="w-5 h-5 text-dourado-600" /> : <Sun className="w-5 h-5 text-dourado-500" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">{t('settings.theme')}</p>
              <p className="text-xs text-gray-400">{theme === 'light' ? t('settings.light') : t('settings.dark')}</p>
            </div>
            {/* Toggle switch */}
            <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 ${theme === 'dark' ? 'bg-rosa-500 justify-end' : 'bg-gray-200 justify-start'}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow" />
            </div>
          </button>
        </div>

        {/* IDIOMA */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.langSection')}</h2>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{t('settings.language')}</p>
              <p className="text-xs text-gray-400">{t('settings.languageDesc')}</p>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => changeLang('pt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${lang === 'pt' ? 'bg-rosa-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                🇵🇹 PT
              </button>
              <button
                onClick={() => changeLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${lang === 'en' ? 'bg-rosa-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* CONTACTOS */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.support')}</h2>
          </div>
          <button
            onClick={() => setShowContacts(!showContacts)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-rosa-50/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rosa-50 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-rosa-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">{t('settings.contacts')}</p>
              <p className="text-xs text-gray-400">{t('settings.contactsDesc')}</p>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${showContacts ? 'rotate-90' : ''}`} />
          </button>

          {/* Contacts expandable */}
          {showContacts && (
            <div className="px-5 pb-4 space-y-2 animate-fade-in border-t border-gray-50 pt-3">
              <a
                href="https://wa.me/244927718735"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-rosa-50/50 transition-colors"
              >
                <Phone className="w-4 h-4 text-rosa-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t('settings.phone')}</p>
                  <p className="text-xs text-gray-400">+244 927 718 735</p>
                </div>
              </a>
              <a
                href="mailto:ggsuportes@gmai.com"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-dourado-50/50 transition-colors"
              >
                <Mail className="w-4 h-4 text-dourado-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t('settings.email')}</p>
                  <p className="text-xs text-gray-400">ggsuportes@gmai.com</p>
                </div>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Luanda,Angola"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-green-50/50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t('settings.location')}</p>
                  <p className="text-xs text-gray-400">Luanda, Angola</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{t('settings.hours')}</p>
                  <p className="text-xs text-gray-400">{t('settings.hoursValue')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SOBRE / VERSÃO */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.info')}</h2>
          </div>
          <Link
            to="/politica-privacidade"
            className="flex items-center gap-3 px-5 py-4 hover:bg-rosa-50/40 transition-colors border-b border-gray-50"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{t('settings.privacy')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </Link>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{t('settings.version')}</p>
              <p className="text-xs text-gray-400">Mundo de Doces da GG</p>
            </div>
            <span className="text-sm font-mono text-gray-400">v{APP_VERSION}</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          © {new Date().getFullYear()} Mundo de Doces da GG — Feito com 💛 em Angola
        </p>
      </div>
    </div>
  );
}
