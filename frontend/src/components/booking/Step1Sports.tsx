'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { quadrasApi } from '@/lib/api';
import { Quadra } from '@/types';
import { getSportLabel, getSportIcon, formatCurrency, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner, { SkeletonCard } from '@/components/ui/LoadingSpinner';
import { ArrowRight, Users, Clock, MapPin } from 'lucide-react';
import { UseBookingReturn } from './types';

interface Props { booking: UseBookingReturn; }

export default function Step1Sports({ booking }: Props) {
  const FALLBACK_QUADRAS: Quadra[] = [
    { id: 'q1', name: 'Quadra Society', sport_type: 'futebol_society', price_per_hour: 120, is_active: true },
    { id: 'q2', name: 'Quadra Futevôlei', sport_type: 'futevolei', price_per_hour: 80, is_active: true },
    { id: 'q3', name: 'Quadra Vôlei de Praia', sport_type: 'volei_praia', price_per_hour: 80, is_active: true },
  ];

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['quadras'],
    queryFn: async () => {
      const res = await quadrasApi.getAll();
      return res.data.data;
    },
    retry: false,
  });

  const data = apiData?.length ? apiData : FALLBACK_QUADRAS;

  const sportInfo: Record<string, { players: string; duration: string; description: string; gradient: string }> = {
    futebol_society: {
      players: '10 jogadores',
      duration: 'Mín. 1 hora',
      description: 'Grama sintética de alta qualidade, iluminação completa',
      gradient: 'from-green-500 to-emerald-600',
    },
    futevolei: {
      players: '4 jogadores',
      duration: 'Mín. 1 hora',
      description: 'Areia fina importada, rede profissional',
      gradient: 'from-orange-500 to-amber-600',
    },
    volei_praia: {
      players: '6 jogadores',
      duration: 'Mín. 1 hora',
      description: 'Areia de praia autêntica, iluminação noturna',
      gradient: 'from-blue-500 to-cyan-600',
    },
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Escolha o esporte</h3>
        <p className="text-slate-500 dark:text-slate-400">Selecione a quadra que você quer reservar</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(data || []).map((quadra: Quadra, i: number) => {
            const info = sportInfo[quadra.sport_type] ?? { players: '—', duration: 'Mín. 1 hora', description: '', gradient: 'from-blue-500 to-blue-600' };
            const isSelected = booking.bookingData.quadra?.id === quadra.id;

            return (
              <motion.div
                key={quadra.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => booking.selectQuadra(quadra)}
                className={cn(
                  'relative rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group',
                  isSelected
                    ? 'border-primary-500 shadow-glow'
                    : 'border-slate-100 dark:border-slate-700 hover:border-primary-300 hover:shadow-card-hover'
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Sport header */}
                <div className={`bg-gradient-to-br ${info.gradient || 'from-blue-500 to-blue-600'} p-6 text-center`}>
                  <div className="text-5xl mb-3">{getSportIcon(quadra.sport_type)}</div>
                  <h4 className="font-bold text-white text-lg">{getSportLabel(quadra.sport_type)}</h4>
                  <div className="text-white/80 text-2xl font-black mt-1">
                    {formatCurrency(quadra.price_per_hour)}<span className="text-sm font-normal">/h</span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-white dark:bg-slate-800 p-4 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{info.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{info.players}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{info.duration}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          disabled={!booking.bookingData.quadra}
          onClick={booking.nextStep}
          className="min-w-48"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
