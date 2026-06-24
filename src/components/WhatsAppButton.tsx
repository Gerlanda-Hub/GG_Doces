import { MessageCircle } from 'lucide-react';
import { isNative } from '../utils/nativeFeatures';

const WHATSAPP_NUMBER = '244927718735';
const WHATSAPP_MESSAGE = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços da Mundo de Doces da GG.');

export default function WhatsAppButton() {
  // Lift it above the bottom navigation bar when inside the native app
  const bottomClass = isNative() ? 'bottom-24' : 'bottom-6';
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${bottomClass} right-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg shadow-green-300/40 hover:bg-green-600 hover:shadow-xl hover:scale-105 transition-all duration-300 group animate-fade-in-up`}
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
      <span className="text-sm font-medium hidden sm:inline">Falar com a Gestão</span>
    </a>
  );
}
