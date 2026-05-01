'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight, Calendar, X, CreditCard, CheckCircle, Copy } from 'lucide-react';
import { quadrasApi, reservasApi, pagamentosApi } from '@/lib/api';
import { Quadra } from '@/types';
import toast from 'react-hot-toast';

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

function sportIcon(t: string) {
  if (t === 'futebol_society') return '⚽';
  if (t === 'futevolei') return '🏐';
  if (t === 'volei_praia') return '🏖️';
  return '🏟️';
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function formatDatePtBR(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

type SlotMap = Record<string, Record<string, boolean>>;

interface BookingSlot { quadra: Quadra; date: string; startTime: string; endTime: string }

// ── Modal de reserva (sem login) ─────────────────────────────────────────────
function BookingModal({ slot, onClose }: { slot: BookingSlot; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'pix' | 'done'>('form');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ qrcode: string; copypaste: string; pagamento_id: string } | null>(null);
  const [reservaId, setReservaId] = useState('');

  const price = Number(slot.quadra.price_per_hour);
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60 || 1;
  const total = price * hours;

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const criarReserva = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      const res = await reservasApi.create({
        quadra_id: slot.quadra.id,
        client_name: form.name,
        client_phone: form.phone,
        client_email: form.email || undefined,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
      });
      const id = res.data.data.id;
      setReservaId(id);

      const pixRes = await pagamentosApi.createPix(id);
      setPix({
        qrcode: pixRes.data.data.pix_qr_code,
        copypaste: pixRes.data.data.pix_copy_paste,
        pagamento_id: pixRes.data.data.pagamento_id,
      });
      setStep('pix');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  const copiarPix = () => {
    if (!pix) return;
    navigator.clipboard.writeText(pix.copypaste);
    toast.success('Código PIX copiado!');
  };

  const verificarPagamento = async () => {
    if (!pix) return;
    try {
      const res = await pagamentosApi.getStatus(pix.pagamento_id);
      if (res.data.data?.status === 'approved' || res.data.data?.reserva_status === 'confirmed') {
        setStep('done');
      } else {
        toast('Pagamento ainda não identificado. Aguarde e tente novamente.', { icon: '⏳' });
      }
    } catch {
      toast.error('Erro ao verificar pagamento');
    }
  };

  const [y, m, d] = slot.date.split('-');
  const dateLabel = `${d}/${m}/${y}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
      >
        {/* Header do modal */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sportIcon(slot.quadra.sport_type)}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{slot.quadra.name}</h3>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{dateLabel} • {slot.startTime}–{slot.endTime}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Valor */}
          <div className="mb-5 p-4 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">Total a pagar</p>
            <p className="text-3xl font-black text-orange-500">R$ {total.toFixed(2).replace('.', ',')}</p>
            <p className="text-xs text-orange-400 mt-0.5">{hours}h × R$ {price.toFixed(0)}/h</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Seu nome *</label>
                  <input value={form.name} onChange={set('name')} placeholder="João Silva"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp *</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(14) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>

                <button onClick={criarReserva} disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><CreditCard className="w-5 h-5" /> Reservar e pagar via PIX</>
                  }
                </button>
                <p className="text-xs text-center text-slate-400">Sem cadastro necessário. Pagamento 100% seguro via Mercado Pago.</p>
              </motion.div>
            )}

            {step === 'pix' && pix && (
              <motion.div key="pix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="text-center">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Reserva criada!</p>
                  <p className="text-sm text-slate-500">Efetue o pagamento PIX para confirmar</p>
                </div>

                {pix.qrcode && (
                  <div className="flex justify-center">
                    <img src={`data:image/png;base64,${pix.qrcode}`} alt="QR Code PIX" className="w-44 h-44 rounded-2xl border-4 border-orange-100" />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700 break-all text-xs text-slate-500 dark:text-slate-300 font-mono leading-relaxed">
                  {pix.copypaste}
                </div>

                <button onClick={copiarPix}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                  <Copy className="w-4 h-4" /> Copiar código PIX
                </button>

                <button onClick={verificarPagamento}
                  className="w-full py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  Já paguei — confirmar pagamento
                </button>

                <p className="text-xs text-center text-slate-400">O PIX expira em 30 minutos</p>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Reserva confirmada!</h3>
                <p className="text-slate-500 text-sm">
                  {slot.quadra.name} • {dateLabel} às {slot.startTime}
                </p>
                <p className="text-sm text-slate-500">Enviamos a confirmação para o WhatsApp <strong>{form.phone}</strong></p>
                <button onClick={onClose}
                  className="mt-2 w-full py-3 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                  Fechar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function AgendaPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [slotMap, setSlotMap] = useState<SlotMap>({});
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingSlot | null>(null);

  useEffect(() => {
    quadrasApi.getAll().then(res =>
      setQuadras((res.data.data ?? []).filter((q: Quadra) => q.is_active))
    );
  }, []);

  useEffect(() => {
    if (quadras.length === 0) return;
    setLoading(true);
    setSlotMap({});
    Promise.all(
      quadras.map(q =>
        quadrasApi.getSlots(q.id, date)
          .then(res => ({ id: q.id, slots: res.data.data ?? [] }))
          .catch(() => ({ id: q.id, slots: [] }))
      )
    ).then(results => {
      const map: SlotMap = {};
      for (const { id, slots } of results) {
        map[id] = {};
        for (const s of slots) {
          const key = typeof s.time === 'string' ? s.time.substring(0, 5) : '';
          if (key) map[id][key] = s.available;
        }
      }
      setSlotMap(map);
      setLoading(false);
    });
  }, [date, quadras]);

  const openBooking = (quadra: Quadra, startTime: string) => {
    const [h, m] = startTime.split(':').map(Number);
    const endMin = h * 60 + m + 60;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    setBooking({ quadra, date, startTime, endTime });
  };

  const minDate = today;
  const maxDate = addDays(today, 30);

  return (
    <>
      <AnimatePresence>
        {booking && <BookingModal slot={booking} onClose={() => setBooking(null)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white text-sm leading-none">Arena Chapadão</div>
                <div className="text-[9px] font-bold tracking-widest" style={{ color: '#f97316' }}>AGUDOS</div>
              </div>
            </a>
            <a href="/minha-conta" className="text-sm text-slate-500 hover:text-orange-500 transition font-medium">
              Minhas reservas →
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reserve sua quadra</h1>
            <p className="text-slate-500 text-sm mt-0.5">Clique em um horário <span className="text-green-600 font-semibold">verde</span> para reservar sem cadastro</p>
          </div>

          {/* Seletor de data */}
          <div className="flex items-center gap-2">
            <button onClick={() => date > minDate && setDate(addDays(date, -1))} disabled={date <= minDate}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition disabled:opacity-30">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
              <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
              <input type="date" min={minDate} max={maxDate} value={date} onChange={e => setDate(e.target.value)}
                className="flex-1 bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none text-sm" />
              <span className="text-slate-400 text-xs capitalize hidden sm:block">{formatDatePtBR(date)}</span>
            </div>

            <button onClick={() => date < maxDate && setDate(addDays(date, 1))} disabled={date >= maxDate}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition disabled:opacity-30">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Grade das 4 quadras */}
          {quadras.length === 0 ? (
            <div className="text-center py-16 text-slate-400">Carregando quadras...</div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: `${quadras.length * 140 + 80}px` }}>
                  <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-slate-700">
                      <th className="px-4 py-4 text-left w-20 bg-slate-50 dark:bg-slate-700/50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário</span>
                      </th>
                      {quadras.map(q => (
                        <th key={q.id} className="px-3 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{sportIcon(q.sport_type)}</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{q.name}</span>
                            <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                              R$ {Number(q.price_per_hour).toFixed(0)}/h
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={quadras.length + 1} className="py-16 text-center text-slate-400 text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                            Carregando disponibilidade...
                          </div>
                        </td>
                      </tr>
                    ) : (
                      HOURS.map((hour, idx) => (
                        <tr key={hour}
                          className="border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition">
                          <td className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-700/30">
                            <span className="text-sm font-bold text-slate-500">{hour}</span>
                          </td>
                          {quadras.map(q => {
                            const available = slotMap[q.id]?.[hour];
                            const hasSlot = hour in (slotMap[q.id] ?? {});

                            if (!hasSlot) {
                              return (
                                <td key={q.id} className="px-3 py-2.5 text-center">
                                  <div className="h-9 rounded-xl bg-slate-100 dark:bg-slate-700/40" />
                                </td>
                              );
                            }

                            return (
                              <td key={q.id} className="px-3 py-2.5 text-center">
                                {available ? (
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => openBooking(q, hour)}
                                    className="w-full h-9 rounded-xl bg-green-400 hover:bg-green-500 text-white text-xs font-black shadow-sm hover:shadow-md transition-all">
                                    LIVRE
                                  </motion.button>
                                ) : (
                                  <div className="w-full h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <span className="text-xs font-bold text-red-400">Ocupada</span>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-400 inline-block" />
              <strong className="text-slate-600 dark:text-slate-300">LIVRE</strong> — clique para reservar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-200 inline-block" />
              Ocupada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
              Fora do horário
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
