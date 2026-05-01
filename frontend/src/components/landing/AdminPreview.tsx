'use client';
import { motion } from 'framer-motion';
import { Bell, Calendar, BarChart3, Users, CheckCircle, TrendingUp, DollarSign, Clock } from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: 'Notificação automática de cada reserva',
    description: 'Receba no WhatsApp e no painel toda nova reserva, pagamento e cancelamento em tempo real.',
    preview: (
      <div className="bg-white rounded-xl shadow-card p-3 text-xs border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">WA</span>
          </div>
          <span className="font-semibold text-slate-700">Divino Arena</span>
          <span className="text-slate-400 text-[10px] ml-auto">10:30</span>
        </div>
        <p className="text-slate-600 font-medium mb-1">🔔 Nova reserva recebida!</p>
        <p className="text-slate-500">Esporte: Futebol Society</p>
        <p className="text-slate-500">Data: 24/05/2025</p>
        <p className="text-slate-500">Horário: 14:00 - 15:00</p>
        <p className="text-slate-500">Cliente: João Silva</p>
        <p className="text-slate-500">Valor: R$ 80,00</p>
        <button className="mt-2 text-green-600 font-semibold text-[10px]">Responder →</button>
      </div>
    ),
  },
  {
    icon: Calendar,
    title: 'Painel com agenda do dia/semana',
    description: 'Visualize todas as reservas em um calendário semanal intuitivo. Crie, edite e cancele facilmente.',
    preview: (
      <div className="bg-slate-900 rounded-xl p-3 text-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">Agenda</span>
          <div className="flex gap-1">
            {['Dia', 'Semana', 'Mês'].map((v, i) => (
              <span key={v} className={`px-2 py-0.5 rounded text-[10px] ${i === 1 ? 'bg-primary-600 text-white' : 'text-slate-400'}`}>{v}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
            <div key={d} className="text-center text-[9px] text-slate-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[
            null, null,
            { label: '9:00 Futevôlei', color: 'bg-orange-500' },
            null,
            { label: '14:00 Futebol', color: 'bg-green-600' },
            null,
            null,
            null,
            { label: '16:00 Futebol João S.', color: 'bg-green-600' },
            null,
            { label: '16:00 Vôlei', color: 'bg-blue-500' },
            { label: '14:00 Futebol', color: 'bg-green-600' },
            null,
            null,
          ].map((item, i) => (
            <div key={i} className={`rounded p-0.5 text-[8px] min-h-[28px] ${item ? item.color + ' text-white font-medium' : 'bg-slate-800'}`}>
              {item?.label}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: 'Histórico de pagamentos',
    description: 'Controle financeiro completo com relatórios de faturamento, recebimentos e pendências.',
    preview: (
      <div className="bg-white rounded-xl shadow-card p-3 text-xs border border-slate-100">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-slate-500 text-[10px]">Faturamento</p>
            <p className="font-black text-slate-900 text-sm">R$ 4.320,00</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px]">Recebidos</p>
            <p className="font-black text-green-600 text-sm">R$ 4.320,00</p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px]">Pendentes</p>
            <p className="font-black text-orange-500 text-sm">R$ 0,00</p>
          </div>
        </div>
        <table className="w-full">
          <tbody>
            {[
              ['João Silva', 'R$ 80,00', 'PIX'],
              ['Maria F.', 'R$ 60,00', 'Cartão'],
              ['Carlos A.', 'R$ 70,00', 'PIX'],
            ].map(([name, val, pay], i) => (
              <tr key={i} className="border-t border-slate-50">
                <td className="py-1 text-slate-600">{name}</td>
                <td className="py-1 text-slate-800 font-semibold">{val}</td>
                <td className="py-1">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${pay === 'PIX' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {pay}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
];

const adminStats = [
  { icon: DollarSign, label: 'Receita mensal', value: 'R$ 15.840', change: '+23%', up: true },
  { icon: Users, label: 'Clientes ativos', value: '142', change: '+8', up: true },
  { icon: Calendar, label: 'Reservas/mês', value: '198', change: '+15%', up: true },
  { icon: Clock, label: 'Ocupação média', value: '87%', change: '+5%', up: true },
];

export default function AdminPreview() {
  return (
    <section id="admin" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-wider">
            Para o Dono da Arena
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            Gestão completa na palma da mão
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Controle total das suas reservas, clientes e financeiro. Tudo em um só lugar.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {adminStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary-600" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.up ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{feature.title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{feature.description}</p>
                {feature.preview}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="/admin/login"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Acessar painel admin
            <TrendingUp className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
