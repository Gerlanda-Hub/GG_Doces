import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Upload, ClipboardCheck, Send, Mail, Sparkles, Trash2, Check, Plus, Minus, Info, Camera, MapPin, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { countries, parsePhoneNumber } from '../utils/countries';
import { takePhoto, getCurrentLocation, isNative } from '../utils/nativeFeatures';

const MANAGEMENT_PHONE = '244927718735';
const MANAGEMENT_EMAIL = 'ggsuportes@gmai.com';

interface ServiceConfig {
  id: string;
  icon: string;
  title: string;
  desc: string;
  min: number;
  step: number;
  unit: string;
}

const serviceTypes: ServiceConfig[] = [
  { id: 'Bolo de Aniversário', icon: '🎂', title: 'Bolo de Aniversário', desc: 'Bolos personalizados criados com designs únicos e sabores irresistíveis.', min: 1, step: 1, unit: 'unidade(s)' },
  { id: 'Bolo de Noivado', icon: '💍', title: 'Bolo de Noivado', desc: 'Elegância e sofisticação para marcar o início de uma nova jornada a dois.', min: 1, step: 1, unit: 'unidade(s)' },
  { id: 'Cupcakes', icon: '🧁', title: 'Cupcakes', desc: 'Cupcakes deliciosamente decorados e personalizados (mínimo de 6 unidades).', min: 6, step: 6, unit: 'unidades' },
  { id: 'Doces', icon: '🍬', title: 'Doces Finos & Tradicionais', desc: 'Brigadeiros gourmet, trufas e docinhos variados (cento ou frações de 25).', min: 25, step: 25, unit: 'unidades' },
  { id: 'Salgados', icon: '🥟', title: 'Salgados Finos', desc: 'Salgados sequinhos e saborosos para festas (frações de 25 unidades).', min: 25, step: 25, unit: 'unidades' },
];

interface OrderFormState {
  clientName: string;
  phone: string;
  email: string;
  eventDate: string;
  guestCount: string;
  eventLocation: string;
  notes: string;
  selectedServices: Record<string, number>; // key: serviceId, value: quantity
}

interface ServiceCustomizations {
  // Cakes
  cakeMassa?: string;
  cakeRecheio?: string;
  // Cupcakes
  cupcakeMassa?: string;
  cupcakeCobertura?: string;
  // Doces
  selectedDoces?: string[];
  // Salgados
  selectedSalgados?: string[];
}

const customizationOptions = {
  cakeMassas: ['Chocolate', 'Baunilha', 'Cenoura', 'Red Velvet', 'Pão de Ló'],
  cakeRecheios: ['Brigadeiro', 'Doce de Leite', 'Prestígio', 'Ninho', 'Frutas Vermelhas'],
  cupcakeMassas: ['Chocolate', 'Baunilha', 'Red Velvet'],
  cupcakeCoberturas: ['Chantininho', 'Brigadeiro', 'Buttercream'],
  docesFlavors: ['Brigadeiro Tradicional', 'Beijinho', 'Brigadeiro de Ninho', 'Trufas de Chocolate', 'Camafeu de Nozes'],
  salgadosFlavors: ['Coxinha de Frango', 'Rissóis de Camarão', 'Bolinhas de Queijo', 'Pastel de Bacalhau', 'Croquetes de Carne'],
};

function buildOrderMessage(data: {
  orderNumber: string;
  clientName: string;
  phone: string;
  email: string;
  servicesFormatted: string;
  eventDate: string;
  guestCount: number;
  eventLocation: string;
  notes: string;
}) {
  return [
    `🆕 *NOVA ENCOMENDA MÚLTIPLA* — ${data.orderNumber}`,
    '',
    `👤 *Cliente:* ${data.clientName}`,
    `📞 *Telefone:* ${data.phone}`,
    `✉️ *E-mail:* ${data.email}`,
    '',
    `📦 *Pedidos Selecionados:*`,
    data.servicesFormatted,
    '',
    `📅 *Data do Evento:* ${new Date(data.eventDate).toLocaleDateString('pt-PT')}`,
    `👥 *Convidados:* ${data.guestCount}`,
    `📍 *Local:* ${data.eventLocation ? data.eventLocation : 'Não informado (a combinar)'}`,
    data.notes ? `📝 *Observações / Personalizações:* \n${data.notes}` : '',
    '',
    `⏰ Recebida em: ${new Date().toLocaleString('pt-PT')}`,
    '',
    `💡 *Painel Admin:* acompanhe no site em /admin`,
  ].filter(Boolean).join('\n');
}

export default function OrderForm() {
  const { addOrder, currentClient } = useApp();

  // Load initial form data (checking drafts first, then saved profile details)
  const getInitialState = (): OrderFormState => {
    const draft = localStorage.getItem('mundodedoces_order_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return {
          clientName: parsed.clientName || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          eventDate: parsed.eventDate || '',
          guestCount: parsed.guestCount || '',
          eventLocation: parsed.eventLocation || '',
          notes: parsed.notes || '',
          selectedServices: parsed.selectedServices || {},
        };
      } catch { /* ignore */ }
    }
    const savedProfile = localStorage.getItem('mundodedoces_saved_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const { localNumber } = parsePhoneNumber(profile.phone || '');
        return {
          clientName: profile.clientName || '',
          phone: localNumber,
          email: profile.email || '',
          eventDate: '',
          guestCount: '',
          eventLocation: '',
          notes: '',
          selectedServices: {},
        };
      } catch { /* ignore */ }
    }
    const clientPhone = currentClient?.phone || '';
    const { localNumber } = parsePhoneNumber(clientPhone);
    return {
      clientName: currentClient?.name || '',
      phone: localNumber,
      email: currentClient?.email || '',
      eventDate: '',
      guestCount: '',
      eventLocation: '',
      notes: '',
      selectedServices: {},
    };
  };

  // Determine initial country code
  const getInitialCountryCode = (): string => {
    const draft = localStorage.getItem('mundodedoces_order_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const { dialCode } = parsePhoneNumber(parsed.phone || '');
        return dialCode;
      } catch { /* ignore */ }
    }
    const savedProfile = localStorage.getItem('mundodedoces_saved_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const { dialCode } = parsePhoneNumber(profile.phone || '');
        return dialCode;
      } catch { /* ignore */ }
    }
    const clientPhone = currentClient?.phone || '';
    const { dialCode } = parsePhoneNumber(clientPhone);
    return dialCode;
  };

  const [form, setForm] = useState<OrderFormState>(getInitialState);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(getInitialCountryCode);
  const [customizations, setCustomizations] = useState<ServiceCustomizations>({
    cakeMassa: 'Chocolate',
    cakeRecheio: 'Brigadeiro',
    cupcakeMassa: 'Chocolate',
    cupcakeCobertura: 'Brigadeiro',
    selectedDoces: [],
    selectedSalgados: [],
  });
  const [imageRef, setImageRef] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState<ReturnType<typeof buildOrderMessage> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasAutoFilled, setWasAutoFilled] = useState(false);

  // Auto-save draft on form change
  useEffect(() => {
    localStorage.setItem('mundodedoces_order_draft', JSON.stringify(form));
  }, [form]);

  // Check if details were auto-filled to show a friendly notification
  useEffect(() => {
    const savedProfile = localStorage.getItem('mundodedoces_saved_profile');
    if (savedProfile && !localStorage.getItem('mundodedoces_order_draft')) {
      setWasAutoFilled(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleToggleService = (service: ServiceConfig) => {
    setForm(prev => {
      const updated = { ...prev.selectedServices };
      if (updated[service.id]) {
        delete updated[service.id]; // Deselect if already active
      } else {
        updated[service.id] = service.min; // Select with default minimum quantity
      }
      return { ...prev, selectedServices: updated };
    });
    if (errors.serviceType) setErrors(prev => { const n = { ...prev }; delete n.serviceType; return n; });
  };

  const handleAdjustQuantity = (service: ServiceConfig, delta: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling/deselecting the card
    setForm(prev => {
      const updated = { ...prev.selectedServices };
      const currentQty = updated[service.id] || 0;
      const newQty = currentQty + (delta * service.step);
      
      if (newQty < service.min) {
        delete updated[service.id]; // Remove if goes below minimum
      } else {
        updated[service.id] = newQty;
      }
      
      return { ...prev, selectedServices: updated };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Imagem deve ter menos de 5MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageRef(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 📷 Tirar foto com a câmara nativa do telemóvel
  const handleTakePhoto = async () => {
    const dataUrl = await takePhoto();
    if (dataUrl) setImageRef(dataUrl);
  };

  // 📍 Preencher localização automaticamente via GPS
  const [locating, setLocating] = useState(false);
  const handleUseMyLocation = async () => {
    setLocating(true);
    const address = await getCurrentLocation();
    setLocating(false);
    if (address) {
      setForm(prev => ({ ...prev, eventLocation: address }));
    } else {
      alert('Não foi possível obter a sua localização. Verifique as permissões de GPS.');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('mundodedoces_order_draft');
    setForm({
      clientName: '',
      phone: '',
      email: '',
      eventDate: '',
      guestCount: '',
      eventLocation: '',
      notes: '',
      selectedServices: {},
    });
    setSelectedCountryCode('+244'); // Reset to default Angola
    setCustomizations({
      cakeMassa: 'Chocolate',
      cakeRecheio: 'Brigadeiro',
      cupcakeMassa: 'Chocolate',
      cupcakeCobertura: 'Brigadeiro',
      selectedDoces: [],
      selectedSalgados: [],
    });
    setWasAutoFilled(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.clientName.trim()) errs.clientName = 'Nome obrigatório';
    if (!form.phone.trim()) errs.phone = 'Telefone obrigatório';
    if (!form.email.trim()) errs.email = 'E-mail obrigatório';
    
    const selectedCount = Object.keys(form.selectedServices).length;
    if (selectedCount === 0) {
      errs.serviceType = 'Selecione pelo menos um serviço e defina a quantidade';
    }
    
    if (!form.eventDate) errs.eventDate = 'Data do evento obrigatória';
    if (!form.guestCount || Number(form.guestCount) < 1) errs.guestCount = 'Número de convidados inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Toggle multi-select chips for sweets and savories
  const handleToggleDocesFlavor = (flavor: string) => {
    setCustomizations(prev => {
      const list = prev.selectedDoces || [];
      const updated = list.includes(flavor)
        ? list.filter(f => f !== flavor)
        : [...list, flavor];
      return { ...prev, selectedDoces: updated };
    });
  };

  const handleToggleSalgadosFlavor = (flavor: string) => {
    setCustomizations(prev => {
      const list = prev.selectedSalgados || [];
      const updated = list.includes(flavor)
        ? list.filter(f => f !== flavor)
        : [...list, flavor];
      return { ...prev, selectedSalgados: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Combine country code and phone number for storage/message
    const combinedPhone = `${selectedCountryCode} ${form.phone.trim()}`;

    // Format selected services string: e.g. "Bolo de Aniversário (1x), Cupcakes (12x)"
    const servicesFormatted = Object.entries(form.selectedServices)
      .map(([id, qty]) => {
        const config = serviceTypes.find(s => s.id === id);
        return `• ${id}: ${qty} ${config?.unit || 'unidade(s)'}`;
      })
      .join('\n');

    // Compile custom options to append beautifully to notes/observações
    const customizationTexts: string[] = [];
    if (form.selectedServices['Bolo de Aniversário'] || form.selectedServices['Bolo de Noivado']) {
      customizationTexts.push(`🎂 *Opções do Bolo:* Massa de ${customizations.cakeMassa}, Recheio de ${customizations.cakeRecheio}`);
    }
    if (form.selectedServices['Cupcakes']) {
      customizationTexts.push(`🧁 *Opções de Cupcakes:* Massa de ${customizations.cupcakeMassa}, Cobertura de ${customizations.cupcakeCobertura}`);
    }
    if (form.selectedServices['Doces'] && customizations.selectedDoces && customizations.selectedDoces.length > 0) {
      customizationTexts.push(`🍬 *Opções de Doces:* ${customizations.selectedDoces.join(', ')}`);
    }
    if (form.selectedServices['Salgados'] && customizations.selectedSalgados && customizations.selectedSalgados.length > 0) {
      customizationTexts.push(`🥟 *Opções de Salgados:* ${customizations.selectedSalgados.join(', ')}`);
    }

    const finalNotes = [
      customizationTexts.join('\n'),
      form.notes ? `📝 Outras observações: ${form.notes}` : ''
    ].filter(Boolean).join('\n\n');

    const serviceTypeSummary = Object.entries(form.selectedServices)
      .map(([id, qty]) => `${id} (${qty}x)`)
      .join(', ');

    try {
      const order = await addOrder({
        clientName: form.clientName,
        phone: combinedPhone,
        email: form.email,
        serviceType: serviceTypeSummary,
        eventDate: form.eventDate,
        guestCount: Number(form.guestCount),
        eventLocation: form.eventLocation,
        notes: finalNotes,
        imageRef,
        userId: currentClient?.id,
      });

      const msg = buildOrderMessage({
        orderNumber: order.orderNumber,
        clientName: form.clientName,
        phone: combinedPhone,
        email: form.email,
        servicesFormatted,
        eventDate: form.eventDate,
        guestCount: Number(form.guestCount),
        eventLocation: form.eventLocation,
        notes: finalNotes,
      });

      // Save user profile details for next time (facilitates next orders/contacts)
      localStorage.setItem(
        'mundodedoces_saved_profile',
        JSON.stringify({ clientName: form.clientName, phone: combinedPhone, email: form.email })
      );

      // Register this order code on this device (for push notifications on status change)
      try {
        const myCodes: string[] = JSON.parse(localStorage.getItem('mundodedoces_my_orders') || '[]');
        if (!myCodes.includes(order.orderNumber)) {
          myCodes.push(order.orderNumber);
          localStorage.setItem('mundodedoces_my_orders', JSON.stringify(myCodes));
        }
      } catch { /* ignore */ }

      // Clear draft upon successful submission
      localStorage.removeItem('mundodedoces_order_draft');

      setOrderNumber(order.orderNumber);
      setOrderData(msg);
      setSubmitted(true);

      // Auto-enviar para a gestão via WhatsApp
      const waMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${MANAGEMENT_PHONE}?text=${waMsg}`, '_blank');
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`Erro ao criar encomenda: ${error?.message || error?.details || JSON.stringify(error) || 'Erro de rede/Supabase'}`);
    }
  };

  const sendViaEmail = () => {
    if (!orderData) return;
    const subject = encodeURIComponent(`Nova Encomenda Múltipla — ${orderNumber}`);
    const body = encodeURIComponent(orderData);
    window.open(`mailto:${MANAGEMENT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  const sendViaWhatsApp = () => {
    if (!orderData) return;
    const waMsg = encodeURIComponent(orderData);
    window.open(`https://wa.me/${MANAGEMENT_PHONE}?text=${waMsg}`, '_blank');
  };

  // Date limit: only allow tomorrow onwards
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const hasCakesSelected = !!(form.selectedServices['Bolo de Aniversário'] || form.selectedServices['Bolo de Noivado']);
  const hasCupcakesSelected = !!form.selectedServices['Cupcakes'];
  const hasDocesSelected = !!form.selectedServices['Doces'];
  const hasSalgadosSelected = !!form.selectedServices['Salgados'];
  const hasAnyCustomizableSelected = hasCakesSelected || hasCupcakesSelected || hasDocesSelected || hasSalgadosSelected;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Encomenda Registada!</h2>
          <p className="text-gray-500 mb-2">
            A sua encomenda foi recebida e enviada para a gestão.
          </p>

          {/* Status de envio */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
            <Send className="w-4 h-4 inline mr-1" />
            Já enviámos os dados para a gestão via WhatsApp. A nossa equipa irá entrar em contacto brevemente.
          </div>

          <div className="bg-rosa-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Número da Encomenda</p>
            <p className="text-2xl font-bold text-rosa-600 font-mono tracking-wider">{orderNumber}</p>
            <p className="text-xs text-gray-400 mt-2">Guarde este número para acompanhar o estado da sua encomenda.</p>
          </div>

          {/* Reenviar opções */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-3">Reenviar dados para a gestão:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={sendViaWhatsApp}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> WhatsApp
              </button>
              <button
                onClick={sendViaEmail}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-gray-700 text-white hover:bg-gray-800 shadow-md transition-all flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> E-mail
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/cliente"
              className="px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md transition-all"
            >
              <ClipboardCheck className="w-4 h-4 inline mr-1" /> Acompanhar Encomenda
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-full text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Auto-filled Notification Banner */}
          {wasAutoFilled && (
            <div className="mb-6 bg-rosa-50 border border-rosa-100 rounded-2xl p-4 flex items-center justify-between text-sm text-rosa-600 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rosa-500 animate-pulse" />
                <span>Preenchemos automaticamente o seu Nome, Telefone e E-mail com os seus dados habituais!</span>
              </div>
              <button
                onClick={clearDraft}
                className="p-1 rounded-lg hover:bg-rosa-100 text-rosa-500 transition-colors"
                title="Limpar formulário"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Draft Notification Banner */}
          {!wasAutoFilled && localStorage.getItem('mundodedoces_order_draft') && (
            <div className="mb-6 bg-dourado-50 border border-dourado-100 rounded-2xl p-4 flex items-center justify-between text-sm text-dourado-700 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dourado-500" />
                <span>Recuperámos o rascunho da sua encomenda anterior para não perder o seu progresso!</span>
              </div>
              <button
                onClick={clearDraft}
                className="text-xs font-semibold text-dourado-800 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Começar do zero
              </button>
            </div>
          )}

          <div className="text-center mb-8">
            <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Encomendar</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Fazer Encomenda
            </h1>
            <p className="text-gray-500">
              Preencha o formulário abaixo para solicitar a sua encomenda. Os dados serão enviados
              diretamente para a nossa gestão.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Dados Pessoais</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.clientName ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                  placeholder="Seu nome completo"
                />
                {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <div className="flex gap-2">
                    {/* Country Dial Code Selector */}
                    <div className="relative flex-shrink-0 w-32">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="w-full h-full px-3 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white cursor-pointer"
                      >
                        {countries.map((c) => (
                          <option key={`${c.name}-${c.code}`} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Raw Phone Number Input */}
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                      placeholder="9XX XXX XXX"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Beautiful Custom Service Card Selection with Multiple Choices and Quantities */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-lg">Selecione os Serviços *</h3>
                {errors.serviceType && <p className="text-red-500 text-xs font-semibold">{errors.serviceType}</p>}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Pode selecionar **vários serviços ao mesmo tempo** e definir a quantidade desejada de cada um:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceTypes.map(s => {
                  const qty = form.selectedServices[s.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleService(s)}
                      className={`relative cursor-pointer rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between group min-h-[170px] shadow-sm ${
                        isSelected
                          ? 'border-rosa-500 bg-rosa-50/20 shadow-md shadow-rosa-100'
                          : 'border-gray-200 hover:border-rosa-200 hover:shadow-md hover:bg-rosa-50/5'
                      }`}
                    >
                      {/* Checkmark badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-rosa-500 text-white flex items-center justify-center shadow-md animate-fade-in">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      
                      <div>
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">
                          {s.icon}
                        </div>
                        <h4 className={`font-semibold text-sm transition-colors ${
                          isSelected ? 'text-rosa-600 font-bold' : 'text-gray-800 group-hover:text-rosa-500'
                        }`}>
                          {s.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {s.desc}
                        </p>
                      </div>

                      {/* Quantity Controller (Only shown when selected) */}
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-rosa-100 flex items-center justify-between animate-fade-in">
                          <span className="text-xs font-semibold text-rosa-600">Quantidade:</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleAdjustQuantity(s, -1, e)}
                              className="w-8 h-8 rounded-lg bg-white border border-rosa-200 hover:bg-rosa-50 text-rosa-500 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                              title="Diminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-gray-800 min-w-[45px] text-center">
                              {qty} <span className="text-[10px] text-gray-400 font-normal">{s.unit}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleAdjustQuantity(s, 1, e)}
                              className="w-8 h-8 rounded-lg bg-white border border-rosa-200 hover:bg-rosa-50 text-rosa-500 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                              title="Aumentar"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Personalization & Taste Customization Options Section */}
            {hasAnyCustomizableSelected && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 animate-fade-in shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Sparkles className="w-5 h-5 text-rosa-500 animate-pulse" />
                  <h3 className="font-semibold text-gray-850 text-lg">Personalização dos Sabores e Opções</h3>
                </div>

                {/* 1. Cake Customization (Aniversário or Noivado) */}
                {hasCakesSelected && (
                  <div className="space-y-4 border-b border-gray-50 pb-4">
                    <h4 className="font-semibold text-sm text-rosa-600 flex items-center gap-1.5">
                      🎂 Opções para os Bolos
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Massa Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Escolha a Massa:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {customizationOptions.cakeMassas.map(massa => (
                            <button
                              type="button"
                              key={massa}
                              onClick={() => setCustomizations(prev => ({ ...prev, cakeMassa: massa }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                customizations.cakeMassa === massa
                                  ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                              }`}
                            >
                              {massa}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Recheio Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Escolha o Recheio:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {customizationOptions.cakeRecheios.map(recheio => (
                            <button
                              type="button"
                              key={recheio}
                              onClick={() => setCustomizations(prev => ({ ...prev, cakeRecheio: recheio }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                customizations.cakeRecheio === recheio
                                  ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                              }`}
                            >
                              {recheio}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Cupcakes Customization */}
                {hasCupcakesSelected && (
                  <div className="space-y-4 border-b border-gray-50 pb-4">
                    <h4 className="font-semibold text-sm text-rosa-600 flex items-center gap-1.5">
                      🧁 Opções para Cupcakes
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Cupcake Massa Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Massa do Cupcake:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {customizationOptions.cupcakeMassas.map(massa => (
                            <button
                              type="button"
                              key={massa}
                              onClick={() => setCustomizations(prev => ({ ...prev, cupcakeMassa: massa }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                customizations.cupcakeMassa === massa
                                  ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                              }`}
                            >
                              {massa}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Cupcake Cobertura Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">Cobertura do Cupcake:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {customizationOptions.cupcakeCoberturas.map(cobertura => (
                            <button
                              type="button"
                              key={cobertura}
                              onClick={() => setCustomizations(prev => ({ ...prev, cupcakeCobertura: cobertura }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                customizations.cupcakeCobertura === cobertura
                                  ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                              }`}
                            >
                              {cobertura}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Doces Customization (Multi-select) */}
                {hasDocesSelected && (
                  <div className="space-y-3 border-b border-gray-50 pb-4">
                    <h4 className="font-semibold text-sm text-rosa-600 flex items-center gap-1.5">
                      🍬 Sabores de Doces Desejados
                    </h4>
                    <p className="text-[11px] text-gray-400">Pode selecionar vários sabores. O cento pode ser misto:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {customizationOptions.docesFlavors.map(flavor => {
                        const isDocesSelected = customizations.selectedDoces?.includes(flavor);
                        return (
                          <button
                            type="button"
                            key={flavor}
                            onClick={() => handleToggleDocesFlavor(flavor)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                              isDocesSelected
                                ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm font-semibold'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                            }`}
                          >
                            {isDocesSelected && <Check className="w-3 h-3" />}
                            {flavor}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Salgados Customization (Multi-select) */}
                {hasSalgadosSelected && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-rosa-600 flex items-center gap-1.5">
                      🥟 Tipos de Salgados Desejados
                    </h4>
                    <p className="text-[11px] text-gray-400">Pode selecionar vários tipos. O cento pode ser misto:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {customizationOptions.salgadosFlavors.map(flavor => {
                        const isSalgadosSelected = customizations.selectedSalgados?.includes(flavor);
                        return (
                          <button
                            type="button"
                            key={flavor}
                            onClick={() => handleToggleSalgadosFlavor(flavor)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                              isSalgadosSelected
                                ? 'bg-rosa-500 text-white border-rosa-500 shadow-sm font-semibold'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-rosa-300'
                            }`}
                          >
                            {isSalgadosSelected && <Check className="w-3 h-3" />}
                            {flavor}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 bg-dourado-50/50 border border-dourado-100/40 rounded-xl p-3 text-xs text-dourado-800">
                  <Info className="w-4 h-4 text-dourado-600 flex-shrink-0 mt-0.5" />
                  <p>As preferências de sabores selecionadas acima serão enviadas de forma clara juntamente com a sua encomenda para que a nossa equipa as possa produzir exatamente como deseja.</p>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Detalhes do Evento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Evento *</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    min={getTomorrowDate()}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.eventDate ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                  />
                  {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Convidados *</label>
                  <input
                    type="number"
                    name="guestCount"
                    value={form.guestCount}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.guestCount ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                    placeholder="Número estimado"
                  />
                  {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local do Evento (opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="eventLocation"
                    value={form.eventLocation}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors"
                    placeholder="Morada do evento"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    title="Usar a minha localização atual"
                    className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-rosa-200 text-rosa-500 hover:bg-rosa-50 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-60"
                  >
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    <span className="hidden sm:inline">{locating ? 'A localizar...' : 'GPS'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Informações Adicionais</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors resize-none"
                  placeholder="Descreva as suas preferências, sabores, cores, temas..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Referência (opcional)</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-rosa-300 hover:bg-rosa-50/30 transition-colors text-sm text-gray-500">
                    <Upload className="w-4 h-4" />
                    Escolher Imagem
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {isNative() && (
                    <button
                      type="button"
                      onClick={handleTakePhoto}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-rosa-200 text-rosa-500 hover:bg-rosa-50 transition-colors text-sm font-medium"
                    >
                      <Camera className="w-4 h-4" />
                      Tirar Foto
                    </button>
                  )}
                  {imageRef && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img src={imageRef} alt="Referência" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageRef(null)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-bl-lg flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-lg shadow-rosa-200 transition-all duration-300 hover:shadow-xl"
            >
              Enviar Encomenda para a Gestão
            </button>

            <p className="text-xs text-gray-400 text-center">
              Ao enviar, os dados da encomenda serão enviados diretamente para a nossa gestão via WhatsApp,
              que entrará em contacto para confirmar os detalhes.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
