'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { quadrasApi } from '@/lib/api';
import { formatDate, getSportIcon, getSportLabel, formatCurrency, toDateString, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { UseBookingReturn } from './types';

interface Props { booking: UseBookingReturn; }

export default function Step2Schedule({ booking }: Props) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const dateStr = toDateString(selectedDate);

  useEffect(() => {
    booking.selectDate(dateStr);
  }, [dateStr]);

  const FALLBACK_SLOTS = Array.from({ length: 14 }, (_, i) => {
    const hour = 8 + i;
    return {
      time: `${String(hour).padStart(2, '0')}:00`,
      end_time: `${String(hour + 1).padStart(2, '0')}:00`,
      available: true,
    };
  });

  const { data: apiSlots, isLoading } = useQuery({
    queryKey: ['slots', booking.bookingData.quadra?.id, dateStr],
    queryFn: async () => {
      if (!booking.bookingData.quadra) return [];
      const res = await quadrasApi.getSlots(booking.bookingData.quadra.id, dateStr);
      return res.data.data;
    },
    enabled: !!booking.bookingData.quadra,
    retry: false,
  });

  const slots = apiSlots?.length ? apiSlots : FALLBACK_SLOTS;

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    if (d >= today) setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    if (d <= maxDate) setSelectedDate(d);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const morningSlots = slots?.filter(s => parseInt(s.time) < 12) || [];
  const afternoonSlots = slots?.filter(s => parseInt(s.time) >= 12 && parseInt(s.time) < 18) || [];
  const eveningSlots = slots?.filter(s => parseInt(s.time) >= 18) || [];

  const renderSlots = (slotGroup: typeof slots, label: string) => {
    if (!slotGroup || slotGroup.length === 0) return null;
    return (
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{label}</h5>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {slotGroup.map((slot) => {
            const isSelected = booking.bookingData.timeSlot?.time === slot.time;
            return (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => booking.selectTimeSlot(slot)}
                className={cn(
                  'py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150',
                  !slot.available
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : isSelected
                    ? 'bg-primary-600 text-white shadow-glow scale-105'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 hover:scale-105'
                )}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Escolha o horário</h3>
        <p className="text-slate-500 dark:text-slate-400">
          {getSportIcon(booking.bookingData.quadra?.sport_type || '')} {getSportLabel(booking.bookingData.quadra?.sport_type || '')} —{' '}
          {formatCurrency(booking.bookingData.quadra?.price_per_hour || 0)}/h
        </p>
      </div>

      {/* Date selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h4>
          <div className="flex gap-2">
            <button onClick={prevDay} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextDay} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map((day, i) => {
            const dayStr = toDateString(day);
            const isSelected = dayStr === dateStr;
            const isToday = dayStr === toDateString(today);
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex flex-col items-center min-w-[52px] py-3 px-2 rounded-2xl transition-all duration-200 flex-shrink-0',
                  isSelected
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                )}
              >
                <span className="text-xs font-medium mb-1">{dayNames[day.getDay()]}</span>
                <span className="text-lg font-black">{day.getDate()}</span>
                {isToday && !isSelected && <div className="w-1 h-1 bg-primary-500 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Horários para {formatDate(dateStr)}
          </h4>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-200 border border-green-400 rounded" />
              <span className="text-slate-500">Disponível</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-200 rounded" />
              <span className="text-slate-500">Indisponível</span>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-primary-600 rounded" />
              <span className="text-slate-500">Selecionado</span>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : (
          <div>
            {renderSlots(morningSlots, 'Manhã')}
            {renderSlots(afternoonSlots, 'Tarde')}
            {renderSlots(eveningSlots, 'Noite')}
            {(!slots || slots.length === 0) && (
              <p className="text-center text-slate-500 py-8">Nenhum horário disponível para este dia.</p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {booking.bookingData.timeSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-6 border border-primary-200 dark:border-primary-800"
        >
          <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
            ✅ <strong>{formatDate(dateStr)}</strong> às{' '}
            <strong>{booking.bookingData.timeSlot.time} - {booking.bookingData.timeSlot.end_time}</strong> —{' '}
            {formatCurrency(booking.bookingData.quadra?.price_per_hour || 0)}
          </p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-center">
        <Button variant="outline" size="lg" onClick={booking.prevStep}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button
          size="lg"
          disabled={!booking.bookingData.timeSlot}
          onClick={booking.nextStep}
          className="min-w-48"
        >
          Continuar <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
