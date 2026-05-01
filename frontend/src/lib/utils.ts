import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SportType, ReservaStatus, PaymentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getSportLabel(sport: SportType | string): string {
  const labels: Record<string, string> = {
    futebol_society: 'Futebol Society',
    futevolei: 'Futevôlei',
    volei_praia: 'Vôlei de Praia',
  };
  return labels[sport] || sport;
}

export function getSportIcon(sport: SportType | string): string {
  const icons: Record<string, string> = {
    futebol_society: '⚽',
    futevolei: '🏐',
    volei_praia: '🏖️',
  };
  return icons[sport] || '🏟️';
}

export function getSportColor(sport: SportType | string): string {
  const colors: Record<string, string> = {
    futebol_society: 'bg-green-500',
    futevolei: 'bg-orange-500',
    volei_praia: 'bg-blue-400',
  };
  return colors[sport] || 'bg-blue-500';
}

export function getStatusLabel(status: ReservaStatus | string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Concluída',
  };
  return labels[status] || status;
}

export function getStatusColor(status: ReservaStatus | string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    confirmed: 'text-green-600 bg-green-50 border-green-200',
    cancelled: 'text-red-600 bg-red-50 border-red-200',
    completed: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getPaymentStatusLabel(status: PaymentStatus | string): string {
  const labels: Record<string, string> = {
    pending: 'Aguardando',
    approved: 'Aprovado',
    failed: 'Falhou',
    refunded: 'Reembolsado',
  };
  return labels[status] || status;
}

export function getPaymentStatusColor(status: PaymentStatus | string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    approved: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    refunded: 'text-blue-600 bg-blue-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
}

export function getDayName(dayIndex: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[dayIndex] || '';
}

export function getWeekDates(startDate?: Date): Date[] {
  const start = startDate || new Date();
  const dayOfWeek = start.getDay();
  const monday = new Date(start);
  monday.setDate(start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isTodayOrFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr >= today;
}
