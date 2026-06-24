import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { countries, parsePhoneNumber } from '../utils/countries';

const MANAGEMENT_PHONE = '244927718735';
const MANAGEMENT_EMAIL = 'ggsuportes@gmai.com';

interface ContactFormState {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

function buildContactMessage(data: { name: string; phone: string; email: string; subject: string; message: string }) {
  return [
    `📩 *NOVA MENSAGEM*`,
    '',
    `👤 *Nome:* ${data.name}`,
    `📞 *Telefone:* ${data.phone}`,
    `✉️ *E-mail:* ${data.email}`,
    '',
    `📌 *Assunto:* ${data.subject}`,
    '',
    `💬 *Mensagem:*`,
    data.message,
    '',
    `⏰ ${new Date().toLocaleString('pt-PT')}`,
  ].join('\n');
}

export default function Contact() {
  const { addMessage } = useApp();

  const getInitialState = (): ContactFormState => {
    const draft = localStorage.getItem('mundodedoces_contact_draft');
    if (draft) {
      try { return JSON.parse(draft); } catch { /* ignore */ }
    }
    const savedProfile = localStorage.getItem('mundodedoces_saved_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        const { localNumber } = parsePhoneNumber(profile.phone || '');
        return {
          name: profile.clientName || '',
          phone: localNumber,
          email: profile.email || '',
          subject: '',
          message: '',
        };
      } catch { /* ignore */ }
    }
    return { name: '', phone: '', email: '', subject: '', message: '' };
  };

  const getInitialCountryCode = (): string => {
    const draft = localStorage.getItem('mundodedoces_contact_draft');
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
    return '+244'; // Default to Angola
  };

  const [form, setForm] = useState<ContactFormState>(getInitialState);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(getInitialCountryCode);
  const [submitted, setSubmitted] = useState(false);
  const [contactData, setContactData] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [wasAutoFilled, setWasAutoFilled] = useState(false);

  // Auto-save draft on change
  useEffect(() => {
    localStorage.setItem('mundodedoces_contact_draft', JSON.stringify(form));
  }, [form]);

  // Check auto-fill status
  useEffect(() => {
    const savedProfile = localStorage.getItem('mundodedoces_saved_profile');
    if (savedProfile && !localStorage.getItem('mundodedoces_contact_draft')) {
      setWasAutoFilled(true);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const clearDraft = () => {
    localStorage.removeItem('mundodedoces_contact_draft');
    setForm({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    });
    setSelectedCountryCode('+244');
    setWasAutoFilled(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome obrigatório';
    if (!form.phone.trim()) errs.phone = 'Telefone obrigatório';
    if (!form.email.trim()) errs.email = 'E-mail obrigatório';
    if (!form.subject.trim()) errs.subject = 'Assunto obrigatório';
    if (!form.message.trim()) errs.message = 'Mensagem obrigatória';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Combine country code and raw phone number
    const combinedPhone = `${selectedCountryCode} ${form.phone.trim()}`;

    try {
      await addMessage({
        name: form.name,
        phone: combinedPhone,
        email: form.email,
        subject: form.subject,
        message: form.message,
      });
      
      // Save profile details for next time
      localStorage.setItem(
        'mundodedoces_saved_profile',
        JSON.stringify({ clientName: form.name, phone: combinedPhone, email: form.email })
      );

      // Clear draft
      localStorage.removeItem('mundodedoces_contact_draft');

      const msg = buildContactMessage({
        ...form,
        phone: combinedPhone,
      });
      setContactData(msg);
      setSubmitted(true);

      // Auto-enviar para a gestão via WhatsApp
      const waMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/${MANAGEMENT_PHONE}?text=${waMsg}`, '_blank');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  const sendViaWhatsApp = () => {
    const waMsg = encodeURIComponent(contactData);
    window.open(`https://wa.me/${MANAGEMENT_PHONE}?text=${waMsg}`, '_blank');
  };

  const sendViaEmail = () => {
    const subject = encodeURIComponent(form.subject);
    const body = encodeURIComponent(contactData);
    window.open(`mailto:${MANAGEMENT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mensagem Enviada!</h2>
          <p className="text-gray-500 mb-2">
            A sua mensagem foi enviada com sucesso para a nossa gestão.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
            <Send className="w-4 h-4 inline mr-1" />
            Já enviámos a sua mensagem via WhatsApp. A gestão irá responder brevemente.
          </div>

          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-3">Reenviar mensagem:</p>
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

          <p className="text-xs text-gray-400">
            Para respostas mais rápidas, fale connosco diretamente pelo WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Auto-filled Notification Banner */}
          {wasAutoFilled && (
            <div className="mb-6 max-w-4xl mx-auto bg-rosa-50 border border-rosa-100 rounded-2xl p-4 flex items-center justify-between text-sm text-rosa-600 animate-fade-in">
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
          {!wasAutoFilled && localStorage.getItem('mundodedoces_contact_draft') && (
            <div className="mb-6 max-w-4xl mx-auto bg-dourado-50 border border-dourado-100 rounded-2xl p-4 flex items-center justify-between text-sm text-dourado-700 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dourado-500" />
                <span>Recuperámos o rascunho da sua mensagem anterior para não perder o seu progresso!</span>
              </div>
              <button
                onClick={clearDraft}
                className="text-xs font-semibold text-dourado-800 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Começar do zero
              </button>
            </div>
          )}

          <div className="text-center mb-10">
            <span className="text-rosa-500 font-semibold text-sm uppercase tracking-wider">Contato</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Falar com a Gestão
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Tem dúvidas, sugestões ou deseja um orçamento personalizado?
              Envie uma mensagem — será entregue diretamente à nossa gestão.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              <a
                href="https://wa.me/244927718735"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-rosa-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-rosa-50 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-rosa-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Telefone / WhatsApp</h3>
                <p className="text-gray-500 text-sm">+244 927 718 735</p>
              </a>
              <a
                href="mailto:ggsuportes@gmai.com"
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-dourado-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-dourado-50 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-dourado-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">E-mail</h3>
                <p className="text-gray-500 text-sm">ggsuportes@gmai.com</p>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Luanda,Angola"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Localização</h3>
                <p className="text-gray-500 text-sm">Luanda, Angola</p>
              </a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                      placeholder="Seu nome"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assunto *</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors`}
                    placeholder="Assunto da mensagem"
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm transition-colors resize-none`}
                    placeholder="Escreva a sua mensagem..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-lg shadow-rosa-200 transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" /> Enviar para a Gestão
                </button>

                <p className="text-xs text-gray-400 text-center">
                  A mensagem será enviada diretamente para a nossa gestão via WhatsApp.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
