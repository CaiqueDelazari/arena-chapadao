'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { reservasApi, pagamentosApi } from '@/lib/api';
import { formatDate, formatCurrency, getSportLabel, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ArrowLeft, Copy, CheckCircle, CreditCard, Smartphone, Tag, User, Phone, Mail } from 'lucide-react';
import { UseBookingReturn } from './types';

const PIX_POLL_INTERVAL_MS = 5000;
const PIX_POLL_TIMEOUT_MS = 30 * 60 * 1000;

interface Props { booking: UseBookingReturn; }

interface FormData {
  name: string;
  phone: string;
  email: string;
  coupon: string;
}

export default function Step3Payment({ booking }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<{ pix_copy_paste: string; pix_qr_code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixExpired, setPixExpired] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const { quadra, date, timeSlot } = booking.bookingData;
  const totalAmount = quadra?.price_per_hour || 0;

  const onSubmit = async (formData: FormData) => {
    if (!quadra || !date || !timeSlot) return;
    setIsLoading(true);

    try {
      const reservaRes = await reservasApi.create({
        quadra_id: quadra.id,
        client_name: formData.name,
        client_phone: formData.phone.replace(/\D/g, ''),
        client_email: formData.email,
        date,
        start_time: timeSlot.time,
        end_time: timeSlot.end_time,
        coupon_code: formData.coupon || undefined,
      });

      const reserva = reservaRes.data.data;
      booking.setReserva(reserva);
      booking.setClientInfo({ name: formData.name, phone: formData.phone, email: formData.email, coupon: formData.coupon });

      if (paymentMethod === 'pix') {
        const pixRes = await pagamentosApi.createPix(reserva.id);
        const pix = pixRes.data.data;
        setPixData({ pix_copy_paste: pix.pix_copy_paste, pix_qr_code: pix.pix_qr_code, amount: pix.amount });
        booking.setPagamento({ id: pix.pagamento_id, pix_copy_paste: pix.pix_copy_paste, pix_qr_code: pix.pix_qr_code, method: 'pix', amount: pix.amount });

        stopPolling();
        setPixExpired(false);
        pollIntervalRef.current = setInterval(async () => {
          try {
            const statusRes = await pagamentosApi.getStatus(pix.pagamento_id);
            if (statusRes.data.data.status === 'approved') {
              stopPolling();
              booking.nextStep();
            }
          } catch (_) {}
        }, PIX_POLL_INTERVAL_MS);
        pollTimeoutRef.current = setTimeout(() => {
          stopPolling();
          setPixExpired(true);
          toast('PIX expirou. Gere um novo para continuar.', { icon: '⏰' });
        }, PIX_POLL_TIMEOUT_MS);
      } else {
        booking.setPagamento({ id: reserva.id, method: 'cartao', amount: totalAmount });
        booking.nextStep();
      }

      toast.success('Reserva criada! Complete o pagamento.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar reserva');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPix = () => {
    if (pixData?.pix_copy_paste) {
      navigator.clipboard.writeText(pixData.pix_copy_paste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const simulatePayment = () => {
    stopPolling();
    booking.nextStep();
  };

  const isDev = process.env.NODE_ENV !== 'production';

  if (pixData) {
    return (
      <div className="max-w-lg mx-auto">
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Pague com PIX</h3>
          <p className="text-slate-500 mb-6 text-sm">Escaneie o QR Code ou copie o código</p>

          {/* QR Code */}
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 inline-block mb-6">
            {pixData.pix_qr_code ? (
              <img
                src={`data:image/png;base64,${pixData.pix_qr_code}`}
                alt="QR Code PIX"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center">
                <p className="text-xs text-slate-500 text-center px-4">QR Code PIX gerado</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-500 mb-2">Código PIX Copia e Cola:</p>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all leading-relaxed">
              {pixData.pix_copy_paste.substring(0, 60)}...
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={copyPix} variant={copied ? 'secondary' : 'primary'} disabled={pixExpired}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar código PIX'}
            </Button>
            {pixExpired ? (
              <>
                <p className="text-xs text-red-500 font-semibold">PIX expirado. Por favor, refaça o pagamento.</p>
                <Button fullWidth size="sm" onClick={() => { setPixData(null); setPixExpired(false); }}>
                  Gerar novo PIX
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-400">Aguardando confirmação do pagamento...</p>
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            )}
            {isDev && (
              <Button variant="ghost" size="sm" onClick={simulatePayment} className="text-xs">
                Simular pagamento aprovado (dev)
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form */}
        <div className="md:col-span-3">
          <Card padding="lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Seus dados</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="João Silva"
                required
                icon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name', { required: 'Nome obrigatório' })}
              />
              <Input
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                required
                type="tel"
                icon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone', { required: 'WhatsApp obrigatório' })}
              />
              <Input
                label="E-mail"
                placeholder="joao@email.com"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                {...register('email')}
              />
              <Input
                label="Cupom de desconto"
                placeholder="ARENA10"
                icon={<Tag className="w-4 h-4" />}
                {...register('coupon')}
              />

              {/* Payment method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Forma de pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pix' as const, label: 'PIX', icon: Smartphone, desc: 'Instantâneo' },
                    { value: 'cartao' as const, label: 'Cartão', icon: CreditCard, desc: 'Crédito/débito' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        paymentMethod === method.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      )}
                    >
                      <method.icon className={cn('w-5 h-5 mb-2', paymentMethod === method.value ? 'text-primary-600' : 'text-slate-400')} />
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{method.label}</div>
                      <div className="text-xs text-slate-500">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={isLoading} className="mt-2">
                Confirmar e pagar {formatCurrency(totalAmount)}
              </Button>
            </form>
          </Card>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <Card padding="md" className="sticky top-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resumo da reserva</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Esporte</span>
                <span className="font-medium">{getSportLabel(quadra?.sport_type || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data</span>
                <span className="font-medium">{formatDate(date || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Horário</span>
                <span className="font-medium">{timeSlot?.time} - {timeSlot?.end_time}</span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline" size="md" onClick={booking.prevStep}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>
    </div>
  );
}
