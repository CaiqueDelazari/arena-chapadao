'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, quadrasApi, reservasApi } from '@/lib/api';
import {
  formatCurrency, formatDate, formatTime, getSportLabel, getSportIcon,
  getStatusLabel, getPaymentStatusLabel, getPaymentStatusColor
} from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Filter, CheckCircle, XCircle, Clock, RefreshCw, CalendarClock, X } from 'lucide-react';
import { Quadra, Reserva, ReservaStatus } from '@/types';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

function statusVariant(status: string): 'warning' | 'success' | 'info' | 'danger' | 'default' {
  if (status === 'pending') return 'warning';
  if (status === 'confirmed') return 'success';
  if (status === 'completed') return 'info';
  if (status === 'cancelled') return 'danger';
  return 'default';
}

function paymentVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

export default function ReservasPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reagendando, setReagendando] = useState<Reserva | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novoHorario, setNovoHorario] = useState('');
  const [novaQuadra, setNovaQuadra] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservas', statusFilter, dateFilter, page],
    queryFn: async () => {
      const res = await adminApi.getReservas({
        status: statusFilter || undefined,
        date: dateFilter || undefined,
        page,
      });
      return res.data;
    },
  });

  const { data: quadrasData } = useQuery({
    queryKey: ['quadras'],
    queryFn: async () => (await quadrasApi.getAll()).data.data ?? [],
  });
  const quadras: Quadra[] = quadrasData ?? [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReservaStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reservas'] }),
  });

  const remarcarMutation = useMutation({
    mutationFn: () => reservasApi.remarcar(reagendando!.id, {
      date: novaData,
      start_time: novoHorario,
      quadra_id: novaQuadra || undefined,
    }),
    onSuccess: () => {
      toast.success('Reserva reagendada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin-reservas'] });
      setReagendando(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Erro ao reagendar');
    },
  });

  const abrirModal = (r: Reserva) => {
    setReagendando(r);
    setNovaData(typeof r.date === 'string' ? r.date.substring(0, 10) : '');
    setNovoHorario(typeof r.start_time === 'string' ? r.start_time.substring(0, 5) : '');
    setNovaQuadra(r.quadra_id ?? '');
  };

  const reservas: Reserva[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Modal de Reagendamento */}
      <AnimatePresence>
        {reagendando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Reagendar Reserva</h3>
                <button onClick={() => setReagendando(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm text-slate-600 dark:text-slate-300">
                <strong>{reagendando.client_name}</strong> — {reagendando.quadra_name}<br />
                <span className="text-xs text-slate-400">Atual: {formatDate(reagendando.date)} às {formatTime(reagendando.start_time)}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nova Quadra</label>
                  <select
                    value={novaQuadra}
                    onChange={e => setNovaQuadra(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {quadras.map(q => (
                      <option key={q.id} value={q.id}>{q.name} — {getSportLabel(q.sport_type)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Nova Data</label>
                  <input
                    type="date"
                    value={novaData}
                    onChange={e => setNovaData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Novo Horário de Início</label>
                  <input
                    type="time"
                    value={novoHorario}
                    onChange={e => setNovoHorario(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="ghost" fullWidth onClick={() => setReagendando(null)}>Cancelar</Button>
                <button
                  onClick={() => remarcarMutation.mutate()}
                  disabled={remarcarMutation.isPending || !novaData || !novoHorario}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}
                >
                  {remarcarMutation.isPending
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><CalendarClock className="w-4 h-4" /> Confirmar Reagendamento</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Reservas</h2>
        <p className="text-slate-500 text-sm">Gerencie todas as reservas da arena</p>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Data</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {(statusFilter || dateFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setDateFilter(''); setPage(1); }}>
              <RefreshCw className="w-4 h-4" /> Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Carregando reservas..." /></div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16 text-slate-500">Nenhuma reserva encontrada</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quadra</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data / Horário</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamento</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {reservas.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{r.client_name}</p>
                      <p className="text-xs text-slate-500">{r.client_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{getSportIcon(r.sport_type || '')}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{r.quadra_name}</p>
                          <p className="text-xs text-slate-500">{getSportLabel(r.sport_type || '')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{formatDate(r.date)}</p>
                      <p className="text-xs text-slate-500">{formatTime(r.start_time)} – {formatTime(r.end_time)}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(r.status)}>{getStatusLabel(r.status)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={paymentVariant(r.payment_status)}>
                        {getPaymentStatusLabel(r.payment_status)}
                      </Badge>
                      {r.payment_method && (
                        <p className="text-xs text-slate-400 mt-0.5 uppercase">{r.payment_method}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: r.id, status: 'confirmed' })}
                            disabled={updateStatus.isPending}
                            title="Confirmar"
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: r.id, status: 'completed' })}
                            disabled={updateStatus.isPending}
                            title="Marcar concluída"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'cancelled' && r.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => abrirModal(r)}
                              title="Reagendar"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                              <CalendarClock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus.mutate({ id: r.id, status: 'cancelled' })}
                              disabled={updateStatus.isPending}
                              title="Cancelar"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              {pagination.total} reservas no total
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Anterior
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Pág. {page}</span>
              <Button variant="outline" size="sm" disabled={page * pagination.limit >= pagination.total} onClick={() => setPage(p => p + 1)}>
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
