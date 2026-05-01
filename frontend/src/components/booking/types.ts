import { BookingData, Quadra, TimeSlot } from '@/types';
import { BookingStep } from '@/hooks/useBooking';

export interface UseBookingReturn {
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
