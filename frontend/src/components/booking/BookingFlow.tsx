'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '@/hooks/useBooking';
import Step1Sports from './Step1Sports';
import Step2Schedule from './Step2Schedule';
import Step3Payment from './Step3Payment';
import Step4WhatsApp from './Step4WhatsApp';
import Step5Confirmed from './Step5Confirmed';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_LABELS = ['Esporte', 'Horário', 'Pagamento', 'WhatsApp', 'Pronto!'];

export default function BookingFlow() {
  const booking = useBooking();

  return (
    <section id="reserva" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
            Reserve Agora
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Sua quadra em poucos cliques
          </h2>
        </motion.div>

        {/* Progress bar */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isCompleted = booking.step > stepNum;
              const isCurrent = booking.step === stepNum;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary-600 text-white shadow-glow' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    )}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                    </div>
                    <span className={cn(
                      'text-xs mt-1 font-medium whitespace-nowrap',
                      isCurrent ? 'text-primary-600' : isCompleted ? 'text-green-500' : 'text-slate-400'
                    )}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={cn(
                      'h-0.5 w-12 sm:w-16 mx-1 mb-5 transition-all duration-300',
                      booking.step > stepNum ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={booking.step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {booking.step === 1 && <Step1Sports booking={booking} />}
            {booking.step === 2 && <Step2Schedule booking={booking} />}
            {booking.step === 3 && <Step3Payment booking={booking} />}
            {booking.step === 4 && <Step4WhatsApp booking={booking} />}
            {booking.step === 5 && <Step5Confirmed booking={booking} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
