const { query } = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM quadras WHERE is_active = true ORDER BY name',
      []
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAll quadras error:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar quadras' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query('SELECT * FROM quadras WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar quadra' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Data é obrigatória' });
    }

    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    const slotsResult = await query(
      'SELECT start_time, end_time FROM time_slots WHERE quadra_id = $1 AND day_of_week = $2 AND is_active = true ORDER BY start_time',
      [id, dayOfWeek]
    );

    const reservedResult = await query(
      `SELECT start_time, end_time FROM reservas
       WHERE quadra_id = $1 AND date = $2 AND status NOT IN ('cancelled')`,
      [id, date]
    );

    const reservedTimes = reservedResult.rows.map(r => r.start_time.substring(0, 5));

    const slots = slotsResult.rows.map(slot => {
      const startTime = slot.start_time.substring(0, 5);
      const isPast = date === new Date().toISOString().split('T')[0] &&
        startTime <= new Date().toTimeString().substring(0, 5);

      return {
        time: startTime,
        end_time: slot.end_time.substring(0, 5),
        available: !reservedTimes.includes(startTime) && !isPast,
      };
    });

    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('getSlots error:', err);
    res.status(500).json({ success: false, message: 'Erro ao buscar horários' });
  }
};

const create = async (req, res) => {
  try {
    const { name, sport_type, description, price_per_hour, image_url } = req.body;
    const result = await query(
      'INSERT INTO quadras (name, sport_type, description, price_per_hour, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, sport_type, description, price_per_hour, image_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar quadra' });
  }
};

const update = async (req, res) => {
  try {
    const { name, description, price_per_hour, image_url, is_active } = req.body;
    const result = await query(
      `UPDATE quadras SET name = COALESCE($1, name), description = COALESCE($2, description),
       price_per_hour = COALESCE($3, price_per_hour), image_url = COALESCE($4, image_url),
       is_active = COALESCE($5, is_active), updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, description, price_per_hour, image_url, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Quadra não encontrada' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar quadra' });
  }
};

const remove = async (req, res) => {
  try {
    await query('UPDATE quadras SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Quadra removida com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao remover quadra' });
  }
};

module.exports = { getAll, getById, getAvailableSlots, create, update, remove };
