// Vercel Serverless API - Haryana Police Inventory
// Document-store style: the whole app state is stored as one JSON blob
// in a single Neon table row. This matches how the frontend uses
// localStorage (loadData / saveData with a central JSON cache).
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try { return await route(req, res); } catch (e) { console.error(e); return res.status(500).json({ error: e.message }); }
};

async function route(req, res) {
  let path = req.query.path || [];
  if (!Array.isArray(path)) path = [path];
  const seg = path.map(decodeURIComponent);
  const body = req.body || {};
  const p0 = seg[0];

  // ensure table exists
  await pool.query(`CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, data JSONB NOT NULL)`);

  // ---------- HEALTH ----------
  if (p0 === 'health') return res.json({ ok: true, db: 'neon' });

  // ---------- LOAD FULL STATE ----------
  if (p0 === 'state' && req.method === 'GET') {
    const { rows } = await pool.query('SELECT data FROM app_state WHERE id=1');
    if (!rows.length) return res.json({});
    return res.json(rows[0].data);
  }

  // ---------- SAVE FULL STATE ----------
  if (p0 === 'state' && req.method === 'POST') {
    if (!body.state) return res.status(400).json({ error: 'state required' });
    await pool.query(
      `INSERT INTO app_state (id, data) VALUES (1, $1)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [JSON.stringify(body.state)]
    );
    return res.json({ ok: true });
  }

  // ---------- SEED DEFAULTS (client-sent defaults) ----------
  if (p0 === 'seed' && req.method === 'POST') {
    if (!body.state) return res.status(400).json({ error: 'state required' });
    const { rows } = await pool.query('SELECT data FROM app_state WHERE id=1');
    if (rows.length) return res.json({ ok: true, existed: true });
    await pool.query('INSERT INTO app_state (id,data) VALUES (1,$1)', [JSON.stringify(body.state)]);
    return res.json({ ok: true, existed: false });
  }

  // ---------- SAVE A SINGLE KEY (incremental) ----------
  if (p0 === 'key' && req.method === 'POST') {
    if (!body.key || !body.value) return res.status(400).json({ error: 'key and value required' });
    const { rows } = await pool.query('SELECT data FROM app_state WHERE id=1');
    let data = rows.length ? rows[0].data : {};
    data[body.key] = body.value;
    await pool.query(
      `INSERT INTO app_state (id,data) VALUES (1,$1) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data`,
      [JSON.stringify(data)]
    );
    return res.json({ ok: true });
  }

  return res.status(404).json({ error: 'Not found' });
}
