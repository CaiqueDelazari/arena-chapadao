'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, LogOut, Calendar, Clock, CreditCard, RefreshCw, X, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { reservasApi, quadrasApi, pagamentosApi } from '@/lib/api';
import { Reserva } from '@/types';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatTime(t: string) {
  return t?.substring(0, 5) ?? '';
}

function statusLabel(s: string) {
  const map: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Concluída' };
  return map[s] ?? s;
}

function statusColor(s: string) {
  if (s === 'confirmed') return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (s === 'cancelled') return 'bg-red-100 text-red-700';
  if (s === 'completed') return 'bg-slate-100 text-slate-500';
  return 'bg-slate-100 text-slate-500';
}

function payLabel(s: string) {
  const map: Record<string, string> = { pending: 'Aguardando pgto.', approved: 'Pago', failed: 'Falhou', refunded: 'Estornado' };
  return map[s] ?? s;
}

function payColor(s: string) {
  if (s === 'approved') return 'bg-green-100 text-green-700';
  if (s === 'pending') return 'bg-orange-100 text-orange-700';
  if (s === 'failed') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-500';
}

function sportIcon(t: string) {
  if (t === 'futebol_society') return '⚽';
  if (t === 'futevolei') return '🏐';
  if (t === 'volei_praia') return '🏖️';
  return '🏟️';
}

// Modal de remarcar
function RemarcarModal({ reserva, onClose }: { reserva: Reserva; onClose: () => void }) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{ time: string; end_time: string; available: boolean }[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const qc = useQueryClient();

  const origStart = reserva.start_time?.substring(0, 5) ?? '';
  const origEnd = reserva.end_time?.substring(0, 5) ?? '';
  const [sh, sm] = origStart.split(':').map(Number);
  const [eh, em] = origEnd.split(':').map(Number);
  const durationH = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  const loadSlots = async (d: string) => {
    setDate(d);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const res = await quadrasApi.getSlots(reserva.quadra_id, d);
      // filtra apenas slots livres com duração compatível
      const all = res.data.data ?? [];
      setSlots(all.filter((s: any) => s.available));
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const mutation = useMutation({
    mutationFn: () => reservasApi.remarcar(reserva.id, { date, start_time: selectedTime }),
    onSuccess: () => {
      toast.success('Reserva remarcada!');
      qc.invalidateQueries({ queryKey: ['minhas-reservas'] });
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erro ao remarcar'),
  });

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Remarcar Reserva</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{reserva.quadra_name}</p>
          <p className="text-slate-500">Atual: {formatDate(reserva.date)} às {formatTime(reserva.start_time)} ({durationH}h)</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nova data</label>
            <input type="date" min={today} max={maxDate} value={date} onChange={e => loadSlots(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          {date && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Horário disponível</label>
              {loadingSlots ? (
                <p className="text-sm text-slate-400 text-center py-3">Carregando horários...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">Nenhum horário disponível nesta data</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button key={s.time} onClick={() => setSelectedTime(s.time)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${selectedTime === s.time ? 'text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                      style={selectedTime === s.time ? { background: 'linear-gradient(135deg, #ea6c0d, #f97316)' } : {}}>
                      {formatTime(s.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            Cancelar
          </button>
          <button onClick={() => mutation.mutate()} disabled={!date || !selectedTime || mutation.isPending}
            className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition"
            style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
            {mutation.isPending ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Modal de pagamento PIX
function PagarModal({ reserva, onClose }: { reserva: Reserva; onClose: () => void }) {
  const [pix, setPix] = useState<{ pix_qr_code: string; pix_copy_paste: string; pagamento_id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const gerarPix = async () => {
    setLoading(true);
    try {
      const res = await pagamentosApi.createPix(reserva.id);
      setPix({ pix_qr_code: res.data.data.pix_qr_code, pix_copy_paste: res.data.data.pix_copy_paste, pagamento_id: res.data.data.pagamento_id });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  const copiar = () => {
    if (!pix) return;
    navigator.clipboard.writeText(pix.pix_copy_paste);
    toast.success('Código PIX copiado!');
  };

  const verificar = async () => {
    if (!pix) return;
    try {
      const res = await pagamentosApi.getStatus(pix.pagamento_id);
      if (res.data.data?.status === 'approved') {
        toast.success('Pagamento confirmado!');
        qc.invalidateQueries({ queryKey: ['minhas-reservas'] });
        onClose();
      } else {
        toast('Pagamento ainda não confirmado. Aguarde alguns instantes.', { icon: '⏳' });
      }
    } catch {
      toast.error('Erro ao verificar pagamento');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Pagar via PIX</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm text-center">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{reserva.quadra_name}</p>
          <p className="text-slate-500">{formatDate(reserva.date)} • {formatTime(reserva.start_time)}–{formatTime(reserva.end_time)}</p>
          <p className="text-2xl font-black text-orange-500 mt-1">R$ {Number(reserva.total_amount).toFixed(2).replace('.', ',')}</p>
        </div>

        {!pix ? (
          <button onClick={gerarPix} disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
            {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><CreditCard className="w-5 h-5" /> Gerar código PIX</>}
          </button>
        ) : (
          <div className="space-y-4">
            {pix.pix_qr_code && (
              <div className="flex justify-center">
                <img src={`data:image/png;base64,${pix.pix_qr_code}`} alt="QR Code PIX" className="w-48 h-48 rounded-xl border border-slate-200" />
              </div>
            )}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700 break-all text-xs text-slate-600 dark:text-slate-300 font-mono">
              {pix.pix_copy_paste}
            </div>
            <button onClick={copiar} className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
              Copiar código PIX
            </button>
            <button onClick={verificar} className="w-full py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Já paguei — verificar pagamento
            </button>
          </div>
        )}

        <button onClick={onClose} className="w-full mt-3 py-2 text-sm text-slate-400 hover:text-slate-600 transition">Fechar</button>
      </motion.div>
    </div>
  );
}

export default function MinhaContaPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'proximas' | 'passadas'>('proximas');
  const [remarcarReserva, setRemarcarReserva] = useState<Reserva | null>(null);
  const [pagarReserva, setPagarReserva] = useState<Reserva | null>(null);
  const qc = useQueryClient();

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['minhas-reservas'],
    queryFn: async () => {
      const res = await reservasApi.getMinhas();
      return res.data.data as Reserva[];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservasApi.cancel(id),
    onSuccess: () => {
      toast.success('Reserva cancelada');
      qc.invalidateQueries({ queryKey: ['minhas-reservas'] });
    },
    onError: () => toast.error('Erro ao cancelar'),
  });

  const today = new Date().toISOString().split('T')[0];
  const proximas = reservas.filter(r => r.date >= today && r.status !== 'cancelled' && r.status !== 'completed');
  const passadas = reservas.filter(r => r.date < today || r.status === 'cancelled' || r.status === 'completed');
  const lista = tab === 'proximas' ? proximas : passadas;

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <>
      {remarcarReserva && <RemarcarModal reserva={remarcarReserva} onClose={() => setRemarcarReserva(null)} />}
      {pagarReserva && <PagarModal reserva={pagarReserva} onClose={() => setPagarReserva(null)} />}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-slate-900 dark:text-white">Arena Chapadão</span>
            </a>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition font-medium">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Boas vindas */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Olá, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-500 text-sm mt-0.5">Suas reservas na Arena Chapadão</p>
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <a href="/agenda" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 group-hover:bg-orange-100 transition">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Reservar</p>
                <p className="text-xs text-slate-400">Ver horários livres</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
            </a>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{proximas.length}</p>
                <p className="text-xs text-slate-400">Próximas</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
            {(['proximas', 'passadas'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'proximas' ? `Próximas (${proximas.length})` : `Histórico (${passadas.length})`}
              </button>
            ))}
          </div>

          {/* Lista de reservas */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Carregando reservas...</div>
          ) : lista.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏟️</p>
              <p className="text-slate-500 font-medium">
                {tab === 'proximas' ? 'Nenhuma reserva próxima' : 'Sem histórico ainda'}
              </p>
              {tab === 'proximas' && (
                <a href="/agenda" className="mt-3 inline-block text-sm font-bold text-orange-500 hover:text-orange-600">
                  Reservar uma quadra →
                </a>
              )}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {lista.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sportIcon(r.sport_type ?? '')}</span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{r.quadra_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500">{formatDate(r.date)}</span>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500">{formatTime(r.start_time)}–{formatTime(r.end_time)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-black text-orange-500 text-sm">R$ {Number(r.total_amount).toFixed(2).replace('.', ',')}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${payColor(r.payment_status)}`}>{payLabel(r.payment_status)}</span>
                    </div>

                    {/* Ações */}
                    {r.status !== 'cancelled' && r.status !== 'completed' && (
                      <div className="flex gap-2 pt-3 border-t border-slate-50 dark:border-slate-700">
                        {r.payment_status === 'pending' && (
                          <button onClick={() => setPagarReserva(r)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                            <CreditCard className="w-4 h-4" /> Pagar
                          </button>
                        )}
                        {r.date >= today && (
                          <button onClick={() => setRemarcarReserva(r)}
                            className="flex-1 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5">
                            <RefreshCw className="w-4 h-4" /> Remarcar
                          </button>
                        )}
                        {r.status === 'pending' && r.date >= today && (
                          <button onClick={() => { if (confirm('Cancelar esta reserva?')) cancelMutation.mutate(r.id); }}
                            className="py-2 px-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
