const { query, getClient } = require('../config/database');
const whatsappService = require('../services/whatsappService');

const create = async (req, res) => {
  const { quadra_id, client_name, client_phone, client_email, date, start_time, end_time, coupon_code, notes } = req.body;

  if (!quadra_id || !client_name || !client_phone || !date || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const conflict = await client.query(
      `SELECT id FROM reservas
       WHERE quadra_id = $1 AND DATE(date) = $2 AND status NOT IN ('cancelled')
       AND (start_time < $4 AND end_time > $3)`,
      [quadra_id, date, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Horário já reservado. Por favor, escolha outro.' });
    }

    const quadraResult = await client.query('SELECT price_per_hour FROM quadras WHERE id = $1', [quadra_id]);
    if (quadraResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
    }

    const pricePerHour = parseFloat(quadraResult.rows[0].price_per_hour);
    const [startH, startM] = start_time.split(':').map(Number);
    const [endH, endM] = end_time.split(':').map(Number);
    const hours = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
    let totalAmount = pricePerHour * hours;
    let discountAmount = 0;

    if (coupon_code) {
      const couponResult = await client.query(
        `SELECT * FROM cupons WHERE code = $1 AND is_active = true
         AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [coupon_code.toUpperCase()]
      );

      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0];
        discountAmount = coupon.discount_type === 'percentage'
          ? totalAmount * (coupon.discount_value / 100)
          : Math.min(coupon.discount_value, totalAmount);
        totalAmount = totalAmount - discountAmount;
        await client.query('UPDATE cupons SET used_count = used_count + 1 WHERE id = $1', [coupon.id]);
      }
    }

    const clientId = req.user?.role === 'client' ? req.user.id : null;

    const result = await client.query(
      `INSERT INTO reservas (quadra_id, client_id, client_name, client_phone, client_email, date, start_time, end_time, total_amount, discount_amount, coupon_code, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [quadra_id, clientId, client_name, client_phone, client_email, date, start_time, end_time, totalAmount, discountAmount, coupon_code, notes]
    );

    await client.query('COMMIT');

    const reserva = result.rows[0];
    const quadraInfo = await query('SELECT name, sport_type FROM quadras WHERE id = $1', [quadra_id]);
    reserva.quadra = quadraInfo.rows[0];

    res.status(201).json({ success: true, data: reserva, message: 'Reserva criada com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create reserva error:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar reserva' });
  } finally {
    client.release();
  }
};

const getAll = async (req, res) => {
  try {
    const { status, date, quadra_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (status) { conditions.push(`r.status = $${paramIdx++}`); params.push(status); }
    if (date) { conditions.push(`DATE(r.date) = $${paramIdx++}`); params.push(date); }
    if (quadra_id) { conditions.push(`r.quadra_id = $${paramIdx++}`); params.push(quadra_id); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type
       FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
       ${where} ORDER BY r.date DESC, r.start_time DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      [...params, parseInt(limit), offset]
    );

    const countResult = await query(`SELECT COUNT(*) FROM reservas r ${where}`, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: { total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar reservas' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type, q.price_per_hour,
              p.pix_qr_code, p.pix_copy_paste, p.status as pagamento_status
       FROM reservas r
       LEFT JOIN quadras q ON r.quadra_id = q.id
       LEFT JOIN pagamentos p ON r.id = p.reserva_id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Reserva não encontrada' });

    const reserva = result.rows[0];
    if (req.user.role !== 'admin' && reserva.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para ver esta reserva' });
    }

    res.json({ success: true, data: reserva });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar reserva' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query(
      'UPDATE reservas SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
};

const cancel = async (req, res) => {
  try {
    const reserva = await query('SELECT * FROM reservas WHERE id = $1', [req.params.id]);
    if (reserva.rows.length === 0) return res.status(404).json({ success: false, message: 'Reserva não encontrada' });

    const r = reserva.rows[0];

    if (req.user.role !== 'admin' && r.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para cancelar esta reserva' });
    }

    if (['cancelled', 'completed'].includes(r.status)) {
      return res.status(400).json({ success: false, message: 'Reserva não pode ser cancelada' });
    }

    await query('UPDATE reservas SET status = $1, updated_at = NOW() WHERE id = $2', ['cancelled', req.params.id]);

    try {
      await whatsappService.sendCancellationNotification(r.client_phone, r);
    } catch (_) {}

    res.json({ success: true, message: 'Reserva cancelada com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao cancelar reserva' });
  }
};

const getAgenda = async (req, res) => {
  try {
    const { start, end } = req.query;
    const result = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type
       FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
       WHERE DATE(r.date) BETWEEN $1 AND $2 AND r.status NOT IN ('cancelled')
       ORDER BY r.date, r.start_time`,
      [start || new Date().toISOString().split('T')[0], end || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar agenda' });
  }
};

const getMyReservas = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type,
              p.pix_qr_code, p.pix_copy_paste, p.status as pagamento_status, p.id as pagamento_id
       FROM reservas r
       LEFT JOIN quadras q ON r.quadra_id = q.id
       LEFT JOIN pagamentos p ON r.id = p.reserva_id
       WHERE r.client_id = $1
       ORDER BY r.date DESC, r.start_time DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyReservas error:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar reservas' });
  }
};

const reschedule = async (req, res) => {
  const { date, start_time, quadra_id } = req.body;
  const { id } = req.params;

  if (!date || !start_time) {
    return res.status(400).json({ success: false, message: 'Data e horário são obrigatórios' });
  }

  const dbClient = await getClient();
  try {
    await dbClient.query('BEGIN');

    const reservaResult = await dbClient.query('SELECT * FROM reservas WHERE id = $1', [id]);
    if (reservaResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Reserva não encontrada' });
    }

    const reserva = reservaResult.rows[0];

    if (req.user.role === 'client' && reserva.client_id !== req.user.id) {
      await dbClient.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Sem permissão para remarcar esta reserva' });
    }

    // Clientes não podem trocar de quadra
    if (req.user.role === 'client' && quadra_id && quadra_id !== reserva.quadra_id) {
      await dbClient.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Sem permissão para trocar de quadra' });
    }

    if (['cancelled', 'completed'].includes(reserva.status)) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Esta reserva não pode ser remarcada' });
    }

    const novaQuadraId = (req.user.role === 'admin' && quadra_id) ? quadra_id : reserva.quadra_id;

    // Mantém a mesma duração original
    const origStart = reserva.start_time.substring(0, 5);
    const origEnd = reserva.end_time.substring(0, 5);
    const [sh, sm] = origStart.split(':').map(Number);
    const [eh, em] = origEnd.split(':').map(Number);
    const durationMin = (eh * 60 + em) - (sh * 60 + sm);

    const [newH, newM] = start_time.split(':').map(Number);
    const endMin = newH * 60 + newM + durationMin;
    const end_time = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    const conflict = await dbClient.query(
      `SELECT id FROM reservas
       WHERE quadra_id = $1 AND DATE(date) = $2 AND status NOT IN ('cancelled') AND id != $3
       AND (start_time < $5 AND end_time > $4)`,
      [novaQuadraId, date, id, start_time, end_time]
    );

    if (conflict.rows.length > 0) {
      await dbClient.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Horário já reservado. Escolha outro.' });
    }

    const result = await dbClient.query(
      'UPDATE reservas SET quadra_id = $1, date = $2, start_time = $3, end_time = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [novaQuadraId, date, start_time, end_time, id]
    );

    await dbClient.query('COMMIT');
    res.json({ success: true, data: result.rows[0], message: 'Reserva remarcada com sucesso' });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('Reschedule error:', err);
    res.status(500).json({ success: false, message: 'Erro ao remarcar reserva' });
  } finally {
    dbClient.release();
  }
};

module.exports = { create, getAll, getById, updateStatus, cancel, getAgenda, getMyReservas, reschedule };
