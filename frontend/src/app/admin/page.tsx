'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDate, formatTime, getSportLabel, getSportIcon, getStatusColor, getStatusLabel } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Calendar, DollarSign, TrendingUp, Users, ArrowUpRight, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminApi.getDashboard();
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Carregando dashboard..." /></div>;

  const stats = [
    { label: 'Reservas hoje', value: data?.total_today || 0, icon: Calendar, color: 'text-blue-600 bg-blue-50', change: 'hoje' },
    { label: 'Reservas esta semana', value: data?.total_week || 0, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50', change: 'esta semana' },
    { label: 'Receita hoje', value: formatCurrency(data?.revenue_today || 0), icon: DollarSign, color: 'text-green-600 bg-green-50', change: 'hoje' },
    { label: 'Receita do mês', value: formatCurrency(data?.revenue_month || 0), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', change: 'este mês' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Dashboard</h2>
        <p className="text-slate-500 text-sm">Visão geral da sua arena</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Próximas reservas</h3>
            <a href="/admin/reservas" className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-3">
            {(data?.upcoming_reservas || []).slice(0, 5).map((reserva: any) => (
              <div key={reserva.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {getSportIcon(reserva.sport_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{reserva.client_name}</p>
                  <p className="text-xs text-slate-500">{getSportLabel(reserva.sport_type)} · {formatDate(reserva.date)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{reserva.start_time?.substring(0, 5)}</p>
                  <Badge variant={reserva.status === 'confirmed' ? 'success' : reserva.status === 'pending' ? 'warning' : 'default'}>
                    {getStatusLabel(reserva.status)}
                  </Badge>
                </div>
              </div>
            ))}
            {(!data?.upcoming_reservas || data.upcoming_reservas.length === 0) && (
              <p className="text-center text-slate-500 text-sm py-6">Nenhuma reserva próxima</p>
            )}
          </div>
        </Card>

        {/* Recent payments */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Pagamentos recentes</h3>
            <a href="/admin/financeiro" className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="space-y-3">
            {(data?.recent_payments || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.client_name}</p>
                    <p className="text-xs text-slate-500">{p.quadra_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(p.total_amount)}</p>
                  <p className="text-xs text-slate-500 uppercase">{p.payment_method}</p>
                </div>
              </div>
            ))}
            {(!data?.recent_payments || data.recent_payments.length === 0) && (
              <p className="text-center text-slate-500 text-sm py-6">Nenhum pagamento recente</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
