"use strict";

const STORAGE_PREFIX = "hp_inventory.";
const AUTH_KEY = STORAGE_PREFIX + "auth";
const APP_VERSION = "2026.09.24";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (s) => { const d = document.createElement("div"); d.textContent = String(s); return d.innerHTML; };

window.addEventListener("error", e => {
  try {
    if (e && e.message) opencodeToast("Error: " + e.message, "error");
  } catch (_) {}
});
function opencodeToast(msg, type) {
  try { toast(msg, type); } catch (_) { console.error(msg); }
}

const DEFAULT_CATEGORIES = [
  { id: "weapons", name: "Weapons & Ammunition", icon: "ðŸ”«" },
  { id: "uniforms", name: "Uniforms & Clothing", icon: "ðŸ‘®" },
  { id: "communication", name: "Communication Equipment", icon: "ðŸ“»" },
  { id: "office", name: "Office & Admin Supplies", icon: "ðŸ“‹" },
  { id: "forensics", name: "Forensics & Investigation", icon: "ðŸ”" },
  { id: "medical", name: "Medical & First Aid", icon: "ðŸ¥" },
  { id: "vehicles", name: "Vehicles & Transport", icon: "ðŸš—" },
  { id: "barricades", name: "Barricades", icon: "ðŸš§" },
  { id: "furniture", name: "Furniture (Tables, Chairs)", icon: "ðŸª‘" },
  { id: "sound", name: "Sound System (Speakers, etc.)", icon: "ðŸ”Š" },
  { id: "riot", name: "Riot Gear", icon: "ðŸ›¡ï¸" },
  { id: "other", name: "Other Items", icon: "ðŸ“¦" },
];

const DEFAULT_DISTRICTS = [
  { id: "dist_1", name: "Gurugram District", code: "GGN", headquarters: "Gurugram", createdAt: Date.now() },
  { id: "dist_2", name: "Faridabad District", code: "FBD", headquarters: "Faridabad", createdAt: Date.now() },
];

const DEFAULT_LOCATIONS = {
  dist_1: [
    { id: "ggn_hq", name: "District HQ - Gurugram", type: "district", districtId: "dist_1" },
    { id: "ggn_station_1", name: "PS DLF Phase 3", type: "station", districtId: "dist_1" },
    { id: "ggn_station_2", name: "PS Sadar Bazaar", type: "station", districtId: "dist_1" },
    { id: "ggn_post_1", name: "PP Sector 5", type: "post", districtId: "dist_1" },
    { id: "ggn_mhc", name: "MHC Gurugram Central", type: "mhc", districtId: "dist_1" },
  ],
  dist_2: [
    { id: "fbd_hq", name: "District HQ - Faridabad", type: "district", districtId: "dist_2" },
    { id: "fbd_station_1", name: "PS NIT", type: "station", districtId: "dist_2" },
    { id: "fbd_station_2", name: "PS Ballabgarh", type: "station", districtId: "dist_2" },
    { id: "fbd_post_1", name: "PP Nehar Par", type: "post", districtId: "dist_2" },
    { id: "fbd_mhc", name: "MHC Faridabad Central", type: "mhc", districtId: "dist_2" },
  ],
};

const DEFAULT_ITEMS = {
  dist_1: [
    { id: "gg_i1", name: "9mm Pistol", categoryId: "weapons", quantity: 45, unit: "pcs", minStock: 10, locationId: "ggn_hq", conditionCounts: { new: 5, good: 33, fair: 5, poor: 2, damaged: 0 } },
    { id: "gg_i2", name: "Carbine Rifle", categoryId: "weapons", quantity: 12, unit: "pcs", minStock: 5, locationId: "ggn_hq", conditionCounts: { new: 2, good: 8, fair: 2, poor: 0, damaged: 0 } },
    { id: "gg_i3", name: "Bullet Proof Jacket", categoryId: "weapons", quantity: 18, unit: "pcs", minStock: 10, locationId: "ggn_hq", conditionCounts: { new: 3, good: 5, fair: 6, poor: 3, damaged: 1 } },
    { id: "gg_i4", name: "Tear Gas Shell", categoryId: "weapons", quantity: 200, unit: "pcs", minStock: 50, locationId: "ggn_station_1", conditionCounts: { new: 20, good: 160, fair: 15, poor: 5, damaged: 0 } },
    { id: "gg_i5", name: "Khaki Uniform Set", categoryId: "uniforms", quantity: 150, unit: "pcs", minStock: 30, locationId: "ggn_mhc", conditionCounts: { new: 25, good: 85, fair: 25, poor: 12, damaged: 3 } },
    { id: "gg_i6", name: "Police Belt", categoryId: "uniforms", quantity: 200, unit: "pcs", minStock: 50, locationId: "ggn_mhc", conditionCounts: { new: 30, good: 130, fair: 25, poor: 10, damaged: 5 } },
    { id: "gg_i7", name: "Boots (Pair)", categoryId: "uniforms", quantity: 120, unit: "pcs", minStock: 30, locationId: "ggn_mhc", conditionCounts: { new: 10, good: 50, fair: 30, poor: 20, damaged: 10 } },
    { id: "gg_i8", name: "Wireless Walkie Talkie", categoryId: "communication", quantity: 35, unit: "pcs", minStock: 10, locationId: "ggn_station_1", conditionCounts: { new: 5, good: 23, fair: 5, poor: 2, damaged: 0 } },
    { id: "gg_i9", name: "Radio Battery", categoryId: "communication", quantity: 70, unit: "pcs", minStock: 20, locationId: "ggn_station_1", conditionCounts: { new: 10, good: 45, fair: 10, poor: 5, damaged: 0 } },
    { id: "gg_i10", name: "A4 Paper Ream", categoryId: "office", quantity: 50, unit: "boxes", minStock: 10, locationId: "ggn_hq", conditionCounts: { new: 15, good: 30, fair: 3, poor: 2, damaged: 0 } },
    { id: "gg_i11", name: "Fingerprint Kit", categoryId: "forensics", quantity: 10, unit: "sets", minStock: 5, locationId: "ggn_station_1", conditionCounts: { new: 2, good: 6, fair: 2, poor: 0, damaged: 0 } },
    { id: "gg_i12", name: "First Aid Kit", categoryId: "medical", quantity: 25, unit: "sets", minStock: 10, locationId: "ggn_mhc", conditionCounts: { new: 5, good: 15, fair: 3, poor: 2, damaged: 0 } },
    { id: "gg_i13", name: "Patrol Car", categoryId: "vehicles", quantity: 8, unit: "pcs", minStock: 3, locationId: "ggn_hq", conditionCounts: { new: 1, good: 4, fair: 2, poor: 1, damaged: 0 } },
    { id: "gg_i14", name: "Motorcycle", categoryId: "vehicles", quantity: 12, unit: "pcs", minStock: 5, locationId: "ggn_station_1", conditionCounts: { new: 0, good: 5, fair: 4, poor: 2, damaged: 1 } },
    { id: "gg_i15", name: "Metal Barricade", categoryId: "barricades", quantity: 60, unit: "pcs", minStock: 20, locationId: "ggn_mhc", conditionCounts: { new: 0, good: 20, fair: 15, poor: 15, damaged: 10 } },
    { id: "gg_i16", name: "Folding Table", categoryId: "furniture", quantity: 20, unit: "pcs", minStock: 5, locationId: "ggn_mhc", conditionCounts: { new: 3, good: 12, fair: 3, poor: 2, damaged: 0 } },
    { id: "gg_i17", name: "Plastic Chair", categoryId: "furniture", quantity: 100, unit: "pcs", minStock: 20, locationId: "ggn_mhc", conditionCounts: { new: 0, good: 40, fair: 20, poor: 15, damaged: 25 } },
    { id: "gg_i18", name: "Portable Speaker", categoryId: "sound", quantity: 10, unit: "pcs", minStock: 3, locationId: "ggn_mhc", conditionCounts: { new: 1, good: 7, fair: 1, poor: 1, damaged: 0 } },
    { id: "gg_i19", name: "Riot Helmet", categoryId: "riot", quantity: 60, unit: "pcs", minStock: 15, locationId: "ggn_mhc", conditionCounts: { new: 10, good: 35, fair: 10, poor: 3, damaged: 2 } },
    { id: "gg_i20", name: "Body Protector", categoryId: "riot", quantity: 40, unit: "pcs", minStock: 10, locationId: "ggn_mhc", conditionCounts: { new: 5, good: 15, fair: 12, poor: 5, damaged: 3 } },
    { id: "gg_i21", name: "Lathi (Riot Cane)", categoryId: "riot", quantity: 120, unit: "pcs", minStock: 30, locationId: "ggn_station_1", conditionCounts: { new: 15, good: 85, fair: 12, poor: 5, damaged: 3 } },
    { id: "gg_i22", name: "Riot Shield", categoryId: "riot", quantity: 30, unit: "pcs", minStock: 8, locationId: "ggn_mhc", conditionCounts: { new: 2, good: 10, fair: 8, poor: 4, damaged: 6 } },
  ],
  dist_2: [
    { id: "fb_i1", name: "9mm Pistol", categoryId: "weapons", quantity: 30, unit: "pcs", minStock: 10, locationId: "fbd_hq", conditionCounts: { new: 4, good: 21, fair: 3, poor: 2, damaged: 0 } },
    { id: "fb_i2", name: "Shotgun", categoryId: "weapons", quantity: 8, unit: "pcs", minStock: 4, locationId: "fbd_hq", conditionCounts: { new: 1, good: 5, fair: 2, poor: 0, damaged: 0 } },
    { id: "fb_i3", name: "Bullet Proof Vest", categoryId: "weapons", quantity: 14, unit: "pcs", minStock: 8, locationId: "fbd_hq", conditionCounts: { new: 2, good: 5, fair: 4, poor: 2, damaged: 1 } },
    { id: "fb_i4", name: "Lathi (Baton)", categoryId: "weapons", quantity: 300, unit: "pcs", minStock: 100, locationId: "fbd_station_1", conditionCounts: { new: 40, good: 220, fair: 25, poor: 10, damaged: 5 } },
    { id: "fb_i5", name: "Khaki Uniform Set", categoryId: "uniforms", quantity: 120, unit: "pcs", minStock: 25, locationId: "fbd_mhc", conditionCounts: { new: 15, good: 75, fair: 18, poor: 8, damaged: 4 } },
    { id: "fb_i6", name: "Winter Jacket", categoryId: "uniforms", quantity: 80, unit: "pcs", minStock: 20, locationId: "fbd_mhc", conditionCounts: { new: 10, good: 55, fair: 10, poor: 3, damaged: 2 } },
    { id: "fb_i7", name: "Combat Boots", categoryId: "uniforms", quantity: 90, unit: "pcs", minStock: 25, locationId: "fbd_mhc", conditionCounts: { new: 0, good: 35, fair: 25, poor: 20, damaged: 10 } },
    { id: "fb_i8", name: "Walkie Talkie", categoryId: "communication", quantity: 25, unit: "pcs", minStock: 8, locationId: "fbd_station_1", conditionCounts: { new: 3, good: 17, fair: 3, poor: 2, damaged: 0 } },
    { id: "fb_i9", name: "Headset for Radio", categoryId: "communication", quantity: 40, unit: "pcs", minStock: 15, locationId: "fbd_station_1", conditionCounts: { new: 5, good: 27, fair: 5, poor: 2, damaged: 1 } },
    { id: "fb_i10", name: "Stationery Set", categoryId: "office", quantity: 80, unit: "boxes", minStock: 20, locationId: "fbd_hq", conditionCounts: { new: 20, good: 50, fair: 6, poor: 3, damaged: 1 } },
    { id: "fb_i11", name: "Computer Monitor", categoryId: "office", quantity: 20, unit: "pcs", minStock: 5, locationId: "fbd_hq", conditionCounts: { new: 0, good: 10, fair: 4, poor: 3, damaged: 3 } },
    { id: "fb_i12", name: "DNA Collection Kit", categoryId: "forensics", quantity: 8, unit: "sets", minStock: 4, locationId: "fbd_station_1", conditionCounts: { new: 2, good: 4, fair: 2, poor: 0, damaged: 0 } },
    { id: "fb_i13", name: "First Aid Box", categoryId: "medical", quantity: 18, unit: "sets", minStock: 8, locationId: "fbd_mhc", conditionCounts: { new: 3, good: 11, fair: 3, poor: 1, damaged: 0 } },
    { id: "fb_i14", name: "Patrol Van", categoryId: "vehicles", quantity: 6, unit: "pcs", minStock: 2, locationId: "fbd_hq", conditionCounts: { new: 1, good: 3, fair: 1, poor: 1, damaged: 0 } },
    { id: "fb_i15", name: "Bicycle", categoryId: "vehicles", quantity: 15, unit: "pcs", minStock: 5, locationId: "fbd_station_1", conditionCounts: { new: 0, good: 7, fair: 5, poor: 2, damaged: 1 } },
    { id: "fb_i16", name: "Mobile Barricade", categoryId: "barricades", quantity: 45, unit: "pcs", minStock: 15, locationId: "fbd_mhc", conditionCounts: { new: 5, good: 30, fair: 6, poor: 3, damaged: 1 } },
    { id: "fb_i17", name: "Traffic Cone", categoryId: "barricades", quantity: 80, unit: "pcs", minStock: 25, locationId: "fbd_mhc", conditionCounts: { new: 10, good: 55, fair: 10, poor: 3, damaged: 2 } },
    { id: "fb_i18", name: "Office Chair", categoryId: "furniture", quantity: 50, unit: "pcs", minStock: 10, locationId: "fbd_mhc", conditionCounts: { new: 0, good: 22, fair: 15, poor: 8, damaged: 5 } },
    { id: "fb_i19", name: "Horn Speaker", categoryId: "sound", quantity: 12, unit: "pcs", minStock: 4, locationId: "fbd_mhc", conditionCounts: { new: 2, good: 8, fair: 1, poor: 1, damaged: 0 } },
    { id: "fb_i20", name: "Riot Helmet", categoryId: "riot", quantity: 50, unit: "pcs", minStock: 12, locationId: "fbd_mhc", conditionCounts: { new: 8, good: 32, fair: 6, poor: 3, damaged: 1 } },
    { id: "fb_i21", name: "Body Protector", categoryId: "riot", quantity: 35, unit: "pcs", minStock: 8, locationId: "fbd_mhc", conditionCounts: { new: 5, good: 23, fair: 4, poor: 2, damaged: 1 } },
    { id: "fb_i22", name: "Lathi (Riot Cane)", categoryId: "riot", quantity: 100, unit: "pcs", minStock: 25, locationId: "fbd_station_1", conditionCounts: { new: 12, good: 73, fair: 8, poor: 5, damaged: 2 } },
    { id: "fb_i23", name: "Riot Shield", categoryId: "riot", quantity: 25, unit: "pcs", minStock: 6, locationId: "fbd_mhc", conditionCounts: { new: 2, good: 8, fair: 6, poor: 4, damaged: 5 } },
  ],
};

const DEFAULT_USERS = [
  { id: "u0", username: "developer", password: "dev@123", role: "devadmin", name: "Developer Admin", mobile: "9999999999", districtId: "dist_1", locationId: "ggn_hq", createdAt: Date.now() },
  { id: "u1", username: "admin", password: "admin123", role: "admin", name: "District Admin - Gurugram", mobile: "9876543210", districtId: "dist_1", locationId: "ggn_hq", createdAt: Date.now() },
  { id: "u2", username: "admin2", password: "admin123", role: "admin", name: "District Admin - Faridabad", mobile: "9876543215", districtId: "dist_2", locationId: "fbd_hq", createdAt: Date.now() },
  { id: "u3", username: "user", password: "user123", role: "user", name: "General Staff", mobile: "9876543211", districtId: "dist_1", locationId: "ggn_station_1", createdAt: Date.now() },
  { id: "u4", username: "mhc", password: "mhc123", role: "mhc", name: "MHC Officer - Gurugram", mobile: "9876543212", districtId: "dist_1", locationId: "ggn_mhc", createdAt: Date.now() },
  { id: "u5", username: "station", password: "station123", role: "station", name: "Station Manager - Gurugram", mobile: "9876543213", districtId: "dist_1", locationId: "ggn_station_1", createdAt: Date.now() },
  { id: "u6", username: "fbd_user", password: "user123", role: "user", name: "Staff - Faridabad", mobile: "9876543216", districtId: "dist_2", locationId: "fbd_station_1", createdAt: Date.now() },
  { id: "u7", username: "fbd_mhc", password: "mhc123", role: "mhc", name: "MHC Officer - Faridabad", mobile: "9876543217", districtId: "dist_2", locationId: "fbd_mhc", createdAt: Date.now() },
];

const ROLE_LABELS = { devadmin: "Developer Admin", admin: "District Admin", station: "Station Manager", mhc: "MHC", tsi: "TSI", post: "Police Post", user: "General User" };

/* ==================== CONDITION BAR HELPER ==================== */
function buildCondBar(cc) {
  const total = (cc.new || 0) + (cc.good || 0) + (cc.fair || 0) + (cc.poor || 0) + (cc.damaged || 0);
  if (total === 0) return `<span style="color:var(--muted);font-size:.75rem">No data</span>`;
  const pct = (n) => Math.round((n / total) * 100);
  let bar = `<div class="cond-bar">`;
  if (cc.new) bar += `<div class="cond-bar-seg cond-bar-new" style="width:${pct(cc.new)}%" title="New: ${cc.new}"></div>`;
  if (cc.good) bar += `<div class="cond-bar-seg cond-bar-good" style="width:${pct(cc.good)}%" title="Good: ${cc.good}"></div>`;
  if (cc.fair) bar += `<div class="cond-bar-seg cond-bar-fair" style="width:${pct(cc.fair)}%" title="Fair: ${cc.fair}"></div>`;
  if (cc.poor) bar += `<div class="cond-bar-seg cond-bar-poor" style="width:${pct(cc.poor)}%" title="Poor: ${cc.poor}"></div>`;
  if (cc.damaged) bar += `<div class="cond-bar-seg cond-bar-damaged" style="width:${pct(cc.damaged)}%" title="Damaged: ${cc.damaged}"></div>`;
  bar += `</div>`;
  bar += `<div class="cond-labels">`;
  if (cc.new) bar += `<span style="color:#0ea5e9">${cc.new}N</span>`;
  if (cc.good) bar += `<span style="color:var(--green)">${cc.good}G</span>`;
  if (cc.fair) bar += `<span style="color:#2563eb">${cc.fair}F</span>`;
  if (cc.poor) bar += `<span style="color:var(--amber)">${cc.poor}P</span>`;
  if (cc.damaged) bar += `<span style="color:var(--red)">${cc.damaged}D</span>`;
  bar += `</div>`;
  return bar;
}

/* ==================== STORAGE ==================== */
function storeKey(name) { return STORAGE_PREFIX + name; }
function loadData(key) {
  // When connected to Neon, api-client provides its own cache-backed loadData.
  if (window.CONFIG && window.CONFIG.useRemote && window.__apiLoadFn) return window.__apiLoadFn(key);
  try { return JSON.parse(localStorage.getItem(storeKey(key))); } catch { return null; }
}
function saveData(key, data) {
  if (window.CONFIG && window.CONFIG.useRemote && window.__apiSaveFn) return window.__apiSaveFn(key, data);
  localStorage.setItem(storeKey(key), JSON.stringify(data));
}

/* ==================== SEED ==================== */
function seedAll() {
  const SEED_VERSION = 5;
  const currentVersion = loadData("seedVersion") || 0;
  if (currentVersion < SEED_VERSION) {
    saveData("categories", DEFAULT_CATEGORIES);
    saveData("districts", DEFAULT_DISTRICTS);
    saveData("users", DEFAULT_USERS);
    saveData("locations", DEFAULT_LOCATIONS);
    saveData("items", DEFAULT_ITEMS);
    saveData("seedVersion", SEED_VERSION);
  }
  if (!loadData("categories")) saveData("categories", DEFAULT_CATEGORIES);
  if (!loadData("districts")) saveData("districts", DEFAULT_DISTRICTS);
  if (!loadData("users")) saveData("users", DEFAULT_USERS);
  if (!loadData("locations")) saveData("locations", DEFAULT_LOCATIONS);
  if (!loadData("items")) saveData("items", DEFAULT_ITEMS);

  const cats = loadData("categories") || [];
  const catIds = new Set(cats.map(c => c.id));
  const merged = [...cats];
  DEFAULT_CATEGORIES.forEach(dc => { if (!catIds.has(dc.id)) merged.push(dc); });
  saveData("categories", merged);

  const allItems = loadData("items") || {};
  Object.keys(DEFAULT_ITEMS).forEach(distId => {
    const existing = allItems[distId] || [];
    const existingIds = new Set(existing.map(i => i.id));
    DEFAULT_ITEMS[distId].forEach(di => { if (!existingIds.has(di.id)) existing.push(di); });
    allItems[distId] = existing;
  });
  saveData("items", allItems);

  // Migration: ensure all items have conditionCounts with 'new' field
  let addedDay = 0;
  Object.keys(allItems).forEach(distId => {
    (allItems[distId] || []).forEach(item => {
      if (!item.createdAt) {
        addedDay++;
        item.createdAt = Date.now() - addedDay * 86400000;
      }
      if (!item.conditionCounts) {
        if (item.condition) {
          const qty = item.quantity || 0;
          item.conditionCounts = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
          item.conditionCounts[item.condition] = qty;
        } else {
          item.conditionCounts = { new: 0, good: item.quantity || 0, fair: 0, poor: 0, damaged: 0 };
        }
      }
      if (item.conditionCounts.new === undefined) item.conditionCounts.new = 0;
      const cc = item.conditionCounts;
      const sum = (cc.new || 0) + (cc.good || 0) + (cc.fair || 0) + (cc.poor || 0) + (cc.damaged || 0);
      if (sum !== item.quantity) {
        item.quantity = sum;
      }
      delete item.condition;
    });
  });
  saveData("items", allItems);

  const districts = getDistricts();
  districts.forEach(d => {
    const txKey = `transactions_${d.id}`;
    if (!loadData(txKey)) seedTransactions(d.id);
    const inspKey = `inspections_${d.id}`;
    if (!loadData(inspKey)) seedInspections(d.id);
    const demKey = `demands_${d.id}`;
    if (!loadData(demKey)) seedDemands(d.id);
  });
}

function seedTransactions(districtId) {
  const items = getItemsForDistrict(districtId);
  const locs = getLocationsForDistrict(districtId);
  const users = getUsers().filter(u => u.districtId === districtId);
  const txns = [];
  const types = ["add", "remove", "transfer"];
  for (let i = 0; i < 10; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const user = users.length ? users[Math.floor(Math.random() * users.length)] : { name: "System" };
    txns.push({
      id: uid(), itemId: item.id, itemName: item.name, type,
      quantity: Math.floor(Math.random() * 15) + 1,
      fromLocation: locs.length ? locs[Math.floor(Math.random() * locs.length)].id : "",
      toLocation: locs.length ? locs[Math.floor(Math.random() * locs.length)].id : "",
      performedBy: user.name,
      notes: type === "add" ? "Monthly restock" : type === "remove" ? "Issued to unit" : "Inter-station transfer",
      createdAt: Date.now() - Math.floor(Math.random() * 7 * 86400000),
    });
  }
  saveData(`transactions_${districtId}`, txns);
}

/* ==================== DATA ACCESS ==================== */
function getDistricts() { return loadData("districts") || []; }
function saveDistricts(d) { saveData("districts", d); }
function getUsers() { return loadData("users") || []; }
function saveUsers(u) { saveData("users", u); }
function getCategories() { return loadData("categories") || []; }
function getAllLocations() { return loadData("locations") || {}; }
function saveAllLocations(l) { saveData("locations", l); }
function getAllItems() { return loadData("items") || {}; }
function saveAllItems(i) { saveData("items", i); }

function getLocationsForDistrict(districtId) { return (getAllLocations())[districtId] || []; }
function getItemsForDistrict(districtId) { return (getAllItems())[districtId] || []; }

let activeDistrictId = null;
function getActiveDistrict() { return activeDistrictId; }
function setActiveDistrict(id) { activeDistrictId = id; localStorage.setItem(STORAGE_PREFIX + "activeDistrict", id); }

function getLocations() { return activeDistrictId ? getLocationsForDistrict(activeDistrictId) : []; }

function getVisibleLocations() {
  const locs = getLocations();
  const locId = getVisibleLocationId();
  if (locId) return locs.filter(l => l.id === locId);
  return locs;
}

function getItems() {
  if (!activeDistrictId) return [];
  const all = getItemsForDistrict(activeDistrictId);
  const locId = getVisibleLocationId();
  if (locId) return all.filter(i => i.locationId === locId);
  return all;
}

function getAllDistrictItems() { return activeDistrictId ? getItemsForDistrict(activeDistrictId) : []; }

function saveItems(items) {
  if (!activeDistrictId) return;
  const all = getAllItems();
  all[activeDistrictId] = items;
  saveAllItems(all);
}

function getTransactions() {
  if (!activeDistrictId) return [];
  const all = loadData(`transactions_${activeDistrictId}`) || [];
  const locId = getVisibleLocationId();
  if (!locId) return all;
  return all.filter(t => t.fromLocation === locId || t.toLocation === locId);
}

function saveTransactions(txns) {
  if (!activeDistrictId) return;
  saveData(`transactions_${activeDistrictId}`, txns);
}

/* ==================== ALL-DISTRICT LOCATION ACCESS ==================== */
function getAllLocationsFlat() {
  const all = getAllLocations();
  const districts = getDistricts();
  const result = [];
  districts.forEach(d => {
    (all[d.id] || []).forEach(loc => {
      result.push({ ...loc, districtName: d.name, districtCode: d.code });
    });
  });
  return result;
}

/* ==================== NOTIFICATIONS ==================== */
function getNotifications(districtId) {
  return loadData(`notifications_${districtId}`) || [];
}

function saveNotifications(districtId, list) {
  saveData(`notifications_${districtId}`, list);
}

function addNotification(targetDistrictId, notif) {
  const list = getNotifications(targetDistrictId);
  list.unshift({
    id: uid(),
    type: notif.type,
    title: notif.title,
    message: notif.message,
    fromDistrictId: notif.fromDistrictId || activeDistrictId,
    demandId: notif.demandId || null,
    targetLocId: notif.targetLocId || null,
    targetUserId: notif.targetUserId || null,
    read: false,
    createdAt: Date.now(),
  });
  saveNotifications(targetDistrictId, list);
}

function __userMatch(n) {
  if (!n.targetUserId) return true;
  return currentUser && n.targetUserId === currentUser.id;
}

function __locMatch(n) {
  const locId = getVisibleLocationId();
  if (!locId) return true;
  return !n.targetLocId || n.targetLocId === locId;
}

function getUnreadCount() {
  if (!activeDistrictId) return 0;
  const list = getNotifications(activeDistrictId);
  return list.filter(n => !n.read && __userMatch(n) && __locMatch(n)).length;
}

function markAllRead() {
  if (!activeDistrictId) return;
  if (isDevAdmin()) {
    getDistricts().forEach(d => {
      const list = getNotifications(d.id);
      let changed = false;
      list.forEach(n => { if (__userMatch(n) && __locMatch(n)) { n.read = true; changed = true; } });
      if (changed) saveNotifications(d.id, list);
    });
  } else {
    const list = getNotifications(activeDistrictId);
    let changed = false;
    list.forEach(n => { if (__userMatch(n) && __locMatch(n)) { n.read = true; changed = true; } });
    if (changed) saveNotifications(activeDistrictId, list);
  }
}

function toggleNotifPanel() {
  const panel = $("#notifPanel");
  if (!panel) return;
  const isOpen = !panel.classList.contains("hidden");
  if (isOpen) {
    panel.classList.add("hidden");
  } else {
    renderNotifications();
    panel.classList.remove("hidden");
  }
}

function renderNotifications() {
  if (!activeDistrictId) return;
  let notifs;
  if (isDevAdmin()) {
    const all = [];
    getDistricts().forEach(d => {
      getNotifications(d.id).forEach(n => { if (__userMatch(n)) all.push({ ...n, _distId: d.id }); });
    });
    notifs = all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
  } else {
    notifs = getNotifications(activeDistrictId).filter(n => __userMatch(n) && __locMatch(n)).slice(0, 20);
  }
  const list = $("#notifList");
  const badge = $("#notifBadge");
  const unread = notifs.filter(n => !n.read).length;
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? "flex" : "none";
  }
  if (!list) return;
  if (!notifs.length) {
    list.innerHTML = `<div class="notif-empty">No notifications yet.</div>`;
    return;
  }
  list.innerHTML = notifs.map(n => {
    const timeAgo = getTimeAgo(n.createdAt);
const iconCls = n.type === "demand_raised" ? "notif-icon-demand" : n.type === "demand_approved" ? "notif-icon-approved" : n.type === "password_reset" ? "notif-icon-password" : n.type === "access_request" ? "notif-icon-access" : n.type === "access_approved" ? "notif-icon-approved" : n.type === "access_rejected" ? "notif-icon-rejected" : "notif-icon-rejected";
    const iconSvg = n.type === "demand_raised"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>`
      : n.type === "demand_approved" || n.type === "access_approved"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`
      : n.type === "password_reset"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`
      : n.type === "access_request"
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    let actionsHtml = "";
    if (n.type === "access_request" && !n.read && (isAdmin() || isDevAdmin())) {
      actionsHtml = `<div class="notif-actions">
        <button class="btn btn-sm btn-green" data-notif-approve="${n.id}" data-request-id="${n.requestId}">Approve</button>
        <button class="btn btn-sm btn-red" data-notif-reject="${n.id}" data-request-id="${n.requestId}">Reject</button>
      </div>`;
    }
    return `<div class="notif-item ${n.read ? "" : "notif-unread"}" data-notif-id="${n.id}" data-dist-id="${n._distId || activeDistrictId}" style="cursor:pointer">
      <div class="notif-icon ${iconCls}">${iconSvg}</div>
      <div class="notif-body">
        <div class="notif-title">${esc(n.title)}</div>
        <div class="notif-msg">${esc(n.message)}</div>
        <div class="notif-time">${timeAgo}</div>
        ${actionsHtml}
      </div>
    </div>`;
  }).join("");
}

function getTimeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  return days + "d ago";
}

/* ==================== AUTH ==================== */
function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY)); } catch { return null; }
}
function setAuth(payload, persist) {
  if (persist === false) { localStorage.removeItem(AUTH_KEY); sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload)); }
  else { sessionStorage.removeItem(AUTH_KEY); localStorage.setItem(AUTH_KEY, JSON.stringify(payload)); }
}
function clearAuth() { localStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_KEY); }
function getToken() { const a = getAuth(); return (a && a.token) || null; }

const QUICK_USERS_KEY = STORAGE_PREFIX + "quick_users";
function readQuickUsers() {
  const out = [];
  for (const s of [localStorage, sessionStorage]) {
    try { const a = JSON.parse(s.getItem(QUICK_USERS_KEY) || "[]"); if (Array.isArray(a)) out.push(...a); } catch { /* ignore */ }
  }
  return out.filter((u, i) => out.findIndex(x => x.username === u.username) === i);
}
function addQuickUser(u, persist) {
  const list = readQuickUsers().filter(x => x.username !== u.username);
  list.unshift({ username: u.username, name: u.name || u.username, password: u.password || "" });
  const keep = list.slice(0, 3);
  (persist === false ? sessionStorage : localStorage).setItem(QUICK_USERS_KEY, JSON.stringify(keep));
}
function renderQuickLogin() {
  const box = $("#quickLogin");
  const list = $("#quickLoginList");
  if (!box || !list) return;
  const users = readQuickUsers();
  box.classList.toggle("hidden", users.length === 0);
  list.innerHTML = "";
  users.forEach(u => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "quick-login-chip";
    b.innerHTML = `<span class="ql-avatar">${esc((u.name || u.username).charAt(0).toUpperCase())}</span>` +
      `<span class="ql-text"><span class="ql-name">${esc(u.name || u.username)}</span><span class="ql-user">@${esc(u.username)}</span></span>`;
    b.addEventListener("click", () => {
      $("#loginUser").value = u.username;
      $("#loginPass").value = u.password || "";
      $("#loginError").classList.add("hidden");
      const form = $("#loginForm");
      if (u.password && form && form.requestSubmit) form.requestSubmit();
      else $("#loginPass").focus();
    });
    list.appendChild(b);
  });
}

async function validateSession(token) {
  if (!window.CONFIG || !window.CONFIG.useRemote) return true;
  if (!token) return false;
  try {
    const res = await __api("POST", "auth/me", {});
    return !!(res && res.ok);
  } catch (e) { return false; }
}

async function login(username, password) {
  if (!window.CONFIG || !window.CONFIG.useRemote) {
    // Local-only fallback (no backend): compare against the client-side list.
    const u = getUsers().find(u => u.username === username && u.password === password) || null;
    if (!u) return { user: null };
    const { password: _pwd, ...safe } = u; // never return/store the password
    return { user: safe };
  }
  const res = await __api("POST", "auth/login", { username, password });
  if (res && res.ok) return res;
  return { user: null };
}

let currentUser = null;

function isAdmin() { return currentUser && (currentUser.role === "admin" || currentUser.role === "devadmin"); }
function isDevAdmin() { return currentUser && currentUser.role === "devadmin"; }
function canEdit() { return currentUser && ["admin", "devadmin", "mhc", "station"].includes(currentUser.role); }
function canSeeAllLocations() { return isDevAdmin(); }
function canSeeAllDistrictLocations() { return isAdmin(); }
function getVisibleLocationId() { if (isAdmin()) return null; return currentUser ? currentUser.locationId : null; }

function logout() {
  const t = getToken();
  currentUser = null;
  activeDistrictId = null;
  clearAuth();
  if (window.CONFIG && window.CONFIG.useRemote && t) {
    try { __api("POST", "auth/logout").catch(() => {}); } catch (e) { /* ignore */ }
  }
  $("#appRoot").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginUser").value = "";
  $("#loginPass").value = "";
  $("#loginError").classList.add("hidden");
  renderQuickLogin();
}

function applyRoleUI() {
  if (!currentUser) return;
  $("#userRoleBadge").textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
  $("#userDisplayName").textContent = currentUser.name;
  const dist = getDistricts().find(d => d.id === currentUser.districtId);
  $("#districtBadge").textContent = dist ? dist.name : "";
  document.body.classList.remove("role-admin", "role-devadmin", "role-user", "role-mhc", "role-tsi", "role-station", "role-post");
  document.body.classList.add("role-" + currentUser.role);

  const sidebarUserName = $("#sidebarUserName");
  const sidebarUserRole = $("#sidebarUserRole");
  const sidebarAvatar = $("#sidebarAvatar");
  if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
  if (sidebarUserRole) sidebarUserRole.textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
  if (sidebarAvatar) sidebarAvatar.textContent = (currentUser.name || "U").charAt(0).toUpperCase();

  const distSel = $("#districtSelect");
  if (distSel) {
    distSel.disabled = !isDevAdmin();
    distSel.closest(".district-selector").style.opacity = isDevAdmin() ? "1" : "0.6";
    distSel.closest(".district-selector").style.pointerEvents = isDevAdmin() ? "auto" : "none";
  }

  const sub = $("#dashboardSubtitle");
  if (sub) {
    if (isDevAdmin()) {
      sub.textContent = "Overview of inventory status â€” All districts";
    } else {
      const dist = getDistricts().find(d => d.id === currentUser.districtId);
      sub.textContent = "Overview of inventory status â€” " + (dist ? dist.name : "Your district");
    }
  }
  const devOpt = document.querySelector('#nuRole [data-dev-only]');
  if (devOpt) devOpt.style.display = isDevAdmin() ? "" : "none";
}
function toast(msg, type) {
  const el = $("#toast");
  el.textContent = msg;
  el.className = "toast " + (type || "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2800);
}
function openModal(id) { $(id).classList.remove("hidden"); }
function closeModals() { $$(".modal-backdrop").forEach(m => m.classList.add("hidden")); }

/* ==================== REQUEST ACCESS ==================== */
function getAccessRequests() { return loadData("accessRequests") || []; }
function saveAccessRequests(arr) { saveData("accessRequests", arr); }

function openRequestAccessModal() {
  const distSel = $("#raDistrict");
  distSel.innerHTML = getDistricts().map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("");
  updateRALocationDropdown();
  $("#raName").value = "";
  $("#raPost").value = "";
  $("#raMobile").value = "";
  $("#raUserType").value = "user";
  $("#raResult").classList.add("hidden");
  $("#raSubmitBtn").disabled = false;
  openModal("#requestAccessModal");
}

function updateRALocationDropdown() {
  const distSel = $("#raDistrict");
  const locSel = $("#raLocation");
  if (!distSel || !locSel) return;
  locSel.innerHTML = getLocationsForDistrict(distSel.value).map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
}

function submitAccessRequest(e) {
  e.preventDefault();
  const name = $("#raName").value.trim();
  const post = $("#raPost").value.trim();
  const mobile = $("#raMobile").value.trim();
  const districtId = $("#raDistrict").value;
  const locationId = $("#raLocation").value;
  const userType = $("#raUserType").value;
  if (!name || !post || !mobile || !districtId || !locationId || !userType) return;

  const req = { id: "ar_" + Date.now(), name, post, mobile, districtId, locationId, userType, status: "pending", createdAt: Date.now() };
  const requests = getAccessRequests();
  requests.unshift(req);
  saveAccessRequests(requests);

  const dist = getDistricts().find(d => d.id === districtId);
  const loc = getLocationsForDistrict(districtId).find(l => l.id === locationId);
  const msg = `New access request from "${name}" â€” Post: ${post}, Mobile: ${mobile}, District: ${dist ? dist.name : "â€”"}, Location: ${loc ? loc.name : "â€”"}, Role: ${ROLE_LABELS[userType] || userType}.`;

  const admins = getUsers().filter(u => u.role === "admin" && u.districtId === districtId);
  admins.forEach(a => addNotification(districtId, { type: "access_request", title: "Access Request", message: msg, fromDistrictId: districtId, requestId: req.id }));

  const devs = getUsers().filter(u => u.role === "devadmin");
  devs.forEach(d => addNotification(d.districtId, { type: "access_request", title: "Access Request", message: msg, fromDistrictId: districtId, requestId: req.id }));

  $("#raResult").classList.remove("hidden");
  $("#raSubmitBtn").disabled = true;
  toast("Access request submitted!", "success");
}

function handleAccessApproval(notifId, requestId, status, distId) {
  const requests = getAccessRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return;
  req.status = status;
  saveAccessRequests(requests);

  const targetDist = distId || activeDistrictId;
  const notifs = getNotifications(targetDist);
  const n = notifs.find(x => x.id === notifId);
  if (n) { n.read = true; saveNotifications(targetDist, notifs); }

  const dist = getDistricts().find(d => d.id === req.districtId);
  const loc = getLocationsForDistrict(req.districtId).find(l => l.id === req.locationId);
  const requestData = `Name: ${req.name}, Post: ${req.post}, Mobile: ${req.mobile}, District: ${dist ? dist.name : "â€”"}, Location: ${loc ? loc.name : "â€”"}, Role: ${ROLE_LABELS[req.userType] || req.userType}`;

  if (status === "approved") {
    const admins = getUsers().filter(u => u.role === "admin" && u.districtId === req.districtId);
    admins.forEach(a => addNotification(req.districtId, { type: "access_approved", title: "Access Approved â€” Create User", message: `Request approved. Please create the user: ${requestData}`, fromDistrictId: req.districtId, requestId: req.id }));
    const devs = getUsers().filter(u => u.role === "devadmin");
    devs.forEach(d => addNotification(d.districtId, { type: "access_approved", title: "Access Approved â€” Create User", message: `Request approved. Please create the user: ${requestData}`, fromDistrictId: req.districtId, requestId: req.id }));
    toast("Access request approved! Admins notified to create user.", "success");
  } else {
    const devs = getUsers().filter(u => u.role === "devadmin");
    devs.forEach(d => addNotification(d.districtId, { type: "access_rejected", title: "Access Rejected", message: `Request for "${req.name}" was rejected.`, fromDistrictId: req.districtId, requestId: req.id }));
    toast("Access request rejected.", "error");
  }
  renderNotifications();
}

/* ==================== NAVIGATION ==================== */
function switchTab(name) {
  $$(".sidebar-link").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  $$(".view").forEach(v => v.classList.add("hidden"));
  const view = $("#view-" + name);
  if (view) view.classList.remove("hidden");
  render();
}

function render() {
  renderDistrictSelector();
  renderDashboard();
  renderInventory();
  renderTransactions();
  renderInspections();
  renderDemands();
  const allocView = $("#view-allotments");
  if (allocView && !allocView.classList.contains("hidden")) renderAllotments();
  renderReports();
  const badge = $("#notifBadge");
  if (badge) {
    const count = getUnreadCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

/* ==================== DISTRICT SELECTOR ==================== */
function renderDistrictSelector() {
  const sel = $("#districtSelect");
  if (!sel) return;
  const districts = getDistricts();
  sel.innerHTML = districts.map(d => `<option value="${d.id}" ${d.id === activeDistrictId ? "selected" : ""}>${esc(d.name)}</option>`).join("");
}

function switchDistrict(newId) {
  if (!isDevAdmin()) return;
  activeDistrictId = newId;
  setActiveDistrict(newId);
  const panel = $("#notifPanel");
  if (panel) panel.classList.add("hidden");
  currentUser.districtId = newId;
  setAuth({ user: currentUser, token: getToken() });
  applyRoleUI();
  render();
}

/* ==================== DASHBOARD ==================== */
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function renderDashboard() {
  const items = getItems();
  const txns = getTransactions();
  const cats = getCategories();

  $("#statTotalItems").textContent = items.length;
  $("#statTotalQuantity").textContent = items.reduce((a, i) => a + i.quantity, 0).toLocaleString();
  $("#statLowStock").textContent = items.filter(i => i.quantity <= i.minStock).length;
  $("#statCategories").textContent = cats.length;
  const condTotals = { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
  items.forEach(i => {
    const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
    condTotals.new += cc.new || 0;
    condTotals.good += cc.good || 0;
    condTotals.fair += cc.fair || 0;
    condTotals.poor += cc.poor || 0;
    condTotals.damaged += cc.damaged || 0;
  });
  $("#statNew").textContent = condTotals.new;
  $("#statDamaged").textContent = condTotals.damaged;
  $("#statFair").textContent = condTotals.fair;
  $("#statPoor").textContent = condTotals.poor;
  $("#statGood").textContent = condTotals.good;

  const lowItems = items.filter(i => i.quantity <= i.minStock);
  const lowBody = $("#lowStockBody");
  if (lowItems.length) {
    lowBody.innerHTML = lowItems.map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
      const cls = i.quantity === 0 ? "status-out" : "status-low";
      const label = i.quantity === 0 ? "Out of Stock" : "Low Stock";
      return `<tr><td class="item-name">${esc(i.name)}</td><td><span class="cat-badge">${esc(cat ? cat.name : "")}</span></td><td class="qty-strong">${i.quantity} ${esc(i.unit)}</td><td>${i.minStock}</td><td>${buildCondBar(cc)}</td><td><span class="status-badge ${cls}">${label}</span></td></tr>`;
    }).join("");
    const lowTotal = lowItems.reduce((a, i) => a + i.quantity, 0);
    lowBody.innerHTML += `<tr class="rpt-total-row"><td>Total</td><td></td><td class="qty-strong">${lowTotal}</td><td colspan="3"></td></tr>`;
  } else {
    lowBody.innerHTML = `<tr class="empty-row"><td colspan="6">All items well stocked.</td></tr>`;
  }

  const recentBody = $("#recentTransBody");
  const recent = [...txns].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  if (recent.length) {
    recentBody.innerHTML = recent.map(t => {
      const label = t.type === "add" ? "Added" : t.type === "remove" ? "Removed" : "Transfer";
      return `<tr><td>${fmtDate(t.createdAt)}</td><td class="item-name">${esc(t.itemName)}</td><td><span class="cat-badge">${label}</span></td><td class="qty-strong">${t.quantity}</td><td>${esc(t.performedBy)}</td></tr>`;
    }).join("");
    const recTotal = recent.reduce((a, t) => a + (Number(t.quantity) || 0), 0);
    recentBody.innerHTML += `<tr class="rpt-total-row"><td colspan="3">Total</td><td class="qty-strong">${recTotal}</td><td></td></tr>`;
  } else {
    recentBody.innerHTML = `<tr class="empty-row"><td colspan="5">No transactions yet.</td></tr>`;
  }
}

/* ==================== DASHBOARD STAT DETAIL + EXPORT ==================== */
let __statDetail = { title: "", subtitle: "", cols: [], rows: [], fileName: "" };
let __statFilter = "";

function __statCurrentRows() {
  const d = __statDetail;
  const q = (__statFilter || "").toLowerCase();
  if (!q) return d.rows;
  return d.rows.filter(r => r.some(c => String(c).toLowerCase().includes(q)));
}

function xmlEsc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function __statConditionRows(cond) {
  const items = getItems();
  const cats = getCategories();
  const locs = getLocations();
  const label = cond.charAt(0).toUpperCase() + cond.slice(1);
  const rows = items
    .filter(i => ((i.conditionCounts || {})[cond] || 0) > 0)
    .map(i => {
      const cc = i.conditionCounts || { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", cc[cond] || 0, i.quantity, i.unit, status];
    });
  return { title: label + " Condition Items", cols: ["Item", "Category", "Location", label + " Qty", "Total Qty", "Unit", "Status"], rows };
}

const __STAT_BUILDERS = {
  total: () => {
    const items = getItems();
    const cats = getCategories();
    const locs = getLocations();
    const rows = items.map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.unit, i.minStock, status];
    });
    return { title: "Total Items", cols: ["Item", "Category", "Location", "Qty", "Unit", "Min", "Status"], rows };
  },
  stock: () => {
    const items = getItems();
    const cats = getCategories();
    const locs = getLocations();
    const rows = items.map(i => {
      const cc = i.conditionCounts || { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.unit, i.minStock, cc.new || 0, cc.good || 0, cc.fair || 0, cc.poor || 0, cc.damaged || 0, status];
    });
    return { title: "Total Quantity", cols: ["Item", "Category", "Location", "Qty", "Unit", "Min", "New", "Good", "Fair", "Poor", "Damaged", "Status"], rows };
  },
  low: () => {
    const items = getItems();
    const cats = getCategories();
    const locs = getLocations();
    const rows = items.filter(i => i.quantity <= i.minStock).map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const status = i.quantity === 0 ? "Out" : "Low";
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.minStock, status];
    });
    return { title: "Low Stock Alerts", cols: ["Item", "Category", "Location", "Current", "Min", "Status"], rows };
  },
  categories: () => {
    const items = getItems();
    const cats = getCategories();
    const rows = cats.map(c => {
      const list = items.filter(i => i.categoryId === c.id);
      return [c.name, c.icon || "", list.length, list.reduce((a, i) => a + i.quantity, 0)];
    });
    return { title: "Categories", cols: ["Category", "Icon", "No. of Items", "Total Qty"], rows };
  },
  new: () => __statConditionRows("new"),
  good: () => __statConditionRows("good"),
  fair: () => __statConditionRows("fair"),
  poor: () => __statConditionRows("poor"),
  damaged: () => __statConditionRows("damaged")
};

function openStatDetail(key) {
  const def = __STAT_BUILDERS[key] ? __STAT_BUILDERS[key]() : null;
  if (!def) return;
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  const now = new Date().toLocaleString();
  __statDetail = {
    title: def.title,
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + now,
    cols: def.cols,
    rows: def.rows,
    fileName: "dashboard-" + key.toLowerCase()
  };
  __statFilter = "";
  $("#statDetailTitle").textContent = def.title;
  $("#statDetailSubtitle").textContent = __statDetail.subtitle;
  $("#statDetailHead").innerHTML = "<tr>" + def.cols.map(c => `<th>${esc(c)}</th>`).join("") + "</tr>";
  const s = $("#statSearch");
  if (s) s.value = "";
  renderStatDetail("");
  openModal("#statDetailModal");
}

function __statTotalRow() {
  const d = __statDetail;
  const rows = __statCurrentRows();
  if (!rows.length) return null;
  const out = new Array(d.cols.length).fill("");
  let hasNum = false;
  for (let c = 0; c < d.cols.length; c++) {
    const vals = rows.map(r => r[c]);
    if (vals.length && vals.every(v => typeof v === "number" && isFinite(v))) {
      out[c] = vals.reduce((a, v) => a + v, 0);
      hasNum = true;
    }
  }
  return hasNum ? out : null;
}

function __statTableBody() {
  const rows = __statCurrentRows();
  const tr = __statTotalRow();
  if (tr) rows.push(tr);
  return rows;
}

function renderStatDetail(filter) {
  __statFilter = (filter || "").trim();
  const d = __statDetail;
  const rows = __statCurrentRows();
  const countEl = $("#statDetailCount");
  if (countEl) countEl.textContent = rows.length + (__statFilter ? " of " + d.rows.length : "") + " row" + (rows.length === 1 ? "" : "s");
  const body = $("#statDetailBody");
  if (rows.length) {
    body.innerHTML = rows.map((r, idx) => `<tr class="${idx % 2 ? "row-alt" : ""}">${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("");
    const tr = __statTotalRow();
    if (tr) {
      const cells = tr.map((c, ci) => `<td class="stat-total-cell">${ci === 0 ? "Total" : c === "" ? "" : esc(c)}</td>`).join("");
      body.innerHTML += `<tr>${cells}</tr>`;
    }
  } else {
    body.innerHTML = `<tr class="empty-row"><td colspan="${d.cols.length}">${d.rows.length ? "No matching entries found." : "No data for this statistic."}</td></tr>`;
  }
}

function downloadBlob(content, mime, fileName) {
  const blob = new Blob([content], { type: mime + ";charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function printStatDetail() {
  const d = __statDetail;
  if (!d.title) return;
  const rows = __statCurrentRows();
  let rowsHtml = rows.length
    ? rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${d.cols.length}" style="text-align:center;color:#888">No data</td></tr>`;
  const tr = __statTotalRow();
  if (tr) {
    rowsHtml += `<tr style="font-weight:bold;background:#e8edf5">${tr.map((c, ci) => `<td style="border-top:2px solid #1e3a5f">${ci === 0 ? "Total" : c === "" ? "" : esc(c)}</td>`).join("")}</tr>`;
  }
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(d.title)}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:24px;color:#111}
      h2{margin:0 0 4px;font-size:20px}
      .meta{font-size:12px;color:#555;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #1e3a5f}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#1e3a5f;color:#fff;text-align:left;padding:6px 8px}
      td{padding:6px 8px;border-bottom:1px solid #ccc}
      tr:nth-child(even){background:#f5f7fa}
    </style></head><body>
    <h2>${esc(d.title)}</h2>
    <div class="meta">${esc(d.subtitle)}</div>
    <table><thead><tr>${d.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rowsHtml}</tbody></table>
    <script>window.onload=function(){window.print();};<\/script>
    </body></html>`);
  w.document.close();
}

function exportStatExcel() {
  const d = __statDetail;
  if (!d.title) return;
  const rows = __statCurrentRows();
  let x = '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>\n';
  x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">${xmlEsc(d.title)}</Data></Cell></Row>\n`;
  x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">${xmlEsc(d.subtitle)}</Data></Cell></Row>\n`;
  x += "<Row>";
  d.cols.forEach(c => { x += `<Cell><Data ss:Type="String">${xmlEsc(c)}</Data></Cell>`; });
  x += "</Row>\n";
  if (!rows.length) {
    x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">No data</Data></Cell></Row>\n`;
  } else {
    rows.forEach(r => {
      x += "<Row>";
      r.forEach(c => {
        const isNum = typeof c === "number" && isFinite(c);
        x += `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${isNum ? c : xmlEsc(c)}</Data></Cell>`;
      });
      x += "</Row>\n";
    });
  }
  const tr = __statTotalRow();
  if (tr) {
    x += "<Row>";
    tr.forEach((c, ci) => {
      if (ci === 0) { x += `<Cell><Data ss:Type="String">Total</Data></Cell>`; return; }
      const isNum = typeof c === "number" && isFinite(c);
      x += c === "" ? `<Cell/>` : `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${isNum ? c : xmlEsc(c)}</Data></Cell>`;
    });
    x += "</Row>\n";
  }
  x += "</Table></Worksheet></Workbook>";
  downloadBlob(x, "application/vnd.ms-excel", d.fileName + ".xls");
  toast("Excel exported.", "success");
}

function exportStatWord() {
  const d = __statDetail;
  if (!d.title) return;
  const rows = __statCurrentRows();
  let x = '<?xml version="1.0"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:body>\n';
  x += `<w:p><w:r><w:rPr><w:b/><w:sz w:val="34"/></w:rPr><w:t>${xmlEsc(d.title)}</w:t></w:r></w:p>\n`;
  x += `<w:p><w:r><w:t xml:space="preserve">${xmlEsc(d.subtitle)}</w:t></w:r></w:p>\n`;
  x += `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="6"/><w:left w:val="single" w:sz="6"/><w:bottom w:val="single" w:sz="6"/><w:right w:val="single" w:sz="6"/><w:insideH w:val="single" w:sz="6"/><w:insideV w:val="single" w:sz="6"/></w:tblBorders></w:tblPr>\n`;
  x += "<w:tr>";
  d.cols.forEach(c => { x += `<w:tc><w:tcPr><w:shd w:fill="1E3A5F"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>${xmlEsc(c)}</w:t></w:r></w:p></w:tc>`; });
  x += "</w:tr>\n";
  if (!rows.length) {
    x += `<w:tr><w:tc><w:p><w:r><w:t>No data</w:t></w:r></w:p></w:tc></w:tr>`;
  } else {
    rows.forEach(r => {
      x += "<w:tr>";
      r.forEach(c => { x += `<w:tc><w:p><w:r><w:t xml:space="preserve">${xmlEsc(c)}</w:t></w:r></w:p></w:tc>`; });
      x += "</w:tr>\n";
    });
  }
  const tr = __statTotalRow();
  if (tr) {
    x += "<w:tr>";
    tr.forEach((c, ci) => {
      const isNum = typeof c === "number" && isFinite(c);
      x += `<w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${ci === 0 ? "Total" : isNum ? c : c === "" ? "" : xmlEsc(c)}</w:t></w:r></w:p></w:tc>`;
    });
    x += "</w:tr>\n";
  }
  x += "</w:tbl>\n</w:body></w:wordDocument>";
  downloadBlob(x, "application/msword", d.fileName + ".doc");
  toast("Word document exported.", "success");
}

function exportStatPDF() {
  const d = __statDetail;
  if (!d.title) return;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    toast("PDF library not loaded yet - use Print instead.", "error");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 95);
  doc.text(d.title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(d.subtitle, 14, 22);
  const body = __statTableBody();
  const totalIdx = body.length - 1;
  const hasTotal = body.length > 0 && body[totalIdx][0] === "Total";
  doc.autoTable({
    head: [d.cols],
    body: body,
    startY: 27,
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didParseCell: data => {
      if (data.section === "body" && hasTotal && data.row.index === totalIdx) data.cell.styles.fontStyle = "bold";
    }
  });
  doc.save(d.fileName + ".pdf");
  toast("PDF exported.", "success");
}

/* ==================== INVENTORY ==================== */
function bindCombobox(inputId, menuId, selId) {
  const input = $("#" + inputId), menu = $("#" + menuId), sel = $("#" + selId);
  if (!input || !menu || !sel) return;

  const selectVal = (val) => {
    sel.value = val;
    syncLabel();
    hideMenu();
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const renderOpts = (filter) => {
    const q = (filter || "").toLowerCase();
    const opts = sel.options;
    let html = "";
    for (let i = 0; i < opts.length; i++) {
      const o = opts[i];
      const label = o.text;
      if (q && !label.toLowerCase().includes(q)) continue;
      if (!o.value && q) continue;
      html += `<button type="button" class="cb-opt${sel.value === o.value ? " cb-opt-sel" : ""}" data-val="${o.value}">${esc(label)}</button>`;
    }
    menu.innerHTML = html || `<div class="cb-empty">No matches${q ? ` for "${esc(q)}"` : ""}</div>`;
    Array.prototype.forEach.call(menu.querySelectorAll(".cb-opt"), b => b.addEventListener("mousedown", ev => {
      ev.preventDefault();
      selectVal(b.dataset.val);
    }));
  };

  const syncLabel = () => {
    const o = sel.selectedOptions && sel.selectedOptions[0];
    input.value = o ? o.text : "";
    input.classList.toggle("cb-has-value", !!(o && o.value));
  };

  const showMenu = (filter) => {
    renderOpts(filter || "");
    menu.classList.remove("hidden");
    input.classList.add("cb-open");
  };

  const hideMenu = () => {
    menu.classList.add("hidden");
    input.classList.remove("cb-open");
  };

  input.addEventListener("mousedown", () => {
    input.value = "";
    showMenu("");
  });
  input.addEventListener("focus", () => {
    if (!input.value) return;
    input.value = "";
    showMenu("");
  });
  input.addEventListener("input", () => { showMenu(input.value); });
  input.addEventListener("blur", () => setTimeout(() => { hideMenu(); syncLabel(); }, 160));
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); hideMenu(); syncLabel(); }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = menu.querySelector(".cb-opt");
      if (opt) selectVal(opt.dataset.val); else { hideMenu(); syncLabel(); }
    }
  });
}

function bindItemSearch() {
  const input = $("#searchInput"), menu = $("#searchCbMenu");
  if (!input || !menu) return;
  const MAX = 40;
  let prevText = "";

  const selectItem = (name) => {
    input.value = name;
    hideMenu();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const renderOpts = (filter) => {
    const q = (filter || "").toLowerCase();
    const items = getItems()
      .filter(i => q ? i.name.toLowerCase().includes(q) : true)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, MAX);
    if (!items.length) {
      menu.innerHTML = `<div class="cb-empty">No items${q ? ` matching "${esc(q)}"` : ""}</div>`;
      return;
    }
    menu.innerHTML = items.map(i => `<button type="button" class="cb-opt" data-name="${i.id}">${esc(i.name)}</button>`).join("");
    Array.prototype.forEach.call(menu.querySelectorAll(".cb-opt"), b => b.addEventListener("mousedown", ev => {
      ev.preventDefault();
      selectItem(b.textContent.trim());
    }));
  };
  const showMenu = (f) => { renderOpts(f); menu.classList.remove("hidden"); };
  const hideMenu = () => menu.classList.add("hidden");
  const restore = () => { if (!input.value) input.value = prevText; };

  input.addEventListener("mousedown", () => { prevText = input.value; input.value = ""; showMenu(""); });
  input.addEventListener("focus", () => { if (!input.value) return; prevText = input.value; input.value = ""; showMenu(""); });
  input.addEventListener("input", () => { showMenu(input.value); });
  input.addEventListener("blur", () => setTimeout(() => { hideMenu(); restore(); }, 160));
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); hideMenu(); restore(); }
    if (e.key === "Enter") {
      e.preventDefault();
      const o = menu.querySelector(".cb-opt");
      if (o) selectItem(o.textContent.trim()); else hideMenu();
    }
  });
}

function syncComboboxes() {
  [["#categoryCbInput", "#categoryFilter"], ["#locationCbInput", "#locationFilter"], ["#conditionCbInput", "#conditionFilter"]].forEach(pair => {
    const input = $(pair[0]), selEl = $(pair[1]);
    if (!input || !selEl) return;
    const o = selEl.selectedOptions && selEl.selectedOptions[0];
    input.value = o ? o.text : "";
    input.classList.toggle("cb-has-value", !!(o && o.value));
  });
}

function __invFiltered() {
  const items = getItems();
  const q = ($("#searchInput") || {}).value || "";
  const catFilter = ($("#categoryFilter") || {}).value || "";
  const locFilter = ($("#locationFilter") || {}).value || "";
  const condFilter = ($("#conditionFilter") || {}).value || "";
  const dateFrom = ($("#itemDateFrom") || {}).value;
  const dateTo = ($("#itemDateTo") || {}).value;

  return items.filter(i => {
    if (catFilter && i.categoryId !== catFilter) return false;
    if (locFilter && i.locationId !== locFilter) return false;
    if (condFilter) {
      const cc = i.conditionCounts || {};
      if (!(cc[condFilter] > 0)) return false;
    }
    if (q && !i.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (dateFrom) {
      const d = i.createdAt || 0;
      if (!d || d < new Date(dateFrom + "T00:00:00").getTime()) return false;
    }
    if (dateTo) {
      const d = i.createdAt || 0;
      if (!d || d >= new Date(dateTo + "T00:00:00").getTime() + 86400000) return false;
    }
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function actDD(items, forceDD) {
  if (!items || !items.length) return "";
  const itemBtn = it => `<button type="button" class="${it.cls || ""}" ${it.attrs} ${it.title ? `title="${esc(it.title)}"` : ""}>${it.label}</button>`;
  if (!forceDD && items.length === 1) {
    return itemBtn(items[0]).replace('class="', 'class="btn btn-sm btn-outline ');
  }
  return `<div class="act-dd"><button type="button" class="act-dd-btn" data-act-dd>Actions <span class="ee-caret">&#9662;</span></button>` +
    `<div class="act-dd-menu hidden">${items.map(itemBtn).join("")}</div></div>`;
}

function renderInventory() {
  const items = getItems();
  const cats = getCategories();
  const locs = getLocations();
  const condFilter = ($("#conditionFilter") || {}).value || "";
  const catFilter = ($("#categoryFilter") || {}).value || "";
  const filtered = __invFiltered();

  const tbody = $("#inventoryBody");
  if (!tbody) return;

  if (filtered.length) {
    let totalQty = 0;
    tbody.innerHTML = filtered.map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
      const displayQty = condFilter ? (cc[condFilter] || 0) : i.quantity;
      totalQty += displayQty;
      const cls = displayQty === 0 ? "status-out" : displayQty <= i.minStock ? "status-low" : "status-ok";
      const label = displayQty === 0 ? "Out of Stock" : displayQty <= i.minStock ? "Low Stock" : "In Stock";
      const btns = canEdit() ? actDD([
        { label: "Edit", attrs: `data-action="edit" data-id="${i.id}"` },
        { label: "Delete", attrs: `data-action="delete" data-id="${i.id}"`, cls: "act-dd-del" }
      ]) : "";
      return `<tr><td class="item-name">${esc(i.name)}</td><td><span class="cat-badge">${esc(cat ? cat.name : "")}</span></td><td class="qty-strong">${displayQty}</td><td>${esc(i.unit)}</td><td>${i.minStock}</td><td>${esc(loc ? loc.name : "")}</td><td>${buildCondBar(cc)}</td><td><span class="status-badge ${cls}">${label}</span></td><td>${i.createdAt ? fmtDate(i.createdAt) : "<span style='color:var(--muted)'>\u2014</span>"}</td><td class="actions-cell">${btns}</td></tr>`;
    }).join("");

    if (condFilter) {
      const condLabel = condFilter.charAt(0).toUpperCase() + condFilter.slice(1);
      let catTotalQty = 0;
      if (catFilter) {
        filtered.forEach(i => {
          const cc = i.conditionCounts || {};
          catTotalQty += (cc[condFilter] || 0);
        });
      }
      const allItems = getItems();
      let grandTotalQty = 0;
      allItems.forEach(i => {
        const cc = i.conditionCounts || {};
        grandTotalQty += (cc[condFilter] || 0);
      });
      const catName = catFilter ? (cats.find(c => c.id === catFilter) || {}).name : "";
      const summaryHtml = catFilter
        ? `<tr class="summary-row"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (${esc(catName)})</td><td class="qty-strong" style="color:var(--primary)">${catTotalQty}</td><td colspan="7"></td></tr><tr class="summary-row summary-grand"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (All Categories)</td><td class="qty-strong" style="color:var(--primary)">${grandTotalQty}</td><td colspan="7"></td></tr>`
        : `<tr class="summary-row summary-grand"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (All Categories)</td><td class="qty-strong" style="color:var(--primary)">${grandTotalQty}</td><td colspan="7"></td></tr>`;
      tbody.innerHTML += summaryHtml;
    }

    tbody.innerHTML += `<tr class="rpt-total-row"><td>Total</td><td></td><td class="qty-strong">${totalQty}</td><td colspan="7"></td></tr>`;
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No items found. Adjust filters or click "+ Add Item" to add one.</td></tr>`;
  }
  renderCatPills();
  rebuildDropdowns();
  syncComboboxes();
}

function __invExportData() {
  const cats = getCategories();
  const locs = getLocations();
  const condKeys = ["new", "good", "fair", "poor", "damaged"];
  const condLabels = ["New", "Good", "Fair", "Poor", "Damaged"];
  const rows = __invFiltered().map(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const loc = locs.find(l => l.id === i.locationId);
    const cc = i.conditionCounts || {};
    const total = condKeys.reduce((s, k) => s + (cc[k] || 0), 0);
    const condTxt = condKeys.map((k, idx) => (cc[k] || 0) ? `${cc[k]} ${condLabels[idx]}` : null).filter(Boolean).join(", ") || "\u2014";
    const status = total === 0 ? "Out of Stock" : total <= i.minStock ? "Low Stock" : "In Stock";
    return [i.name, cat ? cat.name : "", total, i.unit, i.minStock, loc ? loc.name : "", condTxt, status, i.createdAt ? fmtDate(i.createdAt) : "\u2014"];
  });
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  return {
    title: "Inventory Report",
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + rows.length + " item" + (rows.length === 1 ? "" : "s") + ")",
    cols: ["Item Name", "Category", "Quantity", "Unit", "Min Stock", "Location", "Condition", "Status", "Date Added"],
    rows,
    fileName: "inventory-report"
  };
}

function printReport(d) {
  if (!d.title) return;
  const rowsHtml = d.rows.length
    ? d.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")
    : `<tr><td colspan="${d.cols.length}" style="text-align:center;color:#888">No data</td></tr>`;
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(d.title)}</title>
    <style>
      body{font-family:Arial,sans-serif;margin:24px;color:#111}
      h2{margin:0 0 4px;font-size:20px}
      .meta{font-size:12px;color:#555;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #1e3a5f}
      table{width:100%;border-collapse:collapse;font-size:12px}
      th{background:#1e3a5f;color:#fff;text-align:left;padding:6px 8px}
      td{padding:6px 8px;border-bottom:1px solid #ccc}
      tr:nth-child(even){background:#f5f7fa}
    </style></head><body>
    <h2>${esc(d.title)}</h2>
    <div class="meta">${esc(d.subtitle)}</div>
    <table><thead><tr>${d.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${rowsHtml}</tbody></table>
    <script>window.onload=function(){window.print();};<\/script>
    </body></html>`);
  w.document.close();
}

function excelReport(d) {
  if (!d.title) return;
  let x = '<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>\n';
  x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">${xmlEsc(d.title)}</Data></Cell></Row>\n`;
  x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">${xmlEsc(d.subtitle)}</Data></Cell></Row>\n`;
  x += "<Row>";
  d.cols.forEach(c => { x += `<Cell><Data ss:Type="String">${xmlEsc(c)}</Data></Cell>`; });
  x += "</Row>\n";
  if (!d.rows.length) {
    x += `<Row><Cell ss:MergeAcross="${d.cols.length - 1}"><Data ss:Type="String">No data</Data></Cell></Row>\n`;
  } else {
    d.rows.forEach(r => {
      x += "<Row>";
      r.forEach(c => {
        const isNum = typeof c === "number" && isFinite(c);
        x += `<Cell><Data ss:Type="${isNum ? "Number" : "String"}">${isNum ? c : xmlEsc(c)}</Data></Cell>`;
      });
      x += "</Row>\n";
    });
  }
  x += "</Table></Worksheet></Workbook>";
  downloadBlob(x, "application/vnd.ms-excel", d.fileName + ".xls");
}

function wordReport(d) {
  if (!d.title) return;
  let x = '<?xml version="1.0"?>\n<?mso-application progid="Word.Document"?>\n<w:wordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:body>\n';
  x += `<w:p><w:r><w:rPr><w:b/><w:sz w:val="34"/></w:rPr><w:t>${xmlEsc(d.title)}</w:t></w:r></w:p>\n`;
  x += `<w:p><w:r><w:t xml:space="preserve">${xmlEsc(d.subtitle)}</w:t></w:r></w:p>\n`;
  x += `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="6"/><w:left w:val="single" w:sz="6"/><w:bottom w:val="single" w:sz="6"/><w:right w:val="single" w:sz="6"/><w:insideH w:val="single" w:sz="6"/><w:insideV w:val="single" w:sz="6"/></w:tblBorders></w:tblPr>\n`;
  x += "<w:tr>";
  d.cols.forEach(c => { x += `<w:tc><w:tcPr><w:shd w:fill="1E3A5F"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr><w:t>${xmlEsc(c)}</w:t></w:r></w:p></w:tc>`; });
  x += "</w:tr>\n";
  if (!d.rows.length) {
    x += `<w:tr><w:tc><w:p><w:r><w:t>No data</w:t></w:r></w:p></w:tc></w:tr>`;
  } else {
    d.rows.forEach(r => {
      x += "<w:tr>";
      r.forEach(c => { x += `<w:tc><w:p><w:r><w:t xml:space="preserve">${xmlEsc(c)}</w:t></w:r></w:p></w:tc>`; });
      x += "</w:tr>\n";
    });
  }
  x += "</w:tbl>\n</w:body></w:wordDocument>";
  downloadBlob(x, "application/msword", d.fileName + ".doc");
}

function pdfReport(d) {
  if (!d.title) return;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    toast("PDF library not loaded yet - use Print instead.", "error");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 95);
  doc.text(d.title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(d.subtitle, 14, 22);
  doc.autoTable({
    head: [d.cols],
    body: d.rows,
    startY: 27,
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });
  doc.save(d.fileName + ".pdf");
}

function printInventoryReport() { printReport(__invExportData()); }
function exportInvExcel() { excelReport(__invExportData()); toast("Excel exported.", "success"); }
function exportInvWord() { wordReport(__invExportData()); toast("Word document exported.", "success"); }
function exportInvPDF() { pdfReport(__invExportData()); toast("PDF exported.", "success"); }

function renderCatPills() {
  const box = $("#catPills");
  if (!box) return;
  const items = getItems();
  const cats = getCategories();
  const activeCat = ($("#categoryFilter") || {}).value || "";
  const counts = {};
  items.forEach(i => { counts[i.categoryId] = (counts[i.categoryId] || 0) + 1; });

  let html = `<button class="cat-pill${!activeCat ? " active" : ""}" data-cat="">All <span class="cat-count">${items.length}</span></button>`;
  cats.forEach(c => {
    html += `<button class="cat-pill${activeCat === c.id ? " active" : ""}" data-cat="${c.id}">${c.icon || ""} ${esc(c.name)} <span class="cat-count">${counts[c.id] || 0}</span></button>`;
  });
  box.innerHTML = html;
  box.querySelectorAll(".cat-pill").forEach(btn => {
    btn.addEventListener("click", () => { const s = $("#categoryFilter"); if (s) s.value = btn.dataset.cat; renderInventory(); });
  });
}

function rebuildDropdowns() {
  const cats = getCategories();
  const locs = getLocations();

  const populate = (sel, list, prev) => {
    if (!sel) return;
    sel.innerHTML = list;
    if (prev) sel.value = prev;
  };

  const catPrev = ($("#categoryFilter") || {}).value;
  populate($("#categoryFilter"), `<option value="">All Categories</option>` + cats.map(c => `<option value="${c.id}">${c.icon||""} ${esc(c.name)}</option>`).join(""), catPrev);

  if (isDevAdmin()) {
    if ($("#locationFilter")) {
      $("#locationFilter").disabled = false;
      const locPrev = ($("#locationFilter") || {}).value;
      populate($("#locationFilter"), `<option value="">All Locations</option>` + locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join(""), locPrev);
    }
  } else if (isAdmin()) {
    if ($("#locationFilter")) {
      $("#locationFilter").disabled = false;
      const locPrev = ($("#locationFilter") || {}).value;
      populate($("#locationFilter"), `<option value="">All Locations in District</option>` + locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join(""), locPrev);
    }
  } else {
    if ($("#locationFilter")) {
      const myLoc = getLocations().find(l => l.id === currentUser.locationId);
      $("#locationFilter").innerHTML = `<option value="${currentUser.locationId}">${esc(myLoc ? myLoc.name : "")}</option>`;
      $("#locationFilter").disabled = true;
    }
  }

  populate($("#fCategory"), cats.map(c => `<option value="${c.id}">${c.icon||""} ${esc(c.name)}</option>`).join(""));
  populate($("#fLocation"), locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join(""));
}

function buildAllLocationsDropdown() {
  const allLocs = getAllLocationsFlat();
  const districts = getDistricts();
  let html = "";
  districts.forEach(d => {
    const dLocs = allLocs.filter(l => l.districtId === d.id);
    if (dLocs.length) {
      html += `<optgroup label="${esc(d.name)} (${esc(d.code)})">`;
      dLocs.forEach(l => {
        html += `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`;
      });
      html += `</optgroup>`;
    }
  });
  return html;
}

function buildDistrictLocationsDropdown(districtId) {
  const locs = getLocationsForDistrict(districtId);
  let html = `<optgroup label="${esc(getDistricts().find(d => d.id === districtId)?.name || "")}">`;
  locs.forEach(l => {
    html += `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`;
  });
  html += `</optgroup>`;
  return html;
}

function buildAllDistrictsLocationsDropdown() {
  const districts = getDistricts();
  const all = getAllLocations();
  let html = "";
  districts.forEach(d => {
    const locs = all[d.id] || [];
    if (!locs.length) return;
    html += `<optgroup label="${esc(d.name)}">`;
    locs.forEach(l => {
      html += `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`;
    });
    html += `</optgroup>`;
  });
  return html;
}

function openItemModal(item) {
  $("#itemModalTitle").textContent = item ? "Edit Item" : "Add New Item";
  $("#itemSaveBtn").textContent = item ? "Update Item" : "Save Item";
  $("#fItemName").value = item ? item.name : "";
  $("#fCategory").value = item ? item.categoryId : "";
  $("#fUnit").value = item ? item.unit : "pcs";
  $("#fMinStock").value = item ? item.minStock : 5;
  $("#fItemId").value = item ? item.id : "";

  const cc = item ? (item.conditionCounts || { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 }) : { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
  $("#fCondNew").value = cc.new || 0;
  $("#fCondGood").value = cc.good || 0;
  $("#fCondFair").value = cc.fair || 0;
  $("#fCondPoor").value = cc.poor || 0;
  $("#fCondDamaged").value = cc.damaged || 0;
  $("#fQuantity").value = (cc.new || 0) + (cc.good || 0) + (cc.fair || 0) + (cc.poor || 0) + (cc.damaged || 0);

  const locSel = $("#fLocation");
  if (!canSeeAllLocations()) {
    locSel.innerHTML = `<option value="${currentUser.locationId}">${esc(getLocations().find(l => l.id === currentUser.locationId)?.name || "")}</option>`;
    locSel.disabled = true;
  } else {
    locSel.disabled = false;
    const locs = getLocations();
    locSel.innerHTML = `<option value="">Select location</option>` + locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
  }
  locSel.value = item ? item.locationId : (canSeeAllLocations() ? "" : currentUser.locationId);
  openModal("#itemModal");
  setTimeout(() => $("#fItemName").focus(), 50);
}

function saveItem(e) {
  e.preventDefault();
  const id = $("#fItemId").value;
  const name = $("#fItemName").value.trim();
  const categoryId = $("#fCategory").value;
  const unit = $("#fUnit").value;
  const minStock = parseInt($("#fMinStock").value, 10);
  const locationId = $("#fLocation").value;
  const isNew = parseInt($("#fCondNew").value, 10) || 0;
  const good = parseInt($("#fCondGood").value, 10) || 0;
  const fair = parseInt($("#fCondFair").value, 10) || 0;
  const poor = parseInt($("#fCondPoor").value, 10) || 0;
  const damaged = parseInt($("#fCondDamaged").value, 10) || 0;
  const quantity = isNew + good + fair + poor + damaged;
  const conditionCounts = { new: isNew, good, fair, poor, damaged };
  if (!name || !categoryId || !locationId) return toast("Please fill all required fields.", "error");
  if (quantity === 0) return toast("Total quantity cannot be 0. Enter at least one condition count.", "error");

  const items = getItems();
  if (id) {
    const item = items.find(i => i.id === id);
    if (item) {
      const held = (item.allotted || 0) + (item.damagedReturned || 0) + (item.lostReturned || 0);
      if (quantity < held) return toast(`Total quantity cannot be less than currently allotted/damaged/lost units (${held}).`, "error");
      Object.assign(item, { name, categoryId, unit, quantity, minStock, locationId, conditionCounts, updatedAt: Date.now() });
    }
    toast("Item updated.", "success");
  } else {
    items.push({ id: uid(), name, categoryId, unit, quantity, minStock, locationId, conditionCounts, createdAt: Date.now(), updatedAt: Date.now() });
    toast("Item added.", "success");
  }
  saveItems(items);
  closeModals();
  render();
}

function deleteItem(id) {
  if (!confirm("Delete this item?")) return;
  saveItems(getItems().filter(i => i.id !== id));
  toast("Item deleted.", "success");
  render();
}

/* ==================== TRANSACTIONS ==================== */
function __transFiltered() {
  const txns = getTransactions();
  const allLocs = getAllLocationsFlat();
  const dateFrom = ($("#transDateFrom") || {}).value;
  const dateTo = ($("#transDateTo") || {}).value;
  const typeFilter = ($("#transTypeFilter") || {}).value;
  const q = ($("#transSearch") || {}).value || "";

  return txns.filter(t => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (dateFrom && t.createdAt < new Date(dateFrom).getTime()) return false;
    if (dateTo && t.createdAt >= new Date(dateTo).getTime() + 86400000) return false;
    if (q) {
      const from = t.fromLocation ? allLocs.find(l => l.id === t.fromLocation) : null;
      const to = t.toLocation ? allLocs.find(l => l.id === t.toLocation) : null;
      const fromName = from ? `[${from.districtCode}] ${from.name}` : "";
      const toName = to ? `[${to.districtCode}] ${to.name}` : "";
      const label = t.type === "add" ? "Addition" : t.type === "remove" ? "Removal" : "Transfer";
      const hay = [t.itemName, fromName, toName, label, t.performedBy, t.notes || "", fmtDate(t.createdAt)].join(" ").toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);
}

function __transExportData() {
  const allLocs = getAllLocationsFlat();
  const rows = __transFiltered().map(t => {
    const from = t.fromLocation ? allLocs.find(l => l.id === t.fromLocation) : null;
    const to = t.toLocation ? allLocs.find(l => l.id === t.toLocation) : null;
    const label = t.type === "add" ? "Addition" : t.type === "remove" ? "Removal" : "Transfer";
    return [
      fmtDate(t.createdAt),
      t.itemName,
      label,
      t.quantity,
      from ? `[${from.districtCode}] ${from.name}` : "\u2014",
      to ? `[${to.districtCode}] ${to.name}` : "\u2014",
      t.performedBy,
      t.notes || "\u2014"
    ];
  });
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  return {
    title: "Transactions Report",
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + rows.length + " txn" + (rows.length === 1 ? "" : "s") + ")",
    cols: ["Date", "Item", "Type", "Quantity", "From", "To", "Performed By", "Notes"],
    rows,
    fileName: "transactions-report"
  };
}

function printTransReport() { printReport(__transExportData()); }
function exportTransExcel() { excelReport(__transExportData()); toast("Excel exported.", "success"); }
function exportTransWord() { wordReport(__transExportData()); toast("Word document exported.", "success"); }
function exportTransPDF() { pdfReport(__transExportData()); toast("PDF exported.", "success"); }

function renderTransactions() {
  const allLocs = getAllLocationsFlat();
  const filtered = __transFiltered();

  const tbody = $("#transBody");
  if (!tbody) return;

  if (filtered.length) {
    tbody.innerHTML = filtered.map(t => {
      const from = allLocs.find(l => l.id === t.fromLocation);
      const to = allLocs.find(l => l.id === t.toLocation);
      const label = t.type === "add" ? "Addition" : t.type === "remove" ? "Removal" : "Transfer";
      return `<tr><td>${fmtDate(t.createdAt)}</td><td class="item-name">${esc(t.itemName)}</td><td><span class="cat-badge">${label}</span></td><td class="qty-strong">${t.quantity}</td><td>${esc(from ? `[${from.districtCode}] ${from.name}` : "â€”")}</td><td>${esc(to ? `[${to.districtCode}] ${to.name}` : "â€”")}</td><td>${esc(t.performedBy)}</td><td>${esc(t.notes || "â€”")}</td><td>${__txActionsCell(t)}</td></tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No transactions found.</td></tr>`;
  }
}

function openTransModal() {
  const cats = getCategories();
  const catSel = $("#tCategory");
  if (catSel) {
    catSel.innerHTML = `<option value="">Select category</option>` + cats.map(c => `<option value="${c.id}">${c.icon || ""} ${esc(c.name)}</option>`).join("");
    catSel.value = "";
  }

  const nameInput = $("#tItemName");
  if (nameInput) {
    nameInput.value = "";
    nameInput.disabled = false;
  }

  const itemSel = $("#tItem");
  if (itemSel) {
    itemSel.innerHTML = `<option value="">-- select --</option>`;
    itemSel.disabled = false;
  }

  const qtyInput = $("#tQuantity");
  if (qtyInput) qtyInput.value = "1";

  const condSel = $("#tCondition");
  if (condSel) condSel.value = "good";

  const notesInput = $("#tNotes");
  if (notesInput) notesInput.value = "";

  const typeSel = $("#tType");
  if (typeSel) typeSel.value = "add";

  const fromSel = $("#tFrom");
  const toSel = $("#tTo");

  if (fromSel && toSel) {
    if (!canSeeAllDistrictLocations()) {
      const myLoc = currentUser.locationId;
      const myLocName = getLocations().find(l => l.id === myLoc)?.name || "";
      fromSel.innerHTML = `<option value="${myLoc}">[${esc(currentUser.locationId)}] ${esc(myLocName)}</option>`;
      fromSel.disabled = true;
      toSel.innerHTML = buildDistrictLocationsDropdown(currentUser.districtId);
      toSel.disabled = false;
    } else {
      fromSel.innerHTML = buildDistrictLocationsDropdown(activeDistrictId);
      toSel.innerHTML = buildAllDistrictsLocationsDropdown();
      fromSel.disabled = false;
      toSel.disabled = false;
    }
  }

  const assigneeSel = $("#tAssignee");
  if (assigneeSel) {
    assigneeSel.innerHTML = `<option value="">Select user</option>` + buildAssigneeOptions(activeDistrictId, "");
    if (currentUser) {
      const foundOpt = Array.from(assigneeSel.options).find(o => o.value === currentUser.id);
      if (foundOpt) assigneeSel.value = currentUser.id;
    }
  }

  updateTItemForCategory();
  toggleTransferFields();
  openModal("#transModal");
  setTimeout(() => { if (nameInput) nameInput.focus(); }, 50);
}

function updateTItemForCategory() {
  const catId = $("#tCategory") ? $("#tCategory").value : "";
  const sel = $("#tItem");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- select --</option>`;
  if (!catId) return;

  const items = getItems().filter(i => i.categoryId === catId);
  if (items.length) {
    items.forEach(it => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = `${it.name} (${it.quantity} ${it.unit || "units"} in stock)`;
      opt.dataset.name = it.name;
      opt.dataset.categoryId = it.categoryId;
      opt.dataset.condition = it.condition || "good";
      sel.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No items in this category";
    sel.appendChild(opt);
  }
}

function toggleTransferFields() {
  const type = ($("#tType") || {}).value;
  const fromGroup = $("#tFromGroup");
  const toGroup = $("#tToGroup");
  const userGroup = $("#tAssigneeGroup");

  if (fromGroup) {
    fromGroup.classList.toggle("hidden", type === "add");
    const lbl = fromGroup.querySelector("label");
    if (lbl) lbl.textContent = type === "transfer" ? "From Location / Unit" : "Source Location / Unit";
  }
  if (toGroup) {
    toGroup.classList.toggle("hidden", type === "remove");
    const lbl = toGroup.querySelector("label");
    if (lbl) lbl.textContent = type === "transfer" ? "To Location / Unit" : "Destination Location / Unit";
  }
  if (userGroup) {
    const lbl = userGroup.querySelector("label");
    if (lbl) {
      if (type === "remove") lbl.textContent = "Issued To / Personnel";
      else if (type === "add") lbl.textContent = "Received By / Officer";
      else lbl.textContent = "Action By / Officer";
    }
  }
}

function saveTransaction(e) {
  e.preventDefault();
  const catId = $("#tCategory") ? $("#tCategory").value : "";
  const selectedItemId = $("#tItem")?.value;
  let itemName = $("#tItemName") ? $("#tItemName").value.trim() : "";
  const type = $("#tType").value;
  const quantity = parseInt($("#tQuantity").value, 10);
  const condition = $("#tCondition")?.value || "good";
  const fromLocation = $("#tFrom") ? $("#tFrom").value : "";
  const toLocation = $("#tTo") ? $("#tTo").value : "";
  const assigneeId = $("#tAssignee") ? $("#tAssignee").value : "";
  const assignee = assigneeId ? getUsers().find(u => u.id === assigneeId) : null;
  const notes = $("#tNotes") ? $("#tNotes").value.trim() : "";

  if (!itemName && selectedItemId) {
    const opt = $("#tItem")?.selectedOptions[0];
    itemName = opt ? (opt.dataset.name || opt.textContent.split(" (")[0]) : "";
  }
  if (!itemName || !quantity || quantity <= 0) return toast("Please enter valid item and quantity.", "error");

  const allItemsObj = getAllItems();
  const currentDistItems = allItemsObj[activeDistrictId] || [];
  let item = selectedItemId ? currentDistItems.find(i => i.id === selectedItemId) : currentDistItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());

  if (type === "remove" || type === "transfer") {
    if (!item) return toast("Selected item not found in current inventory.", "error");
    if (quantity > item.quantity) return toast(`Cannot ${type} more than available stock (${item.quantity}).`, "error");
  }

  if (type === "add") {
    if (item) {
      item.quantity += quantity;
      item.updatedAt = Date.now();
    } else {
      const cats = getCategories();
      const cat = cats.find(c => c.id === catId);
      const locId = toLocation || getVisibleLocationId() || (getLocations()[0] ? getLocations()[0].id : "");
      item = {
        id: uid(),
        name: itemName,
        categoryId: catId || (cats[0] ? cats[0].id : ""),
        categoryName: cat ? cat.name : "Other",
        quantity,
        unit: "pcs",
        locationId: locId,
        condition,
        minThreshold: 5,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      currentDistItems.push(item);
    }
    allItemsObj[activeDistrictId] = currentDistItems;
    saveAllItems(allItemsObj);
  } else if (type === "remove") {
    if (item) {
      item.quantity -= quantity;
      item.updatedAt = Date.now();
      allItemsObj[activeDistrictId] = currentDistItems;
      saveAllItems(allItemsObj);
    }
  } else if (type === "transfer") {
    if (item) {
      item.quantity -= quantity;
      item.updatedAt = Date.now();
      allItemsObj[activeDistrictId] = currentDistItems;

      if (toLocation && toLocation !== fromLocation) {
        const allLocs = getAllLocations();
        let targetDistId = activeDistrictId;
        for (const [dId, locList] of Object.entries(allLocs)) {
          if (Array.isArray(locList) && locList.some(l => l.id === toLocation)) {
            targetDistId = dId;
            break;
          }
        }
        const targetList = allItemsObj[targetDistId] || [];
        let destItem = targetList.find(i => i.name.toLowerCase() === item.name.toLowerCase() && i.locationId === toLocation);
        if (destItem) {
          destItem.quantity += quantity;
          destItem.updatedAt = Date.now();
        } else {
          targetList.push({
            id: uid(),
            name: item.name,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            quantity: quantity,
            unit: item.unit || "pcs",
            locationId: toLocation,
            condition: condition || item.condition || "good",
            minThreshold: item.minThreshold || 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }
        allItemsObj[targetDistId] = targetList;
      }
      saveAllItems(allItemsObj);
    }
  }

  const performer = assignee ? assignee.name : (currentUser ? currentUser.name : "System");
  const fullNotes = [notes, condition ? `[Cond: ${condition}]` : ""].filter(Boolean).join(" ");

  const txns = getTransactions();
  txns.push({
    id: uid(),
    itemId: item ? item.id : "",
    itemName,
    type,
    quantity,
    condition,
    fromLocation: type === "add" ? "" : fromLocation,
    toLocation: type === "remove" ? "" : toLocation,
    performedBy: performer,
    notes: fullNotes,
    createdAt: Date.now()
  });
  saveTransactions(txns);
  closeModals();
  toast("Transaction recorded.", "success");
  render();
}

/* ==================== TRANSACTION EDIT / APPROVAL ==================== */
let __editingTxnId = null;

function __allDistrictTxns() {
  if (!activeDistrictId) return [];
  return loadData("transactions_" + activeDistrictId) || [];
}

function __initiatorSide(t) {
  if (!currentUser) return null;
  if (isDevAdmin()) return "devadmin";
  const myLoc = getVisibleLocationId();
  if (myLoc) {
    if (t.fromLocation === myLoc) return "from";
    if (t.toLocation === myLoc) return "to";
    return null;
  }
  if (isAdmin()) {
    const all = getAllLocationsFlat();
    const f = t.fromLocation ? all.find(l => l.id === t.fromLocation) : null;
    const to = t.toLocation ? all.find(l => l.id === t.toLocation) : null;
    if (f && f.districtId === currentUser.districtId) return "from";
    if (to && to.districtId === currentUser.districtId) return "to";
    return null;
  }
  return null;
}

function __counterpartLabelFor(t) {
  const all = getAllLocationsFlat();
  const districts = getDistricts();
  const distName = (id) => { const d = districts.find(d => d.id === id); return d ? d.name : ""; };
  const f = t.fromLocation ? all.find(l => l.id === t.fromLocation) : null;
  const to = t.toLocation ? all.find(l => l.id === t.toLocation) : null;
  if (!f && to) {
    return isAdmin() ? "Unit: " + to.name + " (" + to.districtCode + ")" : "District Admin (" + distName(to.districtId) + ")";
  }
  if (f && !to) {
    return isAdmin() ? "Unit: " + f.name + " (" + f.districtCode + ")" : "District Admin (" + distName(f.districtId) + ")";
  }
  if (f && to) {
    const side = __initiatorSide(t);
    const other = side === "from" ? to : side === "to" ? f : (isAdmin() ? to : f);
    return other ? other.name + " (" + other.districtCode + ")" : "Other party";
  }
  return "Other party";
}

function __approverQualifies(t) {
  const pe = t && t.pendingEdit;
  if (!pe || !currentUser) return false;
  if (pe.proposedByUser === currentUser.username) return false;
  if (isDevAdmin()) return true;
  const all = getAllLocationsFlat();
  const f = t.fromLocation ? all.find(l => l.id === t.fromLocation) : null;
  const to = t.toLocation ? all.find(l => l.id === t.toLocation) : null;
  const myLocId = currentUser.locationId;
  if (!f || !to) {
    const sideLocId = f ? f.id : to.id;
    if (myLocId && myLocId === sideLocId) {
      return pe.proposedByLocId !== myLocId;
    }
    if (isAdmin()) {
      return pe.proposedByLocId ? true : (pe.proposedByDistrict ? pe.proposedByDistrict !== currentUser.districtId : false);
    }
    return false;
  }
  if (myLocId) {
    if (t.fromLocation !== myLocId && t.toLocation !== myLocId) return false;
    return pe.proposedByLocId !== myLocId;
  }
  if (isAdmin()) {
    const involved = (f && f.districtId === currentUser.districtId) || (to && to.districtId === currentUser.districtId);
    if (!involved) return false;
    if (pe.proposedByLocId) return true;
    return pe.proposedByDistrict ? pe.proposedByDistrict !== currentUser.districtId : false;
  }
  return false;
}

function __isProposer(t) {
  return t && t.pendingEdit && currentUser && t.pendingEdit.proposedByUser === currentUser.username;
}

function __txActionsCell(t) {
  if (!currentUser) return "\u2014";
  const pe = t.pendingEdit;
  const edited = t.editedAt ? `<span class="status-badge status-applied" title="Edited by ${esc(t.editApprovedBy || "")}">Edited</span>` : "";
  if (pe) {
    const pending = `<span class="status-badge status-await">Edit Pending</span>`;
    const hint = `<span class="tx-hint">req by ${esc(pe.proposedBy)} \u00b7 ${fmtDate(pe.proposedAt)}</span>`;
    if (__isProposer(t)) {
      return `<div class="tx-actions-cell">${pending} ${hint}<br>${actDD([{ label: "Cancel Request", attrs: `data-txn-cancel="${t.id}"` }])}</div>`;
    }
    if (__approverQualifies(t)) {
      return `<div class="tx-actions-cell">${pending} ${hint}<br>${actDD([
        { label: "Approve", cls: "txn-approve", attrs: `data-txn-approve="${t.id}"` },
        { label: "Reject", cls: "txn-reject", attrs: `data-txn-reject="${t.id}"` }
      ])}</div>`;
    }
    return `<div class="tx-actions-cell">${pending} ${hint}</div>`;
  }
  const canPropose = !t.editedAt && __initiatorSide(t) !== null;
  if (canPropose) {
    return `<div class="tx-actions-cell">${edited ? edited + " " : ""}${actDD([{ label: "Propose Edit", attrs: `data-txn-edit="${t.id}"` }])}</div>`;
  }
  return edited ? `<div class="tx-actions-cell">${edited}</div>` : "\u2014";
}

function openEditTrans(t) {
  if (!t) return;
if (t.pendingEdit) return toast("An edit request is already pending for this transaction.", "error");
  if (t.editedAt) return toast("This transaction has already been edited. Please create a new transaction for further changes.", "error");
  __editingTxnId = t.id;
  const all = getAllLocationsFlat();
  const f = t.fromLocation ? all.find(l => l.id === t.fromLocation) : null;
  const to = t.toLocation ? all.find(l => l.id === t.toLocation) : null;
  const label = t.type === "add" ? "Addition" : t.type === "remove" ? "Removal" : "Transfer";
  $("#etSummary").textContent = t.itemName + " \u2014 " + label + " | from " + (f ? f.name : "External") + " to " + (to ? to.name : "External") + " | current qty " + t.quantity;
  $("#etQuantity").value = t.quantity;
  $("#etNotes").value = t.notes || "";
  $("#etApproverInfo").textContent = "Approval required from: " + __counterpartLabelFor(t);
  openModal("#editTransModal");
  setTimeout(() => $("#etQuantity").focus(), 50);
}

function submitTransEdit(e) {
  e.preventDefault();
  const list = __allDistrictTxns();
  const t = list.find(x => x.id === __editingTxnId);
  if (!t) return toast("Transaction not found.", "error");
  if (t.pendingEdit) return toast("An edit request is already pending for this transaction.", "error");
  const qty = parseInt($("#etQuantity").value, 10);
  if (!qty || qty < 1) return toast("Enter a valid quantity.", "error");
const notes = $("#etNotes").value.trim();
  t.pendingEdit = {
    quantity: qty,
    notes,
    proposedBy: currentUser.name,
    proposedByUser: currentUser.username,
    proposedByLocId: getVisibleLocationId() || "",
    proposedByRole: currentUser.role,
    proposedByDistrict: currentUser.districtId,
    counterpart: __counterpartLabelFor(t),
    proposedAt: Date.now()
  };
  saveTransactions(list);
  closeModals();
  toast("Edit submitted. Awaiting approval from " + t.pendingEdit.counterpart + ".", "success");
  render();
}

function approveTransEdit(id) {
  const list = __allDistrictTxns();
  const t = list.find(x => x.id === id);
  if (!t || !t.pendingEdit) return;
  if (!__approverQualifies(t)) return toast("You are not authorized to approve this edit.", "error");
  const pe = t.pendingEdit;
  t.quantity = pe.quantity;
  t.notes = pe.notes;
  t.editedAt = Date.now();
  t.editApprovedBy = currentUser.name;
  delete t.pendingEdit;
  saveTransactions(list);
  toast("Edit approved and applied.", "success");
  render();
}

function rejectTransEdit(id) {
  const list = __allDistrictTxns();
  const t = list.find(x => x.id === id);
  if (!t || !t.pendingEdit) return;
  if (!__approverQualifies(t)) return toast("You are not authorized to reject this edit.", "error");
  delete t.pendingEdit;
  saveTransactions(list);
  toast("Edit request rejected.", "success");
  render();
}

function cancelTransEdit(id) {
  const list = __allDistrictTxns();
  const t = list.find(x => x.id === id);
  if (!t || !t.pendingEdit) return;
  if (!__isProposer(t)) return toast("Only the requester can cancel this request.", "error");
  delete t.pendingEdit;
  saveTransactions(list);
  toast("Edit request cancelled.", "success");
  render();
}

/* ==================== CATEGORIES ==================== */
function renderCatList() {
  const box = $("#catList");
  const cats = getCategories();
  const items = getAllDistrictItems();
  box.innerHTML = cats.map((c, idx) => {
    const count = items.filter(i => i.categoryId === c.id).length;
    return `<div class="cat-list-row" data-idx="${idx}"><span>${c.icon || ""}</span><span class="cat-list-name">${esc(c.name)}</span><span class="cat-list-count">${count} items</span><div class="cat-list-actions">${actDD([
      { label: "Edit", attrs: `data-cat-edit="${idx}"` },
      { label: "Delete", cls: "act-dd-del", attrs: `data-cat-del="${idx}"`, title: count > 0 ? "Remove items first" : "" }
    ].map(it => (count > 0 && it.attrs.includes("data-cat-del")) ? { ...it, attrs: `data-cat-del="${idx}" disabled` } : it))}</div></div>`;
  }).join("");
}

function startEditCat(idx) {
  const cats = getCategories();
  const c = cats[idx];
  if (!c) return;
  const rows = $$(".cat-list-row");
  const row = rows[idx];
  if (!row) return;
  const nameSpan = row.querySelector(".cat-list-name");
  const actionsDiv = row.querySelector(".cat-list-actions");
  row.classList.add("editing");
  nameSpan.innerHTML = `<input class="cat-edit-input" id="catEditName" value="${esc(c.name)}"> <input class="cat-edit-input" id="catEditIcon" value="${esc(c.icon || "")}" style="max-width:60px" placeholder="Icon">`;
  actionsDiv.innerHTML = `<button class="btn btn-sm btn-primary" data-cat-save="${idx}">Save</button><button class="btn btn-sm btn-outline" data-cat-cancel="${idx}">Cancel</button>`;
}

function saveEditCat(idx) {
  const cats = getCategories();
  const name = ($("#catEditName") || {}).value.trim();
  const icon = ($("#catEditIcon") || {}).value.trim();
  if (!name) return toast("Enter a name.", "error");
  if (cats.some((c, i) => i !== idx && c.name.toLowerCase() === name.toLowerCase())) return toast("Already exists.", "error");
  cats[idx].name = name;
  cats[idx].icon = icon;
  saveData("categories", cats);
  renderCatList();
  toast("Category updated.", "success");
}

function openCatModal() {
  renderCatList();
  $("#catInput").value = "";
  openModal("#catModal");
}

function addCategory() {
  const name = ($("#catInput").value || "").trim();
  const icon = ($("#catIconInput").value || "").trim();
  if (!name) return toast("Enter a name.", "error");
  const cats = getCategories();
  if (cats.some(c => c.name.toLowerCase() === name.toLowerCase())) return toast("Already exists.", "error");
  cats.push({ id: uid(), name, icon });
  saveData("categories", cats);
  renderCatList();
  toast(`Added: ${name}`, "success");
  $("#catInput").value = "";
  $("#catIconInput").value = "";
}

function deleteCategory(idx) {
  const cats = getCategories();
  const cat = cats[idx];
  if (getAllDistrictItems().filter(i => i.categoryId === cat.id).length > 0) return toast("Has items â€” reassign first.", "error");
  cats.splice(idx, 1);
  saveData("categories", cats);
  renderCatList();
  toast(`Deleted: ${cat.name}`, "success");
}

/* ==================== USERS ==================== */
function renderUsers() {
  const allUsers = getUsers();
  const users = isDevAdmin() ? allUsers : allUsers.filter(u => u.districtId === activeDistrictId);
  const districts = getDistricts();
  const box = $("#usersList");
  box.innerHTML = users.map(u => {
    const dist = districts.find(d => d.id === u.districtId);
    const isSelf = currentUser && u.id === currentUser.id;
    const roleLabel = ROLE_LABELS[u.role] || u.role;
    const badgeColor = u.role === 'devadmin' ? '#7c3aed' : u.role === 'admin' ? 'var(--primary)' : u.role === 'mhc' ? 'var(--gold)' : 'var(--green)';
    const canManage = isDevAdmin() ? true : (isAdmin() && u.role !== 'admin' && u.role !== 'devadmin');
    const actions = isSelf ? "" : (canManage ? actDD([
      { label: "Edit", attrs: `data-edit-user="${u.id}"` },
      { label: "Delete", cls: "act-dd-del", attrs: `data-del-user="${u.id}"` }
    ]) : "");
    return `<div class="user-row"><div class="ur-info"><div class="ur-name">${esc(u.name)} ${isSelf ? '<span style="color:var(--amber);font-size:.7rem">(You)</span>' : ''}</div><div class="ur-detail">${esc(u.username)} Â· ${esc(u.mobile)} Â· ${esc(dist ? dist.name : "â€”")}</div></div><span class="ur-badge" style="background:${badgeColor};color:#fff">${roleLabel}</span><div class="ur-actions" style="display:flex;gap:4px">${actions}</div></div>`;
  }).join("");
  const distSel = $("#nuDistrict");
  if (distSel) {
    if (isDevAdmin()) {
      distSel.innerHTML = districts.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("");
      distSel.disabled = false;
    } else {
      const myDist = districts.find(d => d.id === activeDistrictId);
      distSel.innerHTML = `<option value="${activeDistrictId}">${esc(myDist ? myDist.name : "")}</option>`;
      distSel.disabled = true;
    }
  }
  updateUserLocationDropdown();
}

function updateUserLocationDropdown() {
  const distSel = $("#nuDistrict");
  const locSel = $("#nuLocation");
  if (!distSel || !locSel) return;
  locSel.innerHTML = getLocationsForDistrict(distSel.value).map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
}

function openUsersModal() {
  $("#usersModalTitle").textContent = "Manage Users";
  $("#userFormTitle").textContent = "Add New User";
  $("#userSubmitBtn").textContent = "Add User";
  $("#cancelUserEdit").style.display = "none";
  $("#nuEditId").value = "";
  $("#addUserForm").reset();
  renderUsers();
  openModal("#usersModal");
}

function startEditUser(id) {
  const user = getUsers().find(u => u.id === id);
  if (!user) return;
  $("#usersModalTitle").textContent = "Edit User";
  $("#userFormTitle").textContent = "Edit User";
  $("#userSubmitBtn").textContent = "Update User";
  $("#cancelUserEdit").style.display = "";
  $("#nuEditId").value = id;
  $("#nuUsername").value = user.username;
  $("#nuPassword").value = "";
  $("#nuName").value = user.name;
  $("#nuMobile").value = user.mobile;
  $("#nuRole").value = user.role;
  $("#nuDistrict").value = user.districtId;
  updateUserLocationDropdown();
  setTimeout(() => { $("#nuLocation").value = user.locationId; }, 50);
}

function cancelUserEdit() {
  $("#userFormTitle").textContent = "Add New User";
  $("#userSubmitBtn").textContent = "Add User";
  $("#cancelUserEdit").style.display = "none";
  $("#nuEditId").value = "";
  $("#addUserForm").reset();
}

function addUser(e) {
  e.preventDefault();
  const editId = $("#nuEditId").value;
  const username = $("#nuUsername").value.trim();
  const password = $("#nuPassword").value;
  const name = $("#nuName").value.trim();
  const mobile = $("#nuMobile").value.trim();
  const role = $("#nuRole").value;
  const districtId = $("#nuDistrict").value;
  const locationId = $("#nuLocation").value;
  if (!username || !name || !mobile) return toast("Fill all required fields.", "error");
  if (!isDevAdmin() && districtId !== activeDistrictId) return toast("You can only create users in your district.", "error");
  if (!isDevAdmin() && (role === "admin" || role === "devadmin")) return toast("You cannot assign admin roles.", "error");
  const users = getUsers();
  if (editId) {
    const user = users.find(u => u.id === editId);
    if (!user) return toast("User not found.", "error");
    if (users.some(u => u.username === username && u.id !== editId)) return toast("Username already taken.", "error");
    user.username = username;
    if (password) user.password = password;
    user.name = name;
    user.mobile = mobile;
    user.role = role;
    user.districtId = districtId;
    user.locationId = locationId;
    toast("User updated.", "success");
  } else {
    if (!password) return toast("Password is required.", "error");
    if (users.some(u => u.username === username)) return toast("Username already exists.", "error");
    users.push({ id: uid(), username, password, role, name, mobile, districtId, locationId, createdAt: Date.now() });
    toast("User added.", "success");
  }
  saveUsers(users);
  cancelUserEdit();
  renderUsers();
}

function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  const user = getUsers().find(u => u.id === id);
  if (!isDevAdmin() && user && user.districtId !== activeDistrictId) return toast("You can only delete users in your district.", "error");
  if (!isDevAdmin() && user && (user.role === "admin" || user.role === "devadmin")) return toast("You cannot delete admin users.", "error");
  saveUsers(getUsers().filter(u => u.id !== id));
  toast("User deleted.", "success");
  renderUsers();
}

/* ==================== INSPECTIONS ==================== */
function getInspections() {
  if (!activeDistrictId) return [];
  return loadData(`inspections_${activeDistrictId}`) || [];
}

function saveInspections(list) {
  if (!activeDistrictId) return;
  saveData(`inspections_${activeDistrictId}`, list);
}

function seedInspections(districtId) {
  const items = getItemsForDistrict(districtId);
  const locs = getLocationsForDistrict(districtId);
  const users = getUsers().filter(u => u.districtId === districtId);
  const inspectors = ["Inspector Rajesh Kumar", "SI Pooja Sharma", "Inspector Vikram Singh", "ASI Mohan Lal", "Inspector Neelam Devi"];
  const findingsSamples = [
    "All items accounted for in good condition. Minor wear on some equipment.",
    "Found 2 items missing from inventory. Investigation recommended.",
    "Stock levels adequate. Some items need replacement due to wear.",
    "Complete audit done. Everything matches the records.",
    "Found damaged items that need immediate replacement.",
    "Routine check completed. No issues found.",
    "Inventory partially updated. Some records need correction.",
    "Equipment in good working condition. Regular maintenance required."
  ];
  const recoSamples = [
    "Replace worn-out items within 2 weeks.",
    "Conduct surprise audit next month.",
    "Update inventory records immediately.",
    "Request new stock for low-quantity items.",
    "No action required at this time.",
    "Schedule maintenance for vehicle fleet.",
    "Train staff on proper inventory handling.",
    "Report discrepancy to senior officer."
  ];
  const types = ["routine", "special", "annual"];
  const statuses = ["completed", "completed", "completed", "pending", "overdue"];
  const txns = [];
  for (let i = 0; i < 8; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const loc = locs[Math.floor(Math.random() * locs.length)];
    const inspector = inspectors[Math.floor(Math.random() * inspectors.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    txns.push({
      id: uid(),
      itemName: item ? item.name : "General Stock",
      inspectedBy: inspector,
      type: types[Math.floor(Math.random() * types.length)],
      date: new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10),
      locationId: loc ? loc.id : (locs[0] || {}).id || "",
      findings: findingsSamples[Math.floor(Math.random() * findingsSamples.length)],
      recommendations: recoSamples[Math.floor(Math.random() * recoSamples.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: Date.now() - daysAgo * 86400000,
    });
  }
  saveData(`inspections_${districtId}`, txns);
}

function __visibleInspections() {
  if (!activeDistrictId) return [];
  if (isDevAdmin()) {
    const out = [];
    getDistricts().forEach(d => { (loadData(`inspections_${d.id}`) || []).forEach(i => out.push(i)); });
    return out.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  const list = getInspections();
  const locId = getVisibleLocationId();
  if (!locId) return list;
  return list.filter(i => i.locationId === locId);
}

function __inspFiltered() {
  const q = ($("#inspSearch") || {}).value || "";
  const typeFilter = ($("#inspTypeFilter") || {}).value || "";
  const statusFilter = ($("#inspStatusFilter") || {}).value || "";
  return __visibleInspections().filter(ins => {
    if (typeFilter && ins.type !== typeFilter) return false;
    if (statusFilter && ins.status !== statusFilter) return false;
    if (q && !ins.itemName.toLowerCase().includes(q.toLowerCase()) && !ins.inspectedBy.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function __inspExportData() {
  const locs = getAllLocationsFlat();
  const rows = __inspFiltered().map(ins => {
    const loc = locs.find(l => l.id === ins.locationId);
    const typeLabel = ins.type ? ins.type.charAt(0).toUpperCase() + ins.type.slice(1) : "Unknown";
    const statusLabel = ins.status ? ins.status.charAt(0).toUpperCase() + ins.status.slice(1) : "Unknown";
    return [ins.date, ins.itemName, ins.inspectedBy, typeLabel, loc ? loc.name : "\u2014", ins.findings || "\u2014", ins.recommendations || "\u2014", statusLabel];
  });
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  return {
    title: "Inspections Report",
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + rows.length + " inspection" + (rows.length === 1 ? "" : "s") + ")",
    cols: ["Date", "Item / Asset", "Inspected By", "Type", "Location", "Findings", "Recommendations", "Status"],
    rows,
    fileName: "inspections-report"
  };
}

function printInspReport() { printReport(__inspExportData()); }
function exportInspExcel() { excelReport(__inspExportData()); toast("Excel exported.", "success"); }
function exportInspWord() { wordReport(__inspExportData()); toast("Word document exported.", "success"); }
function exportInspPDF() { pdfReport(__inspExportData()); toast("PDF exported.", "success"); }

const __INSP_COLS = ["Date", "Item / Asset", "Inspected By", "Type", "Location", "Findings", "Recommendations", "Status"];

function __inspRows(list) {
  const locs = getAllLocationsFlat();
  return list.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(ins => {
    const loc = locs.find(l => l.id === ins.locationId);
    const typeLabel = ins.type ? ins.type.charAt(0).toUpperCase() + ins.type.slice(1) : "Unknown";
    const statusLabel = ins.status ? ins.status.charAt(0).toUpperCase() + ins.status.slice(1) : "Unknown";
    return [ins.date, ins.itemName, ins.inspectedBy, typeLabel, loc ? loc.name : "", ins.findings || "\u2014", ins.recommendations || "\u2014", statusLabel];
  });
}

const __INSP_STAT_BUILDERS = {
  total: () => ({ title: "Total Inspections", cols: __INSP_COLS, rows: __inspRows(__visibleInspections()) }),
  completed: () => ({ title: "Completed Inspections", cols: __INSP_COLS, rows: __inspRows(__visibleInspections().filter(i => i.status === "completed")) }),
  pending: () => ({ title: "Pending Inspections", cols: __INSP_COLS, rows: __inspRows(__visibleInspections().filter(i => i.status === "pending")) }),
  overdue: () => ({ title: "Overdue Inspections", cols: __INSP_COLS, rows: __inspRows(__visibleInspections().filter(i => i.status === "overdue")) })
};

function openInspStatDetail(key) {
  const def = __INSP_STAT_BUILDERS[key] ? __INSP_STAT_BUILDERS[key]() : null;
  if (!def) return;
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  __statDetail = {
    title: def.title,
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + def.rows.length + " inspection" + (def.rows.length === 1 ? "" : "s") + ")",
    cols: def.cols,
    rows: def.rows,
    fileName: "inspections-" + key
  };
  __statFilter = "";
  $("#statDetailTitle").textContent = def.title;
  $("#statDetailSubtitle").textContent = __statDetail.subtitle;
  $("#statDetailHead").innerHTML = "<tr>" + def.cols.map(c => `<th>${esc(c)}</th>`).join("") + "</tr>";
  const s = $("#statSearch");
  if (s) s.value = "";
  renderStatDetail("");
  openModal("#statDetailModal");
}

function renderInspections() {
  const inspections = __visibleInspections();
  const locs = getAllLocationsFlat();

  const filtered = __inspFiltered();

  const tbody = $("#inspBody");
  if (!tbody) return;

  if (filtered.length) {
    tbody.innerHTML = filtered.map(ins => {
      const loc = locs.find(l => l.id === ins.locationId);
      const typeCls = { routine: "cat-badge", special: "status-badge status-low", annual: "status-badge status-ok" }[ins.type] || "cat-badge";
      const statusCls = { completed: "status-badge status-ok", pending: "status-badge status-low", overdue: "status-badge status-out" }[ins.status] || "cat-badge";
      const statusLabel = ins.status ? ins.status.charAt(0).toUpperCase() + ins.status.slice(1) : "Unknown";
      const typeLabel = ins.type ? ins.type.charAt(0).toUpperCase() + ins.type.slice(1) : "Unknown";
      const findings = ins.findings ? (ins.findings.length > 60 ? ins.findings.slice(0, 60) + "..." : ins.findings) : "-";
      const reco = ins.recommendations ? (ins.recommendations.length > 60 ? ins.recommendations.slice(0, 60) + "..." : ins.recommendations) : "-";
      return `<tr title="Findings: ${esc(ins.findings || "")}\nRecommendations: ${esc(ins.recommendations || "")}"><td>${esc(ins.date)}</td><td class="item-name">${esc(ins.itemName)}</td><td>${esc(ins.inspectedBy)}</td><td><span class="${typeCls}">${typeLabel}</span></td><td>${esc(loc ? loc.name : "")}</td><td>${esc(findings)}</td><td>${esc(reco)}</td><td><span class="${statusCls}">${statusLabel}</span></td></tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">No inspections found. Click "+ New Inspection" to add one.</td></tr>`;
  }

  const stats = { total: inspections.length, completed: 0, pending: 0, overdue: 0 };
  inspections.forEach(ins => { if (stats[ins.status] !== undefined) stats[ins.status]++; });
  $("#statTotalInspections").textContent = stats.total;
  $("#statCompleted").textContent = stats.completed;
  $("#statPending").textContent = stats.pending;
  $("#statOverdue").textContent = stats.overdue;
}

function openInspectionModal(insp) {
  $("#inspectionModalTitle").textContent = insp ? "Edit Inspection" : "Add New Inspection";
  $("#inspectionSaveBtn").textContent = insp ? "Update Inspection" : "Save Inspection";
  $("#fiItem").value = insp ? insp.itemName : "";
  $("#fiInspectedBy").value = insp ? insp.inspectedBy : "";
  $("#fiType").value = insp ? insp.type : "routine";
  $("#fiDate").value = insp ? insp.date : new Date().toISOString().slice(0, 10);
  $("#fiFindings").value = insp ? (insp.findings || "") : "";
  $("#fiRecommendations").value = insp ? (insp.recommendations || "") : "";
  $("#fiStatus").value = insp ? (insp.status || "completed") : "completed";
  $("#fiInspectionId").value = insp ? insp.id : "";

  const locSel = $("#fiLocation");
  if (!canSeeAllLocations()) {
    locSel.innerHTML = `<option value="${currentUser.locationId}">${esc(getLocations().find(l => l.id === currentUser.locationId)?.name || "")}</option>`;
    locSel.disabled = true;
  } else {
    locSel.disabled = false;
    const locs = getLocations();
    locSel.innerHTML = `<option value="">Select location</option>` + locs.map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join("");
  }
  locSel.value = insp ? insp.locationId : (canSeeAllLocations() ? "" : currentUser.locationId);
  openModal("#inspectionModal");
  setTimeout(() => $("#fiItem").focus(), 50);
}

function saveInspection(e) {
  e.preventDefault();
  const id = $("#fiInspectionId").value;
  const itemName = $("#fiItem").value.trim();
  const inspectedBy = $("#fiInspectedBy").value.trim();
  const type = $("#fiType").value;
  const date = $("#fiDate").value;
  const locationId = $("#fiLocation").value;
  const findings = $("#fiFindings").value.trim();
  const recommendations = $("#fiRecommendations").value.trim();
  const status = $("#fiStatus").value;
  if (!itemName || !inspectedBy || !date || !locationId) return toast("Please fill all required fields.", "error");

  const inspections = getInspections();
  if (id) {
    const insp = inspections.find(i => i.id === id);
    if (insp) Object.assign(insp, { itemName, inspectedBy, type, date, locationId, findings, recommendations, status, updatedAt: Date.now() });
    toast("Inspection updated.", "success");
  } else {
    inspections.push({ id: uid(), itemName, inspectedBy, type, date, locationId, findings, recommendations, status, createdAt: Date.now() });
    toast("Inspection added.", "success");
  }
  saveInspections(inspections);
  closeModals();
  render();
}

function deleteInspection(id) {
  if (!confirm("Delete this inspection record?")) return;
  saveInspections(getInspections().filter(i => i.id !== id));
  toast("Inspection deleted.", "success");
  render();
}

/* ==================== DEMANDS ==================== */
function getDemands() {
  if (!activeDistrictId) return [];
  return loadData(`demands_${activeDistrictId}`) || [];
}

function __demandsInStore(districtId) {
  return (loadData(`demands_${districtId}`) || []).map(x => ({ ...x, __storeId: districtId }));
}

function __allVisibleDemands() {
  if (!activeDistrictId) return [];
  const combined = __demandsInStore(activeDistrictId);
  getDistricts().forEach(d => {
    if (d.id === activeDistrictId) return;
    __demandsInStore(d.id).forEach(x => { if (x.demandToDistrict === activeDistrictId) combined.push(x); });
  });
  const locId = getVisibleLocationId();
  if (!locId) return combined;
  return combined.filter(d => (d.requestedFromLocation && d.requestedFromLocation === locId) || d.demandToLocation === locId);
}

function saveDemands(list) {
  if (!activeDistrictId) return;
  saveData(`demands_${activeDistrictId}`, list);
}

function getAllDemandsAcrossDistricts() {
  const all = {};
  getDistricts().forEach(d => {
    all[d.id] = loadData(`demands_${d.id}`) || [];
  });
  return all;
}

function seedDemands(districtId) {
  const items = getItemsForDistrict(districtId);
  const districts = getDistricts().filter(d => d.id !== districtId);
  const cats = loadData("categories") || [];
  if (!districts.length || !items.length) return;

  const reasons = [
    "Operational requirement for upcoming deployment",
    "Replacement of damaged/unserviceable equipment",
    "New unit formation requires inventory",
    "Training exercise requirements",
    "Annual restocking mandate",
    "Emergency operational need"
  ];
  const remarks = [
    "Please process at earliest",
    "Required before next month",
    "As per HQ directive",
    "Budget approved for this quarter",
    "Priority item for field operations"
  ];
  const statuses = ["pending", "pending", "approved", "approved", "rejected"];
  const demands = [];

  for (let i = 0; i < 6; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const cat = cats.find(c => c.id === item.categoryId);
    const toDist = districts[Math.floor(Math.random() * districts.length)];
    const toLocs = getLocationsForDistrict(toDist.id);
    const toLoc = toLocs.length ? toLocs[Math.floor(Math.random() * toLocs.length)] : null;
    const daysAgo = Math.floor(Math.random() * 30);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    demands.push({
      id: uid(),
      itemName: item.name,
      quantity: Math.floor(Math.random() * 20) + 1,
      categoryId: item.categoryId,
      categoryName: cat ? cat.name : "Other",
      condition: ["any", "new", "good", "fair"][Math.floor(Math.random() * 4)],
      urgency: ["normal", "urgent", "critical"][Math.floor(Math.random() * 3)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      remarks: remarks[Math.floor(Math.random() * remarks.length)],
      requestedBy: currentUser ? currentUser.name : "Admin",
      requestedFromDistrict: districtId,
      demandToDistrict: toDist.id,
      demandToDistrictName: toDist.name,
      demandToLocation: toLoc ? toLoc.id : "",
      demandToLocationName: toLoc ? toLoc.name : "",
      status: status,
      actionRemarks: status !== "pending" ? remarks[Math.floor(Math.random() * remarks.length)] : "",
      rejectionReason: status === "rejected" ? "Item not available in sufficient quantity at this time." : "",
      createdAt: Date.now() - daysAgo * 86400000,
      updatedAt: status !== "pending" ? Date.now() - (daysAgo - 1) * 86400000 : null,
    });
  }
  saveData(`demands_${districtId}`, demands);
}

function __demandFiltered() {
  const demands = __allVisibleDemands();
  const q = ($("#demandSearch") || {}).value || "";
  const statusFilter = ($("#demandStatusFilter") || {}).value || "";
  const dateFrom = ($("#demandDateFrom") || {}).value;
  const dateTo = ($("#demandDateTo") || {}).value;
  return demands.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (q && !d.itemName.toLowerCase().includes(q.toLowerCase()) && !d.reason.toLowerCase().includes(q.toLowerCase())) return false;
    if (dateFrom && d.createdAt < new Date(dateFrom).getTime()) return false;
    if (dateTo && d.createdAt >= new Date(dateTo).getTime() + 86400000) return false;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);
}

function __demandExportData() {
  const dists = getDistricts();
  const rows = __demandFiltered().map(d => {
    const condLabel = d.condition === "any" ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
    const toDist = dists.find(x => x.id === d.demandToDistrict);
    return [
      new Date(d.createdAt).toLocaleDateString("en-IN"),
      d.itemName,
      d.quantity,
      d.categoryName,
      condLabel,
      d.requestedBy,
      (toDist ? toDist.name : d.demandToDistrictName || "\u2014") + (d.demandToLocationName ? " (" + d.demandToLocationName + ")" : ""),
      d.reason || "\u2014",
      d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Unknown",
    ];
  });
  const dist = getDistricts().find(dd => dd.id === activeDistrictId);
  return {
    title: "Demands Report",
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + rows.length + " demand" + (rows.length === 1 ? "" : "s") + ")",
    cols: ["Date", "Item", "Qty", "Category", "Condition", "Requested By", "Requested To", "Reason", "Status"],
    rows,
    fileName: "demands-report"
  };
}

function printDemandReport() { printReport(__demandExportData()); }
function exportDemandExcel() { excelReport(__demandExportData()); toast("Excel exported.", "success"); }
function exportDemandWord() { wordReport(__demandExportData()); toast("Word document exported.", "success"); }
function exportDemandPDF() { pdfReport(__demandExportData()); toast("PDF exported.", "success"); }

const __DEMAND_COLS = ["Date", "Item", "Qty", "Category", "Condition", "Urgency", "Requested By", "To", "Status"];

function __demandRows(list) {
  const dists = getDistricts();
  return list.slice().sort((a, b) => b.createdAt - a.createdAt).map(d => {
    const condLabel = d.condition === "any" ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
    const toDist = dists.find(x => x.id === d.demandToDistrict);
    const to = (toDist ? toDist.name : d.demandToDistrictName || "\u2014") + (d.demandToLocationName ? " (" + d.demandToLocationName + ")" : "");
    const status = d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Unknown";
    const urgency = d.urgency ? d.urgency.charAt(0).toUpperCase() + d.urgency.slice(1) : "Normal";
    return [new Date(d.createdAt).toLocaleDateString("en-IN"), d.itemName, d.quantity, d.categoryName, condLabel, urgency, d.requestedBy, to, status];
  });
}

const __DEMAND_STAT_BUILDERS = {
  total: () => {
    const list = __allVisibleDemands();
    return { title: "Total Demands", cols: __DEMAND_COLS, rows: __demandRows(list) };
  },
  pending: () => {
    const list = __allVisibleDemands().filter(d => d.status === "pending");
    return { title: "Pending Demands", cols: __DEMAND_COLS, rows: __demandRows(list) };
  },
  approved: () => {
    const list = __allVisibleDemands().filter(d => d.status === "approved");
    return { title: "Approved Demands", cols: __DEMAND_COLS, rows: __demandRows(list) };
  },
  rejected: () => {
    const list = __allVisibleDemands().filter(d => d.status === "rejected");
    return { title: "Rejected Demands", cols: __DEMAND_COLS, rows: __demandRows(list) };
  }
};

function openDemandStatDetail(key) {
  const def = __DEMAND_STAT_BUILDERS[key] ? __DEMAND_STAT_BUILDERS[key]() : null;
  if (!def) return;
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  __statDetail = {
    title: def.title,
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + def.rows.length + " demand" + (def.rows.length === 1 ? "" : "s") + ")",
    cols: def.cols,
    rows: def.rows,
    fileName: "demands-" + key
  };
  __statFilter = "";
  $("#statDetailTitle").textContent = def.title;
  $("#statDetailSubtitle").textContent = __statDetail.subtitle;
  $("#statDetailHead").innerHTML = "<tr>" + def.cols.map(c => `<th>${esc(c)}</th>`).join("") + "</tr>";
  const s = $("#statSearch");
  if (s) s.value = "";
  renderStatDetail("");
  openModal("#statDetailModal");
}

function __demandActionableBy(d) {
  if (!d || d.status !== "pending" || !currentUser) return false;
  if (d.demandToDistrict !== activeDistrictId) return false;
  if (d.assigneeId) return currentUser.id === d.assigneeId;
  return canEdit();
}

function renderDemands() {
  const demands = __allVisibleDemands();

  const filtered = __demandFiltered();

  const tbody = $("#demandBody");
  if (!tbody) return;
  const snap = {};
  filtered.forEach(d => { snap[d.id] = d; });
  window.__demandSnapshot = snap;

  if (filtered.length) {
    tbody.innerHTML = filtered.map(d => {
      const statusCls = { pending: "status-badge status-low", approved: "status-badge status-ok", rejected: "status-badge status-out" }[d.status] || "cat-badge";
      const statusLabel = d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Unknown";
      const urgencyCls = d.urgency === "critical" ? "color:var(--red);font-weight:700" : d.urgency === "urgent" ? "color:var(--amber);font-weight:600" : "";
      const condLabel = d.condition === "any" ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
      const reason = d.reason ? (d.reason.length > 40 ? d.reason.slice(0, 40) + "..." : d.reason) : "-";
let btns = "";
if (__demandActionableBy(d)) {
        btns = actDD([{ label: "Review", cls: "btn-primary", attrs: `data-action="review-demand" data-id="${d.id}"` }], true);
      } else if (d.status !== "pending") {
        const noteTxt = d.status === "rejected" ? (d.rejectionReason || d.actionRemarks) : d.actionRemarks;
        btns = `<span style="font-size:.72rem;color:${d.status === "rejected" ? "var(--red)" : "var(--muted)"}">${noteTxt ? esc(noteTxt.slice(0, 30)) : "&mdash;"}</span>`;
      }
      const rfName = d.assigneeName || d.demandToDistrictName || "&mdash;";
      const rfSub = d.assigneeName ? `${esc(d.demandToDistrictName)}${d.demandToLocationName ? " (" + esc(d.demandToLocationName) + ")" : ""}` : "";
      return `<tr><td>${new Date(d.createdAt).toLocaleDateString("en-IN")}</td><td class="item-name">${esc(d.itemName)}</td><td class="qty-strong">${d.quantity}</td><td><span class="cat-badge">${esc(d.categoryName)}</span></td><td>${condLabel}</td><td>${esc(d.requestedBy)}</td><td>${esc(rfName)}${rfSub ? `<span style="display:block;color:var(--muted);font-size:.72rem">${rfSub}</span>` : ""}</td><td title="${esc(d.reason)}">${esc(reason)}</td><td><span class="${statusCls}">${statusLabel}</span></td><td class="actions-cell">${btns}</td></tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No demands found. Click "+ Raise Demand" to submit one.</td></tr>`;
  }

const stats = { total: demands.length, pending: 0, approved: 0, rejected: 0 };
  demands.forEach(d => { if (stats[d.status] !== undefined) stats[d.status]++; });
  $("#statTotalDemands").textContent = stats.total;
  $("#statPendingDemands").textContent = stats.pending;
  $("#statApprovedDemands").textContent = stats.approved;
  $("#statRejectedDemands").textContent = stats.rejected;
  updateDemandDot();
}

function getDemandDotCount() {
  if (!activeDistrictId || !currentUser) return 0;
  return (loadData(`demands_${activeDistrictId}`) || []).filter(d => __demandActionableBy(d)).length;
}

function updateDemandDot() {
  const dot = $("#demandDot");
  if (dot) dot.style.display = getDemandDotCount() ? "block" : "none";
}

function buildAssigneeOptions(districtId, locationId) {
  const { html, users } = resolveUnitAssignee(districtId, locationId);
  return html;
}

function unitUserCandidates(districtId, locationId) {
  const loc = getLocationsForDistrict(districtId).find(l => l.id === locationId);
  let users = getUsers().filter(u => u.districtId === districtId && (!locationId || u.locationId === locationId));
  if (!users.length && locationId) {
    users = getUsers().filter(u => u.districtId === districtId && u.role === "admin");
  }
  const unitRoles = ["station", "mhc", "post", "tsi"];
  const isHQ = loc && loc.type === "district";
  let best = null;
  if (isHQ) best = users.find(u => u.role === "admin") || users.find(u => u.role === "devadmin");
  if (!best) best = users.find(u => unitRoles.includes(u.role));
  if (!best) best = users.find(u => u.role === "admin");
  if (!best) best = users[0] || null;
  return { autoId: best ? best.id : null, users, isHQ };
}

function resolveUnitAssignee(districtId, locationId) {
  const { autoId, users } = unitUserCandidates(districtId, locationId);
  if (!users.length) return { autoId: null, html: `<option value="">No users found</option>`, users };
  const html = `<option value="">Select user</option>` + users.map(u => `<option value="${u.id}">${esc(u.name)} (${esc(u.role)})</option>`).join("");
  return { autoId, html, users };
}

function openDemandModal() {
  $("#demandModalTitle").textContent = "Raise New Demand";
  $("#demandSaveBtn").textContent = "Submit Demand";
  $("#fdItemName").value = "";
  $("#fdItemName").disabled = true;
  $("#fdItemSelect").innerHTML = `<option value="">-- select --</option>`;
  $("#fdItemSelect").disabled = true;
  $("#fdQuantity").value = 1;
  $("#fdCondition").value = "any";
  $("#fdUrgency").value = "normal";
  $("#fdReason").value = "";
  $("#fdRemarks").value = "";
  $("#fdDemandId").value = "";

  const catSel = $("#fdCategory");
  const cats = getCategories();
  catSel.innerHTML = `<option value="">Select category</option>` + cats.map(c => `<option value="${c.id}">${c.icon || ""} ${esc(c.name)}</option>`).join("");

  const toSel = $("#fdDemandTo");
  const toLocSel = $("#fdDemandToLocation");
  const allDistricts = getDistricts();
  toSel.innerHTML = `<option value="">Select district</option>` + allDistricts.map(d => `<option value="${d.id}" ${d.id === activeDistrictId ? 'selected' : ''}>${esc(d.name)}${d.id === activeDistrictId ? ' (Your District)' : ''}</option>`).join("");
const myLocs = getLocationsForDistrict(activeDistrictId);
  toLocSel.innerHTML = `<option value="">Select location</option>` + myLocs.map(l => `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`).join("");
  toSel.disabled = false;
  toLocSel.disabled = false;

  const assigneeSel = $("#fdAssignee");
  if (assigneeSel) {
    assigneeSel.innerHTML = `<option value="">Select user</option>` + buildAssigneeOptions(toSel.value, "");
  }

  openModal("#demandModal");
  setTimeout(() => $("#fdItemName").focus(), 50);
}

function saveDemand(e) {
  e.preventDefault();
  const itemName = $("#fdItemName").value.trim();
  const quantity = parseInt($("#fdQuantity").value, 10);
  const categoryId = $("#fdCategory").value;
  const condition = $("#fdCondition").value;
const demandToDistrict = $("#fdDemandTo").value;
  const demandToLocation = $("#fdDemandToLocation").value;
  const assigneeId = $("#fdAssignee").value;
  const assignee = getUsers().find(u => u.id === assigneeId);
  const urgency = $("#fdUrgency").value;
  const reason = $("#fdReason").value.trim();
  const remarks = $("#fdRemarks").value.trim();
  if (!itemName || !quantity || !categoryId || !demandToDistrict || !demandToLocation || !assigneeId || !reason) return toast("Please fill all required fields.", "error");

  const cats = getCategories();
  const cat = cats.find(c => c.id === categoryId);
  const toDist = getDistricts().find(d => d.id === demandToDistrict);
  const toLoc = getLocationsForDistrict(demandToDistrict).find(l => l.id === demandToLocation);

  const demands = getDemands();
  demands.push({
    id: uid(),
    itemName, quantity, categoryId, categoryName: cat ? cat.name : "Other",
    condition, urgency, reason, remarks,
requestedBy: currentUser ? currentUser.name : "Admin",
    assigneeId, assigneeName: assignee ? assignee.name : "",
    requestedFromDistrict: activeDistrictId,
    requestedFromLocation: getVisibleLocationId() || "",
    demandToDistrict, demandToDistrictName: toDist ? toDist.name : "",
    demandToLocation, demandToLocationName: toLoc ? toLoc.name : "",
    status: "pending", actionRemarks: "", rejectionReason: "",
    createdAt: Date.now(), updatedAt: null,
  });
  saveDemands(demands);

  addNotification(demandToDistrict, {
    type: "demand_raised",
    title: "New Demand Received",
    message: `${currentUser ? currentUser.name : "A unit"} has demanded ${quantity} x ${itemName} from ${toLoc ? toLoc.name : toDist ? toDist.name : "your district"}.`,
fromDistrictId: activeDistrictId,
    targetUserId: assigneeId || null,
    demandId: demands[demands.length - 1].id,
    targetLocId: demandToLocation || null,
  });

  toast("Demand submitted successfully!", "success");
  closeModals();
  render();
}

let __currentDemandStoreId = null;

function openDemandAction(id) {
  let d = (window.__demandSnapshot && window.__demandSnapshot[id]);
  if (!d) d = __allVisibleDemands().find(x => x.id === id);
  if (!d) {
    getDistricts().forEach(ds => {
      if (d) return;
      d = __demandsInStore(ds.id).find(x => x.id === id);
    });
  }
if (!d) return toast("Demand record could not be found. It may have been edited or removed.", "error");
  if (!__demandActionableBy(d)) return toast("Only the assigned user can review this demand.", "error");
  try {
  __currentDemandStoreId = d.__storeId || activeDistrictId;

  $("#demandActionTitle").textContent = "Review Demand â€” " + (d.itemName || "Item");
  $("#fdActionDemandId").value = d.id;
  $("#fdActionRemarks").value = "";
  $("#fdRejectionReason").value = "";
  $("#rejectionReasonGroup").classList.add("hidden");
  $("#fdActionType").value = "";

  const condLabel = d.condition === "any" || !d.condition ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
  const urgencyStyle = d.urgency === "critical" ? "color:var(--red);font-weight:700" : d.urgency === "urgent" ? "color:var(--amber);font-weight:600" : "";
  const fromDist = getDistricts().find(x => x.id === d.requestedFromDistrict);
  const toDist = getDistricts().find(x => x.id === d.demandToDistrict);

  $("#demandActionDetails").innerHTML = `
    <div class="demand-detail-grid">
      <div class="demand-detail-item"><span class="dd-label">Item</span><span class="dd-value">${esc(d.itemName)}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Quantity</span><span class="dd-value">${d.quantity}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Category</span><span class="dd-value">${esc(d.categoryName)}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Condition</span><span class="dd-value">${condLabel}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Urgency</span><span class="dd-value" style="${urgencyStyle}">${d.urgency ? d.urgency.charAt(0).toUpperCase() + d.urgency.slice(1) : "Normal"}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Requested By</span><span class="dd-value">${esc(d.requestedBy)}</span></div>
      <div class="demand-detail-item"><span class="dd-label">From District</span><span class="dd-value">${esc(fromDist ? fromDist.name : d.requestedFromDistrict)}</span></div>
      <div class="demand-detail-item"><span class="dd-label">To District</span><span class="dd-value">${esc(toDist ? toDist.name : d.demandToDistrictName || "â€”")}${d.demandToLocationName ? ' <span style="color:var(--muted);font-size:.75rem">(' + esc(d.demandToLocationName) + ')</span>' : ''}</span></div>
      <div class="demand-detail-item"><span class="dd-label">Requested From (User)</span><span class="dd-value">${esc(d.assigneeName || "â€”")}</span></div>
      <div class="demand-detail-item dd-full"><span class="dd-label">Reason</span><span class="dd-value">${esc(d.reason)}</span></div>
      ${d.remarks ? `<div class="demand-detail-item dd-full"><span class="dd-label">Remarks</span><span class="dd-value">${esc(d.remarks)}</span></div>` : ""}
    </div>`;

  openModal("#demandActionModal");
  $("#demandApproveBtn").textContent = "Approve & Submit";
  } catch (err) {
    console.error("openDemandAction failed:", err);
    toast("Could not open demand: " + (err && err.message ? err.message : String(err)), "error");
  }
}

function handleDemandAction(e) {
  e.preventDefault();
  const id = $("#fdActionDemandId").value;
  let actionType = $("#fdActionType").value;
  const remarks = $("#fdActionRemarks").value.trim();
  const rejectionReason = $("#fdRejectionReason").value.trim();

  if (!actionType) actionType = "approve";
  if (actionType === "reject" && !rejectionReason) return toast("Rejection reason is required.", "error");

const demands = loadData(`demands_${__currentDemandStoreId || activeDistrictId}`) || [];
  const d = demands.find(x => x.id === id);
  if (!d) return;
  if (!__demandActionableBy(d)) { closeModals(); return toast("You are not authorised to act on this demand.", "error"); }

  d.status = actionType === "approve" ? "approved" : "rejected";
  d.actionRemarks = remarks;
  d.rejectionReason = actionType === "reject" ? rejectionReason : "";
  d.updatedAt = Date.now();

  saveData(`demands_${__currentDemandStoreId || activeDistrictId}`, demands);

  const fromDist = getDistricts().find(x => x.id === d.requestedFromDistrict);
  if (d.status === "approved") {
    addNotification(d.requestedFromDistrict, {
      type: "demand_approved",
      title: "Demand Approved",
      message: `Your demand for ${d.quantity} x ${d.itemName} has been approved by ${fromDist ? fromDist.name : "the district"}.${remarks ? " Note: " + remarks : ""}`,
      fromDistrictId: activeDistrictId,
      demandId: d.id,
      targetLocId: d.requestedFromLocation || null,
    });
  } else {
    addNotification(d.requestedFromDistrict, {
      type: "demand_rejected",
      title: "Demand Rejected",
      message: `Your demand for ${d.quantity} x ${d.itemName} has been rejected by ${fromDist ? fromDist.name : "the district"}. Reason: ${rejectionReason}`,
      fromDistrictId: activeDistrictId,
      demandId: d.id,
      targetLocId: d.requestedFromLocation || null,
    });
  }

  toast(d.status === "approved" ? "Demand approved!" : "Demand rejected.", d.status === "approved" ? "success" : "error");
  closeModals();
  render();
}

/* ==================== DISTRICTS ==================== */
let editingDistId = null;
let selectedDistForLocations = null;

function renderDistricts() {
  const allDistricts = getDistricts();
  const districts = isDevAdmin() ? allDistricts : allDistricts.filter(d => d.id === activeDistrictId);
  const allLocations = getAllLocations();
  const allItems = getAllItems();
  const box = $("#districtsList");
  box.innerHTML = districts.map(d => {
    const locs = allLocations[d.id] || [];
    const items = allItems[d.id] || [];
    const isActive = d.id === activeDistrictId;
    return `<div class="district-row${isActive ? " active" : ""}" data-dist-id="${d.id}">
      <div class="dr-info"><div class="dr-name">${esc(d.name)}</div><div class="dr-detail">${esc(d.headquarters)} Â· ${locs.length} locations Â· ${items.length} items</div></div>
      <span class="dr-code">${esc(d.code)}</span>
      <button class="btn btn-sm btn-outline" data-dist-locs="${d.id}">Locations</button>
      ${isDevAdmin() ? `<button class="btn btn-sm btn-outline" data-dist-edit="${d.id}">Edit</button><button class="btn btn-sm btn-outline" data-dist-del="${d.id}">Delete</button>` : ""}
    </div>`;
  }).join("");
  renderLocationList();
}

function renderLocationList() {
  const box = $("#locationList");
  if (!box) return;
  if (!selectedDistForLocations) { box.innerHTML = `<div style="padding:12px;color:var(--muted);font-size:.85rem">Select a district's "Locations" button above.</div>`; return; }
  const locs = getLocationsForDistrict(selectedDistForLocations);
  const items = getItemsForDistrict(selectedDistForLocations);
  const counts = {};
  items.forEach(i => { counts[i.locationId] = (counts[i.locationId] || 0) + 1; });
  if (!locs.length) { box.innerHTML = `<div style="padding:12px;color:var(--muted);font-size:.85rem">No locations. Add one above.</div>`; return; }
  box.innerHTML = locs.map(l => {
    const count = counts[l.id] || 0;
    return `<div class="location-row"><span class="loc-name">${esc(l.name)}</span><span class="loc-type">${esc(l.type)}</span><span class="loc-items">${count} items</span><button class="btn btn-sm btn-outline" data-loc-del="${l.id}" ${count > 0 ? "disabled title='Has items'" : ""}>Remove</button></div>`;
  }).join("");
}

function openDistrictsModal() {
  editingDistId = null;
  selectedDistForLocations = null;
  $("#distFormTitle").textContent = "Add New District";
  $("#distSubmitBtn").textContent = "Add District";
  $("#cancelDistEdit").style.display = "none";
  $("#ndEditId").value = "";
  $("#addDistrictForm").reset();
  renderDistricts();
  openModal("#districtsModal");
}

function startEditDistrict(id) {
  if (!isDevAdmin()) return toast("Only developer admin can edit districts.", "error");
  const dist = getDistricts().find(d => d.id === id);
  if (!dist) return;
  editingDistId = id;
  $("#distFormTitle").textContent = "Edit District";
  $("#distSubmitBtn").textContent = "Update District";
  $("#cancelDistEdit").style.display = "";
  $("#ndEditId").value = id;
  $("#ndName").value = dist.name;
  $("#ndCode").value = dist.code;
  $("#ndHQ").value = dist.headquarters;
}

function cancelDistEdit() {
  editingDistId = null;
  $("#distFormTitle").textContent = "Add New District";
  $("#distSubmitBtn").textContent = "Add District";
  $("#cancelDistEdit").style.display = "none";
  $("#ndEditId").value = "";
  $("#addDistrictForm").reset();
}

function addDistrict(e) {
  e.preventDefault();
  if (!isDevAdmin()) return toast("Only developer admin can manage districts.", "error");
  const editId = $("#ndEditId").value;
  const name = $("#ndName").value.trim();
  const code = $("#ndCode").value.trim().toUpperCase();
  const headquarters = $("#ndHQ").value.trim();
  if (!name || !code || !headquarters) return toast("Fill all fields.", "error");
  const districts = getDistricts();
  const allLocations = getAllLocations();
  const allItems = getAllItems();
  if (editId) {
    const dist = districts.find(d => d.id === editId);
    if (!dist) return toast("Not found.", "error");
    if (districts.some(d => d.code === code && d.id !== editId)) return toast("Code already taken.", "error");
    dist.name = name; dist.code = code; dist.headquarters = headquarters;
    toast("District updated.", "success");
  } else {
    if (districts.some(d => d.code === code)) return toast("Code already exists.", "error");
    const newId = "dist_" + uid();
    districts.push({ id: newId, name, code, headquarters, createdAt: Date.now() });
    allLocations[newId] = []; allItems[newId] = [];
    saveAllLocations(allLocations); saveAllItems(allItems);
    toast("District added.", "success");
  }
  saveDistricts(districts);
  cancelDistEdit();
  renderDistricts();
  renderDistrictSelector();
}

function deleteDistrict(id) {
  if (!isDevAdmin()) return toast("Only developer admin can delete districts.", "error");
  const districts = getDistricts();
  const items = getItemsForDistrict(id);
  const users = getUsers().filter(u => u.districtId === id);
  if (items.length > 0) return toast("District has items. Remove them first.", "error");
  if (users.length > 0) return toast("District has users. Remove them first.", "error");
  if (districts.length <= 1) return toast("Cannot delete the last district.", "error");
  if (!confirm("Delete this district?")) return;
  const allLocations = getAllLocations();
  const allItems = getAllItems();
  delete allLocations[id]; delete allItems[id];
  saveAllLocations(allLocations); saveAllItems(allItems);
  saveDistricts(districts.filter(d => d.id !== id));
  if (activeDistrictId === id) {
    const remaining = getDistricts();
    if (remaining.length) switchDistrict(remaining[0].id);
  }
  toast("District deleted.", "success");
  renderDistricts();
  renderDistrictSelector();
}

function showLocations(districtId) { selectedDistForLocations = districtId; renderLocationList(); }

function addLocation() {
  if (!selectedDistForLocations) return toast("Select a district first.", "error");
  if (!isDevAdmin() && selectedDistForLocations !== activeDistrictId) return toast("You can only manage locations in your district.", "error");
  const name = ($("#nlName").value || "").trim();
  const type = ($("#nlType") || {}).value;
  if (!name) return toast("Enter location name.", "error");
  const allLocations = getAllLocations();
  const locs = allLocations[selectedDistForLocations] || [];
  if (locs.some(l => l.name.toLowerCase() === name.toLowerCase())) return toast("Location already exists.", "error");
  locs.push({ id: uid(), name, type, districtId: selectedDistForLocations });
  allLocations[selectedDistForLocations] = locs;
  saveAllLocations(allLocations);
  $("#nlName").value = "";
  toast("Location added.", "success");
  renderLocationList();
}

function deleteLocation(id) {
  if (!isDevAdmin() && selectedDistForLocations !== activeDistrictId) return toast("You can only manage locations in your district.", "error");
  const items = getItemsForDistrict(selectedDistForLocations);
  if (items.some(i => i.locationId === id)) return toast("Location has items. Reassign first.", "error");
  const allLocations = getAllLocations();
  allLocations[selectedDistForLocations] = (allLocations[selectedDistForLocations] || []).filter(l => l.id !== id);
  saveAllLocations(allLocations);
  toast("Location removed.", "success");
  renderLocationList();
}

/* ==================== REPORTS ==================== */
function renderReports() {
  const tab = $(".report-tab.active");
  if (tab) {
    const t = tab.dataset.rtab;
    if (t === "stockReport") renderStockReport();
    else if (t === "categoryReport") renderCategoryReport();
    else if (t === "locationReport") renderLocationReport();
  }
}

// ---- report search + sort state ----
let __rptSearch = "";
let __rptSortKey = "";
let __rptSortDir = 1;

function __rptReportId() {
  const t = $(".report-tab.active");
  return t ? t.dataset.rtab : "stockReport";
}

function __rptFilterSort(rows) {
  const q = __rptSearch.trim().toLowerCase();
  const out = q ? rows.filter(r => Object.keys(r).some(k => {
    if (k.charAt(0) === "_") return false;
    return String(r[k]).toLowerCase().includes(q);
  })) : rows.slice();
  if (__rptSortKey) {
    const key = __rptSortKey;
    const dir = __rptSortDir;
    out.sort((a, b) => {
      const av = a[key], bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
  }
  return out;
}

function __rptSortHeader(key, label) {
  const ind = __rptSortKey === key ? (__rptSortDir === 1 ? " \u25B2" : " \u25BC") : "";
  return `<th class="sortable" data-sort-key="${key}">${label}${ind ? `<span class="sort-ind">${ind}</span>` : ""}</th>`;
}

function __rptBindSort() {
  $$("#reportContent th.sortable").forEach(th =>
    th.addEventListener("click", () => {
      const key = th.dataset.sortKey;
      if (__rptSortKey === key) __rptSortDir = -__rptSortDir;
      else { __rptSortKey = key; __rptSortDir = 1; }
      renderReports();
    })
  );
}

function __rptBindSummary() {
  $$(".rpt-summary-card[data-rpt-stat]").forEach(card =>
    card.addEventListener("click", () => {
      const key = card.dataset.rptStat;
      if (key) openRptStatDetail(key);
    })
  );
}

function __rptCondRows(cond, label) {
  const items = getItems();
  const cats = getCategories();
  const locs = getLocations();
  const rows = items
    .filter(i => ((i.conditionCounts || {})[cond] || 0) > 0)
    .map(i => {
      const cc = i.conditionCounts || {};
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", cc[cond] || 0, i.quantity, i.unit];
    });
  return { title: label, cols: ["Item", "Category", "Location", label + " Qty", "Total Qty", "Unit"], rows };
}

const __RPT_BUILDERS = {
  total: () => {
    const items = getItems();
    const cats = getCategories();
    const locs = getLocations();
    const rows = items.map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
      return [i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.unit, i.minStock, status];
    });
    return { title: "Total Items", cols: ["Item", "Category", "Location", "Qty", "Unit", "Min", "Status"], rows };
  },
  instock: () => __rptStockRows(i => i.quantity > i.minStock, "In Stock Items"),
  lowstock: () => __rptStockRows(i => i.quantity > 0 && i.quantity <= i.minStock, "Low Stock Items"),
  outofstock: () => __rptStockRows(i => i.quantity === 0, "Out of Stock Items"),
  new: () => __rptCondRows("new", "New Units"),
  damaged: () => __rptCondRows("damaged", "Damaged Units")
};

function __rptStockRows(pred, label) {
  const items = getItems().filter(pred);
  const cats = getCategories();
  const locs = getLocations();
  const rows = items.map(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const loc = locs.find(l => l.id === i.locationId);
    const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
    return [i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.unit, i.minStock, status];
  });
  return { title: label, cols: ["Item", "Category", "Location", "Qty", "Unit", "Min", "Status"], rows };
}

function openRptStatDetail(key) {
  const def = __RPT_BUILDERS[key] ? __RPT_BUILDERS[key]() : null;
  if (!def) return;
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  __statDetail = {
    title: def.title,
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString(),
    cols: def.cols,
    rows: def.rows,
    fileName: "stock-report-" + key.toLowerCase()
  };
  __statFilter = "";
  $("#statDetailTitle").textContent = def.title;
  $("#statDetailSubtitle").textContent = __statDetail.subtitle;
  $("#statDetailHead").innerHTML = "<tr>" + def.cols.map(c => `<th>${esc(c)}</th>`).join("") + "</tr>";
  const s = $("#statSearch");
  if (s) s.value = "";
  renderStatDetail("");
  openModal("#statDetailModal");
}

function renderStockReport() {
  const items = getItems();
  const cats = getCategories();
  const total = items.length;
  const inStock = items.filter(i => i.quantity > i.minStock).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const damagedUnits = items.reduce((sum, i) => sum + ((i.conditionCounts || {}).damaged || 0), 0);
  const newUnits = items.reduce((sum, i) => sum + ((i.conditionCounts || {}).new || 0), 0);

  let html = `<div class="rpt-summary"><div class="rpt-summary-card" data-rpt-stat="total" title="Click for details & export"><div class="rpt-s-label">Total Items</div><div class="rpt-s-value">${total}</div></div><div class="rpt-summary-card" data-rpt-stat="instock" title="Click for details & export"><div class="rpt-s-label">In Stock</div><div class="rpt-s-value" style="color:var(--green)">${inStock}</div></div><div class="rpt-summary-card" data-rpt-stat="lowstock" title="Click for details & export"><div class="rpt-s-label">Low Stock</div><div class="rpt-s-value" style="color:var(--amber)">${lowStock}</div></div><div class="rpt-summary-card" data-rpt-stat="outofstock" title="Click for details & export"><div class="rpt-s-label">Out of Stock</div><div class="rpt-s-value" style="color:var(--red)">${outOfStock}</div></div><div class="rpt-summary-card" data-rpt-stat="new" title="Click for details & export"><div class="rpt-s-label">New Units</div><div class="rpt-s-value" style="color:#0ea5e9">${newUnits}</div></div><div class="rpt-summary-card" data-rpt-stat="damaged" title="Click for details & export"><div class="rpt-s-label">Damaged Units</div><div class="rpt-s-value" style="color:var(--red)">${damagedUnits}</div></div></div>`;
  html += `<div class="table-wrap"><table><thead><tr>${__rptSortHeader("Item", "Item")}${__rptSortHeader("Category", "Category")}${__rptSortHeader("Qty", "Qty")}${__rptSortHeader("Min", "Min")}<th>Condition Breakdown</th>${__rptSortHeader("Status", "Status")}<th>Health</th></tr></thead><tbody>`;
  const rows = __rptFilterSort(items.map(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
    const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
    return { Item: i.name, Category: cat ? cat.name : "", Qty: i.quantity, Min: i.minStock, Status: status, _cc: cc, _item: i };
  }));
  if (!rows.length) {
    html += `<tr><td colspan="7" style="text-align:center;color:var(--muted)">No matching items.</td></tr></tbody></table></div>`;
    $("#reportContent").innerHTML = html;
    __rptBindSort();
    __rptBindSummary();
    return;
  }
  rows.forEach(r => {
    const i = r._item;
    const cc = r._cc;
    const cls = i.quantity === 0 ? "status-out" : i.quantity <= i.minStock ? "status-low" : "status-ok";
    const pct = i.minStock > 0 ? Math.min(Math.round((i.quantity / (i.minStock * 2)) * 100), 100) : 100;
    const barCls = pct > 60 ? "green" : pct > 30 ? "amber" : "red";
    html += `<tr><td class="item-name">${esc(r.Item)}</td><td><span class="cat-badge">${esc(r.Category)}</span></td><td class="qty-strong">${r.Qty}</td><td>${r.Min}</td><td>${buildCondBar(cc)}</td><td><span class="status-badge ${cls}">${r.Status}</span></td><td style="min-width:100px"><div class="rpt-bar"><div class="rpt-bar-fill ${barCls}" style="width:${pct}%"></div></div></td></tr>`;
  });
  const tQty = rows.reduce((a, r) => a + r.Qty, 0);
  const tMin = rows.reduce((a, r) => a + r.Min, 0);
  html += `<tr class="rpt-total-row"><td>Total</td><td></td><td class="qty-strong">${tQty}</td><td>${tMin}</td><td colspan="3"></td></tr>`;
  html += `</tbody></table></div>`;
  $("#reportContent").innerHTML = html;
  __rptBindSort();
  __rptBindSummary();
}

function renderCategoryReport() {
  const items = getItems();
  const cats = getCategories();
  const catData = cats.map(c => {
    const ci = items.filter(i => i.categoryId === c.id);
    return { Category: c.name, _icon: c.icon || "", Items: ci.length, "Total Qty": ci.reduce((a, i) => a + i.quantity, 0), "Low Stock": ci.filter(i => i.quantity <= i.minStock).length };
  }).filter(c => c.Items > 0);

  const maxQty = Math.max(...catData.map(c => c["Total Qty"]), 1);
  const colors = ["primary", "green", "amber", "red", "gold"];
  let html = `<div class="table-wrap"><table><thead><tr>${__rptSortHeader("Category", "Category")}${__rptSortHeader("Items", "Items")}${__rptSortHeader("Total Qty", "Total Qty")}${__rptSortHeader("Low Stock", "Low Stock")}<th>Distribution</th></tr></thead><tbody>`;
  const rows = __rptFilterSort(catData);
  if (!rows.length) {
    html += `<tr><td colspan="5" style="text-align:center;color:var(--muted)">No matching categories.</td></tr></tbody></table></div>`;
    $("#reportContent").innerHTML = html;
    __rptBindSort();
    return;
  }
  rows.forEach((c, idx) => {
    const pct = Math.round((c["Total Qty"] / maxQty) * 100);
    html += `<tr><td class="item-name">${c._icon ? c._icon + " " : ""}${esc(c.Category)}</td><td>${c.Items}</td><td class="qty-strong">${c["Total Qty"]}</td><td>${c["Low Stock"] ? `<span style="color:var(--amber);font-weight:600">${c["Low Stock"]}</span>` : "0"}</td><td><div class="rpt-bar"><div class="rpt-bar-fill ${colors[idx % colors.length]}" style="width:${pct}%"></div></div></td></tr>`;
  });
  const cQty = rows.reduce((a, c) => a + c["Total Qty"], 0);
  const cItems = rows.reduce((a, c) => a + c.Items, 0);
  const cLow = rows.reduce((a, c) => a + c["Low Stock"], 0);
  html += `<tr class="rpt-total-row"><td>Total</td><td>${cItems}</td><td class="qty-strong">${cQty}</td><td>${cLow}</td><td></td></tr>`;
  html += `</tbody></table></div>`;
  $("#reportContent").innerHTML = html;
  __rptBindSort();
}

function renderLocationReport() {
  const items = getItems();
  const locs = getVisibleLocations();
  const locData = locs.map(l => {
    const li = items.filter(i => i.locationId === l.id);
    return { Location: l.name, Type: l.type, Items: li.length, "Total Qty": li.reduce((a, i) => a + i.quantity, 0), "Low Stock": li.filter(i => i.quantity <= i.minStock).length };
  });
  let html = `<div class="table-wrap"><table><thead><tr>${__rptSortHeader("Location", "Location")}${__rptSortHeader("Type", "Type")}${__rptSortHeader("Items", "Items")}${__rptSortHeader("Total Qty", "Total Qty")}${__rptSortHeader("Low Stock", "Low Stock")}</tr></thead><tbody>`;
  const rows = __rptFilterSort(locData);
  if (!rows.length) {
    html += `<tr><td colspan="5" style="text-align:center;color:var(--muted)">No matching locations.</td></tr></tbody></table></div>`;
    $("#reportContent").innerHTML = html;
    __rptBindSort();
    return;
  }
  rows.forEach(l => {
    html += `<tr><td class="item-name">${esc(l.Location)}</td><td><span class="cat-badge">${esc(l.Type)}</span></td><td>${l.Items}</td><td class="qty-strong">${l["Total Qty"]}</td><td>${l["Low Stock"] ? `<span style="color:var(--amber);font-weight:600">${l["Low Stock"]}</span>` : "0"}</td></tr>`;
  });
  const lQty = rows.reduce((a, l) => a + l["Total Qty"], 0);
  const lItems = rows.reduce((a, l) => a + l.Items, 0);
  const lLow = rows.reduce((a, l) => a + l["Low Stock"], 0);
  html += `<tr class="rpt-total-row"><td>Total</td><td></td><td>${lItems}</td><td class="qty-strong">${lQty}</td><td>${lLow}</td></tr>`;
  html += `</tbody></table></div>`;
  $("#reportContent").innerHTML = html;
  __rptBindSort();
}

function __rptExportData() {
  const id = __rptReportId();
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  let cols, rows, title, fileName;
  if (id === "categoryReport") {
    const items = getItems();
    rows = __rptFilterSort(getCategories().map(c => {
      const ci = items.filter(i => i.categoryId === c.id);
      return { Category: c.name, Items: ci.length, "Total Qty": ci.reduce((a, i) => a + i.quantity, 0), "Low Stock": ci.filter(i => i.quantity <= i.minStock).length };
    })).map(r => [r.Category, r.Items, r["Total Qty"], r["Low Stock"]]);
    cols = ["Category", "Items", "Total Qty", "Low Stock"];
    title = "Category Breakdown Report";
    fileName = "category-report";
  } else if (id === "locationReport") {
    const items = getItems();
    rows = __rptFilterSort(getVisibleLocations().map(l => {
      const li = items.filter(i => i.locationId === l.id);
      return { Location: l.name, Type: l.type, Items: li.length, "Total Qty": li.reduce((a, i) => a + i.quantity, 0), "Low Stock": li.filter(i => i.quantity <= i.minStock).length };
    })).map(r => [r.Location, r.Type, r.Items, r["Total Qty"], r["Low Stock"]]);
    cols = ["Location", "Type", "Items", "Total Qty", "Low Stock"];
    title = "Location Report";
    fileName = "location-report";
  } else {
    const cats = getCategories();
    rows = __rptFilterSort(getItems().map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      return { Item: i.name, Category: cat ? cat.name : "", Qty: i.quantity, Min: i.minStock, Status: i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK" };
    })).map(r => [r.Item, r.Category, r.Qty, r.Min, r.Status]);
    cols = ["Item", "Category", "Qty", "Min", "Status"];
    title = "Stock Report";
    fileName = "stock-report";
  }
  return {
    title,
    subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString() + " (" + rows.length + " row" + (rows.length === 1 ? "" : "s") + ")",
    cols,
    rows,
    fileName
  };
}

function printRptReport() { printReport(__rptExportData()); }
function exportRptPDF() { pdfReport(__rptExportData()); toast("PDF exported.", "success"); }
function exportRptExcel() { excelReport(__rptExportData()); toast("Excel exported.", "success"); }
function exportRptWord() { wordReport(__rptExportData()); toast("Word document exported.", "success"); }

/* ==================== ALLOTMENTS ==================== */
function getPersons() { return loadData("persons") || []; }
function savePersons(persons) { saveData("persons", persons); }
function getAllotments() { return loadData("allotments") || []; }
function saveAllotments(allotments) { saveData("allotments", allotments); }

function getVisibleAllotments() {
  let all = getAllotments();
  if (activeDistrictId) all = all.filter(a => a.districtId === activeDistrictId);
  const locId = getVisibleLocationId();
  if (locId) all = all.filter(a => a.locationId === locId);
  return all;
}

function allocTotals(item) {
  return {
    allotted: item.allotted || 0,
    damaged: item.damagedReturned || 0,
    lost: item.lostReturned || 0
  };
}

function availableQty(item) {
  const t = allocTotals(item);
  return Math.max(0, (item.quantity || 0) - t.allotted - t.damaged - t.lost);
}

function allocStatusOfItem(item) {
  const avail = availableQty(item);
  if (avail <= 0) {
    const t = allocTotals(item);
    if (t.allotted > 0 || t.damaged > 0 || t.lost > 0) return { cls: "status-out", label: "Fully Allotted" };
    return { cls: "status-out", label: "Out of Stock" };
  }
  if (avail <= (item.minStock || 0)) return { cls: "status-low", label: "Low" };
  return { cls: "status-ok", label: "Available" };
}

function allocRemaining(a) { return Math.max(0, (a.qtyAllotted || 0) - (a.qtyReturned || 0)); }

function allocStatusOf(a) {
  if (a.status === "CANCELLED") return "CANCELLED";
  const rem = allocRemaining(a);
  if (rem <= 0) {
    if (a.status === "DAMAGED") return "DAMAGED";
    if (a.status === "LOST") return "LOST";
    return "RETURNED";
  }
  if ((a.qtyReturned || 0) > 0) return "PARTIALLY_RETURNED";
  return "ALLOTTED";
}

function allocStatusBadge(st) {
  const map = {
    ALLOTTED: { cls: "status-ok", label: "Allotted" },
    PARTIALLY_RETURNED: { cls: "status-low", label: "Partially Returned" },
    RETURNED: { cls: "status-neutral", label: "Returned" },
    DAMAGED: { cls: "status-low", label: "Damaged" },
    LOST: { cls: "status-out", label: "Lost" },
    CANCELLED: { cls: "status-neutral", label: "Cancelled" }
  };
  const m = map[st] || { cls: "status-neutral", label: st };
  return `<span class="status-badge ${m.cls}">${m.label}</span>`;
}

function itemHistoryPush(item, ev) {
  if (!item.history) item.history = [];
  item.history.push({
    type: ev.type,
    qty: ev.qty || 0,
    person: ev.person || "",
    ref: ev.ref || "",
    date: ev.date || "",
    time: ev.time || "",
    remarks: ev.remarks || "",
    user: ev.user || (currentUser ? (currentUser.name || currentUser.username || "") : ""),
    at: Date.now()
  });
}

function persistAlloc(items, allotments, persons) {
  saveItems(items);
  saveAllotments(allotments);
  if (persons) savePersons(persons);
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowTimeStr() { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

let __allocTab = "stock";

function renderAllotments() {
  const catSel = $("#allocStockCat");
  if (catSel) {
    catSel.innerHTML = `<option value="">All Categories</option>` + getCategories().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  }
  renderAllocStockFilters();
  if (__allocTab === "stock") renderAllocStock();
  else if (__allocTab === "allotted") renderAllottedList();
  else renderReturnHistory();
}

function renderAllocStockFilters() {
  const acts = getVisibleAllotments();
  const items = getItems();
  const catF = $("#allocCatFilter");
  if (catF) catF.innerHTML = `<option value="">All Categories</option>` + getCategories().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  const itemF = $("#allocItemFilter");
  if (itemF) itemF.innerHTML = `<option value="">All Items</option>` + items.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join("");
  const rankF = $("#allocRankFilter");
  if (rankF) {
    const ranks = [...new Set(acts.map(a => a.rank).filter(Boolean))].sort();
    rankF.innerHTML = `<option value="">All Ranks</option>` + ranks.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("");
  }
}

let __allocStockSort = { key: "name", dir: 1 };
let __allocStockType = "all";

function setStockType(type) {
  __allocStockType = type;
  const sel = $("#allocStockType");
  if (sel && sel.value !== type) sel.value = type;
  renderAllocStock();
}

function setStockSort(key) {
  if (__allocStockSort.key === key) __allocStockSort.dir *= -1;
  else __allocStockSort = { key, dir: 1 };
  updateStockSortHeader();
  renderAllocStock();
}

function updateStockSortHeader() {
  document.querySelectorAll("#allocStockTable thead .sortable").forEach(th => {
    const arrow = th.querySelector(".sort-arrow");
    if (!arrow) return;
    arrow.textContent = th.dataset.sort === __allocStockSort.key ? (__allocStockSort.dir > 0 ? "\u25B2" : "\u25BC") : "";
  });
}

function __allocStockSorted(rows) {
  const cats = getCategories();
  const { key, dir } = __allocStockSort;
  const catName = i => (cats.find(c => c.id === i.categoryId) || {}).name || "";
  rows.sort((a, b) => {
    let av, bv;
    if (key === "name") { av = a.name; bv = b.name; }
    else if (key === "category") { av = catName(a); bv = catName(b); }
    else if (key === "total") { av = a.quantity || 0; bv = b.quantity || 0; }
    else if (key === "available") { av = availableQty(a); bv = availableQty(b); }
    else if (key === "allotted") { av = a.allotted || 0; bv = b.allotted || 0; }
    else if (key === "status") { av = allocStatusOfItem(a).label; bv = allocStatusOfItem(b).label; }
    if (typeof av === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  return rows;
}

function __allocStockFiltered() {
  const cats = getCategories();
  const locations = getLocations();
  const q = (($("#allocStockSearch") || {}).value || "").toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const catF = (($("#allocStockCat") || {}).value || "");
  return getItems().filter(i => {
    if (catF && i.categoryId !== catF) return false;
    if (terms.length) {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = i.locationId ? locations.find(l => l.id === i.locationId) : null;
      const hay = [i.name, cat ? cat.name : "", i.unit || "", loc ? loc.name : ""].join(" ").toLowerCase();
      if (!terms.every(t => hay.includes(t))) return false;
    }
    if (__allocStockType === "allotted" && !(i.allotted > 0)) return false;
    if (__allocStockType === "available" && !(availableQty(i) > 0)) return false;
    return true;
  });
}

function renderAllocStock() {
  const body = $("#allocStockBody");
  if (!body) return;
  const cats = getCategories();
  const rows = __allocStockSorted(__allocStockFiltered());
  updateStockSortHeader();
  if (!rows.length) { body.innerHTML = `<tr class="empty-row"><td colspan="8">No items found.</td></tr>`; return; }
  let ttotal = 0, tavailable = 0, tallot = 0;
  body.innerHTML = rows.map((i, idx) => {
    const cat = cats.find(c => c.id === i.categoryId);
    const st = allocStatusOfItem(i);
    ttotal += i.quantity || 0;
    tallot += i.allotted || 0;
    tavailable += availableQty(i);
    const acts = actDD([
      { label: "View", attrs: `data-alloc-action="view" data-id="${i.id}"` },
      ...(canEdit() ? [
        { label: "Edit", attrs: `data-alloc-action="edit" data-id="${i.id}"` },
        { label: "Adjust", attrs: `data-alloc-action="adjust" data-id="${i.id}"` }
      ] : [])
    ]);
    return `<tr><td>${idx + 1}</td><td class="item-name">${esc(i.name)}</td><td><span class="cat-badge">${esc(cat ? cat.name : "")}</span></td><td class="qty-strong">${i.quantity || 0}</td><td class="qty-strong" style="color:var(--green)">${availableQty(i)}</td><td class="qty-strong" style="color:var(--primary)">${i.allotted || 0}</td><td><span class="status-badge ${st.cls}">${st.label}</span></td><td class="actions-cell">${acts}</td></tr>`;
  }).join("") +
    `<tr class="rpt-total-row"><td>Total</td><td></td><td></td><td class="qty-strong">${ttotal}</td><td class="qty-strong">${tavailable}</td><td class="qty-strong">${tallot}</td><td colspan="2"></td></tr>`;
}

function __allocListFiltered() {
  const cats = getCategories();
  const q = (($("#allocSearch") || {}).value || "").toLowerCase();
  const catF = (($("#allocCatFilter") || {}).value || "");
  const itemF = (($("#allocItemFilter") || {}).value || "");
  const postF = (($("#allocPostingFilter") || {}).value || "").toLowerCase();
  const rankF = (($("#allocRankFilter") || {}).value || "");
  const statusF = (($("#allocStatusFilter") || {}).value || "");
  const dateFrom = (($("#allocDateFrom") || {}).value || "");
  const dateTo = (($("#allocDateTo") || {}).value || "");

  return getVisibleAllotments().filter(a => {
    if (catF && a.categoryId !== catF) return false;
    if (itemF && a.itemId !== itemF) return false;
    if (rankF && a.rank !== rankF) return false;
    if (statusF && allocStatusOf(a) !== statusF) return false;
    if (postF && ((a.posting || "").toLowerCase()).indexOf(postF) === -1) return false;
    if (q) {
      const hay = [a.name, a.beltNo, a.itemName, a.posting, a.rank, a.categoryName].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateFrom) {
      const d = a.createdAt || 0;
      if (!d || d < new Date(dateFrom + "T00:00:00").getTime()) return false;
    }
    if (dateTo) {
      const d = a.createdAt || 0;
      if (!d || d >= new Date(dateTo + "T00:00:00").getTime() + 86400000) return false;
    }
    return true;
  }).sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
}

function renderAllottedList() {
  const body = $("#allocBody");
  if (!body) return;
  const cats = getCategories();
  const rows = __allocListFiltered();
  if (!rows.length) { body.innerHTML = `<tr class="empty-row"><td colspan="12">No allotments found.</td></tr>`; return; }
  body.innerHTML = rows.map((a, idx) => {
    const st = allocStatusOf(a);
    const rem = allocRemaining(a);
    const canAct = (st === "ALLOTTED" || st === "PARTIALLY_RETURNED") && canEdit();
    const acts = actDD([
      { label: "View", attrs: `data-alloc-action="view" data-id="${a.id}"` },
      ...(canAct ? [
        { label: "Edit", attrs: `data-alloc-action="edit" data-id="${a.id}"` },
        { label: "Return", attrs: `data-alloc-action="return" data-id="${a.id}"` },
        { label: "Cancel", cls: "act-dd-del", attrs: `data-alloc-action="cancel" data-id="${a.id}"` }
      ] : [])
    ]);
    const d = a.createdAt || 0;
    return `<tr><td>${idx + 1}</td><td><a href="javascript:void(0)" class="person-link" data-alloc-action="person" data-belt="${esc(a.beltNo)}">${esc(a.name)}</a></td><td>${esc(a.rank || "")}</td><td>${esc(a.beltNo || "")}</td><td>${esc(a.posting || "")}</td><td class="item-name">${esc(a.itemName || "")}</td><td><span class="cat-badge">${esc(a.categoryName || "")}</span></td><td class="qty-strong">${rem}</td><td>${d ? fmtDate(d) : "&mdash;"}</td><td>${esc(a.time || "") || "&mdash;"}</td><td>${allocStatusBadge(st)}</td><td class="actions-cell">${acts}</td></tr>`;
  }).join("");
}

function __allocReturns() {
  const rows = [];
  const q = (($("#allocRetSearch") || {}).value || "").toLowerCase();
  getVisibleAllotments().forEach(a => {
    (a.returns || []).forEach(r => {
      if (r.condition === "cancelled") return;
      const row = { a, r };
      const hay = [a.name, a.beltNo, a.itemName, r.condition, r.receivedBy || "", r.remarks || ""].join(" ").toLowerCase();
      if (q && !hay.includes(q)) return;
      rows.push(row);
    });
  });
  return rows.sort((x, y) => (y.r.at || 0) - (x.r.at || 0));
}

function renderReturnHistory() {
  const body = $("#allocRetBody");
  if (!body) return;
  const rows = __allocReturns();
  if (!rows.length) { body.innerHTML = `<tr class="empty-row"><td colspan="10">No return history found.</td></tr>`; return; }
  const condLabels = { good: "Good", damaged: "Damaged", lost: "Lost", other: "Other" };
  body.innerHTML = rows.map(({ a, r }, idx) => {
    const cond = (r.condition === "damaged" || r.condition === "lost") ? `<span class="status-badge ${r.condition === "lost" ? "status-out" : "status-low"}">${condLabels[r.condition] || r.condition}</span>` : `<span class="status-badge status-neutral">${condLabels[r.condition] || r.condition}</span>`;
    return `<tr><td>${idx + 1}</td><td class="item-name">${esc(a.name)}</td><td>${esc(a.beltNo || "")}</td><td class="item-name">${esc(a.itemName || "")}</td><td class="qty-strong">${r.qty}</td><td>${cond}</td><td>${esc(r.date || "")}</td><td>${esc(r.time || "")}</td><td>${esc(r.receivedBy || "")}</td><td>${esc(r.remarks || "") || "&mdash;"}</td></tr>`;
  }).join("");
}

/* ---- Person suggestions ---- */
function bindPersonSuggest() {
  const input = $("#alPerson");
  const box = $("#alPersonSuggest");
  if (!input || !box) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.classList.add("hidden"); return; }
    const persons = getPersons().filter(p => (p.name + " " + p.beltNo).toLowerCase().includes(q)).slice(0, 8);
    if (!persons.length) { box.classList.add("hidden"); return; }
    box.innerHTML = persons.map(p =>
      `<button type="button" class="suggest-item" data-belt="${esc(p.beltNo)}"><span class="suggest-name">${esc(p.name)}</span><span class="suggest-sub">${esc(p.rank || "")} \u00b7 ${esc(p.beltNo)} \u00b7 ${esc(p.posting || "")}</span></button>`
    ).join("");
    box.classList.remove("hidden");
  });
  box.addEventListener("click", e => {
    const it = e.target.closest(".suggest-item");
    if (!it) return;
    const p = getPersons().find(x => x.beltNo === it.dataset.belt);
    if (!p) return;
    input.value = p.name;
    $("#alRank").value = p.rank || "";
    $("#alBelt").value = p.beltNo || "";
    $("#alPosting").value = p.posting || "";
    box.classList.add("hidden");
  });
  document.addEventListener("click", e => { if (!e.target.closest("#alpPersonGroup")) box.classList.add("hidden"); });
}

/* ---- Allot modal (multi-item) ---- */
let __alItemRows = [];
let __alRowSeq = 0;

function allocRowTemplate(r) {
  return `<div class="alloc-item-row" data-row="${r.key}">
    <div class="form-group" style="flex:1.4">
      <label>Category</label>
      <select class="al-row-cats" data-row="${r.key}" required><option value="">Select category</option></select>
    </div>
    <div class="form-group" style="flex:2.4">
      <label>Item</label>
      <select class="al-row-items" data-row="${r.key}" disabled required><option value="">Select category first</option></select>
    </div>
    <div class="form-group" style="flex:0.8">
      <label>Qty</label>
      <input type="number" class="al-row-qty" data-row="${r.key}" min="1" value="1" required />
    </div>
    <div class="alloc-row-del" data-row="${r.key}" title="Remove item">&times;</div>
    <div class="stock-balance al-row-balance" data-row="${r.key}"></div>
  </div>`;
}

function addAllotItemRow(prefillItemId) {
  const container = $("#alItems");
  if (!container) return;
  const rowKey = ++__alRowSeq;
  const r = { key: rowKey, categoryId: "", itemId: prefillItemId || "", qty: 1 };
  __alItemRows.push(r);
  container.insertAdjacentHTML("beforeend", allocRowTemplate(r));
  const catSel = container.querySelector(`.al-row-cats[data-row="${rowKey}"]`);
  if (catSel) {
    catSel.innerHTML = `<option value="">Select category</option>` + getCategories().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  }
  if (r.itemId) {
    const it = getItems().find(i => i.id === r.itemId);
    if (it) {
      r.categoryId = it.categoryId;
      if (catSel) catSel.value = it.categoryId;
    }
  }
  renderRowItemOptions(r);
  refreshAllotRowBalances();
  refreshAllotSummary();
}

function removeAllotItemRow(key) {
  const el = document.querySelector(`.alloc-item-row[data-row="${key}"]`);
  if (el) el.remove();
  __alItemRows = __alItemRows.filter(r => r.key != key);
  refreshAllotRowOptions();
  refreshAllotSummary();
}

function renderRowItemOptions(r) {
  const sel = document.querySelector(`.al-row-items[data-row="${r.key}"]`);
  if (!sel) return;
  if (!r.categoryId) {
    sel.innerHTML = `<option value="">Select category first</option>`;
    sel.disabled = true;
    r.itemId = "";
    return;
  }
  const used = new Set(__alItemRows.filter(x => x.key !== r.key).map(x => x.itemId).filter(Boolean));
  const opts = getItems().filter(i => i.categoryId === r.categoryId && !used.has(i.id));
  sel.disabled = false;
  const cur = r.itemId && opts.some(o => o.id === r.itemId) ? r.itemId : "";
  sel.innerHTML = `<option value="">Select item</option>` + opts.map(o => `<option value="${o.id}" ${o.id === cur ? "selected" : ""}>${esc(o.name)} (Avail: ${availableQty(o)})</option>`).join("");
  sel.value = cur;
  r.itemId = cur;
  return cur;
}

function refreshAllotRowOptions() {
  __alItemRows.forEach(r => renderRowItemOptions(r));
}

function refreshAllotRowBalances() {
  __alItemRows.forEach(r => {
    const box = document.querySelector(`.al-row-balance[data-row="${r.key}"]`);
    if (!box) return;
    const item = r.itemId ? getItems().find(i => i.id === r.itemId) : null;
    if (!item) { box.innerHTML = ""; return; }
    const t = allocTotals(item);
    box.innerHTML = `<span class="bal-chip bal-total">Total: <b>${item.quantity || 0}</b></span><span class="bal-chip bal-avail">Available: <b>${availableQty(item)}</b></span><span class="bal-chip bal-allot">Allotted: <b>${t.allotted}</b></span><span class="bal-chip bal-dmg">Damaged: <b>${t.damaged}</b></span><span class="bal-chip bal-lost">Lost: <b>${t.lost}</b></span>`;
  });
}

function refreshAllotSummary() {
  const sum = $("#alItemsSummary");
  if (!sum) return;
  const valid = __alItemRows.filter(r => r.itemId);
  const totalQty = valid.reduce((s, r) => s + (r.qty > 0 ? r.qty : 0), 0);
  sum.textContent = valid.length ? `${valid.length} item(s) \u00b7 total quantity ${totalQty}` : "";
}

function bindAllotRowEvents() {
  const container = $("#alItems");
  if (!container || container.dataset.bound) return;
  container.dataset.bound = "1";
  container.addEventListener("change", e => {
    const catSel = e.target.closest(".al-row-cats");
    if (catSel) {
      const key = catSel.dataset.row;
      const r = __alItemRows.find(x => x.key == key);
      if (r) {
        r.categoryId = catSel.value || "";
        r.itemId = "";
        r.qty = parseInt((container.querySelector(`.al-row-qty[data-row="${key}"]`) || {}).value, 10) || 1;
        renderRowItemOptions(r);
        refreshAllotRowBalances();
        refreshAllotSummary();
      }
      return;
    }
    const sel = e.target.closest(".al-row-items");
    if (sel) {
      const key = sel.dataset.row;
      const r = __alItemRows.find(x => x.key == key);
      if (r) {
        r.itemId = sel.value || "";
        r.qty = parseInt((container.querySelector(`.al-row-qty[data-row="${key}"]`) || {}).value, 10) || 1;
        refreshAllotRowOptions();
        refreshAllotRowBalances();
        refreshAllotSummary();
      }
      return;
    }
    const qtyEl = e.target.closest(".al-row-qty");
    if (qtyEl) {
      const key = qtyEl.dataset.row;
      const r = __alItemRows.find(x => x.key == key);
      if (r) r.qty = parseInt(qtyEl.value, 10) || 0;
      refreshAllotSummary();
    }
  });
  container.addEventListener("click", e => {
    const del = e.target.closest(".alloc-row-del");
    if (del) removeAllotItemRow(Number(del.dataset.row));
  });
}

function openAllotModal() {
  $("#allotModalTitle").textContent = "Allot Items";
  $("#alSubmitBtn").textContent = "Allot Items";
  $("#alEditId").value = "";
  $("#alPerson").value = ""; $("#alRank").value = ""; $("#alBelt").value = ""; $("#alPosting").value = "";
  $("#alRemarks").value = "";
  ["alPerson", "alRank", "alBelt", "alPosting", "alDate", "alTime", "alRemarks"].forEach(id => { const el = $("#" + id); if (el) { el.disabled = false; el.style.opacity = ""; } });
  $("#alDate").value = todayStr();
  $("#alTime").value = nowTimeStr();
  const addBtn = $("#alAddItemRow");
  if (addBtn) addBtn.style.display = "";
  __alItemRows = [];
  const container = $("#alItems");
  if (container) container.innerHTML = "";
  bindAllotRowEvents();
  addAllotItemRow();
  refreshAllotSummary();
  openModal("#allotModal");
  setTimeout(() => $("#alPerson").focus(), 50);
}

function saveAllotment(e) {
  e.preventDefault();
  if (!canEdit()) return toast("You do not have permission to allot items.", "error");
  const editId = $("#alEditId").value;
  if (editId) { saveEditedAllotment(e, editId); return; }

  const name = $("#alPerson").value.trim();
  const rank = $("#alRank").value.trim();
  const belt = $("#alBelt").value.trim().toUpperCase();
  const posting = $("#alPosting").value.trim();
  const date = $("#alDate").value || todayStr();
  const time = $("#alTime").value || nowTimeStr();
  const remarks = $("#alRemarks").value.trim();
  if (!name || !rank || !belt || !posting) return toast("Fill all person details.", "error");

  const rows = __alItemRows.filter(r => r.itemId);
  if (!rows.length) return toast("Add at least one item with a quantity.", "error");
  for (const r of rows) {
    if (!r.qty || r.qty < 1) return toast("Enter a valid quantity for every row.", "error");
  }

  const items = getItems();
  for (const r of rows) {
    const item = items.find(i => i.id === r.itemId);
    if (!item) return toast("Item not found.", "error");
    if (r.qty > availableQty(item)) return toast(`Insufficient stock for "${item.name}". Only ${availableQty(item)} units available.`, "error");
  }

  let persons = getPersons();
  let person = persons.find(p => p.beltNo === belt);
  if (!person) {
    person = { id: uid(), name, rank, beltNo: belt, posting, districtId: activeDistrictId, locationId: (getVisibleLocationId() || (currentUser && currentUser.locationId) || null), createdAt: Date.now() };
    persons.push(person);
  }

  const allotments = getAllotments();
  const issueId = uid();
  const now = Date.now();
  rows.forEach(r => {
    const item = items.find(i => i.id === r.itemId);
    const qty = r.qty;
    item.allotted = (item.allotted || 0) + qty;
    itemHistoryPush(item, { type: "ALLOTMENT", qty: -qty, person: name, ref: belt, date, time, remarks: "Allotted " + qty + " " + (item.unit || "pcs") + " to " + name });
    const cat = getCategories().find(c => c.id === item.categoryId);
    allotments.unshift({
      id: uid(),
      issueId,
      personId: person.id,
      name, rank, beltNo: belt, posting,
      districtId: activeDistrictId,
      locationId: person.locationId || item.locationId,
      itemId: item.id, itemName: item.name, categoryId: item.categoryId, categoryName: cat ? cat.name : "",
      qtyAllotted: qty, qtyReturned: 0, status: "ALLOTTED",
      date, time, remarks,
      createdBy: currentUser ? (currentUser.name || currentUser.username) : "",
      createdAt: now, returns: []
    });
  });

  persistAlloc(items, allotments, persons);
  closeModals();
  __alItemRows = [];
  render();
  toast(`${rows.length} item(s) allotted to ${name}.`, "success");
}

function openEditAllotment(id) {
  const a = getAllotments().find(x => x.id === id);
  if (!a) return;
  $("#allotModalTitle").textContent = "Edit Allotment";
  $("#alSubmitBtn").textContent = "Update Quantity";
  $("#alEditId").value = a.id;
  $("#alPerson").value = a.name;
  $("#alRank").value = a.rank || "";
  $("#alBelt").value = a.beltNo || "";
  $("#alPosting").value = a.posting || "";
  $("#alDate").value = a.date || todayStr();
  $("#alTime").value = a.time || nowTimeStr();
  $("#alRemarks").value = a.remarks || "";
  ["alPerson", "alRank", "alBelt", "alPosting", "alDate", "alTime", "alRemarks"].forEach(id => { const el = $("#" + id); if (el) { el.disabled = true; el.style.opacity = "0.65"; } });
  const addBtn = $("#alAddItemRow");
  if (addBtn) addBtn.style.display = "none";
  __alItemRows = [];
  const container = $("#alItems");
  if (container) container.innerHTML = "";
  const rowKey = ++__alRowSeq;
  const r = { key: rowKey, itemId: a.itemId, qty: a.qtyAllotted };
  __alItemRows.push(r);
  container.insertAdjacentHTML("beforeend", `<div class="alloc-item-row" data-row="${rowKey}">
    <div class="form-group" style="flex:2.4"><label>Item (locked)</label><input type="text" class="al-row-itemname" data-row="${rowKey}" value="${esc(a.itemName)}" readonly /></div>
    <div class="form-group" style="flex:1.4"><label>Category (locked)</label><input type="text" class="al-row-cat" data-row="${rowKey}" value="${esc(a.categoryName || "")}" readonly /></div>
    <div class="form-group" style="flex:0.8"><label>Edit Quantity</label><input type="number" class="al-row-qty" data-row="${rowKey}" min="1" value="${a.qtyAllotted}" required /></div>
    <div class="stock-balance al-row-balance" data-row="${rowKey}"></div>
  </div>`);
  refreshAllotRowBalances();
  const note = $("#alItemsSummary");
  if (note) note.textContent = `Returned so far: ${a.qtyReturned || 0}. Only the quantity can be changed \u2014 all other fields are locked.`;
  openModal("#allotModal");
  setTimeout(() => { const q = document.querySelector(`.al-row-qty[data-row="${rowKey}"]`); if (q) q.focus(); }, 50);
}

function saveEditedAllotment(e, id) {
  const allotments = getAllotments();
  const a = allotments.find(x => x.id === id);
  if (!a) return;
  const first = __alItemRows.find(r => r.itemId === a.itemId) || __alItemRows[0];
  const qEl = first ? document.querySelector(`.al-row-qty[data-row="${first.key}"]`) : null;
  const newQty = qEl ? parseInt(qEl.value, 10) : 0;
  if (!newQty || newQty < 1) return toast("Enter a valid quantity.", "error");
  const returned = a.qtyReturned || 0;
  if (newQty < returned) return toast(`Quantity cannot be less than the already returned amount (${returned}).`, "error");

  const items = getItems();
  const item = items.find(i => i.id === a.itemId);
  if (!item) return toast("Item not found.", "error");
  const delta = newQty - (a.qtyAllotted || 0);
  if (delta > 0 && delta > availableQty(item)) return toast(`Insufficient stock. Only ${availableQty(item)} units are currently available.`, "error");

  a.qtyAllotted = newQty;
  item.allotted = Math.max(0, (item.allotted || 0) + delta);
  if (delta !== 0) itemHistoryPush(item, { type: "ADJUST", qty: -delta, person: a.name, ref: a.beltNo, date: a.date, time: a.time, remarks: "Allotment quantity changed by " + (delta > 0 ? "+" : "") + delta });
  a.status = allocStatusOf(a);
  persistAlloc(items, allotments, null);
  closeModals();
  __alItemRows = [];
  render();
  toast("Allotment updated.", "success");
}

/* ---- Return ---- */
let __returnAllotId = null;

function openReturnModal(id) {
  const a = getAllotments().find(x => x.id === id);
  if (!a) return;
  __returnAllotId = a.id;
  const rem = allocRemaining(a);
  $("#rtSummary").innerHTML = `<div class="return-summary-row"><span>Person:</span><b>${esc(a.name)} (BELT: ${esc(a.beltNo)})</b></div><div class="return-summary-row"><span>Item:</span><b>${esc(a.itemName)}</b></div><div class="return-summary-row"><span>Allotted:</span><b>${a.qtyAllotted}</b></div><div class="return-summary-row"><span>Remaining to return:</span><b style="color:var(--primary)">${rem}</b></div>`;
  $("#rtQty").value = rem;
  $("#rtQty").max = rem;
  if (rem <= 1) $("#rtQty").min = 1;
  $("#rtDate").value = todayStr();
  $("#rtTime").value = nowTimeStr();
  $("#rtCondition").value = "good";
  $("#rtRemarks").value = "";
  openModal("#returnModal");
}

function saveReturn(e) {
  e.preventDefault();
  if (!canEdit()) return toast("You do not have permission to process returns.", "error");
  const id = __returnAllotId;
  const qty = parseInt($("#rtQty").value, 10);
  const date = $("#rtDate").value || todayStr();
  const time = $("#rtTime").value || nowTimeStr();
  const condition = $("#rtCondition").value;
  const remarks = $("#rtRemarks").value.trim();
  if (!qty || qty < 1) return toast("Enter a valid return quantity.", "error");

  const allotments = getAllotments();
  const a = allotments.find(x => x.id === id);
  if (!a) return toast("Allotment not found.", "error");
  const rem = allocRemaining(a);
  if (qty > rem) return toast(`Return quantity cannot be more than the remaining allotted quantity (${rem}).`, "error");

  const items = getItems();
  const item = items.find(i => i.id === a.itemId);
  if (!item) return toast("Item not found.", "error");

  a.qtyReturned = (a.qtyReturned || 0) + qty;
  (a.returns || (a.returns = [])).push({ qty, date, time, condition, remarks, receivedBy: currentUser ? (currentUser.name || currentUser.username) : "", at: Date.now() });

  item.allotted = Math.max(0, (item.allotted || 0) - qty);
  if (condition === "damaged") item.damagedReturned = (item.damagedReturned || 0) + qty;
  else if (condition === "lost") item.lostReturned = (item.lostReturned || 0) + qty;

  const left = allocRemaining(a);
  if (left <= 0) {
    if (condition === "damaged") a.status = "DAMAGED";
    else if (condition === "lost") a.status = "LOST";
    else a.status = "RETURNED";
  } else {
    a.status = "PARTIALLY_RETURNED";
  }

  const typeMap = { good: "RETURN", other: "RETURN", damaged: "DAMAGE", lost: "LOSS" };
  itemHistoryPush(item, { type: typeMap[condition] || "RETURN", qty, person: a.name, ref: a.beltNo, date, time, remarks: (condition === "damaged" ? "Returned as damaged" : condition === "lost" ? "Reported lost" : "Returned in good condition") });

  persistAlloc(items, allotments, null);
  closeModals();
  render();
  toast("Item return recorded. Stock updated.", "success");
}

/* ---- Cancel allotment ---- */
function cancelAllotment(id) {
  const a = getAllotments().find(x => x.id === id);
  if (!a) return;
  if (!confirm(`Cancel this allotment to "${a.name}"? Remaining units (${allocRemaining(a)}) will be returned to stock.`)) return;
  const items = getItems();
  const item = items.find(i => i.id === a.itemId);
  const rem = allocRemaining(a);
  if (rem > 0 && item) item.allotted = Math.max(0, (item.allotted || 0) - rem);
  if (item) itemHistoryPush(item, { type: "CANCELLED", qty: rem, person: a.name, ref: a.beltNo, date: todayStr(), time: nowTimeStr(), remarks: "Allotment cancelled, stock restored" });
  (a.returns || (a.returns = [])).push({ qty: rem, date: todayStr(), time: nowTimeStr(), condition: "cancelled", remarks: "Allotment cancelled", receivedBy: currentUser ? (currentUser.name || currentUser.username) : "", at: Date.now() });
  a.status = "CANCELLED";
  a.statusNote = "Cancelled by " + (currentUser ? (currentUser.name || currentUser.username) : "");
  persistAlloc(items, getAllotments(), null);
  render();
  toast("Allotment cancelled. Stock restored.", "success");
}

/* ---- Adjust stock ---- */
function openAdjustStock(presetItemId) {
  const items = getItems().slice().sort((a, b) => a.name.localeCompare(b.name));
  const itemSel = $("#ajItem");
  itemSel.innerHTML = items.map(i => `<option value="${i.id}">${esc(i.name)} (Available: ${availableQty(i)})</option>`).join("");
  itemSel.value = presetItemId || "";
  $("#ajType").value = "add";
  $("#ajQtyGroup").classList.remove("hidden");
  $("#ajTotalGroup").classList.add("hidden");
  $("#ajQty").value = 1;
  $("#ajTotal").value = "";
  $("#ajRemarks").value = "";
  $("#ajDate").value = todayStr();
  $("#ajTime").value = nowTimeStr();
  openModal("#adjustModal");
}

function saveAdjust(e) {
  e.preventDefault();
  if (!canEdit()) return toast("You do not have permission to adjust stock.", "error");
  const itemId = $("#ajItem").value;
  const type = $("#ajType").value;
  const qty = parseInt($("#ajQty").value, 10);
  const total = parseInt($("#ajTotal").value, 10);
  const date = $("#ajDate").value || todayStr();
  const time = $("#ajTime").value || nowTimeStr();
  const remarks = $("#ajRemarks").value.trim();
  if (!itemId) return toast("Select an item.", "error");

  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return toast("Item not found.", "error");
  const held = (item.allotted || 0) + (item.damagedReturned || 0) + (item.lostReturned || 0);

  if (type === "correction") {
    if (!(total >= 0) || isNaN(total)) return toast("Enter the corrected total quantity.", "error");
    if (total < held) return toast(`Corrected total cannot be less than currently held units (allotted+damaged+lost = ${held}).`, "error");
    const delta = total - (item.quantity || 0);
    item.quantity = total;
    itemHistoryPush(item, { type: "ADJUST", qty: delta, person: "", ref: "", date, time, remarks: remarks || ("Stock correction (set to " + total + ")") });
    persistAlloc(items, getAllotments(), null);
    closeModals(); render();
    toast("Stock corrected to " + total + ".", "success");
    return;
  }

  if (!qty || qty < 1) return toast("Enter a valid quantity.", "error");
  if (type === "add") {
    item.quantity = (item.quantity || 0) + qty;
    itemHistoryPush(item, { type: "STOCK_IN", qty, person: "", ref: "", date, time, remarks: remarks || "Stock added" });
  } else if (type === "writeoff") {
    if (qty > availableQty(item)) return toast(`Cannot write off more than available quantity (${availableQty(item)}).`, "error");
    item.quantity = Math.max(0, (item.quantity || 0) - qty);
    itemHistoryPush(item, { type: "WRITEOFF", qty: -qty, person: "", ref: "", date, time, remarks: remarks || "Written off" });
  } else if (type === "damage") {
    if (qty > availableQty(item)) return toast(`Cannot mark more than available quantity (${availableQty(item)}) as damaged.`, "error");
    item.quantity = Math.max(0, (item.quantity || 0) - qty);
    item.damagedReturned = (item.damagedReturned || 0) + qty;
    itemHistoryPush(item, { type: "DAMAGE", qty, person: "", ref: "", date, time, remarks: remarks || "Marked damaged" });
  } else if (type === "loss") {
    if (qty > availableQty(item)) return toast(`Cannot mark more than available quantity (${availableQty(item)}) as lost.`, "error");
    item.quantity = Math.max(0, (item.quantity || 0) - qty);
    item.lostReturned = (item.lostReturned || 0) + qty;
    itemHistoryPush(item, { type: "LOSS", qty, person: "", ref: "", date, time, remarks: remarks || "Marked lost" });
  }
  persistAlloc(items, getAllotments(), null);
  closeModals();
  render();
  toast("Stock adjusted.", "success");
}

/* ---- Detail modals ---- */
function openAllocItemDetail(id) {
  const item = getItems().find(i => i.id === id);
  if (!item) return;
  const cat = getCategories().find(c => c.id === item.categoryId);
  $("#aidTitle").textContent = item.name;
  $("#aidSubtitle").textContent = (cat ? cat.name + " \u00b7 " : "") + "Total: " + (item.quantity || 0) + " | Available: " + availableQty(item) + " | Allotted: " + (item.allotted || 0) + " | Damaged: " + (item.damagedReturned || 0) + " | Lost: " + (item.lostReturned || 0);

  const active = getVisibleAllotments().filter(a => a.itemId === item.id && (allocStatusOf(a) === "ALLOTTED" || allocStatusOf(a) === "PARTIALLY_RETURNED"));
  const aBody = $("#aidAllottedBody");
  aBody.innerHTML = active.length
    ? active.map(a => `<tr><td>${esc(a.name)}</td><td>${esc(a.beltNo || "")}</td><td>${esc(a.posting || "")}</td><td class="qty-strong">${allocRemaining(a)}</td><td>${a.createdAt ? fmtDate(a.createdAt) : "&mdash;"}</td><td>${allocStatusBadge(allocStatusOf(a))}</td></tr>`).join("")
    : `<tr class="empty-row"><td colspan="6">No active allotments for this item.</td></tr>`;

  const hist = (item.history || []).slice().reverse();
  const hBody = $("#aidHistoryBody");
  hBody.innerHTML = hist.length
    ? hist.map(h => `<tr><td>${esc(h.date || (h.at ? fmtDate(h.at) : ""))}</td><td>${esc(h.type)}</td><td class="qty-strong" style="${h.qty < 0 ? "color:var(--red)" : "color:var(--green)"}">${h.qty > 0 ? "+" + h.qty : h.qty}</td><td>${esc(h.person || "")}</td><td>${esc(h.remarks || "")}</td><td>${esc(h.user || "")}</td></tr>`).join("")
    : `<tr class="empty-row"><td colspan="6">No transaction history.</td></tr>`;

  openModal("#allocItemDetailModal");
}

function openAllocPersonDetail(beltNo) {
  const p = getPersons().find(x => x.beltNo === beltNo);
  $("#apdTitle").textContent = (p ? p.name : "Person") + (p && p.rank ? " (" + p.rank + ")" : "");
  $("#apdSubtitle").textContent = "BELT No.: " + (beltNo || "") + (p && p.posting ? " \u00b7 " + p.posting : "");

  const mine = getVisibleAllotments().filter(a => (a.beltNo || "").toUpperCase() === String(beltNo).toUpperCase());
  const active = mine.filter(a => allocStatusOf(a) === "ALLOTTED" || allocStatusOf(a) === "PARTIALLY_RETURNED");
  const aBody = $("#apdAllottedBody");
  aBody.innerHTML = active.length
    ? active.map(a => `<tr><td class="item-name">${esc(a.itemName)}</td><td><span class="cat-badge">${esc(a.categoryName)}</span></td><td class="qty-strong">${allocRemaining(a)}</td><td>${a.createdAt ? fmtDate(a.createdAt) : "&mdash;"}</td><td>${allocStatusBadge(allocStatusOf(a))}</td></tr>`).join("")
    : `<tr class="empty-row"><td colspan="5">No active allotments.</td></tr>`;

  const done = mine.filter(a => allocStatusOf(a) !== "ALLOTTED" && allocStatusOf(a) !== "PARTIALLY_RETURNED");
  const condLabels = { good: "Good", damaged: "Damaged", lost: "Lost", other: "Other", cancelled: "Cancelled" };
  const rBody = $("#apdReturnedBody");
  rBody.innerHTML = done.length
    ? done.map(a => {
        const lastReturn = (a.returns && a.returns.length) ? a.returns[a.returns.length - 1] : null;
        const condTxt = lastReturn ? (condLabels[lastReturn.condition] || lastReturn.condition) : "&mdash;";
        const retDate = lastReturn ? (lastReturn.date || fmtDate(lastReturn.at)) : "&mdash;";
        return `<tr><td class="item-name">${esc(a.itemName)}</td><td class="qty-strong">${a.qtyReturned || 0}</td><td>${esc(condTxt)}</td><td>${a.createdAt ? fmtDate(a.createdAt) : "&mdash;"}</td><td>${esc(retDate)}</td><td>${allocStatusBadge(allocStatusOf(a))}</td></tr>`;
      }).join("")
    : `<tr class="empty-row"><td colspan="6">No settled allotments.</td></tr>`;

  openModal("#allocPersonDetailModal");
}

/* ---- Exports ---- */
function __allocStockExportData() {
  const cats = getCategories();
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  const rows = __allocStockFiltered().map(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const st = allocStatusOfItem(i);
    return [i.name, cat ? cat.name : "", i.quantity || 0, availableQty(i), i.allotted || 0, (i.damagedReturned || 0) + (i.lostReturned || 0), st.label];
  });
  const ttotal = rows.reduce((a, r) => a + (r[2] || 0), 0);
  const tavail = rows.reduce((a, r) => a + (r[3] || 0), 0);
  const tallot = rows.reduce((a, r) => a + (r[4] || 0), 0);
  const tother = rows.reduce((a, r) => a + (r[5] || 0), 0);
  rows.push(["Total", "", ttotal, tavail, tallot, tother, ""]);
  return { title: "Allotments \u2014 Item Stock Report", subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString(), cols: ["Item Name", "Category", "Total Qty", "Available", "Allotted", "Damaged/Lost", "Status"], rows, fileName: "allotment-item-stock" };
}

function __allocListExportData() {
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  const rows = __allocListFiltered().map(a => {
    const st = allocStatusOf(a);
    const labelMap = { ALLOTTED: "Allotted", PARTIALLY_RETURNED: "Partially Returned", RETURNED: "Returned", DAMAGED: "Damaged", LOST: "Lost", CANCELLED: "Cancelled" };
    return [a.name, a.rank || "", a.beltNo || "", a.posting || "", a.itemName || "", a.categoryName || "", allocRemaining(a), a.date || "", a.time || "", labelMap[st] || st];
  });
  return { title: "Allotment Register", subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString(), cols: ["Name", "Post/Rank", "BELT No.", "Posting", "Item", "Category", "Qty (Remaining)", "Date", "Time", "Status"], rows, fileName: "allotment-register" };
}

function __allocReturnsExportData() {
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  const condLabels = { good: "Good", damaged: "Damaged", lost: "Lost", other: "Other" };
  const rows = __allocReturns().map(({ a, r }) => [a.name, a.beltNo || "", a.itemName || "", r.qty, condLabels[r.condition] || r.condition, r.date || "", r.time || "", r.receivedBy || "", r.remarks || ""]);
  return { title: "Return History Report", subtitle: (dist ? dist.name + " \u00b7 " : "") + "Generated " + new Date().toLocaleString(), cols: ["Person", "BELT No.", "Item", "Qty Returned", "Condition", "Return Date", "Return Time", "Received By", "Remarks"], rows, fileName: "return-history" };
}

function printAllocStock() { printReport(__allocStockExportData()); }
function exportAllocStockPDF() { pdfReport(__allocStockExportData()); toast("PDF exported.", "success"); }
function exportAllocStockExcel() { excelReport(__allocStockExportData()); toast("Excel exported.", "success"); }
function exportAllocStockWord() { wordReport(__allocStockExportData()); toast("Word document exported.", "success"); }

function printAllocList() { printReport(__allocListExportData()); }
function exportAllocListPDF() { pdfReport(__allocListExportData()); toast("PDF exported.", "success"); }
function exportAllocListExcel() { excelReport(__allocListExportData()); toast("Excel exported.", "success"); }
function exportAllocListWord() { wordReport(__allocListExportData()); toast("Word document exported.", "success"); }

function printAllocReturns() { printReport(__allocReturnsExportData()); }
function exportAllocReturnsPDF() { pdfReport(__allocReturnsExportData()); toast("PDF exported.", "success"); }
function exportAllocReturnsExcel() { excelReport(__allocReturnsExportData()); toast("Excel exported.", "success"); }
function exportAllocReturnsWord() { wordReport(__allocReturnsExportData()); toast("Word document exported.", "success"); }

/* ==================== SCAN & IMPORT (OCR) ==================== */
let __scanFile = null;      // { file, dataUrl, name, type }
let __scanText = "";
let __scanPeople = [];      // reviewed people { key, name, rank, belt, posting, rows: [{key, itemId, qty}] }
let __scanRowSeq = 0;
let __scanPersonSeq = 0;

function getScans() { return loadData("scans") || []; }
function saveScans(scans) { saveData("scans", scans); }

function __scanLibs() {
  return !!(window.Tesseract && window.pdfjsLib && window.mammoth && window.XLSX);
}

function __scanShow(step) {
  ["scanStepInput", "scanStepProgress", "scanStepReview"].forEach(id => $("#" + id).classList.toggle("hidden", id !== "scanStep" + step));
}

function __scanProgress(text) {
  const el = $("#scanProgressText");
  if (el) el.textContent = text;
}

function openScanModal() {
  __scanFile = null; __scanText = ""; __scanPeople = []; __scanRowSeq = 0; __scanPersonSeq = 0;
  const container = $("#scanPeople");
  if (container) container.innerHTML = "";
  const input = $("#scanFileInput");
  if (input) input.value = "";
  $("#scanChosenFile").classList.add("hidden");
  $("#scanExtractBtn").disabled = true;
  __scanShow("Input");
  openModal("#scanModal");
}

function __scanFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function bindScanEvents() {
  const zone = $("#scanDropZone");
  const input = $("#scanFileInput");
  if (!zone || !input) return;
  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("scan-drop-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("scan-drop-over"));
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("scan-drop-over");
    if (e.dataTransfer.files && e.dataTransfer.files.length) __scanPickFile(e.dataTransfer.files[0]);
  });
  input.addEventListener("change", () => { if (input.files && input.files.length) __scanPickFile(input.files[0]); });
  $("#scanFileClear")?.addEventListener("click", () => {
    __scanFile = null;
    input.value = "";
    $("#scanChosenFile").classList.add("hidden");
    $("#scanExtractBtn").disabled = true;
  });
  $("#scanExtractBtn")?.addEventListener("click", scanExtract);
  $("#scanRescanBtn")?.addEventListener("click", openScanModal);
  $("#scanCommitBtn")?.addEventListener("click", scanCommit);
  $("#scanAddPersonBtn")?.addEventListener("click", () => {
    __scanPersonSeq++;
    const p = { key: __scanPersonSeq, name: "", rank: "", belt: "", posting: "", rows: [] };
    __scanPeople.push(p);
    __renderScanPerson(p, true);
    addScanItemRow(p.key, "", 1);
  });

  const container = $("#scanPeople");
  if (container && !container.dataset.bound) {
    container.dataset.bound = "1";
    container.addEventListener("change", e => {
      const sel = e.target.closest(".sc-row-items");
      const qtyEl = e.target.closest(".sc-row-qty");
      if (sel) {
        const row = __scanFindRow(sel.dataset.srow);
        if (row) {
          row.itemId = sel.value || "";
          const it = row.itemId ? getItems().find(i => i.id === row.itemId) : null;
          const cat = it ? (getCategories().find(c => c.id === it.categoryId) || {}) : {};
          const inp = container.querySelector(`.sc-row-cat[data-srow="${sel.dataset.srow}"]`);
          if (inp) inp.value = it ? (cat.name || "") : "";
          if (!it) row.qty = 1;
          __scanRefreshSummary();
        }
      } else if (qtyEl) {
        const row = __scanFindRow(qtyEl.dataset.srow);
        if (row) {
          row.qty = parseInt(qtyEl.value, 10) || 0;
          __scanRefreshSummary();
        }
      }
    });
    container.addEventListener("click", e => {
      const del = e.target.closest(".sc-row-del");
      if (del) {
        const key = Number(del.dataset.srow);
        const el = container.querySelector(`.alloc-item-row[data-srow="${key}"]`);
        if (el) el.remove();
        __scanPeople.forEach(p => { p.rows = p.rows.filter(r => r.key !== key); });
        __scanRefreshSummary();
        return;
      }
      const pdel = e.target.closest(".scp-del");
      if (pdel) {
        const pkey = Number(pdel.dataset.sperson);
        const block = container.querySelector(`.scan-person[data-sperson="${pkey}"]`);
        if (block) block.remove();
        __scanPeople = __scanPeople.filter(p => p.key !== pkey);
        __scanRefreshSummary();
        return;
      }
      const addItem = e.target.closest(".scp-add-item");
      if (addItem) {
        const pkey = Number(addItem.dataset.sperson);
        addScanItemRow(pkey, "", 1);
      }
    });
  }
}

function __scanFindRow(rowKey) {
  rowKey = Number(rowKey);
  for (const p of __scanPeople) {
    const r = p.rows.find(x => x.key === rowKey);
    if (r) return r;
  }
  return null;
}

function __scanRefreshSummary() {
  const sum = $("#scItemsSummary");
  if (!sum) return;
  const valid = __scanPeople.reduce((a, p) => a.concat(p.rows.filter(r => r.itemId)), []);
  const total = valid.reduce((s, r) => s + (r.qty > 0 ? r.qty : 0), 0);
  const people = __scanPeople.filter(p => p.rows.some(r => r.itemId)).length;
  sum.textContent = `${valid.length} item(s) \u00b7 total quantity ${total} \u00b7 ${people} person(s)`;
}

async function __scanPickFile(file) {
  const name = (file.name || "").toLowerCase();
  const okExt = /\.(png|jpe?g|webp|bmp|pdf|docx|xlsx|xls|csv|txt)$/.test(name) || file.type.startsWith("image/") || file.type === "application/pdf";
  if (!okExt) return toast("Unsupported file type. Use JPG/PNG/PDF/DOCX/XLSX/TXT/CSV.", "error");
  try {
    const dataUrl = await __scanFileToDataUrl(file);
    __scanFile = { file, dataUrl, name: file.name, type: file.type };
    $("#scanFileName").textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    $("#scanChosenFile").classList.remove("hidden");
    $("#scanExtractBtn").disabled = false;
  } catch (e) {
    toast("Could not read the file.", "error");
  }
}

async function scanExtract() {
  if (!__scanFile) return;
  if (!__scanLibs()) return toast("OCR libraries are still loading. Try again in a few seconds.", "error");
  try {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    __scanShow("Progress");
    __scanProgress("Preparing document\u2026");
    const text = await __scanExtractText(__scanFile.file);
    if (!text || !text.trim()) throw new Error("No readable text found in this document.");
    __scanText = text.trim();
    const parsed = __scanParsePeople(__scanText);
    __scanRenderReview(parsed);
  } catch (e) {
    console.error(e);
    __scanShow("Input");
    toast(e.message || "Scan failed. Try a clearer image or a different format.", "error");
  }
}

async function __scanExtractText(file) {
  const name = (file.name || "").toLowerCase();
  if (/\.(png|jpe?g|webp|bmp)$/.test(name) || file.type.startsWith("image/")) return await __ocrImage(file);
  if (/\.pdf$/.test(name) || file.type === "application/pdf") return await __ocrPdf(file);
  if (/\.docx$/.test(name)) {
    if (!window.mammoth) throw new Error("Word reader not loaded.");
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return r.value || "";
  }
  if (/\.(xlsx|xls)$/.test(name)) {
    if (!window.XLSX) throw new Error("Excel reader not loaded.");
    const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const lines = [];
    wb.SheetNames.forEach(sn => {
      lines.push(`--- Sheet: ${sn} ---`);
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
      (rows || []).forEach(r => lines.push((r || []).map(c => c == null ? "" : String(c)).join("\t")));
    });
    return lines.join("\n");
  }
  return await file.text();
}

function __scanPreprocessImage(dataUrl, binarize) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
        const MAX = 2600, MIN = 700;
        let scale = 1;
        if (Math.min(w, h) < MIN) scale = Math.max(scale, MIN / Math.min(w, h));
        if (Math.max(w, h) > MAX) scale = Math.min(scale, MAX / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale)); h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        let min = 255, max = 0;
        for (let i = 0; i < d.length; i += 4) {
          const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i] = d[i + 1] = d[i + 2] = g;
          if (g < min) min = g;
          if (g > max) max = g;
        }
        const range = (max - min) || 1;
        for (let i = 0; i < d.length; i += 4) {
          let g = (d[i] - min) * (255 / range);
          if (binarize) g = g < 110 ? 0 : 255;
          d[i] = d[i + 1] = d[i + 2] = g;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = dataUrl;
  });
}

async function __ocrImage(file) {
  if (!window.Tesseract) throw new Error("OCR engine not loaded.");
  __scanProgress("Preparing image\u2026");
  const dataUrl = await __scanFileToDataUrl(file);
  const [prepBin, prepGray] = await Promise.all([
    __scanPreprocessImage(dataUrl, true),
    __scanPreprocessImage(dataUrl, false)
  ]);
  __scanProgress("Downloading OCR model (first time only)\u2026");
  let bestBin = "";
  for (const psm of [6, 4]) {
    bestBin = await __scanOcrPass(prepBin, psm, "binary").then(t => t.length > bestBin.length ? t : bestBin).catch(e => { console.error("OCR pass " + psm + " failed:", e); return bestBin; });
  }
  if (bestBin.trim().length >= 5) {
    __scanProgress("");
    return bestBin;
  }
  let bestGray = "";
  for (const psm of [6, 4]) {
    bestGray = await __scanOcrPass(prepGray, psm, "soft").then(t => t.length > bestGray.length ? t : bestGray).catch(e => { console.error("OCR pass " + psm + " failed:", e); return bestGray; });
  }
  __scanProgress("");
  return bestGray;
}

async function __scanOcrPass(image, psm, label) {
  let worker = null;
  try {
    worker = await Tesseract.createWorker("eng", 1, {
      logger: m => { if (m && m.status === "recognizing text") __scanProgress("Reading image (" + label + ") \u2026 " + Math.round((m.progress || 0) * 100) + "%"); }
    });
    await worker.setParameters({ tessedit_pageseg_mode: String(psm), preserve_interword_spaces: "1" });
    const res = await worker.recognize(image);
    return (res && res.data && res.data.text ? res.data.text : "").trim();
  } finally {
    try { if (worker) await worker.terminate(); } catch (e) {}
  }
}

async function __ocrPdf(file) {
  if (!window.pdfjsLib) throw new Error("PDF reader not loaded.");
  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch (e) {
    throw new Error("Could not parse this PDF.");
  }
  const maxPages = Math.min(pdf.numPages, 20);
  let out = "";
  let ocrPage = null;
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    __scanProgress(`Reading PDF page ${i}/${maxPages}\u2026`);
    const tc = await page.getTextContent();
    const t = (tc.items || []).map(x => x.str).join(" ").trim();
    if (t.length > 0) {
      out += `\n[page ${i}]\n${t}`;
    } else {
      ocrPage = page;
    }
  }
  if (out.trim().length < 40 && ocrPage && window.Tesseract) {
    __scanProgress("Scanned PDF detected \u2014 OCR page 1\u2026");
    const vp = ocrPage.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width; canvas.height = vp.height;
    const ctx = canvas.getContext("2d");
    await ocrPage.render({ canvasContext: ctx, viewport: vp }).promise;
    const prep = await __scanPreprocessImage(canvas.toDataURL("image/jpeg", 0.85), true);
    let worker = null;
    try {
      worker = await Tesseract.createWorker("eng", 1, { logger: m => { if (m && m.status === "recognizing text") __scanProgress("Reading scanned page \u2026 " + Math.round((m.progress || 0) * 100) + "%"); } });
      await worker.setParameters({ tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" });
      const res = await worker.recognize(prep);
      out += `\n[scanned page]\n${res.data.text || ""}`;
    } catch (e) { console.error("PDF page OCR failed:", e); }
    finally { try { if (worker) await worker.terminate(); } catch (e) {} }
  }
  __scanProgress("");
  return out;
}

const __SCAN_RANKS = ["HEAD CONSTABLE", "SUB INSPECTOR", "SUB-INSPECTOR", "INSPECTOR", "CONSTABLE", "ASSISTANT SUB INSPECTOR", "HOME GUARD", "DRIVER", "CHAUKIDAR", "ASI", "SHO", "DSP", "ASP", "HC", "SI"];

function __scanNorm(s) { return (s || "").trim().toLowerCase().replace(/\s+/g, " "); }

function __scanCellBelt(c) {
  c = String(c || "").trim();
  if (!c) return "";
  if (/^[0-9]{1,3}\s*\/\s*[A-Z0-9]{1,10}$/i.test(c) && /\d/.test(c)) return c.replace(/\s+/g, "").toUpperCase();
  if (/^[A-Z]{1,6}[-\/]?[0-9]{2,10}$/i.test(c) && /\d/.test(c)) return c.replace(/\s+/g, "").toUpperCase();
  if (/^[0-9]{2,10}(\.[0-9]{1,5})?$/i.test(c)) return c.replace(/\s+/g, "").toUpperCase();
  return "";
}

function __scanCellRank(c) {
  const n = __scanNorm(c);
  if (!n) return "";
  for (const rk of __SCAN_RANKS) if (n === rk.toLowerCase()) return rk;
  for (const rk of __SCAN_RANKS) if (rk.split(/[- ]/).length > 1 && n.startsWith(rk.toLowerCase())) return rk;
  return "";
}

function __scanCellCategory(c) {
  const n = __scanNorm(c);
  if (!n || n.length < 2) return "";
  const cats = getCategories().filter(Boolean);
  const hit = cats.find(ca => __scanNorm(ca.name) === n) || cats.find(ca => __scanNorm(ca.name).startsWith(n)) || cats.find(ca => n.startsWith(__scanNorm(ca.name)));
  return hit ? hit.id : "";
}

function __scanCellItem(c) {
  const n = __scanNorm(c);
  if (!n || n.length < 2) return "";
  const list = getItems().filter(Boolean);
  const hit = list.find(it => __scanNorm(it.name) === n) || list.find(it => __scanNorm(it.name).startsWith(n)) ||
    list.find(it => n.startsWith(__scanNorm(it.name))) || list.find(it => n.includes(__scanNorm(it.name)));
  return hit ? hit.id : "";
}

function __scanEditDist(a, b) {
  a = String(a || ""); b = String(b || "");
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const cur = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return dp[n];
}

function __scanFuzzyRankIn(line) {
  const lower = line.toLowerCase();
  let best = { rank: "", pos: -1, len: 0, score: -1 };
  for (const rk of __SCAN_RANKS) {
    const p = lower.indexOf(rk.toLowerCase());
    if (p >= 0 && (best.pos < 0 || p < best.pos)) best = { rank: rk, pos: p, len: rk.length, score: 100 };
  }
  if (best.rank) return best;
  const words = line.split(/\s+/).filter(Boolean).map(w => w.replace(/[^a-zA-Z0-9]/g, ""));
  let off = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const pos = line.indexOf(words[wi], off);
    off = pos + 1;
    for (const rk of __SCAN_RANKS) {
      const rw = rk.toLowerCase().split(/[- ]/).filter(Boolean);
      const W = (words[wi] || "").toLowerCase();
      let matched = 0;
      for (const w of rw) {
        if (W === w || (w.length >= 3 && Math.abs(W.length - w.length) <= 1 && __scanEditDist(W, w) <= 1)) matched++;
      }
      if (matched) {
        const score = (matched === rw.length ? 2 : 1) + matched;
        if (score > best.score) best = { rank: rk, pos, len: rk.length, score };
        else if (score === best.score && pos >= 0 && best.pos >= 0 && pos < best.pos) best = { rank: rk, pos, len: rk.length, score };
      }
    }
  }
  return best;
}

function __scanFuzzyLine(raw) {
  const s = raw.replace(/^\s*\d+[.)\-]?\s*/, "").trim();
  if (!s) return null;
  const rm = __scanFuzzyRankIn(s);
  const name = rm.pos > 0 ? s.slice(0, rm.pos).trim() : "";
  const tail = rm.pos >= 0 ? s.slice(rm.pos + rm.len).trim() : s;
  let belt = "";
  const bm = tail.match(/\b(\d{1,3}\s*[\/.)\-]\s*[A-Z0-9]{1,10})\b/i) || tail.match(/\b([A-Z]{1,5}-?\d{2,10})\b/i) || tail.match(/\b(\d{2,10})\b/i);
  if (bm) belt = bm[1].replace(/\s+/g, "").toUpperCase();
  const itemsList = getItems().filter(Boolean).map(it => ({ it, n: __scanNorm(it.name) })).sort((a, b) => b.n.length - a.n.length);
  let itemId = "", qty = -1;
  const lower = s.toLowerCase();
  for (const { it, n } of itemsList) {
    const p = lower.indexOf(n);
    if (p < 0) continue;
    itemId = it.id;
    const rest = s.slice(p + it.name.length).trim();
    const qm = rest.match(/^\s*[^A-Za-z]*(\d{1,6})/) || rest.match(/\b(\d{1,6})\b/);
    qty = qm ? parseInt(qm[1], 10) : -1;
    break;
  }
  if (!name && !itemId && !belt) return null;
  return { name, rank: rm.rank, belt, posting: "", items: itemId ? [{ itemId, categoryId: getItems().find(i => i.id === itemId).categoryId, qty: qty > 0 ? qty : 1 }] : [] };
}

function __scanParsePeople(text) {
  const people = [];
  const lines = (text || "").split(/\r?\n/).map(l => l.replace(/\t+/g, ", ").trim()).filter(Boolean);
  for (const raw of lines) {
    if (/^(NEW ALLOTTED|DATE|SR\.? ?NO|PERSON NAME|S\.? ?NO|NAME)|^[A-Z\s]{0,20}DETAILS/i.test(raw)) continue;
    let cells = raw.split(",").map(c => c.trim()).filter(Boolean).map(c => c.replace(/\s{2,}/g, " "));
    if (cells.length < 3) {
      const f = __scanFuzzyLine(raw);
      if (!f) continue;
      const dup = people.find(p => __scanNorm(p.name) === __scanNorm(f.name) && p.belt === f.belt);
      if (dup) {
        f.items.forEach(fi => {
          const ex = dup.items.find(r => r.itemId === fi.itemId);
          if (ex) ex.qty += fi.qty; else dup.items.push(fi);
        });
      } else people.push(f);
      continue;
    }
    if (/^\d+[.)\-]?\s*$/.test(cells[0])) cells = cells.slice(1);
    cells[0] = cells[0].replace(/^\d+[.)\-]?\s*/, "");

    const entry = { name: "", rank: "", belt: "", posting: "", items: [] };
    const used = cells.map(() => false);
    const firstUnused = () => { const i = used.findIndex(u => !u); return i; };

    let qty = -1;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (/^\d{1,6}$/.test(cells[i])) { qty = parseInt(cells[i], 10); used[i] = true; break; }
    }

    for (let i = 0; i < cells.length; i++) {
      if (used[i]) continue;
      const b = __scanCellBelt(cells[i]);
      if (b) { entry.belt = b; used[i] = true; break; }
    }

    for (let i = 0; i < cells.length; i++) {
      if (used[i]) continue;
      const rk = __scanCellRank(cells[i]);
      if (rk) { entry.rank = rk; used[i] = true; break; }
    }

    let catId = "";
    const firstIdx = firstUnused();
    for (let i = 0; i < cells.length; i++) {
      if (used[i] || i === firstIdx) continue;
      const c = __scanCellCategory(cells[i]);
      if (c) { catId = c; used[i] = true; break; }
    }

    let itemId = "";
    const firstIdx2 = firstUnused();
    for (let i = 0; i < cells.length; i++) {
      if (used[i] || i === firstIdx2) continue;
      const it = __scanCellItem(cells[i]);
      if (it) { itemId = it; used[i] = true; break; }
    }

    const nameIdx = firstUnused();
    if (nameIdx >= 0) {
      entry.name = cells[nameIdx].replace(/^[\d.)\-]+\s*/, "");
      used[nameIdx] = true;
    }
    const postIdx = firstUnused();
    if (postIdx >= 0) entry.posting = cells[postIdx];

    if (entry.name && (entry.belt || entry.rank || itemId)) {
      if (itemId) {
        const it = getItems().find(i => i.id === itemId);
        entry.items.push({ itemId, categoryId: it ? it.categoryId : (catId || ""), qty: qty > 0 ? qty : 1 });
      }
      const dup = people.find(p => __scanNorm(p.name) === __scanNorm(entry.name) && p.belt === entry.belt);
      if (dup) {
        const ex = dup.items.find(r => r.itemId === entry.items[0] && entry.items[0]);
        if (ex) {
          if (entry.items.length && ex) ex.qty += entry.items[0].qty;
        } else if (entry.items.length) dup.items.push(entry.items[0]);
      } else {
        people.push(entry);
      }
    }
  }
  return people;
}

function addScanItemRow(personKey, itemId, qty) {
  const block = document.querySelector(`.scan-person[data-sperson="${personKey}"]`);
  if (!block) return;
  const key = ++__scanRowSeq;
  const p = __scanPeople.find(x => x.key === personKey);
  const r = { key, itemId: itemId || "", qty: qty && qty > 0 ? qty : 1 };
  if (p) p.rows.push(r);
  const it = r.itemId ? getItems().find(i => i.id === r.itemId) : null;
  const cat = it ? (getCategories().find(c => c.id === it.categoryId) || {}) : {};
  const box = block.querySelector(".alloc-items");
  if (!box) return;
  box.insertAdjacentHTML("beforeend", `<div class="alloc-item-row" data-srow="${key}">
    <div class="form-group" style="flex:2.4">
      <label>Item</label>
      <select class="sc-row-items" data-srow="${key}" required></select>
    </div>
    <div class="form-group" style="flex:1.4">
      <label>Category</label>
      <input type="text" class="sc-row-cat" data-srow="${key}" value="${esc(cat.name || "")}" readonly placeholder="Auto" />
    </div>
    <div class="form-group" style="flex:0.8">
      <label>Qty</label>
      <input type="number" class="sc-row-qty" data-srow="${key}" min="1" value="${r.qty}" required />
    </div>
    <div class="alloc-row-del" data-srow="${key}" title="Remove item">&times;</div>
  </div>`);
  const sel = box.querySelector(`.sc-row-items[data-srow="${key}"]`);
  if (sel) {
    sel.innerHTML = `<option value="">Select item</option>` + getItems().map(i => `<option value="${i.id}" ${i.id === r.itemId ? "selected" : ""}>${esc(i.name)} (Avail: ${availableQty(i)})</option>`).join("");
  }
  __scanRefreshSummary();
}

function __renderScanPerson(p) {
  const container = $("#scanPeople");
  if (!container) return;
  const n = __scanPeople.indexOf(p) + 1;
  const block = container.querySelector(`.scan-person[data-sperson="${p.key}"]`);
  const html = `<div class="scan-person" data-sperson="${p.key}">
    <div class="scan-person-head">
      <h4 class="modal-sec-title">Person ${n}</h4>
      <button type="button" class="scp-del" data-sperson="${p.key}" title="Remove person">&times;</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Person Name</label><input type="text" class="scp-name" data-sperson="${p.key}" value="${esc(p.name)}" placeholder="Auto-extracted or type"></div>
      <div class="form-group"><label>Post / Rank</label><input type="text" class="scp-rank" data-sperson="${p.key}" value="${esc(p.rank)}" placeholder="e.g. HC"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>BELT Number</label><input type="text" class="scp-belt" data-sperson="${p.key}" value="${esc(p.belt)}" placeholder="e.g. BRLT12345"></div>
      <div class="form-group"><label>Posting</label><input type="text" class="scp-posting" data-sperson="${p.key}" value="${esc(p.posting)}" placeholder="e.g. PS DLF Phase 3"></div>
    </div>
    <div class="alloc-items"></div>
    <div class="alloc-items-actions">
      <button type="button" class="btn btn-sm btn-outline scp-add-item" data-sperson="${p.key}">+ Add Item</button>
    </div>
  </div>`;
  if (block) block.outerHTML = html; else container.insertAdjacentHTML("beforeend", html);
}

function __scanRenderReview(people) {
  const container = $("#scanPeople");
  if (container) container.innerHTML = "";
  __scanPeople = [];
  __scanPersonSeq = 0;
  __scanRowSeq = 0;
  const list = (Array.isArray(people) && people.length) ? people : [{}];
  list.forEach(pt => {
    __scanPersonSeq++;
    const p = { key: __scanPersonSeq, name: pt.name || "", rank: pt.rank || "", belt: pt.belt || "", posting: pt.posting || "", rows: [] };
    __scanPeople.push(p);
    __renderScanPerson(p);
    (pt.items && pt.items.length ? pt.items : [{ itemId: "", qty: 1 }]).forEach(it => addScanItemRow(p.key, it.itemId, it.qty));
  });
  $("#scanRawText").textContent = __scanText;
  __scanShow("Review");
  __scanRefreshSummary();
}

async function scanCommit() {
  if (!canEdit()) return toast("You do not have permission to import allotments.", "error");
  if (!__scanPeople.length) return toast("Add at least one person.", "error");

  const items = getItems();
  const entries = [];
  for (const p of __scanPeople) {
    const block = document.querySelector(`.scan-person[data-sperson="${p.key}"]`);
    if (!block) continue;
    const name = (block.querySelector(".scp-name")?.value || "").trim();
    const rank = (block.querySelector(".scp-rank")?.value || "").trim();
    const belt = (block.querySelector(".scp-belt")?.value || "").trim().toUpperCase();
    const posting = (block.querySelector(".scp-posting")?.value || "").trim();
    if (!name || !rank || !belt || !posting) return toast("Fill all person details in every person card before inserting.", "error");
    const rows = [];
    block.querySelectorAll(".alloc-item-row").forEach(rowEl => {
      const sel = rowEl.querySelector(".sc-row-items");
      if (!sel || !sel.value) return;
      const qtyEl = rowEl.querySelector(".sc-row-qty");
      rows.push({ itemId: sel.value, qty: qtyEl ? (parseInt(qtyEl.value, 10) || 0) : 0 });
    });
    if (!rows.length) return toast(`Add at least one item with a quantity for ${name}.`, "error");
    for (const r of rows) {
      if (!r.qty || r.qty < 1) return toast("Enter a valid quantity for every item.", "error");
      const item = items.find(i => i.id === r.itemId);
      if (!item) return toast("Item not found.", "error");
      if (r.qty > availableQty(item)) return toast(`Insufficient stock for "${item.name}" (${name}). Only ${availableQty(item)} units available.`, "error");
    }
    entries.push({ name, rank, belt, posting, rows });
  }

  let persons = getPersons();
  const allotments = getAllotments();
  const now = Date.now();
  const reviewedItems = [];
  let totalItems = 0;

  entries.forEach(en => {
    let person = persons.find(x => x.beltNo === en.belt);
    if (!person) {
      person = { id: uid(), name: en.name, rank: en.rank, beltNo: en.belt, posting: en.posting, districtId: activeDistrictId, locationId: (getVisibleLocationId() || (currentUser && currentUser.locationId) || null), createdAt: now };
      persons.push(person);
    }
    const issueId = uid();
    en.rows.forEach(r => {
      totalItems += r.qty;
      const item = items.find(i => i.id === r.itemId);
      item.allotted = (item.allotted || 0) + r.qty;
      itemHistoryPush(item, { type: "ALLOTMENT", qty: -r.qty, person: en.name, ref: en.belt, date: todayStr(), time: nowTimeStr(), remarks: "Imported via scanned document (" + r.qty + " " + (item.unit || "pcs") + ")" });
      const cat = getCategories().find(c => c.id === item.categoryId);
      allotments.unshift({
        id: uid(),
        issueId,
        personId: person.id,
        name: en.name, rank: en.rank, beltNo: en.belt, posting: en.posting,
        districtId: activeDistrictId,
        locationId: person.locationId || item.locationId,
        itemId: item.id, itemName: item.name, categoryId: item.categoryId, categoryName: cat ? cat.name : "",
        qtyAllotted: r.qty, qtyReturned: 0, status: "ALLOTTED",
        date: todayStr(), time: nowTimeStr(),
        remarks: "Imported from scanned document",
        createdBy: currentUser ? (currentUser.name || currentUser.username) : "",
        createdAt: now, returns: []
      });
      reviewedItems.push({ itemId: item.id, itemName: item.name, qty: r.qty });
    });
  });

  persistAlloc(items, allotments, persons);

  const scanId = uid();
  const rec = {
    id: scanId,
    fileName: __scanFile ? __scanFile.name : "",
    mime: __scanFile ? __scanFile.type : "",
    size: __scanFile ? __scanFile.file.size : 0,
    text: __scanText,
    person: entries.length ? { name: entries[0].name, rank: entries[0].rank, beltNo: entries[0].belt, posting: entries[0].posting } : null,
    peopleCount: entries.length,
    items: reviewedItems,
    status: "VERIFIED",
    verifiedBy: currentUser ? (currentUser.name || currentUser.username) : "",
    createdAt: now, verifiedAt: Date.now()
  };
  const scans = getScans();
  scans.unshift(rec);
  saveScans(scans);

  if (__scanFile && __scanFile.dataUrl) {
    try {
      await __api("POST", "scanfile", { id: scanId, dataUrl: __scanFile.dataUrl });
      rec.fileSaved = true;
      const s2 = getScans(); const si = s2.findIndex(x => x.id === scanId); if (si >= 0) { s2[si].fileSaved = true; saveScans(s2); }
    } catch (e2) { console.error("scan file save failed:", e2); }
  }

  closeModals();
  __scanFile = null; __scanText = ""; __scanPeople = [];
  render();
  toast(`${reviewedItems.length} item(s) for ${entries.length} person(s) verified and inserted. Document saved to the scanned records.`, "success");
}

/* ---- Scan history ---- */
function openScanHistory() {
  renderScanHistory();
  openModal("#scanHistoryModal");
}

function renderScanHistory() {
  const body = $("#scanHistoryBody");
  if (!body) return;
  const scans = getScans();
  if (!scans.length) { body.innerHTML = `<tr class="empty-row"><td colspan="7">No scanned documents yet.</td></tr>`; return; }
  const fmt = s => (s.mime || "").includes("pdf") ? "PDF" : (s.mime || "").includes("sheet") ? "Excel" : (s.mime || "").includes("word") ? "Word" : (s.mime || "").includes("image") ? "Image" : "Other";
  body.innerHTML = scans.slice(0, 100).map(s => {
    const d = new Date(s.createdAt || Date.now());
    const dl = window.CONFIG && window.CONFIG.useRemote ? "View" : (s.text ? "Text" : "View");
    return `<tr>
      <td class="item-name">${esc(s.fileName || "Untitled")}</td>
      <td><span class="status-badge status-neutral">${fmt(s)}</span></td>
      <td>${esc(s.person && s.person.name ? s.person.name : "")} <span class="muted">(${esc(s.person && s.person.beltNo ? s.person.beltNo : "-")})</span>${(s.peopleCount > 1) ? ` <span class="muted">+${s.peopleCount - 1} more</span>` : ""}</td>
      <td class="qty-strong">${(s.items || []).length}</td>
      <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
      <td>${esc(s.verifiedBy || "-")}</td>
      <td class="actions-cell"><button class="btn btn-sm btn-outline" data-scan-view="${s.id}">${dl}</button></td>
    </tr>`;
  }).join("");
}

async function openScanView(id) {
  const rec = getScans().find(s => s.id === id);
  if (!rec) return toast("Record not found.", "error");
  $("#scanViewTitle").textContent = rec.fileName || "Document";
  const body = $("#scanViewBody");
  body.innerHTML = `<div class="scan-view-loading">Loading original document\u2026</div>`;
  openModal("#scanViewModal");
  let dataUrl = null;
  if (window.CONFIG && window.CONFIG.useRemote) {
    try {
      const r = await __api("GET", "scanfile/" + id);
      if (r && r.dataUrl) dataUrl = r.dataUrl;
    } catch (e) { /* fall through */ }
  }
  if (!dataUrl && rec.text) dataUrl = null;
  if (dataUrl) {
    const mime = dataUrl.split(",")[0] || "";
    body.innerHTML = `<div class="scan-view-actions"><a class="btn btn-sm btn-outline" href="${dataUrl}" download="${encodeURIComponent(rec.fileName || "document")}">Download Original</a></div>` +
      (mime.includes("image") ? `<img class="scan-view-img" src="${dataUrl}" alt="Original document">` :
       mime.includes("pdf") ? `<iframe class="scan-view-iframe" src="${dataUrl}"></iframe>` :
       `<pre class="scan-view-pre">${esc(rec.text || "-")}</pre>`);
  } else {
    body.innerHTML = `<pre class="scan-view-pre">${esc(rec.text || "-")}</pre>` +
      (window.CONFIG && window.CONFIG.useRemote ? "" : `<div class="muted">Original file is only kept on the server. (Local/offline mode stores text only.)</div>`);
  }
}

/* ==================== INIT ==================== */
async function init() {
  if (window.__apiReadyPromise) await window.__apiReadyPromise;
  seedAll();

  const auth = getAuth();
  if (auth && auth.user) {
    const valid = await validateSession(auth.token);
    if (valid) {
      currentUser = auth.user;
      activeDistrictId = currentUser.districtId || "dist_1";
      setActiveDistrict(activeDistrictId);
      showApp();
    } else {
      clearAuth();
    }
  }

  renderQuickLogin();

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = $("#loginBtn");
    const loader = $("#loginLoader");
    if (btn) btn.disabled = true;
    if (loader) loader.classList.remove("hidden");
    try {
      const rememberMe = !!$("#rememberMe") && $("#rememberMe").checked;
      const res = await login($("#loginUser").value.trim(), $("#loginPass").value);
      if (res && res.user) {
        currentUser = res.user;
        activeDistrictId = currentUser.districtId || "dist_1";
        setActiveDistrict(activeDistrictId);
        setAuth({ user: currentUser, token: res.token || null }, rememberMe);
        addQuickUser({ username: currentUser.username, name: currentUser.name, password: $("#loginPass").value }, rememberMe);
        showApp();
      } else {
        $("#loginError").classList.remove("hidden");
      }
    } catch (err) {
      $("#loginError").classList.remove("hidden");
    } finally {
      if (btn) btn.disabled = false;
      if (loader) loader.classList.add("hidden");
    }
  });

  $("#togglePass").addEventListener("click", () => { const i = $("#loginPass"); i.type = i.type === "password" ? "text" : "password"; });

  $("#forgotPassBtn")?.addEventListener("click", () => {
    $("#fpUsername").value = "";
    $("#fpPhone").value = "";
    $("#fpResult").classList.add("hidden");
    $("#fpSubmitBtn").disabled = false;
    openModal("#forgotPassModal");
  });

  $("#forgotPassForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const username = $("#fpUsername").value.trim();
    const phone = $("#fpPhone").value.trim();
    if (!username || !phone) return;

    const devs = getUsers().filter(u => u.role === "devadmin");
    devs.forEach(dev => {
      addNotification(dev.districtId, {
        type: "password_reset",
        title: "Password Reset Request",
        message: `User "${username}" (Phone: ${phone}) has requested a password reset. Please contact them to reset the password.`,
        fromDistrictId: dev.districtId,
        demandId: null,
      });
    });

    $("#fpResult").classList.remove("hidden");
    $("#fpSubmitBtn").disabled = true;
    toast("Request sent to admin!", "success");
  });

  $("#requestAccessBtn")?.addEventListener("click", openRequestAccessModal);
  $("#raDistrict")?.addEventListener("change", updateRALocationDropdown);
  $("#requestAccessForm")?.addEventListener("submit", submitAccessRequest);

  $("#logoutBtn").addEventListener("click", logout);
  $("#districtSelect")?.addEventListener("change", e => switchDistrict(e.target.value));

  $$(".sidebar-link").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));
  $$("[data-goto]").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.goto)));

  $$("#statsGrid .stat-card").forEach(card => {
    card.addEventListener("click", () => {
      const cls = [...card.classList].find(c => c.startsWith("stat-") && c !== "stat-card" && c !== "clickable");
      if (cls) openStatDetail(cls.replace("stat-", ""));
    });
  });
  $$("#demandStats .stat-card").forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.demandKey;
      if (key) openDemandStatDetail(key);
    });
  });
  $("#statExportBtn").addEventListener("click", e => { e.stopPropagation(); $("#statExportMenu").classList.toggle("hidden"); });
  $$("#statExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#statExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printStatDetail();
    else if (t === "pdf") exportStatPDF();
    else if (t === "excel") exportStatExcel();
    else if (t === "word") exportStatWord();
  }));
  $("#statSearch")?.addEventListener("input", e => renderStatDetail(e.target.value));
  document.addEventListener("click", e => {
    if (!e.target.closest(".stat-export-dd")) $$(".stat-export-menu").forEach(m => m.classList.add("hidden"));
  });
document.addEventListener("click", e => {
    const act = e.target.closest("[data-action]");
    if (act && act.dataset.action === "review-demand") {
      openDemandAction(act.dataset.id);
      document.querySelectorAll(".act-dd-menu:not(.hidden)").forEach(m => m.classList.add("hidden"));
      return;
    }
    document.querySelectorAll(".act-dd-menu:not(.hidden)").forEach(m => m.classList.add("hidden"));
    const trig = e.target.closest("[data-act-dd]");
    if (trig) {
      const box = trig.parentElement.querySelector(".act-dd-menu");
      if (box) box.classList.remove("hidden");
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const open = $$(".modal-backdrop:not(.hidden)");
    if (open.length) { closeModals(); return; }
    let closed = false;
    $$(".act-dd-menu:not(.hidden), .stat-export-menu:not(.hidden), .cb-menu:not(.hidden), #notifPanel:not(.hidden)").forEach(m => { m.classList.add("hidden"); closed = true; });
    if (closed) return;
    const root = $("#appRoot");
    if (root && window.innerWidth <= 768 && root.classList.contains("sidebar-collapsed")) {
      root.classList.remove("sidebar-collapsed");
    }
  });

  $("#addItemBtn").addEventListener("click", () => openItemModal(null));
  $("#itemForm").addEventListener("submit", saveItem);
  $("#inventoryBody").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "edit") { const item = getItems().find(i => i.id === btn.dataset.id); if (item) openItemModal(item); }
    else if (btn.dataset.action === "delete") deleteItem(btn.dataset.id);
  });
  $("#searchInput")?.addEventListener("input", renderInventory);
  bindItemSearch();
  $("#categoryFilter")?.addEventListener("change", renderInventory);
  $("#locationFilter")?.addEventListener("change", renderInventory);
  $("#conditionFilter")?.addEventListener("change", renderInventory);
  bindCombobox("categoryCbInput", "categoryCbMenu", "categoryFilter");
  bindCombobox("locationCbInput", "locationCbMenu", "locationFilter");
  bindCombobox("conditionCbInput", "conditionCbMenu", "conditionFilter");
  $("#itemDateFrom")?.addEventListener("change", renderInventory);
  $("#itemDateTo")?.addEventListener("change", renderInventory);
  $("#clearInvFilter")?.addEventListener("click", () => {
    ["searchInput", "categoryFilter", "locationFilter", "conditionFilter", "itemDateFrom", "itemDateTo"].forEach(id => { const e = $(`#${id}`); if (e) e.value = ""; });
    renderInventory();
  });
  $("#invExportBtn").addEventListener("click", e => { e.stopPropagation(); $("#invExportMenu").classList.toggle("hidden"); });
  $$("#invExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#invExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printInventoryReport();
    else if (t === "pdf") exportInvPDF();
    else if (t === "excel") exportInvExcel();
    else if (t === "word") exportInvWord();
  }));

  const condIds = ["fCondNew", "fCondGood", "fCondFair", "fCondPoor", "fCondDamaged"];
  const recalcTotal = () => {
    const total = condIds.reduce((sum, id) => sum + (parseInt($("#" + id)?.value, 10) || 0), 0);
    const qtyField = $("#fQuantity");
    if (qtyField) qtyField.value = total;
  };
  condIds.forEach(id => { const el = $("#" + id); if (el) el.addEventListener("input", recalcTotal); });

  $("#newTransBtn").addEventListener("click", openTransModal);
  $("#transForm").addEventListener("submit", saveTransaction);
  $("#editTransForm").addEventListener("submit", submitTransEdit);
  $("#transBody").addEventListener("click", e => {
    const b = e.target.closest("[data-txn-edit],[data-txn-approve],[data-txn-reject],[data-txn-cancel]");
    if (!b) return;
    const id = b.dataset.txnEdit || b.dataset.txnApprove || b.dataset.txnReject || b.dataset.txnCancel;
    if (b.hasAttribute("data-txn-edit")) {
      const t = __allDistrictTxns().find(x => x.id === id);
      if (t) openEditTrans(t);
    } else if (b.hasAttribute("data-txn-approve")) approveTransEdit(id);
    else if (b.hasAttribute("data-txn-reject")) rejectTransEdit(id);
    else if (b.hasAttribute("data-txn-cancel")) cancelTransEdit(id);
  });
  $("#tType")?.addEventListener("change", toggleTransferFields);
  $("#tCategory")?.addEventListener("change", function() {
    updateTItemForCategory();
    const nameInput = $("#tItemName");
    if (nameInput) nameInput.value = "";
  });
  $("#tItem")?.addEventListener("change", function() {
    const opt = this.options[this.selectedIndex];
    if (opt && opt.value) {
      const nameField = $("#tItemName");
      if (nameField) nameField.value = opt.dataset.name || opt.textContent.split(" (")[0];
      if (opt.dataset.categoryId && $("#tCategory")) $("#tCategory").value = opt.dataset.categoryId;
      if (opt.dataset.condition && $("#tCondition")) $("#tCondition").value = opt.dataset.condition;
    }
  });
  $("#tItemName")?.addEventListener("input", function() {
    if (this.value.trim() && $("#tItem")) $("#tItem").value = "";
  });
  $("#tFrom")?.addEventListener("change", function() {
    const assigneeSel = $("#tAssignee");
    if (assigneeSel && this.value) {
      const r = resolveUnitAssignee(activeDistrictId, this.value);
      if (r && r.html) assigneeSel.innerHTML = r.html;
      if (r && r.autoId) assigneeSel.value = r.autoId;
    }
  });
  $("#tTo")?.addEventListener("change", function() {
    const assigneeSel = $("#tAssignee");
    const type = $("#tType")?.value;
    if (assigneeSel && this.value && (type === "add" || type === "transfer")) {
      const r = resolveUnitAssignee(activeDistrictId, this.value);
      if (r && r.html) assigneeSel.innerHTML = r.html;
      if (r && r.autoId) assigneeSel.value = r.autoId;
    }
  });
  $("#transSearch")?.addEventListener("input", renderTransactions);
  $("#transDateFrom")?.addEventListener("change", renderTransactions);
  $("#transDateTo")?.addEventListener("change", renderTransactions);
  $("#transTypeFilter")?.addEventListener("change", renderTransactions);
  $("#clearTransFilter")?.addEventListener("click", () => { ["transSearch","transDateFrom","transDateTo","transTypeFilter"].forEach(id => { const e = $(`#${id}`); if (e) e.value = ""; }); renderTransactions(); });
  $("#transExportBtn").addEventListener("click", e => { e.stopPropagation(); $("#transExportMenu").classList.toggle("hidden"); });
  $$("#transExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#transExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printTransReport();
    else if (t === "pdf") exportTransPDF();
    else if (t === "excel") exportTransExcel();
    else if (t === "word") exportTransWord();
  }));

  $("#newInspectionBtn").addEventListener("click", () => openInspectionModal(null));
  $("#inspectionForm").addEventListener("submit", saveInspection);
  $$("#inspectionStats .stat-card").forEach(card => {
    card.addEventListener("click", () => {
      const key = card.dataset.inspKey;
      if (key) openInspStatDetail(key);
    });
  });
  $("#inspSearch")?.addEventListener("input", renderInspections);
  $("#inspTypeFilter")?.addEventListener("change", renderInspections);
  $("#inspStatusFilter")?.addEventListener("change", renderInspections);
  $("#inspExportBtn")?.addEventListener("click", e => { e.stopPropagation(); $("#inspExportMenu")?.classList.toggle("hidden"); });
  $$("#inspExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#inspExportMenu")?.classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printInspReport();
    else if (t === "pdf") exportInspPDF();
    else if (t === "excel") exportInspExcel();
    else if (t === "word") exportInspWord();
  }));

  $("#raiseDemandBtn").addEventListener("click", openDemandModal);
  $("#fdCategory")?.addEventListener("change", function() {
    const catId = this.value;
    const sel = $("#fdItemSelect");
    const name = $("#fdItemName");
    name.value = "";
    sel.innerHTML = `<option value="">-- select --</option>`;
    if (!catId) {
      sel.disabled = true;
      name.disabled = true;
      return;
    }
    getItems().filter(i => i.categoryId === catId).forEach(it => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = `${it.name} (${it.quantity} in stock)`;
      opt.dataset.name = it.name;
      opt.dataset.categoryId = it.categoryId;
      sel.appendChild(opt);
    });
    sel.disabled = false;
    name.disabled = false;
  });
  $("#fdItemSelect")?.addEventListener("change", function() {
    const opt = this.options[this.selectedIndex];
    if (opt && opt.value) {
      $("#fdItemName").value = opt.dataset.name || opt.textContent.split(" (")[0];
      if (opt.dataset.categoryId) $("#fdCategory").value = opt.dataset.categoryId;
    }
  });
  $("#fdItemName")?.addEventListener("input", function() {
    if (this.value.trim()) $("#fdItemSelect").value = "";
  });
$("#fdDemandTo")?.addEventListener("change", function() {
    const locSel = $("#fdDemandToLocation");
    const distId = this.value;
    const assigneeSel = $("#fdAssignee");
    if (!distId) {
      locSel.innerHTML = `<option value="">Select location</option>`;
      locSel.disabled = true;
      if (assigneeSel) assigneeSel.innerHTML = `<option value="">Select user</option>`;
      return;
    }
    const locs = getLocationsForDistrict(distId);
    locSel.innerHTML = `<option value="">Select location</option>` + locs.map(l => `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`).join("");
    locSel.disabled = false;
    if (assigneeSel) { assigneeSel.innerHTML = `<option value="">Select user</option>` + buildAssigneeOptions(distId, ""); assigneeSel.value = ""; }
  });
  $("#fdDemandToLocation")?.addEventListener("change", function() {
    const assigneeSel = $("#fdAssignee");
    if (!assigneeSel) return;
    const distId = $("#fdDemandTo").value;
    const r = resolveUnitAssignee(distId, this.value);
    assigneeSel.innerHTML = r.html;
    if (r.autoId) assigneeSel.value = r.autoId;
  });
$("#demandForm").addEventListener("submit", saveDemand);
  $("#demandSearch")?.addEventListener("input", renderDemands);
  $("#demandStatusFilter")?.addEventListener("change", renderDemands);
  $("#demandDateFrom")?.addEventListener("change", renderDemands);
  $("#demandDateTo")?.addEventListener("change", renderDemands);
  $("#clearDemandFilter")?.addEventListener("click", () => { ["demandSearch","demandStatusFilter","demandDateFrom","demandDateTo"].forEach(id => { const e = $(`#${id}`); if (e) e.value = ""; }); renderDemands(); });
  $("#demandExportBtn")?.addEventListener("click", e => { e.stopPropagation(); $("#demandExportMenu")?.classList.toggle("hidden"); });
  $$("#demandExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#demandExportMenu")?.classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printDemandReport();
    else if (t === "pdf") exportDemandPDF();
    else if (t === "excel") exportDemandExcel();
    else if (t === "word") exportDemandWord();
  }));

  $("#demandRejectBtn")?.addEventListener("click", () => {
    $("#fdActionType").value = "reject";
    $("#rejectionReasonGroup").classList.remove("hidden");
    $("#demandApproveBtn").textContent = "Submit Rejection";
    $("#fdRejectionReason").focus();
  });
  $("#demandActionForm")?.addEventListener("submit", handleDemandAction);

  $("#notifBell")?.addEventListener("click", e => { e.stopPropagation(); toggleNotifPanel(); });
  $("#notifList")?.addEventListener("click", e => {
    const approveBtn = e.target.closest("[data-notif-approve]");
    const rejectBtn = e.target.closest("[data-notif-reject]");
    if (approveBtn) {
      e.stopPropagation();
      const distId = approveBtn.closest(".notif-item")?.dataset.distId || activeDistrictId;
      handleAccessApproval(approveBtn.dataset.notifId, approveBtn.dataset.requestId, "approved", distId);
      return;
    }
    if (rejectBtn) {
      e.stopPropagation();
      const distId = rejectBtn.closest(".notif-item")?.dataset.distId || activeDistrictId;
      handleAccessApproval(rejectBtn.dataset.notifId, rejectBtn.dataset.requestId, "rejected", distId);
      return;
    }
    const item = e.target.closest(".notif-item");
    if (!item) return;
    const nId = item.dataset.notifId;
    if (!nId) return;
    const readDistId = item.dataset.distId || activeDistrictId;
    const notifs = getNotifications(readDistId);
    const n = notifs.find(x => x.id === nId);
    if (n && !n.read) {
      n.read = true;
      saveNotifications(readDistId, notifs);
      renderNotifications();
    }
  });
  $("#markAllReadBtn")?.addEventListener("click", () => { markAllRead(); renderNotifications(); });
  document.addEventListener("click", e => {
    const panel = $("#notifPanel");
    if (panel && !panel.classList.contains("hidden") && !e.target.closest(".notif-wrapper")) {
      panel.classList.add("hidden");
    }
  });

  $("#manageCatsBtn").addEventListener("click", openCatModal);
  $("#catAddBtn").addEventListener("click", addCategory);
  $("#catList").addEventListener("click", e => {
    if (e.target.closest("[data-cat-edit]")) startEditCat(parseInt(e.target.closest("[data-cat-edit]").dataset.catEdit, 10));
    else if (e.target.closest("[data-cat-save]")) saveEditCat(parseInt(e.target.closest("[data-cat-save]").dataset.catSave, 10));
    else if (e.target.closest("[data-cat-cancel]")) renderCatList();
    else if (e.target.closest("[data-cat-del]")) deleteCategory(parseInt(e.target.closest("[data-cat-del]").dataset.catDel, 10));
  });

  $("#manageUsersBtn")?.addEventListener("click", openUsersModal);
  $("#addUserForm").addEventListener("submit", addUser);
  $("#cancelUserEdit").addEventListener("click", cancelUserEdit);
  $("#nuDistrict")?.addEventListener("change", updateUserLocationDropdown);
  $("#usersList").addEventListener("click", e => {
    if (e.target.closest("[data-edit-user]")) startEditUser(e.target.closest("[data-edit-user]").dataset.editUser);
    else if (e.target.closest("[data-del-user]")) deleteUser(e.target.closest("[data-del-user]").dataset.delUser);
  });

  $("#manageDistrictsBtn")?.addEventListener("click", openDistrictsModal);
  $("#addDistrictForm").addEventListener("submit", addDistrict);
  $("#cancelDistEdit").addEventListener("click", cancelDistEdit);
  $("#addLocationBtn").addEventListener("click", addLocation);
  $("#districtsList").addEventListener("click", e => {
    if (e.target.closest("[data-dist-edit]")) startEditDistrict(e.target.closest("[data-dist-edit]").dataset.distEdit);
    else if (e.target.closest("[data-dist-del]")) deleteDistrict(e.target.closest("[data-dist-del]").dataset.distDel);
    else if (e.target.closest("[data-dist-locs]")) showLocations(e.target.closest("[data-dist-locs]").dataset.distLocs);
  });
  $("#locationList").addEventListener("click", e => {
    if (e.target.closest("[data-loc-del]")) deleteLocation(e.target.closest("[data-loc-del]").dataset.locDel);
  });

  $$(".report-tab").forEach(t => t.addEventListener("click", () => { $$(".report-tab").forEach(rt => rt.classList.remove("active")); t.classList.add("active"); renderReports(); }));
  $("#reportExportBtn").addEventListener("click", e => { e.stopPropagation(); $("#reportExportMenu").classList.toggle("hidden"); });
  $$("#reportExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#reportExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printRptReport();
    else if (t === "pdf") exportRptPDF();
    else if (t === "excel") exportRptExcel();
    else if (t === "word") exportRptWord();
  }));
  $("#reportSearch")?.addEventListener("input", e => { __rptSearch = e.target.value; renderReports(); });

  /* ----- Allotments ----- */
  const __allocShowTab = (name) => {
    __allocTab = name;
    $$("[data-atab]").forEach(t => t.classList.toggle("active", t.dataset.atab === name));
    $$(".alloc-tab").forEach(tab => tab.classList.toggle("hidden", tab.dataset.allocTab !== name));
    renderAllotments();
  };
  $$("[data-atab]").forEach(t => t.addEventListener("click", () => __allocShowTab(t.dataset.atab)));

  $("#allocOpenBtn")?.addEventListener("click", openAllotModal);
  $("#allocAddStockBtn")?.addEventListener("click", () => openItemModal(null));
  $("#scanOpenBtn")?.addEventListener("click", openScanModal);
  $("#scanHistoryBtn")?.addEventListener("click", openScanHistory);
  $("#scanOpenBtn2")?.addEventListener("click", openScanModal);
  $("#scanHistoryBtn2")?.addEventListener("click", openScanHistory);
  bindScanEvents();
  $("#scanHistoryBody")?.addEventListener("click", e => {
    const b = e.target.closest("[data-scan-view]");
    if (b) openScanView(b.dataset.scanView);
  });
  $("#allotForm")?.addEventListener("submit", saveAllotment);
  $("#alAddItemRow")?.addEventListener("click", () => addAllotItemRow());
  bindPersonSuggest();

  $("#allocStockSearch")?.addEventListener("input", renderAllocStock);
  $("#allocStockCat")?.addEventListener("change", renderAllocStock);
  document.querySelectorAll("[data-stock-filter]").forEach(b => b.addEventListener("click", () => setStockType(b.dataset.stockFilter)));
  $("#allocStockType")?.addEventListener("change", e => setStockType(e.target.value));
  $("#allocStockTable")?.addEventListener("click", e => {
    const th = e.target.closest(".sortable");
    if (th && th.dataset.sort) setStockSort(th.dataset.sort);
  });
  $("#allocStockAdjustBtn")?.addEventListener("click", () => openAdjustStock(""));
  $("#allocStockExportBtn")?.addEventListener("click", e => { e.stopPropagation(); $("#allocStockExportMenu").classList.toggle("hidden"); });
  $$("#allocStockExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#allocStockExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printAllocStock();
    else if (t === "pdf") exportAllocStockPDF();
    else if (t === "excel") exportAllocStockExcel();
    else if (t === "word") exportAllocStockWord();
  }));

  $("#allocSearch")?.addEventListener("input", renderAllottedList);
  $("#allocCatFilter")?.addEventListener("change", renderAllottedList);
  $("#allocItemFilter")?.addEventListener("change", renderAllottedList);
  $("#allocPostingFilter")?.addEventListener("input", renderAllottedList);
  $("#allocRankFilter")?.addEventListener("change", renderAllottedList);
  $("#allocStatusFilter")?.addEventListener("change", renderAllottedList);
  $("#allocDateFrom")?.addEventListener("change", renderAllottedList);
  $("#allocDateTo")?.addEventListener("change", renderAllottedList);
  $("#allocClearFilter")?.addEventListener("click", () => {
    ["allocSearch", "allocCatFilter", "allocItemFilter", "allocPostingFilter", "allocRankFilter", "allocStatusFilter", "allocDateFrom", "allocDateTo"].forEach(id => { const el = $("#" + id); if (el) el.value = ""; });
    renderAllottedList();
  });
  $("#allocExportBtn")?.addEventListener("click", e => { e.stopPropagation(); $("#allocExportMenu").classList.toggle("hidden"); });
  $$("#allocExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#allocExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printAllocList();
    else if (t === "pdf") exportAllocListPDF();
    else if (t === "excel") exportAllocListExcel();
    else if (t === "word") exportAllocListWord();
  }));

  $("#allocRetSearch")?.addEventListener("input", renderReturnHistory);
  $("#allocRetExportBtn")?.addEventListener("click", e => { e.stopPropagation(); $("#allocRetExportMenu").classList.toggle("hidden"); });
  $$("#allocRetExportMenu [data-export]").forEach(b => b.addEventListener("click", () => {
    $("#allocRetExportMenu").classList.add("hidden");
    const t = b.dataset.export;
    if (t === "print") printAllocReturns();
    else if (t === "pdf") exportAllocReturnsPDF();
    else if (t === "excel") exportAllocReturnsExcel();
    else if (t === "word") exportAllocReturnsWord();
  }));

  $("#allocStockBody")?.addEventListener("click", e => {
    const btn = e.target.closest("[data-alloc-action]");
    if (!btn) return;
    if (btn.dataset.allocAction === "view") openAllocItemDetail(btn.dataset.id);
    else if (btn.dataset.allocAction === "edit") { const it = getItems().find(i => i.id === btn.dataset.id); if (it) openItemModal(it); }
    else if (btn.dataset.allocAction === "adjust") openAdjustStock(btn.dataset.id);
  });
  $("#allocBody")?.addEventListener("click", e => {
    const el = e.target.closest("[data-alloc-action]");
    if (!el) return;
    const id = el.dataset.id;
    const action = el.dataset.allocAction;
    if (action === "person") openAllocPersonDetail(el.dataset.belt);
    else if (action === "view") openAllocItemDetail(getAllotments().find(a => a.id === id)?.itemId);
    else if (action === "edit") openEditAllotment(id);
    else if (action === "return") openReturnModal(id);
    else if (action === "cancel") cancelAllotment(id);
  });
  $("#returnForm")?.addEventListener("submit", saveReturn);
  $("#adjustForm")?.addEventListener("submit", saveAdjust);
  $("#ajType")?.addEventListener("change", () => {
    const isCorrection = $("#ajType").value === "correction";
    $("#ajQtyGroup").classList.toggle("hidden", isCorrection);
    $("#ajTotalGroup").classList.toggle("hidden", !isCorrection);
  });

  $("#sidebarToggle")?.addEventListener("click", () => { $("#appRoot").classList.toggle("sidebar-collapsed"); });

  $$("[data-close]").forEach(btn => btn.addEventListener("click", closeModals));
  $$(".modal-backdrop").forEach(b => b.addEventListener("click", e => { if (e.target === b) closeModals(); }));
  $("#catInput")?.addEventListener("keydown", e => { if (e.key === "Enter") addCategory(); });
}

function showApp() {
  $("#loginScreen").classList.add("hidden");
  $("#appRoot").classList.remove("hidden");
  const ver = $("#appVersion");
  if (ver) ver.textContent = "v" + APP_VERSION;
  applyRoleUI();
  rebuildDropdowns();
  switchTab("dashboard");
}

document.addEventListener("DOMContentLoaded", init);





















