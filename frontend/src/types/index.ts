export type SportType = 'futebol_society' | 'futevolei' | 'volei_praia';
export type ReservaStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'pix' | 'cartao';
export type PaymentStatus = 'pending' | 'approved' | 'failed' | 'refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
  phone?: string;
  created_at?: string;
}

export interface Quadra {
  id: string;
  name: string;
  sport_type: SportType;
  description?: string;
  price_per_hour: number;
  price_per_hour_weekend?: number;
  image_url?: string;
  is_active: boolean;
}

export interface TimeSlot {
  time: string;
  end_time: string;
  available: boolean;
}

export interface Reserva {
  id: string;
  quadra_id: string;
  quadra_name?: string;
  sport_type?: SportType;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: ReservaStatus;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_id?: string;
  coupon_code?: string;
  discount_amount?: number;
  notes?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  created_at: string;
  updated_at: string;
}

export interface Pagamento {
  id: string;
  reserva_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_gateway_id?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  created_at: string;
}

export interface BookingData {
  quadra?: Quadra;
  date?: string;
  timeSlot?: TimeSlot;
  clientInfo?: {
    name: string;
    phone: string;
    email: string;
    coupon?: string;
  };
  reserva?: Reserva;
  pagamento?: {
    id: string;
    pix_qr_code?: string;
    pix_copy_paste?: string;
    method: PaymentMethod;
    amount: number;
  };
}

export interface DashboardStats {
  total_today: number;
  total_week: number;
  revenue_today: number;
  revenue_month: number;
  upcoming_reservas: Reserva[];
  recent_payments: Array<{
    client_name: string;
    total_amount: number;
    payment_method: string;
    date: string;
    quadra_name: string;
    created_at: string;
  }>;
}

export interface FinanceiroData {
  faturamento: string;
  recebidos: string;
  pendentes: string;
  transactions: Reserva[];
  by_quadra: Array<{
    quadra_name: string;
    sport_type: SportType;
    total_reservas: number;
    receita: string;
  }>;
  by_day: Array<{
    date: string;
    receita: string;
    total: number;
  }>;
}

export interface Mensalista {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  quadra_id: string;
  quadra_name?: string;
  sport_type?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Bloqueio {
  id: string;
  quadra_id: string;
  quadra_name?: string;
  sport_type?: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}
