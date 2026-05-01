'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import {
  formatCurrency, formatDate, getSportLabel, getSportIcon,
  getPaymentStatusLabel
} from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DollarSign, TrendingUp, Clock, BarChart2 } from 'lucide-react';
import { FinanceiroData } from '@/types';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

function paymentVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'failed') return 'danger';
  return 'default';
}

export default function FinanceiroPage() {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isCustom = period === 'custom';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-financeiro', period, startDate, endDate],
    queryFn: async () => {
      const res = await adminApi.getFinanceiro(
        isCustom ? undefined : period,
        isCustom ? startDate : undefined,
        isCustom ? endDate : undefined,
      );
      return res.data.data as FinanceiroData;
    },
    enabled: !isCustom || (!!startDate && !!endDate),
  });

  const summaryCards = [
    {
      label: 'Faturamento total',
      value: formatCurrency(parseFloat(data?.faturamento || '0')),
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Recebido',
      value: formatCurrency(parseFloat(data?.recebidos || '0')),
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Aguardando pagamento',
      value: formatCurrency(parseFloat(data?.pendentes || '0')),
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Financeiro</h2>
        <p className="text-slate-500 text-sm">Receitas e transações da arena</p>
      </div>

      {/* Period selector */}
      <Card padding="md">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Período</label>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-3 py-2 text-sm rounded-xl font-medium transition-all ${
                    period === opt.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {isCustom && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">De</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Até</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Carregando dados financeiros..." /></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By court */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-primary-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Receita por quadra</h3>
              </div>
              {!data?.by_quadra?.length ? (
                <p className="text-center text-slate-500 text-sm py-6">Sem dados para o período</p>
              ) : (
                <div className="space-y-3">
                  {data.by_quadra.map((q, i) => {
                    const total = data.by_quadra.reduce((s, x) => s + parseFloat(x.receita), 0);
                    const pct = total > 0 ? (parseFloat(q.receita) / total) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <span>{getSportIcon(q.sport_type)}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{q.quadra_name}</span>
                            <span className="text-xs text-slate-400">({q.total_reservas} reservas)</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(parseFloat(q.receita))}</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="h-1.5 rounded-full bg-primary-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* By day */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Receita por dia</h3>
              </div>
              {!data?.by_day?.length ? (
                <p className="text-center text-slate-500 text-sm py-6">Sem dados para o período</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {data.by_day.map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(d.date)}</p>
                        <p className="text-xs text-slate-400">{d.total} reservas</p>
                      </div>
                      <p className="font-bold text-green-600">{formatCurrency(parseFloat(d.receita))}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Transactions table */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white">Transações</h3>
            </div>
            {!data?.transactions?.length ? (
              <p className="text-center text-slate-500 text-sm py-8">Nenhuma transação no período</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quadra</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Método</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pgto.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {data.transactions.map((t: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.client_name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span>{getSportIcon(t.sport_type)}</span>
                            <span className="text-slate-700 dark:text-slate-300">{t.quadra_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(t.date)}</td>
                        <td className="px-4 py-3 uppercase text-xs text-slate-500">{t.payment_method || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={paymentVariant(t.payment_status)}>
                            {getPaymentStatusLabel(t.payment_status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(t.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
