import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithRedirect,
  getRedirectResult,
  type User,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { supabase } from '../supabase/config';
import type { Order, Client, Message, Testimonial, OrderStatus, OrderHistoryEntry } from '../types';
import { ORDER_STATUS_LABELS } from '../types';

import type { ChatMessage, ChatSession } from '../types';

interface AppState {
  orders: Order[];
  clients: Client[];
  messages: Message[];
  testimonials: Testimonial[];
  chatMessages: ChatMessage[];
  chatSessions: ChatSession[];
}

interface DiagnosticResult {
  step1_insert: 'pending' | 'success' | 'failed';
  step2_select: 'pending' | 'success' | 'failed';
  step3_verify: 'pending' | 'success' | 'failed';
  step4_delete: 'pending' | 'success' | 'failed';
  details: string[];
}

interface AppContextType {
  state: AppState;
  loading: boolean;
  // Orders (Supabase)
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'history'>) => Promise<Order>;
  findOrderByCode: (code: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  addOrderNote: (orderId: string, note: string) => Promise<void>;
  getOrdersByClient: (email: string) => Order[];
  runSupabaseDiagnosticTest: () => Promise<DiagnosticResult>;
  // Clients (Firebase Auth)
  registerClient: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginClient: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: (name: string, email: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logoutClient: () => Promise<void>;
  updateClient: (data: { name?: string; phone?: string }) => Promise<void>;
  // Messages
  addMessage: (message: Omit<Message, 'id' | 'read' | 'replied' | 'createdAt'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  // Testimonials
  addTestimonial: (t: Omit<Testimonial, 'id' | 'createdAt'>) => Promise<void>;
  // Live Chat & Chatbot
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  requestAgent: (sessionId: string, clientName: string, email?: string, phone?: string) => Promise<void>;
  replyAsAgent: (sessionId: string, text: string) => Promise<void>;
  closeChatSession: (sessionId: string) => Promise<void>;
  markChatReadByAgent: (sessionId: string) => Promise<void>;
  markChatReadByClient: (sessionId: string) => Promise<void>;
  // Auth
  currentClient: Client | null;
  firebaseUser: User | null;
  authLoading: boolean;
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const ADMIN_CREDENTIALS = { username: 'admin', password: 'ggdoces2025' };

// Helper to map DB status to local status
function dbStatusToLocalStatus(dbStatus: string): OrderStatus {
  const norm = dbStatus.toLowerCase().trim();
  if (norm === 'em análise' || norm === 'em-analise') return 'em-analise';
  if (norm === 'em preparação' || norm === 'em-preparacao') return 'em-preparacao';
  if (norm === 'concluída' || norm === 'concluida') return 'concluida';
  return norm as OrderStatus;
}

// Helper to map local status to DB status
function localStatusToDbStatus(localStatus: OrderStatus): string {
  if (localStatus === 'em-analise') return 'Em Análise';
  if (localStatus === 'em-preparacao') return 'Em Preparação';
  if (localStatus === 'concluida') return 'Concluída';
  if (localStatus === 'cancelada') return 'Cancelada';
  return localStatus.charAt(0).toUpperCase() + localStatus.slice(1);
}

// Map Supabase row to Order object
function mapSupabaseToOrder(row: any): Order {
  const localStatus = dbStatusToLocalStatus(row.status || 'Recebida');
  
  // Reconstruct history entries from Supabase timestamps if available
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

function generateUniqueCode(existingOrders: Order[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const existingCodes = new Set(existingOrders.map(o => o.orderNumber));
  let code = '';
  do {
    code = 'MDG-';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (existingCodes.has(code));
  return code;
}

function firebaseUserToClient(user: User, localClient?: Client): Client {
  return {
    id: user.uid,
    name: user.displayName || localClient?.name || user.email?.split('@')[0] || 'Cliente',
    email: user.email || '',
    phone: localClient?.phone || '',
    password: '',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
}

function loadState(): AppState {
  try {
    const data = localStorage.getItem('mundodedoces_state');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        orders: parsed.orders || [],
        clients: parsed.clients || [],
        messages: parsed.messages || [],
        testimonials: parsed.testimonials || [],
        chatMessages: parsed.chatMessages || [],
        chatSessions: parsed.chatSessions || [],
      };
    }
  } catch { /* ignore */ }
  return { orders: [], clients: [], messages: [], testimonials: [], chatMessages: [], chatSessions: [] };
}

function saveState(state: AppState) {
  localStorage.setItem('mundodedoces_state', JSON.stringify(state));
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('mundodedoces_admin') === 'true';
  });

  // Persist state locally
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Fetch orders from Supabase table "encomendas"
  const fetchSupabaseOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('encomendas')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedOrders = data.map(mapSupabaseToOrder);
        setState(prev => {
          const combined = [...mappedOrders];
          prev.orders.forEach(localOrder => {
            if (!combined.some(o => o.id === localOrder.id || o.orderNumber === localOrder.orderNumber)) {
              combined.push(localOrder);
            }
          });
          combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return { ...prev, orders: combined };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch orders failed, falling back to LocalStorage:', err);
    }
  }, []);

  // Fetch stored chats from Supabase (permanent history for admin panel)
  const fetchSupabaseChats = useCallback(async () => {
    try {
      const { data: sessoes } = await supabase
        .from('chat_sessoes')
        .select('*')
        .order('ultimo_timestamp', { ascending: false });

      const { data: mensagens } = await supabase
        .from('chat_mensagens')
        .select('*')
        .order('criado_em', { ascending: true });

      if (sessoes) {
        const mappedSessions: ChatSession[] = sessoes.map((s: any) => ({
          id: s.id,
          clientName: s.nome_cliente || 'Cliente Anónimo',
          clientPhone: s.telefone || '',
          clientEmail: s.email || '',
          lastMessage: s.ultima_mensagem || '',
          lastTimestamp: s.ultimo_timestamp || new Date().toISOString(),
          status: (s.estado || 'bot') as ChatSession['status'],
        }));
        setState(prev => {
          const combined = [...mappedSessions];
          prev.chatSessions.forEach(local => {
            if (!combined.some(c => c.id === local.id)) combined.push(local);
          });
          combined.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
          return { ...prev, chatSessions: combined };
        });
      }

      if (mensagens) {
        const mappedMessages: ChatMessage[] = mensagens.map((m: any) => ({
          id: m.id?.toString() || crypto.randomUUID(),
          sessionId: m.sessao_id,
          sender: m.remetente as ChatMessage['sender'],
          text: m.texto,
          timestamp: m.criado_em || new Date().toISOString(),
          clientName: m.nome_cliente,
        }));
        setState(prev => {
          const combined = [...mappedMessages];
          prev.chatMessages.forEach(local => {
            if (!combined.some(c => c.id === local.id)) combined.push(local);
          });
          combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          return { ...prev, chatMessages: combined };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch chats failed:', err);
    }
  }, []);

  // Subscribe to changes in real-time
  useEffect(() => {
    fetchSupabaseOrders();
    fetchSupabaseChats();

    const ordersSubscription = (supabase as any)
      .channel('public:encomendas')
      .on(
        'postgres_changes',
        { event: '*', scheme: 'public', table: 'encomendas' },
        () => {
          fetchSupabaseOrders();
        }
      )
      .subscribe();

    // Real-time subscription for chats (so app chats appear live in the admin panel)
    const chatsSubscription = (supabase as any)
      .channel('public:chats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessoes' },
        () => { fetchSupabaseChats(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_mensagens' },
        () => { fetchSupabaseChats(); }
      )
      .subscribe();

    // Poll chats every 15s as a safety net (in case realtime is not enabled on the tables)
    const chatsPoll = setInterval(() => { fetchSupabaseChats(); }, 15000);

    const unsubscribes: (() => void)[] = [];

    // Messages listener (Firestore)
    try {
      const messagesUnsub = onSnapshot(
        query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          setState(prev => {
            const combined = [...messages];
            prev.messages.forEach(localMsg => {
              if (!combined.some(m => m.id === localMsg.id)) {
                combined.push(localMsg);
              }
            });
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { ...prev, messages: combined };
          });
        },
        (error) => console.warn('Messages listener failed:', error.message)
      );
      unsubscribes.push(messagesUnsub);
    } catch (e) {
      console.warn('Failed to register messages listener:', e);
    }

    // Testimonials listener (Firestore)
    try {
      const testimonialsUnsub = onSnapshot(
        query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const testimonials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[];
          setState(prev => {
            const combined = [...testimonials];
            prev.testimonials.forEach(localTest => {
              if (!combined.some(t => t.id === localTest.id)) {
                combined.push(localTest);
              }
            });
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return { ...prev, testimonials: combined };
          });
        },
        (error) => console.warn('Testimonials listener failed:', error.message)
      );
      unsubscribes.push(testimonialsUnsub);
    } catch (e) {
      console.warn('Failed to register testimonials listener:', e);
    }

    // Chat messages listener (Firestore)
    try {
      const chatMessagesUnsub = onSnapshot(
        query(collection(db, 'chat_messages'), orderBy('timestamp', 'asc')),
        (snapshot) => {
          const remoteMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ChatMessage[];
          setState(prev => {
            // Merge remote with local-only messages (dedup by id), keeping chronological order
            const combined = [...remoteMessages];
            prev.chatMessages.forEach(localMsg => {
              if (!combined.some(m => m.id === localMsg.id)) {
                combined.push(localMsg);
              }
            });
            combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            return { ...prev, chatMessages: combined };
          });
        },
        (error) => console.warn('Chat messages listener failed:', error.message)
      );
      unsubscribes.push(chatMessagesUnsub);
    } catch (e) {
      console.warn('Failed to register chat messages listener:', e);
    }

    // Chat sessions listener (Firestore)
    try {
      const chatSessionsUnsub = onSnapshot(
        query(collection(db, 'chat_sessions'), orderBy('lastTimestamp', 'desc')),
        (snapshot) => {
          const remoteSessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as ChatSession[];
          setState(prev => {
            // Merge remote sessions with local-only sessions (dedup by id, remote wins)
            const combined = [...remoteSessions];
            prev.chatSessions.forEach(localSession => {
              if (!combined.some(s => s.id === localSession.id)) {
                combined.push(localSession);
              }
            });
            combined.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
            return { ...prev, chatSessions: combined };
          });
        },
        (error) => console.warn('Chat sessions listener failed:', error.message)
      );
      unsubscribes.push(chatSessionsUnsub);
    } catch (e) {
      console.warn('Failed to register chat sessions listener:', e);
    }

    return () => {
      ordersSubscription.unsubscribe();
      chatsSubscription.unsubscribe();
      clearInterval(chatsPoll);
      unsubscribes.forEach(unsub => unsub());
    };
  }, [fetchSupabaseOrders, fetchSupabaseChats]);

  // Firebase Auth listener
  useEffect(() => {
    // Check for redirect result on mount (for mobile/safari redirects)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('[Firebase Auth] Redirect sign-in success:', result.user.email);
          const client = firebaseUserToClient(result.user);
          setCurrentClient(client);
        }
      })
      .catch((err) => {
        console.warn('[Firebase Auth] Redirect sign-in error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        const client = firebaseUserToClient(user);
        setCurrentClient(client);
      } else {
        setCurrentClient(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Admin
  useEffect(() => {
    localStorage.setItem('mundodedoces_admin', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // ===== ORDERS (Supabase Table: encomendas) =====
  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'history'>) => {
    const now = new Date().toISOString();
    const firstHistory: OrderHistoryEntry = {
      status: 'recebida',
      label: 'Encomenda recebida.',
      timestamp: now,
    };
    
    const uniqueCode = generateUniqueCode(state.orders);
    const order: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      orderNumber: uniqueCode,
      status: 'recebida',
      createdAt: now,
      history: [firstHistory],
    };

    // Update local state immediately for instant feedback
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));

    // Format the payload exactly for Supabase table `encomendas`
    const dados = {
      codigo: uniqueCode,
      nome: orderData.clientName,
      telefone: orderData.phone,
      email: orderData.email,
      servico: orderData.serviceType,
      data_evento: orderData.eventDate,
      convidados: orderData.guestCount,
      local_evento: orderData.eventLocation || '',
      observacoes: orderData.notes || '',
      status: 'Recebida',
    };

    console.log("DADOS ENVIADOS:", dados);

    try {
      const { data, error } = await supabase
        .from('encomendas')
        .insert([dados])
        .select(); // Ensure we select the inserted row to populate `data`

      console.log("RESPOSTA SUPABASE:", data);
      console.log("ERRO SUPABASE:", error);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("EXCEÇÃO SUPABASE AO CRIAR ENCOMENDA:", error);
      throw error; // Propagate the error so the UI can notify the user
    }

    return order;
  }, [state.orders]);

  const findOrderByCode = useCallback((code: string): Order | null => {
    const normalized = code.trim().toUpperCase();
    return state.orders.find(o => o.orderNumber === normalized) || null;
  }, [state.orders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, note?: string) => {
    const now = new Date().toISOString();
    const label = ORDER_STATUS_LABELS[status];
    const entry: OrderHistoryEntry = {
      status,
      label: note ? `${label} — ${note}` : `${label}.`,
      timestamp: now,
      note,
    };

    // Update local state immediately
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o =>
        o.id === orderId
          ? { ...o, status, history: [...o.history, entry] }
          : o
      ),
    }));

    // Update Supabase "encomendas"
    try {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        const dbStatus = localStatusToDbStatus(status);
        const { error } = await supabase
          .from('encomendas')
          .update({ status: dbStatus })
          .eq('codigo', order.orderNumber);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Supabase updateOrderStatus failed:', error);
      throw error;
    }
  }, [state.orders]);

  const addOrderNote = useCallback(async (orderId: string, note: string) => {
    const now = new Date().toISOString();
    const entry: OrderHistoryEntry = {
      status: state.orders.find(o => o.id === orderId)?.status || 'recebida',
      label: `📝 ${note}`,
      timestamp: now,
      note,
    };

    // Update local state immediately
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o =>
        o.id === orderId
          ? { ...o, history: [...o.history, entry] }
          : o
      ),
    }));
  }, [state.orders]);

  const getOrdersByClient = useCallback((email: string) => {
    return state.orders.filter(o => o.email === email);
  }, [state.orders]);

  // ===== AUTOMATIC CONNECTION & POLICY TEST RUNNER =====
  const runSupabaseDiagnosticTest = async (): Promise<DiagnosticResult> => {
    const testCode = `MDG-TEST${Math.floor(1000 + Math.random() * 9000)}`;
    const results: DiagnosticResult = {
      step1_insert: 'pending',
      step2_select: 'pending',
      step3_verify: 'pending',
      step4_delete: 'pending',
      details: []
    };

    results.details.push(`[Test] Iniciar teste diagnóstico com o código temporário: ${testCode}`);

    // Step 1: Insert test order
    try {
      results.details.push('[Test] Passo 1: A tentar inserir encomenda de teste no Supabase...');
      const { data: insertData, error: insertError, status: insertStatus } = await supabase
        .from('encomendas')
        .insert([
          {
            codigo: testCode,
            nome: 'Cliente Diagnóstico Teste',
            telefone: '+244 927 718 735',
            email: 'ggsuportes@gmai.com',
            servico: 'Bolo de Aniversário (1x)',
            data_evento: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            convidados: 50,
            local_evento: 'Luanda, Angola',
            observacoes: 'Encomenda de teste automático de integridade do sistema.',
            status: 'Recebida'
          }
        ])
        .select();

      results.details.push(`[Test] Resposta de Inserção Supabase (Código HTTP: ${insertStatus})`);
      if (insertError) {
        results.step1_insert = 'failed';
        results.details.push(`[Test ❌ FALHA] Erro de Inserção: ${insertError.message} (${insertError.code})`);
        throw insertError;
      }

      results.step1_insert = 'success';
      results.details.push(`[Test ✅ SUCESSO] Encomenda de teste inserida. Dados retornados: ${JSON.stringify(insertData)}`);
    } catch (e: any) {
      results.step1_insert = 'failed';
      results.details.push(`[Test ❌ EXCEÇÃO] Erro crítico no Passo 1: ${e?.message || e}`);
      return results; // Stop execution if insert fails
    }

    // Step 2: Select the created order
    try {
      results.details.push('[Test] Passo 2: A tentar consultar a encomenda de teste criada...');
      const { data: selectData, error: selectError, status: selectStatus } = await supabase
        .from('encomendas')
        .select('*')
        .eq('codigo', testCode)
        .maybeSingle();

      results.details.push(`[Test] Resposta de Consulta Supabase (Código HTTP: ${selectStatus})`);
      if (selectError) {
        results.step2_select = 'failed';
        results.details.push(`[Test ❌ FALHA] Erro de Consulta: ${selectError.message} (${selectError.code})`);
        throw selectError;
      }

      results.step2_select = 'success';
      results.details.push(`[Test ✅ SUCESSO] Encomenda de teste localizada: ${JSON.stringify(selectData)}`);
    } catch (e: any) {
      results.step2_select = 'failed';
      results.details.push(`[Test ❌ EXCEÇÃO] Erro crítico no Passo 2: ${e?.message || e}`);
      return results;
    }

    // Step 3: Verify fields integrity
    try {
      results.details.push('[Test] Passo 3: A verificar integridade dos campos...');
      const { data: verifyData } = await supabase
        .from('encomendas')
        .select('*')
        .eq('codigo', testCode)
        .maybeSingle();

      if (verifyData && verifyData.codigo === testCode && verifyData.nome === 'Cliente Diagnóstico Teste') {
        results.step3_verify = 'success';
        results.details.push(`[Test ✅ SUCESSO] Verificação concluída. O código "${testCode}" existe e os campos correspondem.`);
      } else {
        results.step3_verify = 'failed';
        results.details.push('[Test ❌ FALHA] Os campos da encomenda retornados não correspondem aos inseridos.');
      }
    } catch (e: any) {
      results.step3_verify = 'failed';
      results.details.push(`[Test ❌ EXCEÇÃO] Erro no Passo 3: ${e?.message || e}`);
    }

    // Step 4: Clean up (Delete the test order)
    try {
      results.details.push('[Test] Passo 4: A tentar remover a encomenda de teste para limpar a BD...');
      const { error: deleteError, status: deleteStatus } = await supabase
        .from('encomendas')
        .delete()
        .eq('codigo', testCode);

      results.details.push(`[Test] Resposta de Remoção Supabase (Código HTTP: ${deleteStatus})`);
      if (deleteError) {
        results.step4_delete = 'failed';
        results.details.push(`[Test ❌ FALHA] Erro ao remover: ${deleteError.message}`);
      } else {
        results.step4_delete = 'success';
        results.details.push('[Test ✅ SUCESSO] Encomenda de teste removida com sucesso da base de dados.');
      }
    } catch (e: any) {
      results.step4_delete = 'failed';
      results.details.push(`[Test ❌ EXCEÇÃO] Erro no Passo 4: ${e?.message || e}`);
    }

    results.details.push('[Test] Diagnóstico concluído com sucesso.');
    return results;
  };

  // ===== CLIENTS (Firebase) =====
  const registerClient = useCallback(async (name: string, email: string, phone: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const client: Client = {
        id: cred.user.uid,
        name,
        email,
        phone,
        password: '',
        createdAt: new Date().toISOString(),
      };
      
      // Save locally
      setState(prev => ({ ...prev, clients: [...prev.clients, client] }));

      try {
        await addDoc(collection(db, 'clients'), client);
      } catch (err) {
        console.warn('Firestore client save failed:', err);
      }

      return { success: true };
    } catch (err: any) {
      let error = 'Erro ao criar conta.';
      if (err.code === 'auth/email-already-in-use') error = 'Este e-mail já está registado.';
      if (err.code === 'auth/weak-password') error = 'A senha deve ter pelo menos 6 caracteres.';
      if (err.code === 'auth/invalid-email') error = 'E-mail inválido.';
      return { success: false, error };
    }
  }, []);

  const loginClient = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      let error = 'Erro ao iniciar sessão.';
      if (err.code === 'auth/invalid-credential') error = 'E-mail ou senha incorretos.';
      if (err.code === 'auth/invalid-email') error = 'E-mail inválido.';
      if (err.code === 'auth/too-many-requests') error = 'Muitas tentativas. Tente mais tarde.';
      return { success: false, error };
    }
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      let error = 'Erro ao enviar e-mail de recuperação.';
      if (err.code === 'auth/invalid-email') error = 'E-mail inválido.';
      if (err.code === 'auth/user-not-found') error = 'Nenhuma conta com este e-mail.';
      return { success: false, error };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    console.log("LOGIN_ATTEMPT: Google Sign-In initiated");
    console.log("FIREBASE_USER_STATE: Currently logged in user state:", auth.currentUser);
    
    try {
      // Try to sign in using a popup first
      const cred = await signInWithPopup(auth, provider);
      
      // Sync client profile details to local state & database
      const client: Client = {
        id: cred.user.uid,
        name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Cliente Google',
        email: cred.user.email || '',
        phone: cred.user.phoneNumber || '',
        password: '',
        createdAt: new Date().toISOString(),
      };
      
      // Save locally
      setState(prev => {
        const exists = prev.clients.find(c => c.id === cred.user.uid);
        if (!exists) return { ...prev, clients: [...prev.clients, client] };
        return prev;
      });
      
      try {
        await addDoc(collection(db, 'clients'), client);
      } catch (err) {
        console.warn('Firestore client save failed:', err);
      }

      console.log("RESULTADO DA TENTATIVA DE LOGIN: Sucesso total!", client);
      return { success: true };
    } catch (err: any) {
      console.error("ERRO COMPLETO DO FIREBASE AO FALHAR LOGIN:", err);
      
      // Fallback to redirect if popup is blocked by the browser
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/cancelled-popup-request' ||
        /popup/i.test(err.message || '')
      ) {
        try {
          console.log('[Firebase Auth] Popup blocked. Attempting redirect fallback...');
          await signInWithRedirect(auth, provider);
          return { success: true }; // Redirect has started successfully
        } catch (redirErr: any) {
          console.error('[Firebase Auth] Redirect fallback failed:', redirErr);
          return { success: false, error: 'O seu navegador bloqueou a janela de autenticação. Tente permitir popups ou use a aba de Acesso Rápido.' };
        }
      }

      // Map other common Firebase Authentication errors to extremely helpful instructions
      let error = 'Erro ao entrar com o Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        error = 'O início de sessão foi cancelado por fechar a janela.';
      } else if (err.code === 'auth/operation-not-allowed') {
        error = 'Erro da Gestão: O provedor Google (Google Provider) não está ativado (ENABLED) no Firebase Console. Por favor, ative a autenticação do Google e adicione um e-mail de suporte.';
      } else if (err.code === 'auth/unauthorized-domain') {
        error = `Erro de Domínio Não Autorizado: O domínio "gg-doces.vercel.app" (ou ${window.location.hostname}) não está configurado como Domínio Autorizado no Firebase Authentication. Aceda ao Firebase Console -> Auth -> Settings -> Authorized Domains e adicione "gg-doces.vercel.app".`;
      } else if (err.code === 'auth/network-request-failed') {
        error = 'Erro de Rede: Verifique a sua ligação à Internet e tente novamente.';
      } else {
        error = `Erro do Firebase (${err.code}): ${err.message || 'Falha na autenticação do Google.'}`;
      }

      return { success: false, error };
    }
  }, []);

  const loginAsGuest = useCallback(async (name: string, email: string, phone: string) => {
    try {
      const cred = await signInAnonymously(auth);
      await updateProfile(cred.user, { displayName: name });
      
      const client: Client = {
        id: cred.user.uid,
        name,
        email,
        phone,
        password: '',
        createdAt: new Date().toISOString(),
      };
      
      // Save locally
      setState(prev => ({ ...prev, clients: [...prev.clients, client] }));

      try {
        await addDoc(collection(db, 'clients'), client);
      } catch (err) {
        console.warn('Firestore client save failed:', err);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      return { success: false, error: 'Erro ao aceder como Convidado.' };
    }
  }, []);

  const logoutClient = useCallback(async () => {
    await signOut(auth);
    setCurrentClient(null);
  }, []);

  const updateClientProfile = useCallback(async (data: { name?: string; phone?: string }) => {
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }
    setCurrentClient(prev => prev ? { ...prev, ...data } : null);
    
    // Update local list
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      setState(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === uid ? { ...c, ...data } : c)
      }));
    }
  }, []);

  // ===== MESSAGES =====
  const addMessage = useCallback(async (msg: Omit<Message, 'id' | 'read' | 'replied' | 'createdAt'>) => {
    const message: Message = { ...msg, id: crypto.randomUUID(), read: false, replied: false, createdAt: new Date().toISOString() };
    
    // Update local state
    setState(prev => ({ ...prev, messages: [message, ...prev.messages] }));

    try {
      await addDoc(collection(db, 'messages'), {
        ...message,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore addMessage failed (using LocalStorage fallback):', error);
    }
  }, []);

  const markMessageRead = useCallback(async (id: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, read: true } : m),
    }));

    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
    } catch (error) {
      console.warn('Firestore markMessageRead failed:', error);
    }
  }, []);

  // ===== TESTIMONIALS =====
  const addTestimonial = useCallback(async (t: Omit<Testimonial, 'id' | 'createdAt'>) => {
    const testimonial: Testimonial = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    
    // Update local state
    setState(prev => ({ ...prev, testimonials: [testimonial, ...prev.testimonials] }));

    try {
      await addDoc(collection(db, 'testimonials'), {
        ...testimonial,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore addTestimonial failed:', error);
    }
  }, []);

  // ===== LIVE CHAT & CHATBOT =====
  const sendChatMessage = useCallback(async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString();
    const message: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: now,
    };

    // 1. Optimistic local update (ensures the chat always works, even if Firestore is offline)
    setState(prev => {
      const existingSession = prev.chatSessions.find(s => s.id === msg.sessionId);
      const updatedSession: ChatSession = {
        id: msg.sessionId,
        clientName: msg.clientName || existingSession?.clientName || 'Cliente Anónimo',
        clientPhone: existingSession?.clientPhone,
        clientEmail: existingSession?.clientEmail,
        lastMessage: msg.text,
        lastTimestamp: now,
        // Keep waiting/active status if already set; otherwise default by sender
        status: existingSession?.status === 'waiting' || existingSession?.status === 'active'
          ? existingSession.status
          : (msg.sender === 'agent' ? 'active' : 'bot'),
        unreadByAgent: msg.sender === 'user' ? true : existingSession?.unreadByAgent,
        unreadByClient: msg.sender === 'agent' ? true : existingSession?.unreadByClient,
      };
      const otherSessions = prev.chatSessions.filter(s => s.id !== msg.sessionId);
      return {
        ...prev,
        chatMessages: [...prev.chatMessages, message],
        chatSessions: [updatedSession, ...otherSessions],
      };
    });

    // 2. Persist to Firestore in the background (best-effort)
    try {
      await addDoc(collection(db, 'chat_messages'), message);

      const sessionRef = doc(db, 'chat_sessions', msg.sessionId);
      await setDoc(sessionRef, {
        id: msg.sessionId,
        clientName: msg.clientName || 'Cliente Anónimo',
        lastMessage: msg.text,
        lastTimestamp: now,
        status: msg.sender === 'user' ? 'bot' : 'active',
        unreadByAgent: msg.sender === 'user',
        unreadByClient: msg.sender === 'agent',
      }, { merge: true });

    } catch (error) {
      console.warn('Firestore sendChatMessage failed (using local fallback):', error);
    }

    // 3. Persist to Supabase database (best-effort, permanent storage)
    try {
      await supabase.from('chat_mensagens').insert([{
        sessao_id: msg.sessionId,
        remetente: msg.sender,
        texto: msg.text,
        nome_cliente: msg.clientName || 'Cliente Anónimo',
        criado_em: now,
      }]);

      await supabase.from('chat_sessoes').upsert([{
        id: msg.sessionId,
        nome_cliente: msg.clientName || 'Cliente Anónimo',
        ultima_mensagem: msg.text,
        ultimo_timestamp: now,
        estado: msg.sender === 'user' ? 'bot' : 'active',
      }], { onConflict: 'id' });
    } catch (error) {
      console.warn('Supabase sendChatMessage failed (using local fallback):', error);
    }
  }, []);

  const requestAgent = useCallback(async (sessionId: string, clientName: string, email?: string, phone?: string) => {
    const now = new Date().toISOString();

    // Optimistic local update
    setState(prev => {
      const existing = prev.chatSessions.find(s => s.id === sessionId);
      const updatedSession: ChatSession = {
        id: sessionId,
        clientName,
        clientEmail: email || '',
        clientPhone: phone || '',
        lastMessage: 'Pedido de falar com atendente iniciado.',
        lastTimestamp: now,
        status: 'waiting',
        unreadByAgent: true,
        unreadByClient: existing?.unreadByClient,
      };
      const others = prev.chatSessions.filter(s => s.id !== sessionId);
      const sysMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        sender: 'bot',
        text: 'Aguarde um momento. Um atendente irá entrar na conversa em breve... 👩‍🍳✨',
        timestamp: now,
        clientName,
      };
      return { ...prev, chatSessions: [updatedSession, ...others], chatMessages: [...prev.chatMessages, sysMsg] };
    });

    // Firestore (best-effort)
    try {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await setDoc(sessionRef, {
        id: sessionId,
        clientName,
        clientEmail: email || '',
        clientPhone: phone || '',
        lastMessage: 'Pedido de falar com atendente iniciado.',
        lastTimestamp: now,
        status: 'waiting',
        unreadByAgent: true,
      }, { merge: true });

      await addDoc(collection(db, 'chat_messages'), {
        id: crypto.randomUUID(),
        sessionId,
        sender: 'bot',
        text: 'Aguarde um momento. Um atendente irá entrar na conversa em breve... 👩‍🍳✨',
        timestamp: now,
        clientName,
      });
    } catch (error) {
      console.warn('Firestore requestAgent failed:', error);
    }

    // Supabase (best-effort, permanent storage)
    try {
      await supabase.from('chat_sessoes').upsert([{
        id: sessionId,
        nome_cliente: clientName,
        email: email || '',
        telefone: phone || '',
        ultima_mensagem: 'Pedido de falar com atendente iniciado.',
        ultimo_timestamp: now,
        estado: 'waiting',
      }], { onConflict: 'id' });

      await supabase.from('chat_mensagens').insert([{
        sessao_id: sessionId,
        remetente: 'bot',
        texto: 'Aguarde um momento. Um atendente irá entrar na conversa em breve... 👩‍🍳✨',
        nome_cliente: clientName,
        criado_em: now,
      }]);
    } catch (error) {
      console.warn('Supabase requestAgent failed:', error);
    }
  }, []);

  const replyAsAgent = useCallback(async (sessionId: string, text: string) => {
    const now = new Date().toISOString();
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      sender: 'agent',
      text,
      timestamp: now,
    };

    // Optimistic local update
    setState(prev => {
      const existing = prev.chatSessions.find(s => s.id === sessionId);
      const updatedSession: ChatSession = {
        id: sessionId,
        clientName: existing?.clientName || 'Cliente Anónimo',
        clientPhone: existing?.clientPhone,
        clientEmail: existing?.clientEmail,
        lastMessage: text,
        lastTimestamp: now,
        status: 'active',
        unreadByClient: true,
        unreadByAgent: false,
      };
      const others = prev.chatSessions.filter(s => s.id !== sessionId);
      return { ...prev, chatMessages: [...prev.chatMessages, message], chatSessions: [updatedSession, ...others] };
    });

    // Firestore (best-effort)
    try {
      await addDoc(collection(db, 'chat_messages'), message);
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await updateDoc(sessionRef, {
        lastMessage: text,
        lastTimestamp: now,
        status: 'active',
        unreadByClient: true,
        unreadByAgent: false,
      });
    } catch (error) {
      console.warn('Firestore replyAsAgent failed:', error);
    }

    // Supabase (best-effort, permanent storage)
    try {
      await supabase.from('chat_mensagens').insert([{
        sessao_id: sessionId,
        remetente: 'agent',
        texto: text,
        criado_em: now,
      }]);

      await supabase.from('chat_sessoes').upsert([{
        id: sessionId,
        ultima_mensagem: text,
        ultimo_timestamp: now,
        estado: 'active',
      }], { onConflict: 'id' });
    } catch (error) {
      console.warn('Supabase replyAsAgent failed:', error);
    }
  }, []);

  const closeChatSession = useCallback(async (sessionId: string) => {
    const now = new Date().toISOString();
    const closeMsg = 'Esta conversa foi encerrada pelo atendente. Se precisar de algo mais, sinta-se à vontade para reabrir ou iniciar um novo chat!';

    // Optimistic local update
    setState(prev => {
      const existing = prev.chatSessions.find(s => s.id === sessionId);
      const updatedSession: ChatSession = {
        id: sessionId,
        clientName: existing?.clientName || 'Cliente Anónimo',
        clientPhone: existing?.clientPhone,
        clientEmail: existing?.clientEmail,
        lastMessage: 'Conversa encerrada pelo atendente.',
        lastTimestamp: now,
        status: 'closed',
        unreadByClient: existing?.unreadByClient,
        unreadByAgent: existing?.unreadByAgent,
      };
      const others = prev.chatSessions.filter(s => s.id !== sessionId);
      const sysMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        sender: 'bot',
        text: closeMsg,
        timestamp: now,
      };
      return { ...prev, chatSessions: [updatedSession, ...others], chatMessages: [...prev.chatMessages, sysMsg] };
    });

    // Firestore (best-effort)
    try {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'closed',
        lastMessage: 'Conversa encerrada pelo atendente.',
        lastTimestamp: now,
      });

      await addDoc(collection(db, 'chat_messages'), {
        id: crypto.randomUUID(),
        sessionId,
        sender: 'bot',
        text: closeMsg,
        timestamp: now,
      });
    } catch (error) {
      console.warn('Firestore closeChatSession failed:', error);
    }

    // Supabase (best-effort, permanent storage)
    try {
      await supabase.from('chat_sessoes').upsert([{
        id: sessionId,
        ultima_mensagem: 'Conversa encerrada pelo atendente.',
        ultimo_timestamp: now,
        estado: 'closed',
      }], { onConflict: 'id' });

      await supabase.from('chat_mensagens').insert([{
        sessao_id: sessionId,
        remetente: 'bot',
        texto: closeMsg,
        criado_em: now,
      }]);
    } catch (error) {
      console.warn('Supabase closeChatSession failed:', error);
    }
  }, []);

  const markChatReadByAgent = useCallback(async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await updateDoc(sessionRef, { unreadByAgent: false });
    } catch (error) {
      console.error('Error marking chat read by agent:', error);
    }
  }, []);

  const markChatReadByClient = useCallback(async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await updateDoc(sessionRef, { unreadByClient: false });
    } catch (error) {
      console.error('Error marking chat read by client:', error);
    }
  }, []);

  // ===== ADMIN =====
  const adminLogin = useCallback((username: string, password: string) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => setIsAdminLoggedIn(false), []);

  return (
    <AppContext.Provider value={{
      state, loading: authLoading,
      addOrder, findOrderByCode, updateOrderStatus, addOrderNote, getOrdersByClient, runSupabaseDiagnosticTest,
      registerClient, loginClient, loginWithGoogle, loginAsGuest, recoverPassword, logoutClient, updateClient: updateClientProfile,
      addMessage, markMessageRead,
      addTestimonial,
      sendChatMessage, requestAgent, replyAsAgent, closeChatSession, markChatReadByAgent, markChatReadByClient,
      currentClient, firebaseUser, authLoading,
      isAdminLoggedIn, adminLogin, adminLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
