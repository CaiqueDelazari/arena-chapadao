const { query } = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const [todayReservas, weekReservas, revenueToday, revenueMonth, upcomingReservas, recentPayments] = await Promise.all([
      query(`SELECT COUNT(*) FROM reservas WHERE DATE(date) = $1 AND status != 'cancelled'`, [today]),
      query(`SELECT COUNT(*) FROM reservas WHERE DATE(date) >= $1 AND status != 'cancelled'`, [weekStartStr]),
      query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM reservas WHERE DATE(date) = $1 AND payment_status = 'approved'`, [today]),
      query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM reservas WHERE DATE_TRUNC('month', DATE(date)) = DATE_TRUNC('month', CURRENT_DATE) AND payment_status = 'approved'`),
      query(
        `SELECT r.*, q.name as quadra_name, q.sport_type FROM reservas r
         LEFT JOIN quadras q ON r.quadra_id = q.id
         WHERE DATE(r.date) >= $1 AND r.status NOT IN ('cancelled')
         ORDER BY r.date, r.start_time LIMIT 10`,
        [today]
      ),
      query(
        `SELECT r.client_name, r.total_amount, r.payment_method, r.date, q.name as quadra_name, r.created_at
         FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
         WHERE r.payment_status = 'approved' ORDER BY r.created_at DESC LIMIT 5`
      ),
    ]);

    res.json({
      success: true,
      data: {
        total_today: parseInt(todayReservas.rows[0].count),
        total_week: parseInt(weekReservas.rows[0].count),
        revenue_today: parseFloat(revenueToday.rows[0].total),
        revenue_month: parseFloat(revenueMonth.rows[0].total),
        upcoming_reservas: upcomingReservas.rows,
        recent_payments: recentPayments.rows,
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar dashboard' });
  }
};

const getFinanceiro = async (req, res) => {
  try {
    const { period = 'month', start_date, end_date } = req.query;
    const isoDate = /^\d{4}-\d{2}-\d{2}$/;
    let dateFilter;
    let params = [];

    if (start_date && end_date && isoDate.test(start_date) && isoDate.test(end_date)) {
      dateFilter = `DATE(r.date) BETWEEN $1 AND $2`;
      params = [start_date, end_date];
    } else if (period === 'day') {
      dateFilter = `DATE(r.date) = CURRENT_DATE`;
    } else if (period === 'week') {
      dateFilter = `DATE(r.date) >= DATE_TRUNC('week', CURRENT_DATE)`;
    } else {
      dateFilter = `DATE_TRUNC('month', DATE(r.date)) = DATE_TRUNC('month', CURRENT_DATE)`;
    }

    const [totals, transactions, byQuadra, byDay] = await Promise.all([
      query(`
        SELECT
          COALESCE(SUM(total_amount), 0) as faturamento,
          COALESCE(SUM(CASE WHEN payment_status = 'approved' THEN total_amount ELSE 0 END), 0) as recebidos,
          COALESCE(SUM(CASE WHEN payment_status = 'pending' AND status != 'cancelled' THEN total_amount ELSE 0 END), 0) as pendentes
        FROM reservas r WHERE ${dateFilter}
      `, params),
      query(`
        SELECT r.date, r.client_name, q.name as quadra_name, q.sport_type, r.total_amount, r.payment_method, r.payment_status, r.status
        FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
        WHERE ${dateFilter} ORDER BY r.date DESC, r.created_at DESC LIMIT 100
      `, params),
      query(`
        SELECT q.name as quadra_name, q.sport_type, COUNT(*) as total_reservas,
               COALESCE(SUM(r.total_amount), 0) as receita
        FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
        WHERE ${dateFilter} AND r.payment_status = 'approved'
        GROUP BY q.id, q.name, q.sport_type
      `, params),
      query(`
        SELECT DATE(r.date) as date, COALESCE(SUM(CASE WHEN r.payment_status = 'approved' THEN r.total_amount ELSE 0 END), 0) as receita,
               COUNT(*) as total
        FROM reservas r WHERE ${dateFilter} GROUP BY DATE(r.date) ORDER BY DATE(r.date)
      `, params),
    ]);

    res.json({
      success: true,
      data: {
        ...totals.rows[0],
        transactions: transactions.rows,
        by_quadra: byQuadra.rows,
        by_day: byDay.rows,
      }
    });
  } catch (err) {
    console.error('Financeiro error:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar financeiro' });
  }
};

const getAgenda = async (req, res) => {
  try {
    const { start, end } = req.query;
    const today = new Date();
    const startDate = start || today.toISOString().split('T')[0];
    const endDate = end || new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];

    const result = await query(
      `SELECT r.*, q.name as quadra_name, q.sport_type
       FROM reservas r LEFT JOIN quadras q ON r.quadra_id = q.id
       WHERE r.date BETWEEN $1 AND $2 AND r.status NOT IN ('cancelled')
       ORDER BY r.date, r.start_time`,
      [startDate, endDate]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao carregar agenda' });
  }
};

const getClientes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '';
    let params = [];
    if (search) {
      where = `WHERE client_name ILIKE $1 OR client_phone ILIKE $1 OR client_email ILIKE $1`;
      params.push(`%${search}%`);
    }

    const result = await query(
      `SELECT client_name, client_phone, client_email,
              COUNT(*) as total_reservas,
              COALESCE(SUM(CASE WHEN payment_status = 'approved' THEN total_amount ELSE 0 END), 0) as total_gasto,
              MAX(date) as ultima_reserva
       FROM reservas ${where}
       GROUP BY client_name, client_phone, client_email
       ORDER BY ultima_reserva DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes' });
  }
};

const getConfiguracoes = async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM configuracoes ORDER BY key');
    const config = result.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar configurações' });
  }
};

const updateConfiguracoes = async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await query(
        `INSERT INTO configuracoes (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    res.json({ success: true, message: 'Configurações salvas com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao salvar configurações' });
  }
};

module.exports = { getDashboard, getFinanceiro, getAgenda, getClientes, getConfiguracoes, updateConfiguracoes };
