'use client';
import { motion } from 'framer-motion';
import { Footprints, Clock, CreditCard, MessageCircle, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Footprints,
    title: 'Escolha o esporte/quadra',
    description: 'Futebol Society, Futevôlei ou Vôlei de Praia. Escolha o esporte da sua preferência.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    number: 2,
    icon: Clock,
    title: 'Veja os horários disponíveis em tempo real',
    description: 'Calendário atualizado em tempo real. Sem surpresas, sem conflitos de agendamento.',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    number: 3,
    icon: CreditCard,
    title: 'Reserve e pague na hora (PIX, cartão)',
    description: 'Pagamento seguro via PIX ou cartão de crédito. Confirmação imediata.',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    number: 4,
    icon: MessageCircle,
    title: 'Receba confirmação automática no WhatsApp',
    description: 'Confirmação com todos os detalhes da reserva direto no seu WhatsApp.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    number: 5,
    icon: CheckCircle,
    title: 'Pronto! Sua reserva está garantida.',
    description: 'Chegue, jogue e aproveite. Sua quadra está esperando por você.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
            Como Funciona Para o Cliente
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Reserve em 5 passos simples
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Do escolha ao campo, tudo em poucos minutos. Sem filas, sem ligações.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 dark:from-blue-800 dark:via-violet-800 dark:to-emerald-800" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300 text-center h-full">
                  {/* Step number */}
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
