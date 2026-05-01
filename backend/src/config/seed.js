require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./database');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ('Administrador', $1, $2, 'admin', '5511999999999')
      ON CONFLICT (email) DO NOTHING
    `, [process.env.ADMIN_EMAIL || 'admin@divinoarena.com', passwordHash]);

    const quadras = [
      { name: 'Futebol Society', sport: 'futebol_society', price: 80.00, desc: 'Quadra de futebol society com grama sintética de alta qualidade' },
      { name: 'Futevôlei', sport: 'futevolei', price: 60.00, desc: 'Quadra de futevôlei com areia fina importada' },
      { name: 'Vôlei de Praia', sport: 'volei_praia', price: 70.00, desc: 'Quadra de vôlei de praia com iluminação completa' },
    ];

    for (const q of quadras) {
      const res = await client.query(`
        INSERT INTO quadras (name, sport_type, description, price_per_hour)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [q.name, q.sport, q.desc, q.price]);

      if (res.rows.length > 0) {
        const quadraId = res.rows[0].id;
        for (let day = 0; day <= 6; day++) {
          for (let hour = 8; hour <= 21; hour++) {
            const startTime = `${String(hour).padStart(2, '0')}:00`;
            const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
            await client.query(`
              INSERT INTO time_slots (quadra_id, day_of_week, start_time, end_time)
              VALUES ($1, $2, $3, $4)
            `, [quadraId, day, startTime, endTime]);
          }
        }
      }
    }

    const configs = [
      ['arena_name', 'Divino Arena'],
      ['arena_phone', '5511999999999'],
      ['arena_address', 'Rua das Quadras, 123 - São Paulo, SP'],
      ['arena_pix_key', 'arena@divinoarena.com'],
      ['arena_email', 'contato@divinoarena.com'],
      ['booking_advance_days', '30'],
      ['cancellation_hours', '24'],
      ['whatsapp_notifications', 'true'],
    ];

    for (const [key, value] of configs) {
      await client.query(`
        INSERT INTO configuracoes (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `, [key, value]);
    }

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
