'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, bloqueiosApi, quadrasApi, mensalistasApi } from '@/lib/api';
import { getSportLabel, getSportIcon, getWeekDates, toDateString, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Lock, Unlock, X, Users, Trash2 } from 'lucide-react';
import { Reserva, Bloqueio, Quadra, Mensalista } from '@/types';
import toast from 'react-hot-toast';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);
const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const SPORT_COLORS: Record<string, string> = {
  futebol_society: 'bg-green-500',
  futevolei: 'bg-orange-500',
  volei_praia: 'bg-blue-500',
};

type ModalTipo = 'bloqueio' | 'mensalista' | 'lista-mensalistas' | null;

export default function AgendaPage() {
  const queryClient = useQueryClient();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [modalTipo, setModalTipo] = useState<ModalTipo>(null);
  const [bloqueioData, setBloqueioData] = useState({ quadra_id: '', date: '', start_time: '', end_time: '', reason: '' });
  const [mensalistaData, setMensalistaData] = useState({ client_name: '', client_phone: '', client_email: '', quadra_id: '', day_of_week: 1, start_time: '', end_time: '', notes: '' });
  const [confirmDeleteBloqueio, setConfirmDeleteBloqueio] = useState<Bloqueio | null>(null);
  const [confirmDeleteMensalista, setConfirmDeleteMensalista] = useState<Mensalista | null>(null);

  const weekDates = getWeekDates(currentWeekStart);
  const startStr = toDateString(weekDates[0]);
  const endStr = toDateString(weekDates[6]);

  const { data: reservas, isLoading } = useQuery({
    queryKey: ['agenda', startStr, endStr],
    queryFn: async () => (await adminApi.getAgenda(startStr, endStr)).data.data as Reserva[],
  });

  const { data: bloqueios } = useQuery({
    queryKey: ['bloqueios', startStr, endStr],
    queryFn: async () => (await bloqueiosApi.getAll(startStr, endStr)).data.data as Bloqueio[],
  });

  const { data: mensalistas } = useQuery({
    queryKey: ['mensalistas'],
    queryFn: async () => (await mensalistasApi.getAll()).data.data as Mensalista[],
  });

  const { data: quadrasData } = useQuery({
    queryKey: ['quadras'],
    queryFn: async () => (await quadrasApi.getAll()).data.data ?? [],
  });
  const quadras: Quadra[] = quadrasData ?? [];

  const criarBloqueio = useMutation({
    mutationFn: () => bloqueiosApi.create(bloqueioData),
    onSuccess: () => {
      toast.success('Horário bloqueado!');
      queryClient.invalidateQueries({ queryKey: ['bloqueios'] });
      setModalTipo(null);
    },
    onError: () => toast.error('Erro ao bloquear horário'),
  });

  const removerBloqueio = useMutation({
    mutationFn: (id: string) => bloqueiosApi.delete(id),
    onSuccess: () => {
      toast.success('Bloqueio removido!');
      queryClient.invalidateQueries({ queryKey: ['bloqueios'] });
      setConfirmDeleteBloqueio(null);
    },
    onError: () => toast.error('Erro ao remover bloqueio'),
  });

  const criarMensalista = useMutation({
    mutationFn: () => mensalistasApi.create({
      ...mensalistaData,
      client_email: mensalistaData.client_email || undefined,
      notes: mensalistaData.notes || undefined,
    }),
    onSuccess: () => {
      toast.success('Mensalista cadastrado!');
      queryClient.invalidateQueries({ queryKey: ['mensalistas'] });
      setModalTipo(null);
      setMensalistaData({ client_name: '', client_phone: '', client_email: '', quadra_id: '', day_of_week: 1, start_time: '', end_time: '', notes: '' });
    },
    onError: () => toast.error('Erro ao cadastrar mensalista'),
  });

  const removerMensalista = useMutation({
    mutationFn: (id: string) => mensalistasApi.delete(id),
    onSuccess: () => {
      toast.success('Mensalista removido!');
      queryClient.invalidateQueries({ queryKey: ['mensalistas'] });
      setConfirmDeleteMensalista(null);
    },
    onError: () => toast.error('Erro ao remover mensalista'),
  });

  const prevWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); };
  const nextWeek = () => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); };

  const getReservasForCell = (date: Date, hour: number) => {
    if (!reservas) return [];
    const dateStr = toDateString(date);
    return reservas.filter(r => r.date === dateStr && parseInt(r.start_time) === hour);
  };

  const getBloqueiosForCell = (date: Date, hour: number) => {
    if (!bloqueios) return [];
    const dateStr = toDateString(date);
    const hourStr = String(hour).padStart(2, '0');
    return bloqueios.filter(b => b.date === dateStr && b.start_time.substring(0, 2) === hourStr);
  };

  const getMensalistasForCell = (date: Date, hour: number) => {
    if (!mensalistas) return [];
    const dayOfWeek = date.getDay();
    const hourStr = String(hour).padStart(2, '0');
    return mensalistas.filter(m => m.day_of_week === dayOfWeek && m.start_time.substring(0, 2) === hourStr);
  };

  const abrirModalBloqueio = (date: Date, hour: number) => {
    const end = hour + 1 > 22 ? 22 : hour + 1;
    setBloqueioData({
      quadra_id: quadras[0]?.id ?? '',
      date: toDateString(date),
      start_time: `${String(hour).padStart(2, '0')}:00`,
      end_time: `${String(end).padStart(2, '0')}:00`,
      reason: '',
    });
    setModalTipo('bloqueio');
  };

  const today = toDateString(new Date());
  const monthYear = currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const inputClass = 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400';

  return (
    <div className="space-y-6">

      {/* Modal: Bloquear horário */}
      <AnimatePresence>
        {modalTipo === 'bloqueio' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-500" /> Bloquear Horário
                </h3>
                <button onClick={() => setModalTipo(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Quadra</label>
                  <select value={bloqueioData.quadra_id} onChange={e => setBloqueioData(d => ({ ...d, quadra_id: e.target.value }))} className={inputClass}>
                    {quadras.map(q => <option key={q.id} value={q.id}>{q.name} — {getSportLabel(q.sport_type)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Data</label>
                  <input type="date" value={bloqueioData.date} onChange={e => setBloqueioData(d => ({ ...d, date: e.target.value }))} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Início</label>
                    <input type="time" value={bloqueioData.start_time} onChange={e => setBloqueioData(d => ({ ...d, start_time: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Fim</label>
                    <input type="time" value={bloqueioData.end_time} onChange={e => setBloqueioData(d => ({ ...d, end_time: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Motivo (opcional)</label>
                  <input type="text" placeholder="Ex: Manutenção, Evento privado..." value={bloqueioData.reason} onChange={e => setBloqueioData(d => ({ ...d, reason: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" fullWidth onClick={() => setModalTipo(null)}>Cancelar</Button>
                <button onClick={() => criarBloqueio.mutate()}
                  disabled={criarBloqueio.isPending || !bloqueioData.quadra_id || !bloqueioData.date || !bloqueioData.start_time || !bloqueioData.end_time}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors">
                  {criarBloqueio.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Lock className="w-4 h-4" /> Bloquear</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Cadastrar mensalista */}
      <AnimatePresence>
        {modalTipo === 'mensalista' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> Novo Mensalista
                </h3>
                <button onClick={() => setModalTipo(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nome do cliente *</label>
                  <input type="text" placeholder="Nome completo" value={mensalistaData.client_name} onChange={e => setMensalistaData(d => ({ ...d, client_name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Telefone *</label>
                  <input type="tel" placeholder="(14) 99999-9999" value={mensalistaData.client_phone} onChange={e => setMensalistaData(d => ({ ...d, client_phone: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">E-mail (opcional)</label>
                  <input type="email" placeholder="cliente@email.com" value={mensalistaData.client_email} onChange={e => setMensalistaData(d => ({ ...d, client_email: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Quadra *</label>
                  <select value={mensalistaData.quadra_id} onChange={e => setMensalistaData(d => ({ ...d, quadra_id: e.target.value }))} className={inputClass}>
                    <option value="">Selecione a quadra</option>
                    {quadras.map(q => <option key={q.id} value={q.id}>{q.name} — {getSportLabel(q.sport_type)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Dia da semana *</label>
                  <select value={mensalistaData.day_of_week} onChange={e => setMensalistaData(d => ({ ...d, day_of_week: parseInt(e.target.value) }))} className={inputClass}>
                    {DAY_NAMES_FULL.map((name, i) => <option key={i} value={i}>{name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Horário início *</label>
                    <input type="time" value={mensalistaData.start_time} onChange={e => setMensalistaData(d => ({ ...d, start_time: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Horário fim *</label>
                    <input type="time" value={mensalistaData.end_time} onChange={e => setMensalistaData(d => ({ ...d, end_time: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Observação (opcional)</label>
                  <input type="text" placeholder="Ex: Joga com turma" value={mensalistaData.notes} onChange={e => setMensalistaData(d => ({ ...d, notes: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" fullWidth onClick={() => setModalTipo(null)}>Cancelar</Button>
                <button onClick={() => criarMensalista.mutate()}
                  disabled={criarMensalista.isPending || !mensalistaData.client_name || !mensalistaData.client_phone || !mensalistaData.quadra_id || !mensalistaData.start_time || !mensalistaData.end_time}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition-colors">
                  {criarMensalista.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Users className="w-4 h-4" /> Cadastrar</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Lista de mensalistas */}
      <AnimatePresence>
        {modalTipo === 'lista-mensalistas' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> Mensalistas Ativos
                </h3>
                <button onClick={() => setModalTipo(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {!mensalistas || mensalistas.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">Nenhum mensalista cadastrado</p>
                ) : (
                  mensalistas.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{m.client_name}</p>
                        <p className="text-xs text-slate-500">{m.client_phone}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                          {DAY_NAMES_FULL[m.day_of_week]} • {m.start_time?.substring(0, 5)} – {m.end_time?.substring(0, 5)}
                        </p>
                        <p className="text-xs text-slate-400">{m.quadra_name} — {getSportLabel(m.sport_type || '')}</p>
                        {m.notes && <p className="text-xs text-slate-400 italic">{m.notes}</p>}
                      </div>
                      <button onClick={() => setConfirmDeleteMensalista(m)}
                        className="ml-3 p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => setModalTipo('mensalista')}
                  className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-purple-600 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Novo Mensalista
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmar remoção bloqueio */}
      <AnimatePresence>
        {confirmDeleteBloqueio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Unlock className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Remover Bloqueio?</h3>
              <p className="text-sm text-slate-500 mb-5">
                {confirmDeleteBloqueio.quadra_name} — {confirmDeleteBloqueio.date?.substring(0, 10)}<br />
                {confirmDeleteBloqueio.start_time?.substring(0, 5)} às {confirmDeleteBloqueio.end_time?.substring(0, 5)}
                {confirmDeleteBloqueio.reason && ` • ${confirmDeleteBloqueio.reason}`}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setConfirmDeleteBloqueio(null)}>Cancelar</Button>
                <button onClick={() => removerBloqueio.mutate(confirmDeleteBloqueio.id)}
                  disabled={removerBloqueio.isPending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {removerBloqueio.isPending ? '...' : 'Remover'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmar remoção mensalista */}
      <AnimatePresence>
        {confirmDeleteMensalista && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Remover Mensalista?</h3>
              <p className="text-sm text-slate-500 mb-5">
                <strong>{confirmDeleteMensalista.client_name}</strong><br />
                {DAY_NAMES_FULL[confirmDeleteMensalista.day_of_week]}s • {confirmDeleteMensalista.start_time?.substring(0, 5)} – {confirmDeleteMensalista.end_time?.substring(0, 5)}<br />
                {confirmDeleteMensalista.quadra_name}
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setConfirmDeleteMensalista(null)}>Cancelar</Button>
                <button onClick={() => removerMensalista.mutate(confirmDeleteMensalista.id)}
                  disabled={removerMensalista.isPending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                  {removerMensalista.isPending ? '...' : 'Remover'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Agenda</h2>
          <p className="text-slate-500 text-sm capitalize">{monthYear}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={prevWeek} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-2">
            {weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} - {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}
          </span>
          <button onClick={nextWeek} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setModalTipo('lista-mensalistas')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm bg-purple-600 hover:bg-purple-700 transition-colors">
            <Users className="w-4 h-4" /> Mensalistas
            {mensalistas && mensalistas.length > 0 && (
              <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs">{mensalistas.length}</span>
            )}
          </button>
          <button onClick={() => {
            setBloqueioData({ quadra_id: quadras[0]?.id ?? '', date: today, start_time: '08:00', end_time: '09:00', reason: '' });
            setModalTipo('bloqueio');
          }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm bg-red-500 hover:bg-red-600 transition-colors">
            <Lock className="w-4 h-4" /> Bloquear Horário
          </button>
        </div>
      </div>

      <Card padding="none" className="overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Carregando agenda..." /></div>
        ) : (
          <div className="min-w-[700px]">
            <div className="grid border-b border-slate-100 dark:border-slate-700" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              <div className="p-3" />
              {weekDates.map((date, i) => {
                const dateStr = toDateString(date);
                const isToday = dateStr === today;
                return (
                  <div key={i} className={cn('p-3 text-center border-l border-slate-100 dark:border-slate-700', isToday && 'bg-primary-50 dark:bg-primary-900/20')}>
                    <div className={cn('text-xs font-medium mb-1', isToday ? 'text-primary-600' : 'text-slate-500')}>{DAY_NAMES_SHORT[date.getDay()]}</div>
                    <div className={cn('text-sm font-black w-7 h-7 rounded-full flex items-center justify-center mx-auto', isToday ? 'bg-primary-600 text-white' : 'text-slate-800 dark:text-slate-200')}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {HOURS.map((hour) => (
              <div key={hour} className="grid border-b border-slate-50 dark:border-slate-800" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                <div className="px-3 py-1 text-xs text-slate-400 font-medium pt-2">{String(hour).padStart(2, '0')}:00</div>
                {weekDates.map((date, dayIdx) => {
                  const dayReservas = getReservasForCell(date, hour);
                  const dayBloqueios = getBloqueiosForCell(date, hour);
                  const dayMensalistas = getMensalistasForCell(date, hour);
                  const dateStr = toDateString(date);
                  const isToday = dateStr === today;
                  const isEmpty = dayReservas.length === 0 && dayBloqueios.length === 0 && dayMensalistas.length === 0;
                  return (
                    <div key={dayIdx}
                      onClick={() => isEmpty && abrirModalBloqueio(date, hour)}
                      className={cn(
                        'border-l border-slate-100 dark:border-slate-800 min-h-[44px] p-0.5',
                        isToday && 'bg-primary-50/30 dark:bg-primary-900/10',
                        isEmpty && 'hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors'
                      )}
                    >
                      {dayReservas.map((reserva) => (
                        <motion.div key={reserva.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className={`${SPORT_COLORS[reserva.sport_type || ''] || 'bg-blue-500'} rounded-lg p-1.5 m-0.5 hover:opacity-80 transition-opacity`}
                          title={`${reserva.client_name} - ${getSportLabel(reserva.sport_type || '')}`}>
                          <p className="text-white text-[9px] font-bold leading-tight truncate">
                            {reserva.start_time?.substring(0, 5)} {getSportIcon(reserva.sport_type || '')} {reserva.quadra_name}
                          </p>
                          <p className="text-white/80 text-[9px] truncate">{reserva.client_name?.split(' ')[0]}</p>
                        </motion.div>
                      ))}
                      {dayBloqueios.map((b) => (
                        <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteBloqueio(b); }}
                          className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-1.5 m-0.5 cursor-pointer hover:bg-red-200 transition-colors"
                          title={`Bloqueado: ${b.quadra_name}${b.reason ? ` — ${b.reason}` : ''}`}>
                          <p className="text-red-700 dark:text-red-300 text-[9px] font-bold leading-tight truncate flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5 inline" /> {b.quadra_name}
                          </p>
                          {b.reason && <p className="text-red-500 text-[9px] truncate">{b.reason}</p>}
                        </motion.div>
                      ))}
                      {dayMensalistas.map((m) => (
                        <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 rounded-lg p-1.5 m-0.5"
                          title={`Mensalista: ${m.client_name} — ${m.quadra_name}`}>
                          <p className="text-purple-700 dark:text-purple-300 text-[9px] font-bold leading-tight truncate flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5 inline" /> {m.client_name?.split(' ')[0]}
                          </p>
                          <p className="text-purple-500 text-[9px] truncate">{m.quadra_name}</p>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        {Object.entries(SPORT_COLORS).map(([sport, color]) => (
          <div key={sport} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 ${color} rounded`} />
            <span className="text-slate-500">{getSportLabel(sport)}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-purple-400 rounded" />
          <span className="text-slate-500">Mensalista</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-300 rounded" />
          <span className="text-slate-500">Bloqueado</span>
        </div>
        <span className="text-slate-400">• Clique em célula vazia para bloquear</span>
      </div>
    </div>
  );
}
