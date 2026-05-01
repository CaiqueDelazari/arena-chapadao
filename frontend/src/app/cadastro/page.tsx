'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function CadastroPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Preencha todos os campos obrigatórios'); return; }
    if (form.password !== form.confirm) { toast.error('As senhas não coincidem'); return; }
    if (form.password.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      const { token } = res.data.data;
      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);
      toast.success('Conta criada com sucesso!');
      window.location.href = '/minha-conta';
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
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
          <h1 className="text-2xl font-black text-white">Criar conta</h1>
          <p className="text-slate-400 text-sm mt-1">Reserve quadras e acompanhe seus agendamentos</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome completo *</label>
              <input value={form.name} onChange={set('name')} placeholder="João Silva"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(14) 99999-9999"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Senha *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Mín. 6 caracteres"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirmar senha *</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5" /> Criar conta</>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-500">
              Já tem conta?{' '}
              <a href="/login" className="font-semibold text-orange-500 hover:text-orange-600">Entrar</a>
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
