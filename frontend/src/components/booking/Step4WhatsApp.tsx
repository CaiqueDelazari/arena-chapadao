'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency, getSportLabel } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { MessageCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { UseBookingReturn } from './types';

interface Props { booking: UseBookingReturn; }

export default function Step4WhatsApp({ booking }: Props) {
  const [step, setStep] = useState(0);
  const { reserva, quadra, clientInfo } = booking.bookingData;

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const messages = [
    {
      text: `✅ *Sua reserva foi confirmada!*\n\n🏟️ *Divino Arena*\n\n⚽ *Esporte:* ${getSportLabel(quadra?.sport_type || '')}\n📅 *Data:* ${formatDate(reserva?.date || '')}\n🕐 *Horário:* ${reserva?.start_time?.substring(0, 5)} - ${reserva?.end_time?.substring(0, 5)}\n💰 *Valor:* ${formatCurrency(reserva?.total_amount || 0)}\n\nObrigado por reservar na Divino Arena!`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <MessageCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Confirmação no WhatsApp
        </h3>
        <p className="text-slate-500">
          Enviando mensagem para {clientInfo?.phone}
        </p>
      </div>

      {/* WhatsApp mockup */}
      <div className="bg-[#ECE5DD] rounded-2xl overflow-hidden shadow-xl mb-8">
        {/* Header */}
        <div className="bg-[#128C7E] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">DA</div>
          <div>
            <div className="text-white font-semibold text-sm">Divino Arena</div>
            <div className="text-white/70 text-xs">online</div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 min-h-[250px] space-y-3">
          {step >= 1 && messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex justify-end"
            >
              <div className="max-w-[85%]">
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {msg.text}
                  </pre>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                    {step >= 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <CheckCircle className="w-3 h-3 text-[#53bdeb]" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {step === 0 && (
            <div className="flex justify-center items-center h-32">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <span className="text-xs text-slate-500 bg-white/50 px-3 py-1 rounded-full">
                Mensagem entregue ✅
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button fullWidth size="lg" onClick={booking.nextStep}>
            Ver confirmação final
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
