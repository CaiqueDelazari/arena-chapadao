import Image from 'next/image';
import { Phone, MapPin, Zap, Shield, MessageCircle, BarChart3, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.jpeg" alt="Arena Chapadão" width={64} height={64} className="rounded-xl object-contain bg-white p-1" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Mais praticidade para você. Mais organização para o seu negócio.
              Reserve sua quadra de forma rápida e fácil.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { icon: Zap, text: 'Reservas rápidas' },
                { icon: Shield, text: 'Pagamento seguro' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <item.icon className="w-3.5 h-3.5 text-primary-400" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-slate-300">Navegação</h4>
            <ul className="space-y-2">
              {['Como funciona', 'Reservar agora', 'Para arenas', 'Contato'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-slate-300">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:1431000320" className="hover:text-white transition-colors">(14) 3100-0320</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                16:30 – 00:00 (Seg a Dom)
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                Agudos, SP
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Zap, text: 'Reservas rápidas' },
              { icon: Shield, text: 'Pagamento seguro' },
              { icon: MessageCircle, text: 'Confirmação automática' },
              { icon: BarChart3, text: 'Gestão completa' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <item.icon className="w-3.5 h-3.5 text-primary-500" />
                {item.text}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600">© 2025 Arena Chapadão. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
