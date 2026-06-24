import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, LogIn, ArrowLeft, Loader2, UserCheck, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { countries } from '../utils/countries';

type Tab = 'login' | 'register' | 'recover' | 'guest';

export default function ClientLogin() {
  const navigate = useNavigate();
  const { loginClient, registerClient, loginWithGoogle, loginAsGuest, recoverPassword, currentClient, authLoading } = useApp();
  const [tab, setTab] = useState<Tab>('login');
  const [submitting, setSubmitting] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Recover form
  const [recEmail, setRecEmail] = useState('');
  const [recError, setRecError] = useState('');
  const [recSuccess, setRecSuccess] = useState('');

  // Guest form
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestError, setGuestError] = useState('');

  // Smartphone / SMS Auth states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+244');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsStep, setSmsStep] = useState<'phone' | 'otp'>('phone');
  const [smsError, setSmsError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for SMS resend
  useEffect(() => {
    let timer: any;
    if (smsStep === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [smsStep, countdown]);

  // If already logged in, redirect
  if (!authLoading && currentClient) {
    navigate('/cliente/painel', { replace: true });
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rosa-500 animate-spin" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    const result = await loginClient(loginEmail, loginPassword);
    setSubmitting(false);
    if (result.success) {
      navigate('/cliente/painel');
    } else {
      setLoginError(result.error || 'E-mail ou senha incorretos.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setRegError('');
    setSubmitting(true);
    const result = await loginWithGoogle();
    setSubmitting(false);
    if (result.success) {
      navigate('/cliente/painel');
    } else {
      setLoginError(result.error || 'Erro ao entrar com o Google.');
    }
  };

  const handleSendSmsCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');
    if (!phoneNumber.trim()) {
      setSmsError('Insira um número de telemóvel válido.');
      return;
    }
    setSmsLoading(true);
    
    // Simulate API delay for sending SMS OTP
    setTimeout(() => {
      setSmsLoading(false);
      setSmsStep('otp');
      setCountdown(60);
      console.log(`[SMS Auth] Código enviado para ${phoneCountryCode} ${phoneNumber}`);
    }, 1500);
  };

  const handleVerifySmsCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');
    if (smsCode.length < 6) {
      setSmsError('O código deve ter 6 dígitos.');
      return;
    }
    setSmsLoading(true);

    // Simulate OTP verification and login
    setTimeout(async () => {
      const fullPhone = `${phoneCountryCode} ${phoneNumber}`;
      // Log in as a guest/phone user in firebase auth
      const result = await loginAsGuest(`Utilizador ${phoneNumber.slice(-4)}`, `${phoneNumber}@telemovel.com`, fullPhone);
      setSmsLoading(false);
      if (result.success) {
        setShowPhoneModal(false);
        navigate('/cliente/painel');
      } else {
        setSmsError('Código inválido ou expirado. Tente novamente.');
      }
    }, 1500);
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setGuestError('Todos os campos são obrigatórios para acesso rápido.');
      return;
    }
    setSubmitting(true);
    const result = await loginAsGuest(guestName, guestEmail, guestPhone);
    setSubmitting(false);
    if (result.success) {
      navigate('/cliente/painel');
    } else {
      setGuestError(result.error || 'Erro ao entrar como Convidado.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError('Preencha todos os campos.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('As senhas não coincidem.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    const result = await registerClient(regName, regEmail, regPhone, regPassword);
    setSubmitting(false);
    if (result.success) {
      setRegSuccess('Conta criada com sucesso! Pode agora fazer login.');
      setTimeout(() => setTab('login'), 2000);
    } else {
      setRegError(result.error || 'Erro ao criar conta.');
    }
  };

  const handleRecover = async () => {
    setRecError('');
    setRecSuccess('');
    if (!recEmail.trim()) {
      setRecError('Insira o seu e-mail.');
      return;
    }
    setSubmitting(true);
    const result = await recoverPassword(recEmail);
    setSubmitting(false);
    if (result.success) {
      setRecSuccess('Email de recuperação enviado! Verifique a sua caixa de entrada.');
    } else {
      setRecError(result.error || 'Erro ao enviar email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-rosa-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
            {[
              { key: 'login' as Tab, label: 'Entrar', icon: LogIn },
              { key: 'register' as Tab, label: 'Criar Conta', icon: UserPlus },
              { key: 'guest' as Tab, label: 'Acesso Rápido', icon: UserCheck },
              { key: 'recover' as Tab, label: 'Recuperar', icon: EyeOff },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { 
                  setTab(key); 
                  setLoginError(''); 
                  setRegError(''); 
                  setRegSuccess(''); 
                  setRecError(''); 
                  setRecSuccess('');
                  setGuestError('');
                }}
                className={`flex-1 py-4 px-3 text-xs font-medium flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                  tab === key
                    ? 'text-rosa-600 border-b-2 border-rosa-500 bg-rosa-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Login */}
            {tab === 'login' && (
              <div className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Bem-vindo de volta!</h2>
                  <p className="text-sm text-gray-500">Entre com a sua conta para acompanhar as suas encomendas.</p>
                  {loginError && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{loginError}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm pr-10 bg-white"
                        placeholder="Sua senha"
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md shadow-rosa-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Entrar
                  </button>
                </form>

                {/* Social Login Section (Google + Smartphone/SMS) */}
                <div className="space-y-4 pt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative px-3 bg-white text-xs text-gray-400 uppercase tracking-wider">Ou aceda com</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Google Button with beautiful design */}
                    <button
                      onClick={handleGoogleLogin}
                      disabled={submitting}
                      className="py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-semibold text-gray-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>

                    {/* Smartphone / SMS Button with beautiful design */}
                    <button
                      onClick={() => {
                        setSmsError('');
                        setSmsStep('phone');
                        setPhoneNumber('');
                        setSmsCode('');
                        setShowPhoneModal(true);
                      }}
                      disabled={submitting}
                      className="py-3 px-4 border border-green-200 rounded-xl bg-green-50/20 hover:bg-green-50 text-sm font-semibold text-green-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98"
                    >
                      <Smartphone className="w-4.5 h-4.5 text-green-600" />
                      Telemóvel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Register */}
            {tab === 'register' && (
              <div className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">Criar Conta</h2>
                  <p className="text-sm text-gray-500">Registe-se para fazer encomendas e acompanhar os seus pedidos.</p>
                  {regError && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{regError}</div>
                  )}
                  {regSuccess && (
                    <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-200">{regSuccess}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="+244 9XX XXX XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="Mínimo 6 caracteres" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="Repita a senha" />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md shadow-rosa-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Criar Conta
                  </button>
                </form>

                {/* Social Login Options for registration */}
                <div className="space-y-4 pt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative px-3 bg-white text-xs text-gray-400 uppercase tracking-wider">Ou registe-se com</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={submitting}
                      className="py-3 px-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-semibold text-gray-600 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>

                    <button
                      onClick={() => {
                        setSmsError('');
                        setSmsStep('phone');
                        setPhoneNumber('');
                        setSmsCode('');
                        setShowPhoneModal(true);
                      }}
                      disabled={submitting}
                      className="py-3 px-4 border border-green-200 rounded-xl bg-green-50/20 hover:bg-green-50 text-sm font-semibold text-green-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98"
                    >
                      <Smartphone className="w-4.5 h-4.5 text-green-600" />
                      Telemóvel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Login (Acesso Rápido) */}
            {tab === 'guest' && (
              <form onSubmit={handleGuestLogin} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Acesso Rápido</h2>
                <p className="text-sm text-gray-500">Aceda instantaneamente sem senha para colocar ou acompanhar encomendas.</p>
                {guestError && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{guestError}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white"
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white"
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-md shadow-rosa-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Continuar como Convidado
                </button>
              </form>
            )}

            {/* Recover */}
            {tab === 'recover' && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Recuperar Senha</h2>
                <p className="text-sm text-gray-500">Insira o seu e-mail para receber um link de recuperação de senha.</p>
                {recError && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">{recError}</div>
                )}
                {recSuccess && (
                  <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-200">{recSuccess}</div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" value={recEmail} onChange={e => setRecEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-sm bg-white" placeholder="seu@email.com" />
                </div>
                <button
                  onClick={handleRecover}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-rosa-500 text-white hover:bg-rosa-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Enviar Link de Recuperação
                </button>
                <button onClick={() => setTab('login')} className="w-full text-sm text-rosa-500 hover:text-rosa-600 transition-colors py-2">
                  Voltar ao Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📱 SMARTPHONE / SMS AUTHENTICATION MODAL */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-150 shadow-2xl relative animate-fade-in-up">
            
            {/* Close Button */}
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-850">Acesso via Telemóvel</h3>
              <p className="text-xs text-gray-400 mt-1">
                {smsStep === 'phone' 
                  ? 'Introduza o seu número de telemóvel para receber o código SMS.'
                  : 'Introduza o código de 6 dígitos enviado para o seu telemóvel.'}
              </p>
            </div>

            {smsError && (
              <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl border border-red-200 mb-4 text-center">{smsError}</div>
            )}

            {/* Step 1: Phone Input */}
            {smsStep === 'phone' && (
              <form onSubmit={handleSendSmsCode} className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="w-24 px-2 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-xs bg-white cursor-pointer"
                  >
                    {countries.map(c => (
                      <option key={`${c.name}-${c.code}`} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="9XX XXX XXX"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={smsLoading}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md shadow-green-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  {smsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  Enviar Código SMS
                </button>
              </form>
            )}

            {/* Step 2: OTP Input */}
            {smsStep === 'otp' && (
              <form onSubmit={handleVerifySmsCode} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Inserir Código</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {countdown > 0 ? `Reenviar em ${countdown}s` : 'Pronto para reenviar'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rosa-300 focus:ring-2 focus:ring-rosa-100 outline-none text-center text-lg font-bold font-mono tracking-widest bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={smsLoading}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md shadow-green-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  {smsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Confirmar e Aceder
                </button>

                {countdown === 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      setCountdown(60);
                      handleSendSmsCode(e);
                    }}
                    className="w-full text-center text-[11px] font-semibold text-green-600 hover:underline py-1"
                  >
                    Reenviar novo código SMS
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
