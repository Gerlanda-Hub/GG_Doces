import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { ORDER_STATUS_LABELS } from '../types';
import { requestNotificationPermission, sendLocalNotification, isNative } from '../utils/nativeFeatures';

// Monitoriza as encomendas guardadas no dispositivo e dispara uma notificação local
// (no app Android) sempre que o estado de uma encomenda muda.
export default function OrderNotifier() {
  const { state } = useApp();
  const knownStatuses = useRef<Record<string, string>>({});
  const initialized = useRef(false);

  // Pede permissão de notificações ao iniciar (apenas no app nativo)
  useEffect(() => {
    if (isNative()) {
      requestNotificationPermission();
    }
  }, []);

  useEffect(() => {
    // Apenas seguimos encomendas que pertencem a este dispositivo/cliente
    const myCodes: string[] = JSON.parse(localStorage.getItem('mundodedoces_my_orders') || '[]');
    const myOrders = state.orders.filter(o => myCodes.includes(o.orderNumber));

    if (!initialized.current) {
      // Primeira passagem: regista os estados atuais sem notificar
      myOrders.forEach(o => { knownStatuses.current[o.orderNumber] = o.status; });
      initialized.current = true;
      return;
    }

    myOrders.forEach(order => {
      const prev = knownStatuses.current[order.orderNumber];
      if (prev && prev !== order.status) {
        // O estado mudou → notificar o cliente
        sendLocalNotification(
          '🔔 Atualização da sua Encomenda',
          `A sua encomenda ${order.orderNumber} está agora: ${ORDER_STATUS_LABELS[order.status]}`
        );
      }
      knownStatuses.current[order.orderNumber] = order.status;
    });
  }, [state.orders]);

  return null;
}
