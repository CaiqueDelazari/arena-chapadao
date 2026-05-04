import { Clock, Phone, DollarSign } from 'lucide-react';

export default function InfoPrecos() {
  return (
    <section className="bg-slate-50 py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Informações & Preços</h2>
          <p className="text-slate-500 text-sm">Tudo que você precisa saber antes de reservar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Horário */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Horário de Funcionamento</h3>
            <p className="text-slate-500 text-sm">Segunda a Domingo</p>
            <span className="text-2xl font-black text-blue-600">16:30 – 00:00</span>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Fale Conosco</h3>
            <p className="text-slate-500 text-sm">Ligue ou mande uma mensagem</p>
            <a
              href="tel:1431000320"
              className="text-2xl font-black text-green-600 hover:text-green-700 transition-colors"
            >
              (14) 3100-0320
            </a>
          </div>

          {/* Preços */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3">
            <div className="flex flex-col items-center text-center gap-2 mb-1">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Tabela de Preços</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Areia – Seg a Qui</p>
                  <p className="text-xs text-slate-400">por hora</p>
                </div>
                <span className="text-lg font-black text-slate-900">R$ 75</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Areia – Sex, Sáb e Dom</p>
                  <p className="text-xs text-slate-400">por hora</p>
                </div>
                <span className="text-lg font-black text-slate-900">R$ 65</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Society</p>
                  <p className="text-xs text-slate-400">por hora</p>
                </div>
                <span className="text-lg font-black text-slate-900">R$ 150</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
