'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Save, CheckCircle } from 'lucide-react';

const CONFIG_FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: 'arena_name', label: 'Nome da arena', placeholder: 'Divino Arena' },
  { key: 'arena_phone', label: 'Telefone / WhatsApp', placeholder: '(62) 99999-9999', type: 'tel' },
  { key: 'arena_email', label: 'E-mail de contato', placeholder: 'contato@arena.com', type: 'email' },
  { key: 'arena_address', label: 'Endereço', placeholder: 'Rua das Quadras, 123 – Chapadão do Céu, GO' },
  { key: 'arena_instagram', label: 'Instagram', placeholder: '@divinoarena' },
  { key: 'open_time', label: 'Horário de abertura', placeholder: '08:00', type: 'time' },
  { key: 'close_time', label: 'Horário de fechamento', placeholder: '22:00', type: 'time' },
  { key: 'slot_duration_minutes', label: 'Duração do slot (minutos)', placeholder: '60', type: 'number' },
  { key: 'whatsapp_message_template', label: 'Mensagem WhatsApp (confirmação)', placeholder: 'Olá {nome}! Sua reserva em {data} às {hora} foi confirmada.' },
  { key: 'pix_key', label: 'Chave PIX', placeholder: 'cpf@email.com ou chave aleatória' },
];

export default function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-configuracoes'],
    queryFn: async () => {
      const res = await adminApi.getConfiguracoes();
      return res.data.data as Record<string, string>;
    },
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => adminApi.updateConfiguracoes(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-configuracoes'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Carregando configurações..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Configurações</h2>
          <p className="text-slate-500 text-sm">Dados e preferências da arena</p>
        </div>
        <Button
          onClick={() => save.mutate()}
          loading={save.isPending}
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar alterações
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arena info */}
        <Card padding="md">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Informações da arena</h3>
          <div className="space-y-4">
            {CONFIG_FIELDS.slice(0, 5).map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Operation settings */}
        <div className="space-y-6">
          <Card padding="md">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Funcionamento</h3>
            <div className="space-y-4">
              {CONFIG_FIELDS.slice(5, 8).map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={form[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Pagamentos & Notificações</h3>
            <div className="space-y-4">
              {CONFIG_FIELDS.slice(8).map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {field.label}
                  </label>
                  {field.key === 'whatsapp_message_template' ? (
                    <textarea
                      value={form[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={form[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <Button
          onClick={() => save.mutate()}
          loading={save.isPending}
          size="lg"
          className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {saved ? (
            <><CheckCircle className="w-5 h-5" /> Configurações salvas!</>
          ) : (
            <><Save className="w-5 h-5" /> Salvar alterações</>
          )}
        </Button>
      </div>
    </div>
  );
}
