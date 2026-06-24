import { useState } from 'react';
import { Search, XCircle, CheckCircle, Clock, AlertCircle, CookingPot, Truck, Package, MessageCircle, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../supabase/config';
import AdSenseAd from '../components/AdSenseAd';
import type { Order, OrderStatus, OrderHistoryEntry } from '../types';
import { ORDER_STATUS_LABELS, ORDER_PROGRESS_STATUSES } from '../types';

const statusConfig: Record<OrderStatus, { color: string; bg: string; icon: React.ReactNode; borderColor: string }> = {
  'recebida': { color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-blue-300', icon: <Clock className="w-4 h-4" /> },
  'em-analise': { color: 'text-yellow-600', bg: 'bg-yellow-50', borderColor: 'border-yellow-300', icon: <AlertCircle className="w-4 h-4" /> },
  'confirmada': { color: 'text-green-600', bg: 'bg-green-50', borderColor: 'border-green-300', icon: <CheckCircle className="w-4 h-4" /> },
  'em-preparacao': { color: 'text-orange-600', bg: 'bg-orange-50', borderColor: 'border-orange-300', icon: <CookingPot className="w-4 h-4" /> },
  'pronta': { color: 'text-purple-600', bg: 'bg-purple-50', borderColor: 'border-purple-300', icon: <Truck className="w-4 h-4" /> },
  'concluida': { color: 'text-gray-600', bg: 'bg-gray-50', borderColor: 'border-gray-300', icon: <CheckCircle className="w-4 h-4" /> },
  'cancelada': { color: 'text-red-600', bg: 'bg-red-50', borderColor: 'border-red-300', icon: <AlertCircle className="w-4 h-4" /> },
};

function dbStatusToLocalStatus(dbStatus: string): OrderStatus {
  const norm = dbStatus.toLowerCase().trim();
  if (norm === 'em análise' || norm === 'em-analise') return 'em-analise';
  if (norm === 'em preparação' || norm === 'em-preparacao') return 'em-preparacao';
  if (norm === 'concluída' || norm === 'concluida') return 'concluida';
  return norm as OrderStatus;
}

function mapSupabaseToOrder(row: any): Order {
  const localStatus = dbStatusToLocalStatus(row.status || 'Recebida');
  const history: OrderHistoryEntry[] = [
    {
      status: 'recebida',
      label: 'Encomenda recebida.',
      timestamp: row.criado_em || new Date().toISOString(),
    }
  ];

  if (localStatus !== 'recebida') {
    history.push({
      status: localStatus,
      label: `${ORDER_STATUS_LABELS[localStatus]}.`,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    id: row.id,
    orderNumber: row.codigo,
    clientName: row.nome,
    phone: row.telefone,
    email: row.email,
    serviceType: row.servico,
    eventDate: row.data_evento,
    guestCount: Number(row.convidados),
    eventLocation: row.local_evento || '',
    notes: row.observacoes || '',
    imageRef: null,
    status: localStatus,
    createdAt: row.criado_em || new Date().toISOString(),
    history,
  };
}

export default function TrackOrder() {
  const { findOrderByCode } = useApp();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) {
      setError('Digite um código de encomenda.');
      setOrder(null);
      setSearched(true);
      return;
    }

    // Validate format MDG-XXXXXXXX
    if (!/^MDG-[A-Z0-9]{8}$/.test(trimmed)) {
      setError('Formato inválido. O código deve ter o formato: MDG-XXXXXXXX');
      setOrder(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Direct Supabase Query (Required for production accuracy)
      const { data, error: dbError } = await supabase
        .from('encomendas')
        .select('*')
        .eq('codigo', trimmed)
        .maybeSingle();

      if (dbError) throw dbError;

      if (data) {
        setOrder(mapSupabaseToOrder(data));
        setError('');
      } else {
        // 2. Fallback to Local State if Supabase returns empty (or during offline mode)
        const localFound = findOrderByCode(trimmed);
        if (localFound) {
          setOrder(localFound);
          setError('');
        } else {
          setOrder(null);
          setError('Encomenda não encontrada. Verifique o código e tente novamente.');
        }
      }
    } catch (err: any) {
      console.warn('Supabase query failed, falling back to local state:', err);
      // Fallback
      const localFound = findOrderByCode(trimmed);
      if (localFound) {
        setOrder(localFound);
        setError('');
      } else {
        setOrder(null);
        setError(`Erro ao consultar a encomenda: ${err.message || 'Problema de conexão'}`);
      }
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const currentStatusIndex = order && order.status !== 'cancelada'
    ? ORDER_PROGRESS_STATUSES.indexOf(order.status)
    : order?.status === 'cancelada' ? 3 : -1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rosa-50 mb-4">
              <Package className="w-7 h-7 text-rosa-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              📦 Consultar Encomenda
            </h1>
            <p className="text-gray-500">
              Digite o código da sua encomenda para acompanhar o andamento do seu pedido.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-lg mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearched(false); }}
                onKeyDown={handleKeyDown}
                placeholder="Exemplo: MDG-MQM86LMB"
                className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm font-mono placeholder:text-gray-300 bg-white shadow-sm"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-4 rounded-2xl bg-rosa-500 text-white font-semibold text-sm hover:bg-rosa-600 shadow-md shadow-rosa-200 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Consultar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Not Found / Error */}
        {searched && error && !order && !loading && (
          <div className="bg-white border border-red-100 rounded-3xl p-8 text-center animate-fade-in-up shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{error}</h2>
            <p className="text-gray-500 text-sm mb-6">
              Verifique o código e tente novamente ou contacte a Mundo de Doces da GG pelo WhatsApp.
            </p>
            <a
              href="https://wa.me/244927718735?text=Olá! Preciso de ajuda para consultar a minha encomenda."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
            </a>
          </div>
        )}

        {/* Order Found */}
        {order && !loading && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Order Details Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">{order.orderNumber}</p>
                  <h2 className="text-xl font-bold text-gray-900">{order.clientName}</h2>
                  <p className="text-gray-500 text-sm mt-1">{order.serviceType}</p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig[order.status].bg} ${statusConfig[order.status].color} ${statusConfig[order.status].borderColor}`}>
                  {statusConfig[order.status].icon}
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Calendar className="w-4 h-4 text-rosa-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Data do Evento</p>
                    <p className="text-sm font-medium text-gray-700">{new Date(order.eventDate).toLocaleDateString('pt-PT')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Users className="w-4 h-4 text-rosa-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Convidados</p>
                    <p className="text-sm font-medium text-gray-700">{order.guestCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <MapPin className="w-4 h-4 text-rosa-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Local</p>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{order.eventLocation ? order.eventLocation : 'A combinar'}</p>
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-4 rounded-xl bg-rosa-50/50 border border-rosa-50">
                  <p className="text-xs text-gray-400 mb-1">Observações e Sabores</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Encomenda criada em {new Date(order.createdAt).toLocaleDateString('pt-PT')} às {new Date(order.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Status Progress */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Estado da Encomenda</h3>
              <div className="relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-5 right-5 h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      order?.status === 'cancelada'
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : 'bg-gradient-to-r from-rosa-400 to-rosa-500'
                    }`}
                    style={{
                      width: order?.status === 'cancelada'
                        ? '50%'
                        : `${((currentStatusIndex + 1) / ORDER_PROGRESS_STATUSES.length) * 100}%`
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="flex justify-between relative">
                  {ORDER_PROGRESS_STATUSES.map((s, i) => {
                    const config = statusConfig[s];
                    const isCurrent = s === order.status;
                    const isPast = i <= currentStatusIndex;
                    return (
                      <div key={s} className="flex flex-col items-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCurrent
                              ? 'bg-rosa-500 text-white shadow-lg shadow-rosa-200 scale-110 ring-4 ring-rosa-100'
                              : isPast
                              ? 'bg-rosa-300 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isPast ? <CheckCircle className="w-4 h-4" /> : config.icon}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs mt-2 text-center max-w-[60px] leading-tight transition-colors duration-300 ${
                            isCurrent ? 'text-rosa-600 font-semibold' : isPast ? 'text-rosa-400' : 'text-gray-400'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Histórico de Atualizações</h3>
              <div className="space-y-0">
                {order.history.map((entry, i) => {
                  const isLast = i === order.history.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                          isLast ? 'bg-rosa-500 ring-2 ring-rosa-200' : 'bg-rosa-300'
                        }`} />
                        {!isLast && <div className="w-0.5 flex-1 min-h-[24px] bg-rosa-100" />}
                      </div>

                      {/* Content */}
                      <div className="pb-5">
                        <p className="text-sm text-gray-700 font-medium">{entry.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(entry.timestamp).toLocaleDateString('pt-PT')} às{' '}
                          {new Date(entry.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 💰 Google AdSense Banner */}
            <AdSenseAd slot="track-order-bottom-ad" />

            {/* WhatsApp Help */}
            <div className="text-center pb-8">
              <p className="text-sm text-gray-400 mb-3">💬 Precisa de ajuda?</p>
              <a
                href={`https://wa.me/244927718735?text=Olá! Gostaria de saber mais sobre a minha encomenda ${order.orderNumber}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Falar com a Gestão
              </a>
            </div>
          </div>
        )}

        {/* Empty state - no search yet */}
        {!searched && !order && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-rosa-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-rosa-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Insira o código da sua encomenda acima e clique em "Consultar" para ver o estado do seu pedido.
            </p>
            <p className="text-gray-300 text-xs mt-2">
              O código segue o formato: MDG-XXXXXXXX
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
