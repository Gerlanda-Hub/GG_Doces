import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, UserCheck, Clock, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { isWithinWorkingHours } from '../types';
import { getAssistantResponse } from '../services/assistant';
import { isNative } from '../utils/nativeFeatures';

const QUICK_REPLIES = [
  'Fazer uma encomenda',
  'Solicitar orçamento',
  'Ver serviços',
  'Falar com a gestão',
];

const BOT_RESPONSES: Record<string, string> = {
  'olá': 'Olá! 👋 Bem-vinda à Mundo de Doces da GG! Como posso ajudar? Pode perguntar sobre os nossos bolos, cupcakes, doces, salgados ou fazer uma encomenda.',
  'oi': 'Oi! 😊 Em que posso ajudar? Estamos aqui para tornar a sua celebração ainda mais especial!',
  'bom dia': 'Bom dia! ☀️ Como posso ajudar hoje?',
  'boa tarde': 'Boa tarde! 🌤️ Em que posso ser útil?',
  'boa noite': 'Boa noite! 🌙 Como posso ajudar?',
  'encomenda': 'Para fazer uma encomenda, clique no link "Fazer Encomenda" no menu ou aceda a a nossa página de Encomendas. Preencha o formulário e a nossa equipa entrará em contacto! 📝',
  'encomendar': 'Pode encomendar diretamente no nosso site! Aceda à página "Encomendar" no menu superior. É rápido e simples! 🎂',
  'orçamento': 'Para solicitar um orçamento, pode preencher o formulário em "Encomendar" ou enviar uma mensagem em "Contato". Também pode falar connosco diretamente pelo WhatsApp! 💬',
  'preço': 'Os preços variam conforme o tipo de produto, quantidade e personalização. Para um orçamento personalizado, faça uma encomenda no site ou fale connosco no WhatsApp! 💰',
  'serviços': 'Oferecemos: 🎂 Bolos de Aniversário, 💍 Bolos de Noivado, 🧁 Cupcakes, 🍬 Doces e 🥟 Salgados. Todos feitos com ingredientes de qualidade!',
  'servicos': 'Os nossos serviços incluem: 🎂 Bolos de Aniversário, 💍 Bolos de Noivado, 🧁 Cupcakes, 🍬 Doces e 🥟 Salgados. Qual deles lhe interessa?',
  'bolo': 'Temos bolos de aniversário e de noivado, todos personalizados! 🎂💍 Diga-nos o tipo de bolo que procura e teremos todo o gosto em ajudar!',
  'cupcake': 'Os nossos cupcakes são decorados e personalizados para qualquer evento! 🧁 São um sucesso em festas. Quer fazer uma encomenda?',
  'doces': 'Preparamos doces deliciosos para aniversários, noivados e eventos! 🍬 Temos brigadeiros, trufas e muito mais!',
  'salgados': 'Os nossos salgados são perfeitos para festas e reuniões! 🥟 Temos uma variedade deliciosa. Quer saber mais?',
  'whatsapp': 'Pode falar connosco diretamente no WhatsApp: +244 927 718 735. Respondemos rapidamente! 📱',
  'obrigado': 'De nada! 😊 Estamos sempre à disposição. Se precisar de mais alguma coisa, é só chamar!',
  'obrigada': 'De nada! 😊 Estamos sempre à disposição para o que precisar!',
  'contacto': 'Pode contactar-nos por telefone (+244 927 718 735), e-mail (ggsuportes@gmai.com) ou pelo WhatsApp. Estamos em Luanda, Angola! 📍',
  'contato': 'Os nossos contactos: 📞 +244 927 718 735 | ✉️ ggsuportes@gmai.com | 📍 Luanda, Angola. Também estamos no WhatsApp!',
  'horário': 'Estamos disponíveis de segunda a sábado. Para encomendas, recomendamos fazer com antecedência! ⏰',
  'prazo': 'O prazo de entrega depende do tipo de produto e quantidade. Normalmente pedimos pelo menos 3 a 5 dias de antecedência. Para encomendas maiores, recomendamos 1 a 2 semanas. 📅',
  'ajuda': 'Claro que sim! Pode perguntar sobre: encomendas, orçamentos, serviços, preços, prazos de entrega, ou falar diretamente com a gestão. O que gostaria de saber? 🤗',
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase().trim();
  for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(keyword)) return response;
  }
  return 'Obrigada pelo seu contacto! 😊 Para lhe dar uma resposta mais personalizada, recomendo que fale connosco pelo WhatsApp (+244 927 718 735) ou preencha o formulário de encomenda no site. Posso ajudar com mais alguma coisa?';
}

export default function ChatBot() {
  const { state, sendChatMessage, requestAgent, markChatReadByClient } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Guest details for Live Chat request
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  // Initialize and persist Session ID
  const [sessionId] = useState<string>(() => {
    const saved = localStorage.getItem('mundodedoces_chat_session_id');
    if (saved) return saved;
    const newId = crypto.randomUUID();
    localStorage.setItem('mundodedoces_chat_session_id', newId);
    return newId;
  });

  // Current session status derived from state
  const currentSession = state.chatSessions.find(s => s.id === sessionId);
  const isWaitingForAgent = currentSession?.status === 'waiting';
  const isAgentActive = currentSession?.status === 'active';
  const isLiveChat = isWaitingForAgent || isAgentActive;

  // Filter messages for this specific session
  const filteredMessages = state.chatMessages.filter(m => m.sessionId === sessionId);

  // Initial welcome message if no messages exist
  const displayMessages = filteredMessages.length > 0 ? filteredMessages : [
    {
      id: 'welcome',
      sessionId,
      sender: 'bot' as const,
      text: 'Olá! 👋 Bem-vinda à Mundo de Doces da GG! Como posso ajudar? Pode perguntar sobre os nossos bolos, cupcakes, doces, salgados ou fazer uma encomenda.',
      timestamp: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping, showRequestForm, showOfflineNotice]);

  // Mark messages read when open
  useEffect(() => {
    if (isOpen && currentSession?.unreadByClient) {
      markChatReadByClient(sessionId);
    }
  }, [isOpen, currentSession, sessionId, markChatReadByClient]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = {
      sessionId,
      sender: 'user' as const,
      text: text.trim(),
      clientName: currentSession?.clientName || 'Cliente Anónimo',
    };

    // 1. Send user message
    await sendChatMessage(userMsg);
    setInput('');

    // 2. If in Live Chat mode, the agent handles it. If in Bot mode, the AI (ChatGPT) responds.
    if (!isLiveChat) {
      setIsTyping(true);

      // Build conversation history for AI context
      const history = filteredMessages
        .filter(m => m.sender === 'user' || m.sender === 'bot')
        .map(m => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }));

      // Try ChatGPT first, fall back to local keyword responses if it fails
      let botReply: string | null = null;
      try {
        botReply = await getAssistantResponse(text, history);
      } catch {
        botReply = null;
      }

      if (!botReply) {
        botReply = getBotResponse(text);
      }

      await sendChatMessage({
        sessionId,
        sender: 'bot',
        text: botReply,
        clientName: 'Mundo de Doces da GG',
      });
      setIsTyping(false);
    }
  };

  const handleRequestAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) return;

    await requestAgent(sessionId, guestName, guestEmail, guestPhone);
    setShowRequestForm(false);
  };

  const handleTalkToAgentClick = () => {
    // Validate Working Hours (08:00 to 20:00)
    if (!isWithinWorkingHours()) {
      setShowOfflineNotice(true);
    } else {
      setShowRequestForm(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${isNative() ? 'bottom-24' : 'bottom-6'} left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-rosa-400 to-rosa-600 text-white shadow-lg shadow-rosa-300/40 hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group`}
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
          {currentSession?.unreadByClient && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${isNative() ? 'bottom-24' : 'bottom-6'} left-6 z-50 w-[370px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-rosa-400 to-rosa-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {isAgentActive ? 'Suporte da GG' : 'Mundo de Doces da GG'}
                </h3>
                <p className="text-rosa-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {isAgentActive 
                    ? 'Ligado a um atendente' 
                    : isWaitingForAgent 
                    ? 'A aguardar atendente...' 
                    : 'Assistente Virtual'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-rosa-50/30">
            {displayMessages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'bot'
                    ? 'bg-rosa-100'
                    : msg.sender === 'agent'
                    ? 'bg-dourado-100'
                    : 'bg-gray-700'
                }`}>
                  {msg.sender === 'bot' ? (
                    <Bot className="w-4 h-4 text-rosa-500" />
                  ) : msg.sender === 'agent' ? (
                    <Sparkles className="w-4 h-4 text-dourado-600 animate-pulse" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-rosa-500 text-white rounded-tr-sm'
                    : msg.sender === 'agent'
                    ? 'bg-dourado-50 border border-dourado-200 text-dourado-900 rounded-tl-sm'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-rosa-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-rosa-500" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-rosa-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-rosa-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-rosa-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Talk to Agent Request Form */}
            {showRequestForm && (
              <div className="bg-white rounded-2xl p-4 border border-rosa-100 shadow-lg space-y-3 animate-fade-in-up">
                <h4 className="font-semibold text-xs text-gray-800 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-rosa-500" /> Conversar com Atendente
                </h4>
                <p className="text-[10px] text-gray-400">Insira os seus dados de contacto para o ligarmos à nossa equipa:</p>
                <form onSubmit={handleRequestAgent} className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Seu e-mail"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Seu telemóvel"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2 rounded-xl bg-rosa-500 text-white text-xs font-semibold hover:bg-rosa-600 transition-colors">
                      Iniciar
                    </button>
                    <button type="button" onClick={() => setShowRequestForm(false)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-550 hover:bg-gray-50">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Offline notice modal */}
            {showOfflineNotice && (
              <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-lg space-y-3 animate-fade-in-up">
                <h4 className="font-semibold text-xs text-red-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Fora do Horário de Atendimento
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Desculpe! O nosso horário de atendimento com assistentes reais é das **08:00 às 20:00** (Segunda a Sábado).
                </p>
                <p className="text-[10px] text-gray-400">
                  Neste momento os nossos atendentes estão offline, mas pode continuar a conversar com o nosso assistente virtual ou fazer a sua encomenda diretamente no formulário do site.
                </p>
                <button
                  type="button"
                  onClick={() => setShowOfflineNotice(false)}
                  className="w-full py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Entendido
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies / Talk to Agent (only when in bot mode and not waiting) */}
          {!isLiveChat && !showRequestForm && !showOfflineNotice && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-50 bg-white">
              {QUICK_REPLIES.map(reply => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-rosa-50 border border-rosa-200 text-rosa-600 hover:bg-rosa-100 transition-colors"
                >
                  {reply}
                </button>
              ))}
              {/* Talk to Agent Button */}
              <button
                onClick={handleTalkToAgentClick}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" /> Falar com Atendente
              </button>
            </div>
          )}

          {/* Live Chat Banner Indicator */}
          {isWaitingForAgent && (
            <div className="bg-yellow-50 border-t border-b border-yellow-100 px-4 py-2 flex items-center gap-2 text-xs text-yellow-800">
              <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
              <span>Aguardar conexão com um atendente real...</span>
            </div>
          )}

          {isAgentActive && (
            <div className="bg-green-50 border-t border-b border-green-100 px-4 py-2 flex items-center gap-2 text-xs text-green-800">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span>Ligada a um atendente da Mundo de Doces da GG!</span>
            </div>
          )}

          {/* Input field */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isWaitingForAgent ? "Aguarde o atendente..." : "Escreva a sua mensagem..."}
                disabled={isWaitingForAgent}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white disabled:opacity-60"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isWaitingForAgent}
                className="p-2.5 rounded-xl bg-rosa-500 text-white hover:bg-rosa-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
