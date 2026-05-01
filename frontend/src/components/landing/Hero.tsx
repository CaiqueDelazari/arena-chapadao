'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Footprints, Calendar, CreditCard, MessageCircle, Zap, Shield, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

const steps = [
  { icon: Footprints, label: 'Escolha o esporte', color: 'bg-blue-500' },
  { icon: Calendar, label: 'Veja horários', color: 'bg-indigo-500' },
  { icon: CreditCard, label: 'Reserve e pague', color: 'bg-violet-500' },
  { icon: MessageCircle, label: 'Receba no WhatsApp', color: 'bg-green-500' },
];

const stats = [
  { value: '500+', label: 'Reservas/mês' },
  { value: '98%', label: 'Satisfação' },
  { value: '3min', label: 'Tempo médio' },
  { value: '24/7', label: 'Disponível' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        {/* Top steps bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex justify-center mb-16"
        >
          <div className="glass-dark rounded-2xl px-8 py-4 flex items-center gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-white/80 font-medium whitespace-nowrap">{step.label}</span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-white/20 ml-4" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-400/30 rounded-full px-4 py-2 mb-6"
          >
            <Zap className="w-4 h-4 text-primary-300" />
            <span className="text-sm text-primary-200 font-medium">Reserva em menos de 3 minutos</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6"
          >
            <span className="text-white">Reserve sua quadra</span>
            <span className="block" style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              de forma rápida e fácil!
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto"
          >
            Escolha, reserve, pague e pronto. Tudo em poucos cliques.
            Confirmação automática no WhatsApp.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="xl"
              onClick={() => document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-black text-lg text-white shadow-glow-orange"
              style={{ background: 'linear-gradient(135deg, #ea6c0d, #f97316)' }}
            >
              Reservar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Como funciona?
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div key={i} className="glass-dark rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-blue-200/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mt-16"
        >
          {[
            { icon: Zap, text: 'Reservas rápidas' },
            { icon: Shield, text: 'Pagamento seguro' },
            { icon: MessageCircle, text: 'Confirmação WhatsApp' },
            { icon: Star, text: 'Gestão completa' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 glass-dark rounded-full px-4 py-2">
              <item.icon className="w-4 h-4 text-primary-300" />
              <span className="text-xs text-white/80 font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full fill-slate-50 dark:fill-slate-900" preserveAspectRatio="none" height="80">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
