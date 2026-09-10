// ============================================================
// API Client - Switches the app from browser localStorage to a
// Neon (PostgreSQL) backend via Vercel serverless functions.
//
// Load this file BEFORE app.js.
// Set CONFIG.useRemote = true to use the remote Neon database.
//
// Model: the whole app state is one JSON object stored in Neon.
// We hydrate a local cache from it at startup, then every
// saveData() writes the full state back to the server.
// ============================================================

var CONFIG = {
  useRemote: true,   // <- true uses Neon (PostgreSQL) backend
  apiBase: "",       // relative base; __api() APPENDS "/api/..." to it
};

var __apiCache = {};
var __prefix = "hp_inventory.";
var __apiSaveTimer = null;
var __apiReady = false;

var __apiQueue = Promise.resolve();
var __bootPromise = Promise.resolve();

function __api(method, path, body) {
  const url = CONFIG.apiBase + "/api/" + path;
  const headers = { "Content-Type": "application/json" };
  const token = __authToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  return fetch(url, opts).then(r => {
    if (!r.ok) throw new Error(method + " " + path + " -> " + r.status);
    return r.json();
  });
}

function __authToken() {
  try {
    const a = JSON.parse(localStorage.getItem(__prefix + "auth"));
    return a && a.token ? a.token : null;
  } catch { return null; }
}

// Fetch full state from Neon into local cache.
async function __apiLoadAll() {
  const state = await __api("GET", "state");
  // state is a map: "hp_inventory.xxx" -> value
  Object.keys(state || {}).forEach(k => { __apiCache[k] = state[k]; });
  __apiReady = true;
}

// Debounced full-state write.
function __apiPersist() {
  clearTimeout(__apiSaveTimer);
  __apiSaveTimer = setTimeout(() => {
    __apiQueue = __apiQueue.then(() =>
      __api("POST", "state", { state: JSON.parse(JSON.stringify(__apiCache)) })
    ).then(res => {
      // Server returns the sanitised users (passwords hashed & stripped);
      // refresh the cache so no plaintext lingers in browser memory.
      if (res && Array.isArray(res.users)) {
        __apiCache[__prefix + "users"] = res.users;
      }
    }).catch(e => console.error("save to Neon failed:", e));
  }, 400);
}

// ============================================================
// PUBLIC OVERRIDES - app.js delegates to these via globals
// ============================================================

window.__apiLoadFn = function(key) {
  const storeKey = __prefix + key;
  return __apiCache.hasOwnProperty(storeKey) ? __apiCache[storeKey] : null;
};

window.__apiSaveFn = function(key, data) {
  const storeKey = __prefix + key;
  __apiCache[storeKey] = data;
  if (__apiReady) { __apiPersist(); }
  else {
    __ensureReady().then(() => __apiPersist());
  }
};

function __ensureReady() {
  if (__apiReady) return Promise.resolve();
  return __apiLoadAll().catch(e => { console.error(e); __apiReady = true; });
}

// Bootstrap: load remote state before app.js runs its seed/init.
// Expose a ready promise so app.js can wait for remote data.
window.__apiReadyPromise = __bootPromise;
__bootPromise = (async function __boot() {
  if (CONFIG.useRemote) {
    try { await __apiLoadAll(); } catch (e) { console.error("load from Neon failed:", e); }
  }
})();
