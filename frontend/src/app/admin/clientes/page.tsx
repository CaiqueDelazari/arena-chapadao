'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Search, Users, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';

interface Cliente {
  client_name: string;
  client_phone: string;
  client_email?: string;
  total_reservas: string;
  total_gasto: string;
  ultima_reserva: string;
}

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clientes', debouncedSearch, page],
    queryFn: async () => {
      const res = await adminApi.getClientes({ search: debouncedSearch || undefined, page });
      return res.data;
    },
  });

  const clientes: Cliente[] = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((window as any)._searchTimeout);
    (window as any)._searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Clientes</h2>
        <p className="text-slate-500 text-sm">Histórico e dados de todos os clientes</p>
      </div>

      {/* Search */}
      <Card padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Carregando clientes..." /></div>
      ) : clientes.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-12 text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum cliente encontrado</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientes.map((c, i) => (
            <motion.div
              key={`${c.client_phone}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card padding="md" className="h-full">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">
                      {c.client_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{c.client_name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span>{c.client_phone}</span>
                    </div>
                    {c.client_email && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{c.client_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Reservas</span>
                    </div>
                    <p className="font-black text-lg text-slate-900 dark:text-white">
                      {parseInt(c.total_reservas)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Total gasto</span>
                    </div>
                    <p className="font-black text-lg text-green-600">
                      {formatCurrency(parseFloat(c.total_gasto))}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Última reserva: {c.ultima_reserva ? formatDate(c.ultima_reserva) : '—'}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">{pagination.total} clientes</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">Pág. {page}</span>
            <Button variant="outline" size="sm" disabled={page * pagination.limit >= pagination.total} onClick={() => setPage(p => p + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
