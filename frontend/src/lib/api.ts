import axios from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse, Quadra, TimeSlot, Reserva, BookingData, DashboardStats, FinanceiroData } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', { email, password }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/register', data),

  getMe: () => api.get<ApiResponse<any>>('/auth/me'),
};

export const quadrasApi = {
  getAll: () => api.get<ApiResponse<Quadra[]>>('/quadras'),
  getById: (id: string) => api.get<ApiResponse<Quadra>>(`/quadras/${id}`),
  getSlots: (id: string, date: string) =>
    api.get<ApiResponse<TimeSlot[]>>(`/quadras/${id}/slots?date=${date}`),
  create: (data: Partial<Quadra>) => api.post<ApiResponse<Quadra>>('/quadras', data),
  update: (id: string, data: Partial<Quadra>) => api.put<ApiResponse<Quadra>>(`/quadras/${id}`, data),
  delete: (id: string) => api.delete(`/quadras/${id}`),
};

export const reservasApi = {
  create: (data: {
    quadra_id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    date: string;
    start_time: string;
    end_time: string;
    coupon_code?: string;
    notes?: string;
  }) => api.post<ApiResponse<Reserva>>('/reservas', data),

  getAll: (params?: { status?: string; date?: string; quadra_id?: string; page?: number }) =>
    api.get<ApiResponse<Reserva[]>>('/reservas', { params }),

  getAgenda: (start: string, end: string) =>
    api.get<ApiResponse<Reserva[]>>(`/reservas/agenda?start=${start}&end=${end}`),

  getById: (id: string) => api.get<ApiResponse<Reserva>>(`/reservas/${id}`),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Reserva>>(`/reservas/${id}/status`, { status }),

  cancel: (id: string) => api.post(`/reservas/${id}/cancel`),
};

export const pagamentosApi = {
  createPix: (reserva_id: string) =>
    api.post<ApiResponse<{ pagamento_id: string; pix_qr_code: string; pix_copy_paste: string; amount: number; expires_at: string }>>('/pagamentos/pix', { reserva_id }),

  createCard: (data: { reserva_id: string; token: string; installments?: number; payment_method_id: string }) =>
    api.post<ApiResponse<{ pagamento_id: string; status: string }>>('/pagamentos/cartao', data),

  getStatus: (id: string) => api.get<ApiResponse<any>>(`/pagamentos/${id}/status`),
};

export const adminApi = {
  getDashboard: () => api.get<ApiResponse<DashboardStats>>('/admin/dashboard'),

  getFinanceiro: (period?: string, start_date?: string, end_date?: string) =>
    api.get<ApiResponse<FinanceiroData>>('/admin/financeiro', { params: { period, start_date, end_date } }),

  getAgenda: (start: string, end: string) =>
    api.get<ApiResponse<Reserva[]>>(`/admin/agenda?start=${start}&end=${end}`),

  getClientes: (params?: { page?: number; search?: string }) =>
    api.get<ApiResponse<any[]>>('/admin/clientes', { params }),

  getConfiguracoes: () => api.get<ApiResponse<Record<string, string>>>('/admin/configuracoes'),

  updateConfiguracoes: (data: Record<string, string>) =>
    api.put<ApiResponse<null>>('/admin/configuracoes', data),

  getReservas: (params?: { status?: string; date?: string; page?: number }) =>
    api.get<ApiResponse<Reserva[]>>('/reservas', { params }),

  updateReservaStatus: (id: string, status: string) =>
    api.put<ApiResponse<Reserva>>(`/reservas/${id}/status`, { status }),
};

export default api;
