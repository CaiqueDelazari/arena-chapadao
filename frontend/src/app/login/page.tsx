'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo!');
      window.location.href = '/minha-conta';
    } catch {
      toast.error('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="font-black text-xl text-white leading-none">Arena Chapadão</div>
              <div className="text-xs font-bold tracking-widest" style={{ color: '#f97316' }}>AGUDOS</div>
            </div>
          </a>
          <h1 className="text-2xl font-black text-white">Entrar na sua conta</h1>
          <p className="text-slate-400 text-sm mt-1">Acesse suas reservas e pagamentos</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-5 h-5" /> Entrar</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Não tem conta?{' '}
              <a href="/cadastro" className="font-semibold text-orange-500 hover:text-orange-600">Cadastre-se grátis</a>
            </p>
            <p className="text-sm text-slate-500">
              <a href="/" className="text-slate-400 hover:text-slate-600">← Voltar ao início</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
