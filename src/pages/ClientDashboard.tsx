import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ClipboardList, Settings, User, Clock, CheckCircle, AlertCircle, CookingPot, Truck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'recebida': { label: 'Recebida', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', icon: <Clock className="w-4 h-4" /> },
  'em-analise': { label: 'Em Análise', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: <AlertCircle className="w-4 h-4" /> },
  'confirmada': { label: 'Confirmada', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-4 h-4" /> },
  'em-preparacao': { label: 'Em Preparação', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: <CookingPot className="w-4 h-4" /> },
  'pronta': { label: 'Pronta', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', icon: <Truck className="w-4 h-4" /> },
  'concluida': { label: 'Concluída', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: <CheckCircle className="w-4 h-4" /> },
  'cancelada': { label: 'Cancelada', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: <AlertCircle className="w-4 h-4" /> },
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { currentClient, updateClient, getOrdersByClient, logoutClient, authLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [editName, setEditName] = useState(currentClient?.name || '');
  const [editPhone, setEditPhone] = useState(currentClient?.phone || '');
  const [saved, setSaved] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rosa-200 border-t-rosa-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentClient) {
    navigate('/cliente', { replace: true });
    return null;
  }

  const orders = getOrdersByClient(currentClient.email);

  const handleLogout = async () => {
    await logoutClient();
    navigate('/');
  };

  const handleUpdateProfile = async () => {
    await updateClient({ name: editName, phone: editPhone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Área do Cliente</h1>
              <p className="text-sm text-gray-500 mt-1">Bem-vinda, {currentClient.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'orders' ? 'bg-rosa-50 text-rosa-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Minhas Encomendas
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile' ? 'bg-rosa-50 text-rosa-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" /> Dados Pessoais
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Histórico de Encomendas</h2>
              <Link
                to="/encomendar"
                className="px-4 py-2 rounded-full text-sm font-medium bg-rosa-500 text-white hover:bg-rosa-600 transition-colors shadow-sm"
              >
                Nova Encomenda
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Ainda não tem encomendas.</p>
                <Link
                  to="/encomendar"
                  className="inline-flex px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white shadow-md transition-all"
                >
                  Fazer Primeira Encomenda
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const status = statusConfig[order.status];
                  return (
                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-400 font-mono">#{order.orderNumber}</p>
                          <h3 className="font-semibold text-gray-800 mt-1">{order.serviceType}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.eventDate).toLocaleDateString('pt-PT')} • {order.guestCount} convidados • {order.eventLocation}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>

                      {/* Status progress */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between">
                          {(['recebida', 'em-analise', 'confirmada', 'em-preparacao', 'pronta', 'concluida'] as OrderStatus[]).map((s, i) => {
                            const isActive = order.status === s;
                            const isPast = ['recebida', 'em-analise', 'confirmada', 'em-preparacao', 'pronta', 'concluida'].indexOf(order.status) >= i;
                            return (
                              <div key={s} className="flex flex-col items-center flex-1">
                                <div className={`w-3 h-3 rounded-full mb-1 ${
                                  isActive ? 'bg-rosa-500 ring-2 ring-rosa-200' : isPast ? 'bg-rosa-300' : 'bg-gray-200'
                                }`} />
                                <span className="text-[9px] text-gray-400 text-center hidden sm:block">
                                  {statusConfig[s].label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="relative mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-rosa-400 rounded-full transition-all duration-500"
                            style={{ width: `${((['recebida', 'em-analise', 'confirmada', 'em-preparacao', 'pronta', 'concluida'].indexOf(order.status) + 1) / 6) * 100}%` }}
                          />
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-50">
                          <p className="text-xs text-gray-400">Observações:</p>
                          <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-rosa-400" /> Dados Pessoais
            </h2>
            {saved && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-200 mb-4">
                Dados atualizados com sucesso!
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={currentClient.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm" />
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md transition-all"
              >
                Atualizar Dados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
