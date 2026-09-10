// Vercel Serverless API - Haryana Police Inventory
// Document-store style: the whole app state is stored as one JSON blob
// in a single Neon table row. This matches how the frontend uses
// localStorage (loadData / saveData with a central JSON cache).
//
// SECURITY:
//  - Passwords are hashed with bcryptjs before storage; plaintext is
//    never persisted and never returned to the browser.
//  - POST /api/auth/login verifies credentials server-side, applies a
//    per-IP rate limit, and returns an opaque session token.
//  - Account-changing writes (users collection alters) require that token.
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const BCRYPT_ROUNDS = 12;

// ---- rate limiting (per serverless instance; fine for this scale) ----
const loginAttempts = new Map(); // ip -> { count, resetAt }

function rateLimited(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now > rec.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  return rec.count >= 10;
}
function recordFailure(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  rec.count += 1;
  loginAttempts.set(ip, rec);
}
function resetFailures(ip) {
  loginAttempts.delete(ip);
}
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

// ---- session helpers ----
const TOKEN_KEY = 'hp_inventory.sessions';
const SCAN_FILES_PREFIX = 'hp_inventory.scan_files.';

async function getState() {
  const { rows } = await pool.query('SELECT data FROM app_state WHERE id=1');
  return rows.length ? rows[0].data : {};
}
async function setState(data) {
  await pool.query(
    `INSERT INTO app_state (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [JSON.stringify(data)]
  );
}

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const state = await getState();
  const sessions = state[TOKEN_KEY] || {};
  sessions[hash] = { userId, expiresAt: Date.now() + SESSION_TTL_MS };
  state[TOKEN_KEY] = sessions;
  await setState(state);
  return token;
}

async function destroySession(token) {
  if (!token) return;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const state = await getState();
  const sessions = state[TOKEN_KEY] || {};
  if (sessions[hash]) {
    delete sessions[hash];
    state[TOKEN_KEY] = sessions;
    await setState(state);
  }
}

// Validates the Authorization: Bearer token; prunes expired sessions.
async function authFromRequest(req) {
  const header = req.headers['authorization'] || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return { user: null };
  const token = m[1].trim();
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const state = await getState();
  const sessions = state[TOKEN_KEY] || {};
  const sess = sessions[hash];
  if (!sess) return { user: null };
  if (Date.now() > sess.expiresAt) {
    delete sessions[hash];
    state[TOKEN_KEY] = sessions;
    await setState(state);
    return { user: null };
  }
  const users = Array.isArray(state['hp_inventory.users']) ? state['hp_inventory.users'] : [];
  const user = users.find(u => u.id === sess.userId) || null;
  return { user };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try { return await route(req, res); } catch (e) { console.error(e); return res.status(500).json({ error: e.message }); }
};

async function route(req, res) {
  let path = req.query.path || [];
  if (!Array.isArray(path)) path = [path];
  // Vercel's `:path*` may deliver joined strings ("auth,login" or "auth/login");
  // normalise both into segment arrays.
  const seg = [];
  for (const p of path) {
    for (const part of String(p).split(/[/,]/)) {
      if (part) seg.push(decodeURIComponent(part));
    }
  }
  const body = req.body || {};
  const p0 = seg[0];

  // ensure tables exist
  await pool.query(`CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, data JSONB NOT NULL)`);

  // Self-heal legacy plaintext passwords before handling any request.
  await sweepPlaintextPasswords();

  // ---------- HEALTH ----------
  if (p0 === 'health') {
    const state = await getState();
    const users = Array.isArray(state['hp_inventory.users']) ? state['hp_inventory.users'] : [];
    const bcryptHashed = users.filter(u => typeof u.password === 'string' && u.password.startsWith('$2')).length;
    return res.json({
      ok: true,
      db: 'neon',
      users: users.length,
      bcryptHashed,
      passwordsAllHashed: users.length > 0 && bcryptHashed === users.length,
      bcryptRounds: BCRYPT_ROUNDS,
      rateLimit: '10 failed attempts / 15 min / IP',
      sessions: 'sha256 hashed tokens, 12h TTL'
    });
  }

  // ---------- LOGIN ----------
  if (p0 === 'auth' && seg[1] === 'login') {
    const ip = clientIp(req);
    if (rateLimited(ip)) return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    const { username, password } = body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const state = await getState();
    const users = Array.isArray(state['hp_inventory.users']) ? state['hp_inventory.users'] : [];
    const user = users.find(u => u.username && u.username.toLowerCase() === String(username).toLowerCase());

    if (!user || !user.password) {
      recordFailure(ip);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Legacy support + migration: if the stored value isn't a bcrypt hash,
    // compare in plaintext and upgrade it to a hash on success.
    let ok;
    if (user.password.startsWith('$2')) {
      ok = await bcrypt.compare(String(password), user.password);
    } else {
      ok = user.password === String(password);
      if (ok) {
        user.password = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
        await setState(state);
      }
    }
    if (!ok) {
      recordFailure(ip);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    resetFailures(ip);
    const token = await createSession(user.id);
    return res.json({ ok: true, token, user: publicUser(user) });
  }

  // ---------- LOGOUT ----------
  if (p0 === 'auth' && seg[1] === 'logout') {
    const header = req.headers['authorization'] || '';
    const m = header.match(/^Bearer\s+(.+)$/i);
    if (m) await destroySession(m[1].trim());
    return res.json({ ok: true });
  }

  // ---------- VERIFY SESSION ----------
  if (p0 === 'auth' && seg[1] === 'me') {
    const { user } = await authFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ ok: true, user: publicUser(user) });
  }

  // ---------- ALLOTMENT / STOCK INVARIANTS ----------
function validateAllocState(state) {
  const items = state['hp_inventory.items'];
  if (items && typeof items === 'object') {
    for (const dist of Object.values(items)) {
      if (!Array.isArray(dist)) continue;
      for (const i of dist) {
        const q = i.quantity || 0;
        const al = i.allotted || 0;
        const dmg = i.damagedReturned || 0;
        const lost = i.lostReturned || 0;
        if (!Number.isFinite(q) || q < 0 || al < 0 || dmg < 0 || lost < 0) {
          return `Negative quantity not allowed for item "${(i.name || '')}"`;
        }
        if (al + dmg + lost > q) {
          return `Available quantity cannot go negative for item "${(i.name || '')}"`;
        }
      }
    }
  }
  const allots = state['hp_inventory.allotments'];
  if (Array.isArray(allots)) {
    for (const a of allots) {
      const allotted = a.qtyAllotted || 0;
      const returned = a.qtyReturned || 0;
      if (!Number.isFinite(allotted) || !Number.isFinite(returned) || allotted < 0 || returned < 0) {
        return 'Allotment quantities must be non-negative numbers';
      }
      if (returned > allotted) {
        return `Returned quantity (${returned}) exceeds allotted quantity (${allotted}) for allotment "${a.id}"`;
      }
    }
  }
  return null;
}

// ---------- LOAD FULL STATE ----------
  if (p0 === 'state' && req.method === 'GET') {
    const state = await getState();
    // never leak password hashes or session tokens to the browser
    const publicState = {};
    for (const [k, v] of Object.entries(state)) {
      if (k === TOKEN_KEY) continue;
      if (k.indexOf(SCAN_FILES_PREFIX) === 0) continue; // scan files stay out of full state
      if (k === 'hp_inventory.users' && Array.isArray(v)) {
        publicState[k] = v.map(publicUser).filter(Boolean);
        continue;
      }
      publicState[k] = v;
    }
    return res.json(publicState);
  }

  // ---------- WRITE-INTENT AUTH GATE ----------
  // Every write that could alter the `users` collection (or the token map)
  // must present a valid session token. Writes that do not touch users are
  // allowed unauth for backward compat (document-store model), but we still
  // sanitise any passwords present before persisting.
  if (p0 === 'state' && req.method === 'POST') {
    if (!body.state) return res.status(400).json({ error: 'state required' });
    const incoming = body.state;
    const current = await getState();
    const currentUsers = Array.isArray(current['hp_inventory.users']) ? current['hp_inventory.users'] : [];
    const incomingUsers = Array.isArray(incoming['hp_inventory.users']) ? incoming['hp_inventory.users'] : [];
    // Only account mutations require a session. If the users collection is
    // unchanged (plain writes of inventory data, request-access, etc.), the
    // write proceeds without auth, matching the doc-store model.
    const usersChanged = !usersEqual(incomingUsers, currentUsers);
    if (usersChanged) {
      const { user } = await authFromRequest(req);
      if (!user) {
        // Fresh-bootstrap: allow creating the very first users from the seed.
        if (currentUsers.length > 0) return res.status(401).json({ error: 'Not authenticated' });
      }
    }
    // Sanitise: hash any plaintext passwords that slipped in.
    if (Array.isArray(incoming['hp_inventory.users'])) {
      const existing = await getState();
      const currentUsers = Array.isArray(existing['hp_inventory.users']) ? existing['hp_inventory.users'] : [];
      incoming['hp_inventory.users'] = await mergeUsers(incoming['hp_inventory.users'], currentUsers);
    }
    // Keep it server-managed: never let a client persist its own sessions.
    incoming[TOKEN_KEY] = current[TOKEN_KEY] || {};
    // Preserve self-hosted scan files (client never loads them into its cache).
    for (const k of Object.keys(current)) {
      if (k.indexOf(SCAN_FILES_PREFIX) === 0) incoming[k] = current[k];
    }
    const verr = validateAllocState(incoming);
    if (verr) return res.status(400).json({ error: verr });
    await setState(incoming);
    // Return the sanitised users so the client never keeps plaintext in memory.
    const resp = { ok: true };
    if (Array.isArray(incoming['hp_inventory.users'])) {
      resp.users = incoming['hp_inventory.users'].map(publicUser).filter(Boolean);
    }
    return res.json(resp);
  }

  // ---------- SAVE A SINGLE KEY (incremental) ----------
  if (p0 === 'key' && req.method === 'POST') {
    if (!body.key || !body.value) return res.status(400).json({ error: 'key and value required' });
    if (body.key === 'hp_inventory.users' || body.key === TOKEN_KEY) {
      const { user } = await authFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Not authenticated' });
    }
    const state = await getState();
    if (body.key === 'hp_inventory.users' && Array.isArray(body.value)) {
      const currentUsers = Array.isArray(state['hp_inventory.users']) ? state['hp_inventory.users'] : [];
      state[body.key] = await mergeUsers(body.value, currentUsers);
    } else if (body.key === TOKEN_KEY) {
      // ignore client attempts to manage sessions
    } else {
      state[body.key] = body.value;
    }
    const verr = validateAllocState(state);
    if (verr) return res.status(400).json({ error: verr });
    await setState(state);
    return res.json({ ok: true });
  }

  // ---------- SCAN FILE STORAGE (self-hosted original documents) ----------
  // Scan file bytes are stored under dedicated keys that are EXCLUDED from
  // GET /api/state so the main state payload stays small. They are fetched
  // individually only when the user opens a scanned document.
  if (p0 === 'scanfile') {
    if (req.method === 'POST') {
      if (!body.id || !body.dataUrl) return res.status(400).json({ error: 'id and dataUrl required' });
      if (typeof body.dataUrl !== 'string' || body.dataUrl.length > 12 * 1024 * 1024) {
        return res.status(413).json({ error: 'File too large (max ~8MB)' });
      }
      const state = await getState();
      state[SCAN_FILES_PREFIX + body.id] = { savedAt: Date.now(), dataUrl: body.dataUrl, length: body.dataUrl.length };
      await setState(state);
      return res.json({ ok: true });
    }
    if (req.method === 'GET') {
      const id = seg[1];
      if (!id) return res.status(400).json({ error: 'file id required' });
      const state = await getState();
      const rec = state[SCAN_FILES_PREFIX + id];
      if (!rec) return res.status(404).json({ error: 'File not found' });
      return res.json({ ok: true, savedAt: rec.savedAt, length: rec.length, dataUrl: rec.dataUrl });
    }
    return res.status(404).json({ error: 'Not found' });
  }

  // ---------- SEED DEFAULTS (client-sent defaults) ----------
  if (p0 === 'seed' && req.method === 'POST') {
    if (!body.state) return res.status(400).json({ error: 'state required' });
    const { rows } = await pool.query('SELECT data FROM app_state WHERE id=1');
    if (rows.length) return res.json({ ok: true, existed: true });
    const seedState = { ...body.state };
    if (Array.isArray(seedState['hp_inventory.users'])) {
      seedState['hp_inventory.users'] = await hashAllPasswords(seedState['hp_inventory.users']);
    }
    delete seedState[TOKEN_KEY];
    await setState(seedState);
    return res.json({ ok: true, existed: false });
  }

  return res.status(404).json({ error: 'Not found' });
}

// Compares two user lists ignoring passwords and any undefined fields.
function usersEqual(a, b) {
  const clean = (arr) => (arr || []).map(u => {
    const { password, ...rest } = u;
    for (const k of Object.keys(rest)) if (rest[k] === undefined) delete rest[k];
    return rest;
  });
  const norm = (arr) => clean(arr).sort((x, y) => (x.id < y.id ? -1 : 1)).map(u => JSON.stringify(u)).join("|");
  return norm(a) === norm(b);
}

// Returns a users array whose plaintext passwords have been hashed; any
// existing bcrypt hashes (e.g. from prior saves) are preserved by id.
async function mergeUsers(incoming, existing) {
  const existingById = {};
  for (const u of existing || []) existingById[u.id] = u;
  const out = [];
  for (const u of incoming || []) {
    const copy = { ...u };
    const prev = existingById[u.id];
    if (copy.password) {
      if (copy.password.startsWith('$2')) {
        copy.password = copy.password; // already a bcrypt hash
      } else {
        copy.password = await bcrypt.hash(copy.password, BCRYPT_ROUNDS);
      }
    } else if (prev && prev.password) {
      // Preserve the stored hash; if it is a legacy plaintext value,
      // upgrade it to bcrypt here so data self-migrates on next write.
      copy.password = prev.password.startsWith('$2')
        ? prev.password
        : await bcrypt.hash(prev.password, BCRYPT_ROUNDS);
    }
    out.push(copy);
  }
  return out;
}

async function hashAllPasswords(users) {
  const out = [];
  for (const u of users || []) {
    const copy = { ...u };
    if (copy.password && !copy.password.startsWith('$2')) {
      copy.password = await bcrypt.hash(copy.password, BCRYPT_ROUNDS);
    }
    out.push(copy);
  }
  return out;
}

// Self-healing: guarantees no plaintext password can survive in the DB.
// Runs at most once per minute per serverless instance. Upgrades any
// legacy plaintext values to bcrypt so every stored password is a hash.
let lastPasswordSweep = 0;
async function sweepPlaintextPasswords() {
  const now = Date.now();
  if (now - lastPasswordSweep < 60_000) return;
  lastPasswordSweep = now;
  try {
    const state = await getState();
    const users = Array.isArray(state['hp_inventory.users']) ? state['hp_inventory.users'] : [];
    const needsHashing = users.some(u => typeof u.password === 'string' && u.password && !u.password.startsWith('$2'));
    if (!needsHashing) return;
    state['hp_inventory.users'] = await hashAllPasswords(users);
    await setState(state);
    console.log('[security] upgraded legacy plaintext password(s) to bcrypt');
  } catch (e) {
    lastPasswordSweep = 0; // allow a retry on the next request
  }
}