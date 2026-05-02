const axios = require('axios');

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getSportName = (sport) => {
  const names = { futebol_society: 'Futebol Society', futevolei: 'Futevôlei', volei_praia: 'Vôlei de Praia' };
  return names[sport] || sport;
};

const sendMessage = async (phone, message) => {
  if (!process.env.WHATSAPP_INSTANCE || !process.env.WHATSAPP_TOKEN) {
    console.log('[WhatsApp Mock] To:', phone, '\nMessage:', message);
    return { success: true, mock: true };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  try {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_INSTANCE}/token/${process.env.WHATSAPP_TOKEN}/send-text`,
      { phone: fullPhone, message }
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error('[WhatsApp] Send error:', err.message);
    return { success: false, error: err.message };
  }
};

const sendReservationConfirmation = async (phone, reserva) => {
  const sportName = getSportName(reserva.sport_type || reserva.quadra_sport_type);
  const message = `✅ *Sua reserva foi confirmada!*

🏟️ *Arena Chapadão*

⚽ *Esporte:* ${sportName}
📅 *Data:* ${formatDate(reserva.date)}
🕐 *Horário:* ${reserva.start_time?.substring(0, 5)} - ${reserva.end_time?.substring(0, 5)}
💰 *Valor:* ${formatCurrency(reserva.total_amount)}
💳 *Pagamento:* ${reserva.payment_method?.toUpperCase() || 'PIX'}

👤 *Nome:* ${reserva.client_name}

✨ Obrigado por reservar na *Arena Chapadão*!
Até ${formatDate(reserva.date)}! 🎉`;

  return sendMessage(phone, message);
};

const sendAdminNotification = async (reserva) => {
  const ownerPhone = process.env.WHATSAPP_OWNER_NUMBER;
  if (!ownerPhone) return;

  const sportName = getSportName(reserva.sport_type || reserva.quadra_sport_type);
  const message = `🔔 *Nova reserva recebida!*

⚽ *Esporte:* ${sportName}
📅 *Data:* ${formatDate(reserva.date)}
🕐 *Horário:* ${reserva.start_time?.substring(0, 5)} - ${reserva.end_time?.substring(0, 5)}
👤 *Cliente:* ${reserva.client_name}
📱 *Telefone:* ${reserva.client_phone}
💰 *Valor:* ${formatCurrency(reserva.total_amount)}
💳 *Pagamento:* ${reserva.payment_method?.toUpperCase() || 'PIX'}`;

  return sendMessage(ownerPhone, message);
};

const sendCancellationNotification = async (phone, reserva) => {
  const sportName = getSportName(reserva.sport_type || reserva.quadra_sport_type);
  const message = `❌ *Reserva Cancelada*

Sua reserva foi cancelada:
⚽ *Esporte:* ${sportName}
📅 *Data:* ${formatDate(reserva.date)}
🕐 *Horário:* ${reserva.start_time?.substring(0, 5)} - ${reserva.end_time?.substring(0, 5)}

Para mais informações, entre em contato conosco.
*Arena Chapadão* 🏟️`;

  return sendMessage(phone, message);
};

const sendPaymentReminder = async (phone, reserva) => {
  const message = `⏰ *Lembrete de Pagamento*

Sua reserva está aguardando pagamento:
📅 *Data:* ${formatDate(reserva.date)}
🕐 *Horário:* ${reserva.start_time?.substring(0, 5)}
💰 *Valor:* ${formatCurrency(reserva.total_amount)}

Acesse o link para finalizar o pagamento.
*Arena Chapadão* 🏟️`;

  return sendMessage(phone, message);
};

module.exports = {
  sendMessage,
  sendReservationConfirmation,
  sendAdminNotification,
  sendCancellationNotification,
  sendPaymentReminder,
};
