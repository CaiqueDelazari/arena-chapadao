'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { formatCurrency, getSportLabel, getSportIcon, getWeekDates, toDateString, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Reserva } from '@/types';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SPORT_COLORS: Record<string, string> = {
  futebol_society: 'bg-green-500',
  futevolei: 'bg-orange-500',
  volei_praia: 'bg-blue-500',
};

export default function AgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const weekDates = getWeekDates(currentWeekStart);
  const startStr = toDateString(weekDates[0]);
  const endStr = toDateString(weekDates[6]);

  const { data: reservas, isLoading } = useQuery({
    queryKey: ['agenda', startStr, endStr],
    queryFn: async () => {
      const res = await adminApi.getAgenda(startStr, endStr);
      return res.data.data as Reserva[];
    },
  });

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const getReservasForDayAndHour = (date: Date, hour: number) => {
    if (!reservas) return [];
    const dateStr = toDateString(date);
    return reservas.filter(r => {
      if (r.date !== dateStr) return false;
      const startHour = parseInt(r.start_time);
      return startHour === hour;
    });
  };

  const today = toDateString(new Date());
  const monthYear = currentWeekStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Agenda</h2>
          <p className="text-slate-500 text-sm capitalize">{monthYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-2">
            {weekDates[0].getDate()}/{weekDates[0].getMonth()+1} - {weekDates[6].getDate()}/{weekDates[6].getMonth()+1}
          </span>
          <button onClick={nextWeek} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Card padding="none" className="overflow-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Carregando agenda..." /></div>
        ) : (
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid border-b border-slate-100 dark:border-slate-700" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              <div className="p-3" />
              {weekDates.map((date, i) => {
                const dateStr = toDateString(date);
                const isToday = dateStr === today;
                return (
                  <div key={i} className={cn('p-3 text-center border-l border-slate-100 dark:border-slate-700', isToday && 'bg-primary-50 dark:bg-primary-900/20')}>
                    <div className={cn('text-xs font-medium mb-1', isToday ? 'text-primary-600' : 'text-slate-500')}>
                      {DAY_NAMES_SHORT[date.getDay()]}
                    </div>
                    <div className={cn(
                      'text-sm font-black w-7 h-7 rounded-full flex items-center justify-center mx-auto',
                      isToday ? 'bg-primary-600 text-white' : 'text-slate-800 dark:text-slate-200'
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
                <div className="px-3 py-1 text-xs text-slate-400 font-medium pt-2">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {weekDates.map((date, dayIdx) => {
                  const dayReservas = getReservasForDayAndHour(date, hour);
                  const dateStr = toDateString(date);
                  const isToday = dateStr === today;
                  return (
                    <div key={dayIdx} className={cn('border-l border-slate-100 dark:border-slate-800 min-h-[44px] p-0.5', isToday && 'bg-primary-50/30 dark:bg-primary-900/10')}>
                      {dayReservas.map((reserva) => (
                        <motion.div
                          key={reserva.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`${SPORT_COLORS[reserva.sport_type || ''] || 'bg-blue-500'} rounded-lg p-1.5 m-0.5 cursor-pointer hover:opacity-80 transition-opacity`}
                          title={`${reserva.client_name} - ${getSportLabel(reserva.sport_type || '')}`}
                        >
                          <p className="text-white text-[9px] font-bold leading-tight truncate">
                            {reserva.start_time?.substring(0, 5)} {getSportLabel(reserva.sport_type || '').split(' ')[0]}
                          </p>
                          <p className="text-white/80 text-[9px] truncate">{reserva.client_name?.split(' ')[0]} {reserva.client_name?.split(' ')[1]?.[0]}.</p>
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        {Object.entries(SPORT_COLORS).map(([sport, color]) => (
          <div key={sport} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 ${color} rounded`} />
            <span className="text-slate-500">{getSportLabel(sport)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
