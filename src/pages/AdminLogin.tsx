import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isAdminLoggedIn } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdminLoggedIn) {
    navigate('/admin/painel', { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    const ok = adminLogin(username, password);
    if (ok) {
      navigate('/admin/painel');
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Site
        </button>

        <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rosa-400 to-rosa-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rosa-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400 text-sm mt-2">Mundo de Doces da GG</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-rosa-400 focus:ring-2 focus:ring-rosa-400/20 outline-none text-sm transition-colors"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-rosa-400 focus:ring-2 focus:ring-rosa-400/20 outline-none text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rosa-400 to-rosa-500 text-white hover:from-rosa-500 hover:to-rosa-600 shadow-lg shadow-rosa-500/20 transition-all"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
