'use client';
import { useState, useCallback } from 'react';
import { BookingData, Quadra, TimeSlot } from '@/types';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

interface UseBookingReturn {
  step: BookingStep;
  bookingData: BookingData;
  selectQuadra: (quadra: Quadra) => void;
  selectDate: (date: string) => void;
  selectTimeSlot: (slot: TimeSlot) => void;
  setClientInfo: (info: BookingData['clientInfo']) => void;
  setReserva: (reserva: BookingData['reserva']) => void;
  setPagamento: (pagamento: BookingData['pagamento']) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: BookingStep) => void;
  reset: () => void;
}

const initialData: BookingData = {};

export function useBooking(): UseBookingReturn {
  const [step, setStep] = useState<BookingStep>(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialData);

  const selectQuadra = useCallback((quadra: Quadra) => {
    setBookingData(prev => ({ ...prev, quadra, date: undefined, timeSlot: undefined }));
  }, []);

  const selectDate = useCallback((date: string) => {
    setBookingData(prev => ({ ...prev, date, timeSlot: undefined }));
  }, []);

  const selectTimeSlot = useCallback((slot: TimeSlot) => {
    setBookingData(prev => ({ ...prev, timeSlot: slot }));
  }, []);

  const setClientInfo = useCallback((info: BookingData['clientInfo']) => {
    setBookingData(prev => ({ ...prev, clientInfo: info }));
  }, []);

  const setReserva = useCallback((reserva: BookingData['reserva']) => {
    setBookingData(prev => ({ ...prev, reserva }));
  }, []);

  const setPagamento = useCallback((pagamento: BookingData['pagamento']) => {
    setBookingData(prev => ({ ...prev, pagamento }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 5) as BookingStep);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1) as BookingStep);
  }, []);

  const goToStep = useCallback((newStep: BookingStep) => {
    setStep(newStep);
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setBookingData(initialData);
  }, []);

  return {
    step,
    bookingData,
    selectQuadra,
    selectDate,
    selectTimeSlot,
    setClientInfo,
    setReserva,
    setPagamento,
    nextStep,
    prevStep,
    goToStep,
    reset,
  };
}
