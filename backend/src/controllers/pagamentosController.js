const axios = require('axios');
const { query } = require('../config/database');
const whatsappService = require('../services/whatsappService');

const getMercadoPagoHeaders = () => ({
  'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'X-Idempotency-Key': Date.now().toString(),
});

const createPix = async (req, res) => {
  try {
    const { reserva_id } = req.body;

    const reservaResult = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type as quadra_sport_type FROM reservas r
       LEFT JOIN quadras q ON r.quadra_id = q.id WHERE r.id = $1`,
      [reserva_id]
    );

    if (reservaResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
    }

    const reserva = reservaResult.rows[0];

    const mpPayload = {
      transaction_amount: parseFloat(reserva.total_amount),
      description: `Reserva ${reserva.quadra_name} - ${reserva.date} ${reserva.start_time}`,
      payment_method_id: 'pix',
      payer: {
        email: reserva.client_email || 'cliente@arenachapadao.com',
        first_name: reserva.client_name.split(' ')[0],
        last_name: reserva.client_name.split(' ').slice(1).join(' ') || 'Cliente',
        identification: { type: 'CPF', number: '00000000000' },
      },
      notification_url: process.env.MP_NOTIFICATION_URL,
      external_reference: reserva_id,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    let pixData;
    try {
      const mpResponse = await axios.post(
        'https://api.mercadopago.com/v1/payments',
        mpPayload,
        { headers: getMercadoPagoHeaders() }
      );
      pixData = mpResponse.data;
    } catch (mpErr) {
      if (process.env.NODE_ENV === 'production') {
        console.error('createPix MP error:', mpErr?.response?.data || mpErr.message);
        return res.status(502).json({ success: false, message: 'Falha ao gerar PIX. Tente novamente.' });
      }
      pixData = {
        id: `MOCK_${Date.now()}`,
        point_of_interaction: {
          transaction_data: {
            qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            qr_code: `00020126580014BR.GOV.BCB.PIX0136${reserva_id}5204000053039865802BR5913Arena Chapadao6009SAO PAULO62070503***6304ABCD`,
          }
        },
        status: 'pending',
      };
    }

    const pagamento = await query(
      `INSERT INTO pagamentos (reserva_id, amount, method, status, payment_gateway_id, pix_qr_code, pix_copy_paste, payment_data)
       VALUES ($1, $2, 'pix', 'pending', $3, $4, $5, $6) RETURNING *`,
      [
        reserva_id,
        reserva.total_amount,
        pixData.id.toString(),
        pixData.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        pixData.point_of_interaction?.transaction_data?.qr_code || '',
        JSON.stringify(pixData),
      ]
    );

    await query(
      'UPDATE reservas SET payment_method = $1, payment_id = $2, updated_at = NOW() WHERE id = $3',
      ['pix', pixData.id.toString(), reserva_id]
    );

    res.json({
      success: true,
      data: {
        pagamento_id: pagamento.rows[0].id,
        pix_qr_code: pagamento.rows[0].pix_qr_code,
        pix_copy_paste: pagamento.rows[0].pix_copy_paste,
        amount: reserva.total_amount,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    });
  } catch (err) {
    console.error('createPix error:', err);
    res.status(500).json({ success: false, message: 'Erro ao gerar PIX' });
  }
};

const createCard = async (req, res) => {
  try {
    const { reserva_id, token, installments = 1, issuer_id, payment_method_id } = req.body;

    const reservaResult = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type as quadra_sport_type FROM reservas r
       LEFT JOIN quadras q ON r.quadra_id = q.id WHERE r.id = $1`,
      [reserva_id]
    );

    if (reservaResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
    }

    const reserva = reservaResult.rows[0];

    const mpPayload = {
      transaction_amount: parseFloat(reserva.total_amount),
      token,
      description: `Reserva ${reserva.quadra_name} - ${reserva.date}`,
      installments: parseInt(installments),
      payment_method_id,
      issuer_id,
      payer: { email: reserva.client_email || 'cliente@arenachapadao.com' },
      notification_url: process.env.MP_NOTIFICATION_URL,
      external_reference: reserva_id,
    };

    let cardData;
    try {
      const mpResponse = await axios.post('https://api.mercadopago.com/v1/payments', mpPayload, { headers: getMercadoPagoHeaders() });
      cardData = mpResponse.data;
    } catch (mpErr) {
      console.error('createCard MP error:', mpErr?.response?.data || mpErr.message);
      return res.status(502).json({ success: false, message: 'Falha ao processar cartão. Tente novamente ou use outro método.' });
    }

    const pagamento = await query(
      `INSERT INTO pagamentos (reserva_id, amount, method, status, payment_gateway_id, payment_data)
       VALUES ($1, $2, 'cartao', $3, $4, $5) RETURNING *`,
      [reserva_id, reserva.total_amount, cardData.status, cardData.id.toString(), JSON.stringify(cardData)]
    );

    if (cardData.status === 'approved') {
      await query(
        `UPDATE reservas SET status = 'confirmed', payment_status = 'approved', payment_method = 'cartao', payment_id = $1, updated_at = NOW() WHERE id = $2`,
        [cardData.id.toString(), reserva_id]
      );
      try {
        await whatsappService.sendReservationConfirmation(reserva.client_phone, { ...reserva, payment_method: 'cartao' });
        await whatsappService.sendAdminNotification({ ...reserva, payment_method: 'cartao' });
      } catch (_) {}
    }

    res.json({ success: true, data: { pagamento_id: pagamento.rows[0].id, status: cardData.status } });
  } catch (err) {
    console.error('createCard error:', err);
    res.status(500).json({ success: false, message: 'Erro ao processar cartão' });
  }
};

const webhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment' && data?.id) {
      let paymentInfo;
      try {
        const mpResponse = await axios.get(
          `https://api.mercadopago.com/v1/payments/${data.id}`,
          { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
        );
        paymentInfo = mpResponse.data;
      } catch (_) {
        return res.sendStatus(200);
      }

      const pagamento = await query(
        'SELECT * FROM pagamentos WHERE payment_gateway_id = $1',
        [data.id.toString()]
      );

      if (pagamento.rows.length > 0) {
        const status = paymentInfo.status === 'approved' ? 'approved' : paymentInfo.status === 'refunded' ? 'refunded' : 'failed';
        await query(
          'UPDATE pagamentos SET status = $1, updated_at = NOW() WHERE payment_gateway_id = $2',
          [status, data.id.toString()]
        );

        if (status === 'approved') {
          const reservaId = pagamento.rows[0].reserva_id;
          const reservaResult = await query(
            `SELECT r.*, q.name as quadra_name, q.sport_type as quadra_sport_type FROM reservas r
             LEFT JOIN quadras q ON r.quadra_id = q.id WHERE r.id = $1`,
            [reservaId]
          );

          await query(
            `UPDATE reservas SET status = 'confirmed', payment_status = 'approved', updated_at = NOW() WHERE id = $1`,
            [reservaId]
          );

          if (reservaResult.rows.length > 0) {
            const reserva = reservaResult.rows[0];
            try {
              await whatsappService.sendReservationConfirmation(reserva.client_phone, reserva);
              await whatsappService.sendAdminNotification(reserva);
            } catch (_) {}
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200);
  }
};

const getStatus = async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, r.status as reserva_status, r.client_phone, r.client_name, r.date,
              r.start_time, r.end_time, r.total_amount, r.payment_method,
              q.sport_type as quadra_sport_type
       FROM pagamentos p
       LEFT JOIN reservas r ON p.reserva_id = r.id
       LEFT JOIN quadras q ON r.quadra_id = q.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Pagamento não encontrado' });

    const pagamento = result.rows[0];

    // Se ainda está pendente, consulta o MP em tempo real
    if (pagamento.status === 'pending' && pagamento.payment_gateway_id && !pagamento.payment_gateway_id.startsWith('MOCK')) {
      try {
        const mpResponse = await axios.get(
          `https://api.mercadopago.com/v1/payments/${pagamento.payment_gateway_id}`,
          { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` } }
        );
        const mpStatus = mpResponse.data.status;

        if (mpStatus === 'approved') {
          await query('UPDATE pagamentos SET status = $1, updated_at = NOW() WHERE id = $2', ['approved', pagamento.id]);
          await query(
            `UPDATE reservas SET status = 'confirmed', payment_status = 'approved', updated_at = NOW() WHERE id = $1`,
            [pagamento.reserva_id]
          );
          pagamento.status = 'approved';
          pagamento.reserva_status = 'confirmed';

          try {
            await whatsappService.sendReservationConfirmation(pagamento.client_phone, pagamento);
            await whatsappService.sendAdminNotification(pagamento);
          } catch (_) {}
        }
      } catch (_) {}
    }

    res.json({ success: true, data: pagamento });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar status' });
  }
};

module.exports = { createPix, createCard, webhook, getStatus };
