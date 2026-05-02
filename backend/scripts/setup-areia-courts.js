require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Rename "Futevôlei" → "Quadra 1"
    await client.query(
      `UPDATE quadras SET name = 'Quadra 1', sport_type = 'futevolei', price_per_hour = 60
       WHERE id = 'd7cf42a3-92ad-41a3-a20f-b79681cc4eef'`
    );
    console.log('✓ Quadra 1 updated');

    // 2. Rename "Vôlei de Praia" → "Quadra 2"
    await client.query(
      `UPDATE quadras SET name = 'Quadra 2', sport_type = 'futevolei', price_per_hour = 60
       WHERE id = '02573cf1-cde9-41ca-9782-d179cdb794a4'`
    );
    console.log('✓ Quadra 2 updated');

    // 3. Insert Quadra 3
    const q3 = await client.query(
      `INSERT INTO quadras (name, sport_type, price_per_hour, is_active)
       VALUES ('Quadra 3', 'futevolei', 60, true)
       ON CONFLICT DO NOTHING
       RETURNING id`
    );
    const q3id = q3.rows[0]?.id;
    console.log('✓ Quadra 3 inserted:', q3id);

    // 4. Insert Quadra 4
    const q4 = await client.query(
      `INSERT INTO quadras (name, sport_type, price_per_hour, is_active)
       VALUES ('Quadra 4', 'futevolei', 60, true)
       ON CONFLICT DO NOTHING
       RETURNING id`
    );
    const q4id = q4.rows[0]?.id;
    console.log('✓ Quadra 4 inserted:', q4id);

    // 5. Insert time_slots for Quadra 3 and Quadra 4: days 0-6, hours 07:00-21:00
    const hours = [];
    for (let h = 7; h <= 20; h++) {
      hours.push({
        start: `${String(h).padStart(2, '0')}:00`,
        end: `${String(h + 1).padStart(2, '0')}:00`,
      });
    }

    let slotCount = 0;
    for (const qid of [q3id, q4id]) {
      if (!qid) continue;
      for (let day = 0; day <= 6; day++) {
        for (const hour of hours) {
          await client.query(
            `INSERT INTO time_slots (quadra_id, day_of_week, start_time, end_time, is_active)
             VALUES ($1, $2, $3, $4, true)
             ON CONFLICT DO NOTHING`,
            [qid, day, hour.start, hour.end]
          );
          slotCount++;
        }
      }
    }
    console.log(`✓ ${slotCount} time_slots inserted for Quadra 3 and Quadra 4`);

    // 6. Also ensure Quadra 1 and Quadra 2 have complete time_slots (fill any gaps)
    const arenaIds = [
      'd7cf42a3-92ad-41a3-a20f-b79681cc4eef',
      '02573cf1-cde9-41ca-9782-d179cdb794a4',
    ];
    let fixCount = 0;
    for (const qid of arenaIds) {
      for (let day = 0; day <= 6; day++) {
        for (const hour of hours) {
          const r = await client.query(
            `INSERT INTO time_slots (quadra_id, day_of_week, start_time, end_time, is_active)
             VALUES ($1, $2, $3, $4, true)
             ON CONFLICT DO NOTHING`,
            [qid, day, hour.start, hour.end]
          );
          if (r.rowCount > 0) fixCount++;
        }
      }
    }
    if (fixCount > 0) console.log(`✓ ${fixCount} missing time_slots filled for Quadra 1 and Quadra 2`);

    await client.query('COMMIT');
    console.log('\n✅ All done!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
