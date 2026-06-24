export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  slug: string;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  phone: string;
  email: string;
  serviceType: string;
  eventDate: string;
  guestCount: number;
  eventLocation: string;
  notes: string;
  imageRef: string | null;
  status: OrderStatus;
  createdAt: string;
  history: OrderHistoryEntry[];
  userId?: string;
}

export type OrderStatus =
  | 'recebida'
  | 'em-analise'
  | 'confirmada'
  | 'em-preparacao'
  | 'pronta'
  | 'concluida'
  | 'cancelada';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  'recebida': 'Recebida',
  'em-analise': 'Em Análise',
  'confirmada': 'Confirmada',
  'em-preparacao': 'Em Preparação',
  'pronta': 'Pronta',
  'concluida': 'Concluída',
  'cancelada': 'Cancelada',
};

export const ORDER_STATUSES: OrderStatus[] = [
  'recebida',
  'em-analise',
  'confirmada',
  'em-preparacao',
  'pronta',
  'concluida',
];

// Estados que aparecem na linha de progresso (cancelada é terminal)
export const ORDER_PROGRESS_STATUSES: OrderStatus[] = [
  'recebida',
  'em-analise',
  'confirmada',
  'em-preparacao',
  'pronta',
  'concluida',
];

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: 'bolos' | 'cupcakes' | 'doces' | 'salgados' | 'decoracao';
}

export interface SiteSettings {
  companyName: string;
  slogan: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  instagram?: string;
  facebook?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export interface AdminUser {
  username: string;
  password: string;
}

// ===== CHATBOT & LIVE CHAT TYPES =====
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'bot' | 'user' | 'agent';
  text: string;
  timestamp: string;
  clientName?: string;
}

export interface ChatSession {
  id: string; // matches sessionId
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  lastMessage: string;
  lastTimestamp: string;
  status: 'bot' | 'waiting' | 'active' | 'closed';
  unreadByAgent?: boolean;
  unreadByClient?: boolean;
}

// Working Hours: 08:00 to 20:00 (Angola / Local Time)
export function isWithinWorkingHours(): boolean {
  const now = new Date();
  const hours = now.getHours();
  return hours >= 8 && hours < 20;
}
