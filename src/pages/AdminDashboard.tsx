import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Users, MessageSquare, Package, Settings,
  LogOut, ArrowLeft, Clock, Mail, ChevronDown, Search, Plus, History, Save, Send
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from '../types';

const statusColors: Record<OrderStatus, string> = {
  'recebida': 'bg-blue-100 text-blue-700',
  'em-analise': 'bg-yellow-100 text-yellow-700',
  'confirmada': 'bg-green-100 text-green-700',
  'em-preparacao': 'bg-orange-100 text-orange-700',
  'pronta': 'bg-purple-100 text-purple-700',
  'concluida': 'bg-gray-100 text-gray-700',
  'cancelada': 'bg-red-100 text-red-700',
};

const statusColorsDark: Record<OrderStatus, string> = {
  'recebida': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'em-analise': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'confirmada': 'bg-green-500/20 text-green-400 border-green-500/30',
  'em-preparacao': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'pronta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'concluida': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'cancelada': 'bg-red-500/20 text-red-400 border-red-500/30',
};

type AdminTab = 'dashboard' | 'orders' | 'clients' | 'messages' | 'services' | 'settings' | 'chatbot';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { state, updateOrderStatus, addOrderNote, findOrderByCode, runSupabaseDiagnosticTest, markMessageRead, replyAsAgent, closeChatSession, markChatReadByAgent, isAdminLoggedIn, adminLogout } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'todas'>('todas');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // Code search
  const [codeSearch, setCodeSearch] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<ReturnType<typeof findOrderByCode>>(null);

  // Status update note
  const [statusNote, setStatusNote] = useState<Record<string, string>>({});
  // Observation note
  const [obsNote, setObsNote] = useState<Record<string, string>>({});
  // Should notify client via WhatsApp (default true per order)
  const [shouldNotify, setShouldNotify] = useState<Record<string, boolean>>({});

  // Diagnostic Test States
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<any>(null);

  // Live Chat States
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [agentReplyText, setAgentReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll admin chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages, selectedSessionId]);

  if (!isAdminLoggedIn) {
    navigate('/admin', { replace: true });
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  const handleCodeSearch = () => {
    const found = findOrderByCode(codeSearch.trim().toUpperCase());
    setSearchedOrder(found);
    if (found) setExpandedOrder(found.id);
  };

  const filteredOrders = (() => {
    if (orderFilter === 'todas') return state.orders;
    return state.orders.filter(o => o.status === orderFilter);
  })();

  const unreadMessages = state.messages.filter(m => !m.read).length;
  const unreadChats = state.chatSessions.filter(s => s.unreadByAgent).length;

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'orders', label: 'Encomendas', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'clients', label: 'Clientes', icon: <Users className="w-4 h-4" /> },
    { key: 'messages', label: 'Mensagens', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'services', label: 'Serviços', icon: <Package className="w-4 h-4" /> },
    { key: 'chatbot', label: 'ChatBot', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    const note = statusNote[orderId]?.trim() || undefined;
    try {
      await updateOrderStatus(orderId, status, note);
    } catch (error) {
      console.error('Error updating status:', error);
      return;
    }

    // Notificar cliente via WhatsApp APENAS se o checkbox estiver ativo
    const isNotifyEnabled = shouldNotify[orderId] !== false; // default to true
    if (isNotifyEnabled) {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        const statusLabel = ORDER_STATUS_LABELS[status];
        const phone = order.phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          `🔔 *Atualização da sua Encomenda* — ${order.orderNumber}\n\n` +
          `📦 *Serviço:* ${order.serviceType}\n` +
          `📌 *Novo Estado:* ${statusLabel}\n` +
          (note ? `📝 *Nota:* ${note}\n` : '') +
          `\n📅 *Data do Evento:* ${new Date(order.eventDate).toLocaleDateString('pt-PT')}\n` +
          `\n🔍 Acompanhe a sua encomenda em:\n` +
          `${window.location.origin}/consultar\n` +
          `\n💬 *Mundo de Doces da GG*`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
    }

    setStatusNote(prev => { const n = { ...prev }; delete n[orderId]; return n; });
  };

  const handleAddNote = async (orderId: string) => {
    const note = obsNote[orderId]?.trim();
    if (!note) return;
    try {
      await addOrderNote(orderId, note);
    } catch (error) {
      console.error('Error adding note:', error);
      return;
    }

    // Notificar cliente via WhatsApp APENAS se o checkbox estiver ativo
    const isNotifyEnabled = shouldNotify[orderId] !== false; // default to true
    if (isNotifyEnabled) {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        const phone = order.phone.replace(/[^0-9]/g, '');
        const msg = encodeURIComponent(
          `📝 *Nova observação* — ${order.orderNumber}\n\n` +
          `📦 *Serviço:* ${order.serviceType}\n` +
          `💬 *Mensagem:* ${note}\n\n` +
          `🔍 Acompanhe: ${window.location.origin}/consultar\n\n` +
          `💬 *Mundo de Doces da GG*`
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
    }

    setObsNote(prev => { const n = { ...prev }; delete n[orderId]; return n; });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rosa-400 to-rosa-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">MD</span>
              </div>
              <span className="text-white font-semibold text-sm">Painel Admin</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-rosa-500/10 text-rosa-400 border border-rosa-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'messages' && unreadMessages > 0 && (
                  <span className="ml-auto bg-rosa-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadMessages}</span>
                )}
                {tab.key === 'chatbot' && unreadChats > 0 && (
                  <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{unreadChats}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-all">
              <ArrowLeft className="w-4 h-4" /> Ver Site
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-all ${
                  activeTab === tab.key ? 'text-rosa-400' : 'text-gray-400'
                }`}
              >
                {tab.icon}
                <span className="mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {/* ========== DASHBOARD ========== */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Encomendas', value: state.orders.length, icon: ClipboardList, color: 'bg-blue-500' },
                  { label: 'Novas Mensagens', value: unreadMessages, icon: MessageSquare, color: 'bg-rosa-500' },
                  { label: 'Clientes', value: state.clients.length, icon: Users, color: 'bg-green-500' },
                  { label: 'Por Confirmar', value: state.orders.filter(o => o.status === 'recebida' || o.status === 'em-analise').length, icon: Clock, color: 'bg-dourado-500' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Encomendas Recentes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-3 font-medium">Nº</th>
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium">Serviço</th>
                        <th className="pb-3 font-medium">Data Evento</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="border-b border-gray-700/50">
                          <td className="py-3 text-gray-300 font-mono text-xs">{order.orderNumber}</td>
                          <td className="py-3 text-gray-200">{order.clientName}</td>
                          <td className="py-3 text-gray-400">{order.serviceType}</td>
                          <td className="py-3 text-gray-400">{new Date(order.eventDate).toLocaleDateString('pt-PT')}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {state.orders.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">Nenhuma encomenda ainda.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== ORDERS ========== */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-white">Gestão de Encomendas</h1>
                <div className="flex flex-wrap gap-3">
                  {/* Code search */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codeSearch}
                      onChange={e => setCodeSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCodeSearch()}
                      placeholder="MDG-XXXXXXXX"
                      className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 text-sm focus:border-rosa-400 outline-none w-44 font-mono placeholder:text-gray-500"
                    />
                    <button
                      onClick={handleCodeSearch}
                      className="px-3 py-2 rounded-xl bg-rosa-500 text-white text-sm hover:bg-rosa-600 transition-colors flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Buscar
                    </button>
                  </div>
                  {/* Status filter */}
                  <select
                    value={orderFilter}
                    onChange={e => setOrderFilter(e.target.value as OrderStatus | 'todas')}
                    className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 text-sm focus:border-rosa-400 outline-none"
                  >
                    <option value="todas">Todas</option>
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {searchedOrder && (
                <div className="mb-4 bg-rosa-500/10 border border-rosa-500/20 rounded-xl px-4 py-2 text-rosa-400 text-sm flex items-center justify-between">
                  Busca: <span className="font-mono font-bold">{searchedOrder.orderNumber}</span> — {searchedOrder.clientName}
                  <button onClick={() => { setSearchedOrder(null); setCodeSearch(''); }} className="text-xs underline hover:text-rosa-300">limpar</button>
                </div>
              )}

              <div className="space-y-3">
                {(searchedOrder ? [searchedOrder] : filteredOrders).map(order => (
                  <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    <div
                      className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColorsDark[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <div>
                          <p className="text-white font-medium">{order.clientName}</p>
                          <p className="text-gray-400 text-xs font-mono">{order.orderNumber} • {order.serviceType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">{new Date(order.eventDate).toLocaleDateString('pt-PT')}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="px-5 pb-5 border-t border-gray-700 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <p className="text-gray-400 text-xs">Detalhes do Cliente</p>
                            <p className="text-gray-200 text-sm">{order.clientName}</p>
                            <p className="text-gray-400 text-sm">{order.email}</p>
                            <p className="text-gray-400 text-sm">{order.phone}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-400 text-xs">Detalhes do Evento</p>
                            <p className="text-gray-200 text-sm">{order.serviceType}</p>
                            <p className="text-gray-400 text-sm">Data: {new Date(order.eventDate).toLocaleDateString('pt-PT')}</p>
                            <p className="text-gray-400 text-sm">Convidados: {order.guestCount}</p>
                            <p className="text-gray-400 text-sm">Local: {order.eventLocation}</p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-4">
                            <p className="text-gray-400 text-xs mb-1">Observações</p>
                            <p className="text-gray-300 text-sm bg-gray-700/50 rounded-xl p-3">{order.notes}</p>
                          </div>
                        )}
                        {order.imageRef && (
                          <div className="mt-4">
                            <p className="text-gray-400 text-xs mb-1">Imagem de Referência</p>
                            <img src={order.imageRef} alt="Referência" className="w-32 h-32 object-cover rounded-xl border border-gray-600" />
                          </div>
                        )}

                        {/* History Timeline */}
                        <div className="mt-5">
                          <p className="text-gray-400 text-xs mb-3 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" /> Histórico de Atualizações
                          </p>
                          <div className="space-y-0 pl-1">
                            {order.history.map((entry, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="flex flex-col items-center pt-1">
                                  <div className={`w-2 h-2 rounded-full ${i === order.history.length - 1 ? 'bg-rosa-500' : 'bg-gray-600'}`} />
                                  {i < order.history.length - 1 && <div className="w-px flex-1 min-h-[20px] bg-gray-700" />}
                                </div>
                                <div className="pb-3">
                                  <p className="text-gray-300 text-xs">{entry.label}</p>
                                  <p className="text-gray-500 text-[10px] mt-0.5">
                                    {new Date(entry.timestamp).toLocaleDateString('pt-PT')} às{' '}
                                    {new Date(entry.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-5 pt-4 border-t border-gray-700">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="text-gray-400 text-xs font-semibold">Atualizar Status</p>
                            
                            {/* Option to notify customer toggle */}
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-300 bg-gray-750 border border-gray-700 rounded-xl px-3 py-1.5 hover:bg-gray-700 transition-all">
                              <input
                                type="checkbox"
                                checked={shouldNotify[order.id] !== false}
                                onChange={e => setShouldNotify(prev => ({ ...prev, [order.id]: e.target.checked }))}
                                className="accent-rosa-500 w-4 h-4 rounded cursor-pointer"
                              />
                              <span>🔔 Notificar cliente via WhatsApp</span>
                            </label>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {ORDER_STATUSES.map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(order.id, status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  order.status === status
                                    ? 'bg-rosa-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {ORDER_STATUS_LABELS[status]}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={statusNote[order.id] || ''}
                              onChange={e => setStatusNote(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="Nota da atualização (opcional)"
                              className="flex-1 px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 text-xs focus:border-rosa-400 outline-none placeholder:text-gray-500"
                            />
                          </div>
                          
                          {/* Manual re-notify buttons */}
                          <div className="flex gap-2">
                            <a
                              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🔔 *Mundo de Doces da GG*\n\nA sua encomenda *${order.orderNumber}* está agora: *${ORDER_STATUS_LABELS[order.status]}*\n\n📦 Serviço: ${order.serviceType}\n📅 Evento: ${new Date(order.eventDate).toLocaleDateString('pt-PT')}\n\n🔍 Consulte: ${window.location.origin}/consultar`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-green-600 text-white hover:bg-green-500 transition-colors flex items-center gap-1"
                            >
                              💬 Notificar via WhatsApp manualmente
                            </a>
                            <a
                              href={`mailto:${order.email}?subject=${encodeURIComponent(`Atualização da Encomenda ${order.orderNumber}`)}&body=${encodeURIComponent(`Olá ${order.clientName},\n\nA sua encomenda ${order.orderNumber} está agora: ${ORDER_STATUS_LABELS[order.status]}.\n\n📦 Serviço: ${order.serviceType}\n📅 Data do Evento: ${new Date(order.eventDate).toLocaleDateString('pt-PT')}\n\nPode acompanhar em: ${window.location.origin}/consultar\n\nObrigado,\nMundo de Doces da GG`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors flex items-center gap-1"
                            >
                              ✉️ Notificar por E-mail
                            </a>
                          </div>
                        </div>

                        {/* Add Observation */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-gray-400 text-xs mb-2">Adicionar Observação</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={obsNote[order.id] || ''}
                              onChange={e => setObsNote(prev => ({ ...prev, [order.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddNote(order.id)}
                              placeholder="Nova observação..."
                              className="flex-1 px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 text-xs focus:border-rosa-400 outline-none placeholder:text-gray-500"
                            />
                            <button
                              onClick={() => handleAddNote(order.id)}
                              className="px-3 py-2 rounded-xl bg-gray-600 text-gray-200 text-xs hover:bg-gray-500 transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredOrders.length === 0 && !searchedOrder && (
                  <div className="text-center py-16 text-gray-500">Nenhuma encomenda encontrada.</div>
                )}
              </div>
            </div>
          )}

          {/* ========== CLIENTS ========== */}
          {activeTab === 'clients' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Clientes Cadastrados</h1>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="p-4 font-medium">Nome</th>
                        <th className="p-4 font-medium">E-mail</th>
                        <th className="p-4 font-medium">Telefone</th>
                        <th className="p-4 font-medium">Cadastro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.clients.map(client => (
                        <tr key={client.id} className="border-b border-gray-700/50">
                          <td className="p-4 text-gray-200">{client.name}</td>
                          <td className="p-4 text-gray-400">{client.email}</td>
                          <td className="p-4 text-gray-400">{client.phone}</td>
                          <td className="p-4 text-gray-400">{new Date(client.createdAt).toLocaleDateString('pt-PT')}</td>
                        </tr>
                      ))}
                      {state.clients.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum cliente cadastrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========== MESSAGES ========== */}
          {activeTab === 'messages' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Mensagens Recebidas</h1>
              <div className="space-y-3">
                {state.messages.map(msg => (
                  <div key={msg.id} className={`bg-gray-800 border rounded-2xl overflow-hidden transition-all ${msg.read ? 'border-gray-700' : 'border-rosa-500/30'}`}>
                    <div
                      className="p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-gray-700/50"
                      onClick={() => {
                        setExpandedMessage(expandedMessage === msg.id ? null : msg.id);
                        if (!msg.read) markMessageRead(msg.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {!msg.read && <div className="w-2 h-2 rounded-full bg-rosa-500" />}
                        <div>
                          <p className="text-white font-medium">{msg.name}</p>
                          <p className="text-gray-400 text-xs">{msg.subject}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">{new Date(msg.createdAt).toLocaleDateString('pt-PT')}</span>
                    </div>
                    {expandedMessage === msg.id && (
                      <div className="px-5 pb-5 border-t border-gray-700 animate-fade-in">
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-400 text-sm"><Mail className="w-3 h-3 inline mr-1" /> {msg.email}</p>
                          <p className="text-gray-400 text-sm">📞 {msg.phone}</p>
                        </div>
                        <div className="mt-4 bg-gray-700/50 rounded-xl p-4">
                          <p className="text-gray-200 text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <a
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors"
                          >
                            Responder por WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {state.messages.length === 0 && (
                  <div className="text-center py-16 text-gray-500">Nenhuma mensagem recebida.</div>
                )}
              </div>
            </div>
          )}

          {/* ========== SERVICES ========== */}
          {activeTab === 'services' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Serviços</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: '🎂', name: 'Bolo de Aniversário', desc: 'Bolos personalizados para aniversários' },
                  { icon: '💍', name: 'Bolo de Noivado', desc: 'Bolos elegantes para noivados' },
                  { icon: '🧁', name: 'Cupcakes', desc: 'Cupcakes decorados personalizados' },
                  { icon: '🍬', name: 'Doces', desc: 'Doces para eventos especiais' },
                  { icon: '🥟', name: 'Salgados', desc: 'Salgados para festas e reuniões' },
                ].map(service => (
                  <div key={service.name} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                    <span className="text-3xl">{service.icon}</span>
                    <h3 className="text-white font-semibold mt-3">{service.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== SETTINGS ========== */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-6">Configurações do Site</h1>
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Informações Gerais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nome da Empresa</label>
                      <input
                        type="text"
                        defaultValue="Mundo de Doces da GG"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Slogan</label>
                      <input
                        type="text"
                        defaultValue="Sabores criados para cada celebração especial."
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Contactos</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        defaultValue="+244 927 718 735"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                      <input
                        type="email"
                        defaultValue="ggsuportes@gmai.com"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Endereço</label>
                      <input
                        type="text"
                        defaultValue="Luanda, Angola"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Redes Sociais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Instagram</label>
                      <input
                        type="text"
                        placeholder="@mundodedocesdagg"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Facebook</label>
                      <input
                        type="text"
                        placeholder="Mundo de Doces da GG"
                        className="w-full px-4 py-2 rounded-xl bg-gray-700 border border-gray-600 text-gray-200 focus:border-rosa-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button className="px-6 py-3 rounded-xl bg-rosa-500 text-white font-medium hover:bg-rosa-600 transition-colors flex items-center gap-2 mb-6">
                  <Save className="w-4 h-4" /> Guardar Configurações
                </button>

                {/* 🛡️ SUPABASE AUTOMATED DIAGNOSTIC TEST RUNNER */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-5 h-5 text-rosa-400" />
                    <h2 className="text-lg font-semibold text-white">Teste de Conexão e Integridade (Supabase)</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">
                    Este teste automático valida o funcionamento do Supabase. Ele insere uma encomenda de teste temporária com um código único (ex: MDG-TESTXXXX), consulta-a para validar o RLS/leitura, verifica a integridade dos campos e, por fim, remove-a para manter a base de dados limpa.
                  </p>

                  <div className="space-y-4">
                    <button
                      type="button"
                      disabled={diagLoading}
                      onClick={async () => {
                        setDiagLoading(true);
                        setDiagResult(null);
                        try {
                          const res = await runSupabaseDiagnosticTest();
                          setDiagResult(res);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setDiagLoading(false);
                        }
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-rosa-400 to-rosa-500 text-white font-medium hover:from-rosa-500 hover:to-rosa-600 transition-all shadow-md shadow-rosa-500/10 flex items-center gap-2 disabled:opacity-50"
                    >
                      {diagLoading ? (
                        <>
                          <Plus className="w-4 h-4 animate-spin" />
                          A executar testes...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Executar Teste Automático
                        </>
                      )}
                    </button>

                    {diagResult && (
                      <div className="bg-gray-900 rounded-xl p-4 border border-gray-750 font-mono text-xs text-gray-300 space-y-4 animate-fade-in">
                        <h3 className="font-semibold text-white border-b border-gray-800 pb-2 flex items-center justify-between">
                          <span>📋 Resultados do Diagnóstico:</span>
                          <span className={
                            diagResult.step1_insert === 'success' && 
                            diagResult.step2_select === 'success' && 
                            diagResult.step3_verify === 'success' && 
                            diagResult.step4_delete === 'success'
                              ? 'text-green-400 font-bold'
                              : 'text-red-400 font-bold'
                          }>
                            {diagResult.step1_insert === 'success' && 
                             diagResult.step2_select === 'success' && 
                             diagResult.step3_verify === 'success' && 
                             diagResult.step4_delete === 'success'
                              ? 'PASSED ✅'
                              : 'FAILED ❌'}
                          </span>
                        </h3>

                        {/* Steps Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className={diagResult.step1_insert === 'success' ? 'text-green-400' : diagResult.step1_insert === 'failed' ? 'text-red-400' : 'text-gray-500'}>
                              {diagResult.step1_insert === 'success' ? '●' : '○'}
                            </span>
                            <span>1. Inserção de Teste: {diagResult.step1_insert.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={diagResult.step2_select === 'success' ? 'text-green-400' : diagResult.step2_select === 'failed' ? 'text-red-400' : 'text-gray-500'}>
                              {diagResult.step2_select === 'success' ? '●' : '○'}
                            </span>
                            <span>2. Rastreio por Código: {diagResult.step2_select.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={diagResult.step3_verify === 'success' ? 'text-green-400' : diagResult.step3_verify === 'failed' ? 'text-red-400' : 'text-gray-500'}>
                              {diagResult.step3_verify === 'success' ? '●' : '○'}
                            </span>
                            <span>3. Validação de Integridade: {diagResult.step3_verify.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={diagResult.step4_delete === 'success' ? 'text-green-400' : diagResult.step4_delete === 'failed' ? 'text-red-400' : 'text-gray-500'}>
                              {diagResult.step4_delete === 'success' ? '●' : '○'}
                            </span>
                            <span>4. Limpeza (Delete): {diagResult.step4_delete.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Detailed Console Printout */}
                        <div className="border-t border-gray-800 pt-3 space-y-1.5 max-h-60 overflow-y-auto pr-2">
                          <p className="text-gray-500 text-[10px]">--- DETALHES DE DEPURAÇÃO (LOGS) ---</p>
                          {diagResult.details.map((log: string, idx: number) => (
                            <p key={idx} className={
                              log.includes('❌') ? 'text-red-400' : 
                              log.includes('✅') ? 'text-green-400' : 
                              'text-gray-300'
                            }>
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== CHATBOT LIVE CHAT TAB ========== */}
          {activeTab === 'chatbot' && (
            <div className="h-[calc(100vh-12rem)] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-rosa-500 animate-pulse" /> Atendimento ao Cliente (Live Chat)
                </h1>
                <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">
                  Horário de Atendimento: 08:00 - 20:00
                </span>
              </div>

              <div className="flex-1 flex bg-gray-800 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* 1. Sidebar - Chat Sessions Queue */}
                <div className="w-1/3 border-r border-gray-700 flex flex-col bg-gray-800">
                  <div className="p-4 border-b border-gray-700 bg-gray-850">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Conversas Ativas</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto divide-y divide-gray-755">
                    {state.chatSessions.map(session => {
                      const isSelected = selectedSessionId === session.id;
                      const statusLabelsMap = {
                        bot: 'Com Assistente',
                        waiting: 'A Aguardar ⏰',
                        active: 'Em Atendimento 🟢',
                        closed: 'Encerrada ⚪',
                      };
                      const statusColorsMap = {
                        bot: 'text-gray-400 bg-gray-700/55 border-gray-650',
                        waiting: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 animate-pulse',
                        active: 'text-green-400 bg-green-500/10 border-green-500/20',
                        closed: 'text-gray-500 bg-gray-800 border-gray-750',
                      };

                      return (
                        <div
                          key={session.id}
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            markChatReadByAgent(session.id);
                          }}
                          className={`p-4 cursor-pointer transition-all flex flex-col gap-2 ${
                            isSelected 
                              ? 'bg-rosa-500/10 border-l-4 border-rosa-500' 
                              : 'hover:bg-gray-750'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-sm text-white truncate max-w-[130px]">
                              {session.clientName}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${statusColorsMap[session.status]}`}>
                              {statusLabelsMap[session.status]}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-400 truncate leading-relaxed">
                            {session.lastMessage}
                          </p>

                          <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono mt-1">
                            <span>
                              {new Date(session.lastTimestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {session.unreadByAgent && !isSelected && (
                              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {state.chatSessions.length === 0 && (
                      <div className="text-center py-16 text-gray-500 text-xs">
                        Nenhuma conversa ativa no momento.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Right Side - Selected Chat Window */}
                <div className="flex-1 flex flex-col bg-gray-900">
                  {selectedSessionId ? (
                    (() => {
                      const currentSession = state.chatSessions.find(s => s.id === selectedSessionId);
                      const sessionMessages = state.chatMessages.filter(m => m.sessionId === selectedSessionId);
                      
                      return (
                        <div className="flex-1 flex flex-col">
                          {/* Chat Window Header */}
                          <div className="px-5 py-4 bg-gray-850 border-b border-gray-750 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm text-white">{currentSession?.clientName}</h3>
                              {currentSession?.clientPhone && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  📞 {currentSession.clientPhone} | ✉️ {currentSession.clientEmail}
                                </p>
                              )}
                            </div>
                            
                            {/* Close/End Session Button */}
                            {currentSession?.status !== 'closed' && (
                              <button
                                onClick={() => closeChatSession(selectedSessionId)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                Encerrar Conversa
                              </button>
                            )}
                          </div>

                          {/* Messages list */}
                          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-900/40">
                            {sessionMessages.map((msg, idx) => (
                              <div
                                key={msg.id || idx}
                                className={`flex gap-2.5 ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  msg.sender === 'agent' 
                                    ? 'bg-rosa-500 text-white' 
                                    : msg.sender === 'bot' 
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-green-600 text-white'
                                }`}>
                                  {msg.sender === 'agent' ? 'AG' : msg.sender === 'bot' ? 'BOT' : 'CL'}
                                </div>
                                
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                  msg.sender === 'agent'
                                    ? 'bg-rosa-500 text-white rounded-tr-sm'
                                    : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'
                                }`}>
                                  {msg.text}
                                  <span className="block text-[8px] text-right mt-1 opacity-60 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>

                          {/* Chat Input */}
                          {currentSession?.status !== 'closed' ? (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (!agentReplyText.trim()) return;
                                await replyAsAgent(selectedSessionId, agentReplyText.trim());
                                setAgentReplyText('');
                              }}
                              className="p-4 bg-gray-850 border-t border-gray-750 flex gap-2"
                            >
                              <input
                                type="text"
                                value={agentReplyText}
                                onChange={e => setAgentReplyText(e.target.value)}
                                placeholder="Escreva a sua resposta..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 text-xs focus:border-rosa-400 outline-none"
                              />
                              <button
                                type="submit"
                                disabled={!agentReplyText.trim()}
                                className="px-4 py-2.5 rounded-xl bg-rosa-500 text-white hover:bg-rosa-600 disabled:opacity-50 text-xs font-semibold transition-all flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" /> Enviar
                              </button>
                            </form>
                          ) : (
                            <div className="p-4 bg-gray-850 border-t border-gray-750 text-center text-xs text-gray-500">
                              Esta conversa foi encerrada.
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="w-12 h-12 text-gray-700 mb-3" />
                      <p className="text-gray-400 text-sm">Selecione uma conversa na barra lateral para iniciar o atendimento em tempo real.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
