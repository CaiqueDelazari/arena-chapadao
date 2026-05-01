'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, DollarSign, User, RefreshCw } from 'lucide-react';
import { formatDate, formatCurrency, getSportLabel, getSportIcon } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { UseBookingReturn } from './types';

interface Props { booking: UseBookingReturn; }

export default function Step5Confirmed({ booking }: Props) {
  const { reserva, quadra, clientInfo } = booking.bookingData;

  const details = [
    { icon: Calendar, label: 'Data', value: formatDate(reserva?.date || '') },
    { icon: Clock, label: 'Horário', value: `${reserva?.start_time?.substring(0, 5)} - ${reserva?.end_time?.substring(0, 5)}` },
    { icon: DollarSign, label: 'Valor', value: formatCurrency(reserva?.total_amount || 0) },
    { icon: User, label: 'Nome', value: clientInfo?.name || '' },
  ];

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Celebration animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative w-28 h-28 mx-auto mb-8"
      >
        <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full animate-pulse-slow" />
        <div className="relative w-28 h-28 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-glow-lg">
          <CheckCircle className="w-14 h-14 text-white" />
        </div>

        {/* Confetti dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0, x: Math.cos(i * 45 * Math.PI / 180) * 60, y: Math.sin(i * 45 * Math.PI / 180) * 60 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
            style={{ backgroundColor: ['#3b82f6','#22c55e','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#ef4444','#84cc16'][i] }}
          />
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Reserva confirmada!
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Sua reserva está garantida. Até o dia do jogo! 🎉
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card padding="md" className="mb-6 text-left">
          {/* Sport header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="text-3xl">{getSportIcon(quadra?.sport_type || '')}</span>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{getSportLabel(quadra?.sport_type || '')}</div>
              <div className="text-xs text-slate-500">Divino Arena</div>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Confirmada
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2">
                <detail.icon className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-500">{detail.label}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{detail.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 flex items-center gap-2">
          <span className="text-lg">📱</span>
          <p className="text-sm text-green-700 dark:text-green-400">
            Confirmação enviada para <strong>{clientInfo?.phone}</strong> via WhatsApp
          </p>
        </div>

        <Button fullWidth size="xl" variant="primary" onClick={booking.reset}>
          <RefreshCw className="w-5 h-5" />
          Nova reserva
        </Button>
      </motion.div>
    </div>
  );
}
