"use strict";

const STORAGE_PREFIX = "hp_inventory.";
const AUTH_KEY = STORAGE_PREFIX + "auth";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (s) => { const d = document.createElement("div"); d.textContent = String(s); return d.innerHTML; };

const DEFAULT_CATEGORIES = [
  { id: "weapons", name: "Weapons & Ammunition", icon: "🔫" },
  { id: "uniforms", name: "Uniforms & Clothing", icon: "👮" },
  { id: "communication", name: "Communication Equipment", icon: "📻" },
  { id: "office", name: "Office & Admin Supplies", icon: "📋" },
  { id: "forensics", name: "Forensics & Investigation", icon: "🔍" },
  { id: "medical", name: "Medical & First Aid", icon: "🏥" },
  { id: "vehicles", name: "Vehicles & Transport", icon: "🚗" },
  { id: "barricades", name: "Barricades", icon: "🚧" },
  { id: "furniture", name: "Furniture (Tables, Chairs)", icon: "🪑" },
  { id: "sound", name: "Sound System (Speakers, etc.)", icon: "🔊" },
  { id: "riot", name: "Riot Gear", icon: "🛡️" },
  { id: "other", name: "Other Items", icon: "📦" },
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
  Object.keys(allItems).forEach(distId => {
    (allItems[distId] || []).forEach(item => {
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
    read: false,
    createdAt: Date.now(),
  });
  saveNotifications(targetDistrictId, list);
}

function getUnreadCount() {
  if (!activeDistrictId) return 0;
  return getNotifications(activeDistrictId).filter(n => !n.read).length;
}

function markAllRead() {
  if (!activeDistrictId) return;
  if (isDevAdmin()) {
    getDistricts().forEach(d => {
      const list = getNotifications(d.id);
      list.forEach(n => n.read = true);
      saveNotifications(d.id, list);
    });
  } else {
    const list = getNotifications(activeDistrictId);
    list.forEach(n => n.read = true);
    saveNotifications(activeDistrictId, list);
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
      getNotifications(d.id).forEach(n => all.push({ ...n, _distId: d.id }));
    });
    notifs = all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30);
  } else {
    notifs = getNotifications(activeDistrictId).slice(0, 20);
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
function getAuth() { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } }
function setAuth(user) { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem(AUTH_KEY); }

function login(username, password) {
  return getUsers().find(u => u.username === username && u.password === password) || null;
}

let currentUser = null;

function isAdmin() { return currentUser && (currentUser.role === "admin" || currentUser.role === "devadmin"); }
function isDevAdmin() { return currentUser && currentUser.role === "devadmin"; }
function canEdit() { return currentUser && ["admin", "devadmin", "mhc", "station"].includes(currentUser.role); }
function canSeeAllLocations() { return isDevAdmin(); }
function canSeeAllDistrictLocations() { return isAdmin(); }
function getVisibleLocationId() { if (isAdmin()) return null; return currentUser ? currentUser.locationId : null; }

function logout() {
  currentUser = null;
  activeDistrictId = null;
  clearAuth();
  $("#appRoot").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginUser").value = "";
  $("#loginPass").value = "";
  $("#loginError").classList.add("hidden");
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
      sub.textContent = "Overview of inventory status — All districts";
    } else {
      const dist = getDistricts().find(d => d.id === currentUser.districtId);
      sub.textContent = "Overview of inventory status — " + (dist ? dist.name : "Your district");
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
  const msg = `New access request from "${name}" — Post: ${post}, Mobile: ${mobile}, District: ${dist ? dist.name : "—"}, Location: ${loc ? loc.name : "—"}, Role: ${ROLE_LABELS[userType] || userType}.`;

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
  const requestData = `Name: ${req.name}, Post: ${req.post}, Mobile: ${req.mobile}, District: ${dist ? dist.name : "—"}, Location: ${loc ? loc.name : "—"}, Role: ${ROLE_LABELS[req.userType] || req.userType}`;

  if (status === "approved") {
    const admins = getUsers().filter(u => u.role === "admin" && u.districtId === req.districtId);
    admins.forEach(a => addNotification(req.districtId, { type: "access_approved", title: "Access Approved — Create User", message: `Request approved. Please create the user: ${requestData}`, fromDistrictId: req.districtId, requestId: req.id }));
    const devs = getUsers().filter(u => u.role === "devadmin");
    devs.forEach(d => addNotification(d.districtId, { type: "access_approved", title: "Access Approved — Create User", message: `Request approved. Please create the user: ${requestData}`, fromDistrictId: req.districtId, requestId: req.id }));
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
  setAuth(currentUser);
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
  } else {
    recentBody.innerHTML = `<tr class="empty-row"><td colspan="5">No transactions yet.</td></tr>`;
  }
}

/* ==================== INVENTORY ==================== */
function renderInventory() {
  const items = getItems();
  const cats = getCategories();
  const locs = getLocations();
  const q = ($("#searchInput") || {}).value || "";
  const catFilter = ($("#categoryFilter") || {}).value || "";
  const locFilter = ($("#locationFilter") || {}).value || "";
  const condFilter = ($("#conditionFilter") || {}).value || "";

  let filtered = items.filter(i => {
    if (catFilter && i.categoryId !== catFilter) return false;
    if (locFilter && i.locationId !== locFilter) return false;
    if (condFilter) {
      const cc = i.conditionCounts || {};
      if (!(cc[condFilter] > 0)) return false;
    }
    if (q && !i.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const tbody = $("#inventoryBody");
  if (!tbody) return;

  if (filtered.length) {
    let totalCondQty = 0;
    tbody.innerHTML = filtered.map(i => {
      const cat = cats.find(c => c.id === i.categoryId);
      const loc = locs.find(l => l.id === i.locationId);
      const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
      const displayQty = condFilter ? (cc[condFilter] || 0) : i.quantity;
      if (condFilter) totalCondQty += displayQty;
      const cls = displayQty === 0 ? "status-out" : displayQty <= i.minStock ? "status-low" : "status-ok";
      const label = displayQty === 0 ? "Out of Stock" : displayQty <= i.minStock ? "Low Stock" : "In Stock";
      const btns = canEdit() ? `<button class="btn btn-sm btn-outline" data-action="edit" data-id="${i.id}">Edit</button><button class="btn btn-sm btn-outline" data-action="delete" data-id="${i.id}">Delete</button>` : "";
      return `<tr><td class="item-name">${esc(i.name)}</td><td><span class="cat-badge">${esc(cat ? cat.name : "")}</span></td><td class="qty-strong">${displayQty}</td><td>${esc(i.unit)}</td><td>${i.minStock}</td><td>${esc(loc ? loc.name : "")}</td><td>${buildCondBar(cc)}</td><td><span class="status-badge ${cls}">${label}</span></td><td class="actions-cell">${btns}</td></tr>`;
    }).join("");

    if (condFilter) {
      const condLabel = condFilter.charAt(0).toUpperCase() + condFilter.slice(1);
      const catTotal = catFilter ? totalCondQty : 0;
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
        ? `<tr class="summary-row"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (${esc(catName)})</td><td class="qty-strong" style="color:var(--primary)">${catTotalQty}</td><td colspan="6"></td></tr><tr class="summary-row summary-grand"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (All Categories)</td><td class="qty-strong" style="color:var(--primary)">${grandTotalQty}</td><td colspan="6"></td></tr>`
        : `<tr class="summary-row summary-grand"><td colspan="2" style="font-weight:700;color:var(--primary)">${condLabel} Total (All Categories)</td><td class="qty-strong" style="color:var(--primary)">${grandTotalQty}</td><td colspan="6"></td></tr>`;
      tbody.innerHTML += summaryHtml;
    }
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="9">No items found. Click "+ Add Item" to add one.</td></tr>`;
  }
  renderCatPills();
  rebuildDropdowns();
}

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
    if (item) Object.assign(item, { name, categoryId, unit, quantity, minStock, locationId, conditionCounts, updatedAt: Date.now() });
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
function renderTransactions() {
  const txns = getTransactions();
  const locs = getLocations();
  const allLocs = getAllLocationsFlat();
  const dateFrom = ($("#transDateFrom") || {}).value;
  const dateTo = ($("#transDateTo") || {}).value;
  const typeFilter = ($("#transTypeFilter") || {}).value;

  let filtered = txns.filter(t => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (dateFrom && t.createdAt < new Date(dateFrom).getTime()) return false;
    if (dateTo && t.createdAt >= new Date(dateTo).getTime() + 86400000) return false;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const tbody = $("#transBody");
  if (!tbody) return;

  if (filtered.length) {
    tbody.innerHTML = filtered.map(t => {
      const from = allLocs.find(l => l.id === t.fromLocation);
      const to = allLocs.find(l => l.id === t.toLocation);
      const label = t.type === "add" ? "Addition" : t.type === "remove" ? "Removal" : "Transfer";
      return `<tr><td>${fmtDate(t.createdAt)}</td><td class="item-name">${esc(t.itemName)}</td><td><span class="cat-badge">${label}</span></td><td class="qty-strong">${t.quantity}</td><td>${esc(from ? `[${from.districtCode}] ${from.name}` : "—")}</td><td>${esc(to ? `[${to.districtCode}] ${to.name}` : "—")}</td><td>${esc(t.performedBy)}</td><td>${esc(t.notes || "—")}</td></tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">No transactions found.</td></tr>`;
  }
}

function openTransModal() {
  const items = getItems();
  const sel = $("#tItem");
  sel.innerHTML = items.length ? items.map(i => `<option value="${i.id}">${esc(i.name)} (${i.quantity} ${i.unit})</option>`).join("") : `<option value="">No items</option>`;
  $("#tQuantity").value = "";
  $("#tNotes").value = "";
  $("#tType").value = "add";

  const fromSel = $("#tFrom");
  const toSel = $("#tTo");

  if (!canSeeAllDistrictLocations()) {
    const myLoc = currentUser.locationId;
    const myLocName = getLocations().find(l => l.id === myLoc)?.name || "";
    fromSel.innerHTML = `<option value="${myLoc}">[${esc(currentUser.locationId)}] ${esc(myLocName)}</option>`;
    fromSel.disabled = true;
    toSel.innerHTML = buildDistrictLocationsDropdown(currentUser.districtId);
    toSel.disabled = false;
  } else {
    fromSel.innerHTML = buildDistrictLocationsDropdown(activeDistrictId);
    toSel.innerHTML = buildDistrictLocationsDropdown(activeDistrictId);
    fromSel.disabled = false;
    toSel.disabled = false;
  }

  toggleTransferFields();
  openModal("#transModal");
}

function toggleTransferFields() {
  const type = ($("#tType") || {}).value;
  const from = $("#tFromGroup");
  const to = $("#tToGroup");
  from.classList.toggle("hidden", type === "add");
  to.classList.toggle("hidden", type === "remove");
}

function saveTransaction(e) {
  e.preventDefault();
  const itemId = $("#tItem").value;
  const type = $("#tType").value;
  const quantity = parseInt($("#tQuantity").value, 10);
  const fromLocation = $("#tFrom").value;
  const toLocation = $("#tTo").value;
  const notes = $("#tNotes").value.trim();
  if (!itemId || !quantity) return toast("Fill all required fields.", "error");

  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return toast("Item not found.", "error");
  if (type === "remove" && quantity > item.quantity) return toast("Cannot remove more than available.", "error");

  if (type === "add") item.quantity += quantity;
  else if (type === "remove") item.quantity -= quantity;
  item.updatedAt = Date.now();
  saveItems(items);

  const txns = getTransactions();
  txns.push({ id: uid(), itemId, itemName: item.name, type, quantity, fromLocation: type === "add" ? "" : fromLocation, toLocation: type === "remove" ? "" : toLocation, performedBy: currentUser ? currentUser.name : "System", notes, createdAt: Date.now() });
  saveTransactions(txns);
  closeModals();
  toast("Transaction recorded.", "success");
  render();
}

/* ==================== CATEGORIES ==================== */
function renderCatList() {
  const box = $("#catList");
  const cats = getCategories();
  const items = getAllDistrictItems();
  box.innerHTML = cats.map((c, idx) => {
    const count = items.filter(i => i.categoryId === c.id).length;
    return `<div class="cat-list-row" data-idx="${idx}"><span>${c.icon || ""}</span><span class="cat-list-name">${esc(c.name)}</span><span class="cat-list-count">${count} items</span><div class="cat-list-actions"><button class="btn btn-sm btn-outline" data-cat-edit="${idx}">Edit</button><button class="btn btn-sm btn-outline" data-cat-del="${idx}" ${count > 0 ? "disabled" : ""}>Delete</button></div></div>`;
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
  if (getAllDistrictItems().filter(i => i.categoryId === cat.id).length > 0) return toast("Has items — reassign first.", "error");
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
    const actions = isSelf ? "" : (canManage ? `<button class="btn btn-sm btn-outline" data-edit-user="${u.id}">Edit</button><button class="btn btn-sm btn-outline" data-del-user="${u.id}">Delete</button>` : "");
    return `<div class="user-row"><div class="ur-info"><div class="ur-name">${esc(u.name)} ${isSelf ? '<span style="color:var(--amber);font-size:.7rem">(You)</span>' : ''}</div><div class="ur-detail">${esc(u.username)} · ${esc(u.mobile)} · ${esc(dist ? dist.name : "—")}</div></div><span class="ur-badge" style="background:${badgeColor};color:#fff">${roleLabel}</span><div class="ur-actions" style="display:flex;gap:4px">${actions}</div></div>`;
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

function renderInspections() {
  const inspections = getInspections();
  const locs = getLocations();
  const q = ($("#inspSearch") || {}).value || "";
  const typeFilter = ($("#inspTypeFilter") || {}).value || "";
  const statusFilter = ($("#inspStatusFilter") || {}).value || "";

  let filtered = inspections.filter(ins => {
    if (typeFilter && ins.type !== typeFilter) return false;
    if (statusFilter && ins.status !== statusFilter) return false;
    if (q && !ins.itemName.toLowerCase().includes(q.toLowerCase()) && !ins.inspectedBy.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

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
      const btns = canEdit() ? `<button class="btn btn-sm btn-outline" data-action="edit-insp" data-id="${ins.id}">Edit</button><button class="btn btn-sm btn-outline" data-action="delete-insp" data-id="${ins.id}">Delete</button>` : "";
      return `<tr title="Findings: ${esc(ins.findings || "")}\nRecommendations: ${esc(ins.recommendations || "")}"><td>${esc(ins.date)}</td><td class="item-name">${esc(ins.itemName)}</td><td>${esc(ins.inspectedBy)}</td><td><span class="${typeCls}">${typeLabel}</span></td><td>${esc(loc ? loc.name : "")}</td><td>${esc(findings)}</td><td>${esc(reco)}</td><td><span class="${statusCls}">${statusLabel}</span></td><td class="actions-cell">${btns}</td></tr>`;
    }).join("");
  } else {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="9">No inspections found. Click "+ New Inspection" to add one.</td></tr>`;
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

function renderDemands() {
  const demands = getDemands();
  const q = ($("#demandSearch") || {}).value || "";
  const statusFilter = ($("#demandStatusFilter") || {}).value || "";

  let filtered = demands.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (q && !d.itemName.toLowerCase().includes(q.toLowerCase()) && !d.reason.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const tbody = $("#demandBody");
  if (!tbody) return;

  if (filtered.length) {
    tbody.innerHTML = filtered.map(d => {
      const statusCls = { pending: "status-badge status-low", approved: "status-badge status-ok", rejected: "status-badge status-out" }[d.status] || "cat-badge";
      const statusLabel = d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Unknown";
      const urgencyCls = d.urgency === "critical" ? "color:var(--red);font-weight:700" : d.urgency === "urgent" ? "color:var(--amber);font-weight:600" : "";
      const condLabel = d.condition === "any" ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
      const reason = d.reason ? (d.reason.length > 40 ? d.reason.slice(0, 40) + "..." : d.reason) : "-";
      let btns = "";
      if (d.status === "pending" && canEdit()) {
        btns = `<button class="btn btn-sm btn-primary" data-action="review-demand" data-id="${d.id}">Review</button>`;
      } else if (d.status !== "pending") {
        btns = `<span style="font-size:.72rem;color:var(--muted)">${d.actionRemarks ? esc(d.actionRemarks.slice(0, 30)) : ""}</span>`;
      }
      return `<tr><td>${new Date(d.createdAt).toLocaleDateString("en-IN")}</td><td class="item-name">${esc(d.itemName)}</td><td class="qty-strong">${d.quantity}</td><td><span class="cat-badge">${esc(d.categoryName)}</span></td><td>${condLabel}</td><td>${esc(d.requestedBy)}</td><td>${esc(d.demandToDistrictName)}${d.demandToLocationName ? ' <span style="color:var(--muted);font-size:.72rem">(' + esc(d.demandToLocationName) + ')</span>' : ''}</td><td title="${esc(d.reason)}">${esc(reason)}</td><td><span class="${statusCls}">${statusLabel}</span></td><td class="actions-cell">${btns}</td></tr>`;
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
}

function openDemandModal() {
  $("#demandModalTitle").textContent = "Raise New Demand";
  $("#demandSaveBtn").textContent = "Submit Demand";
  $("#fdItemName").value = "";
  $("#fdItemSelect").innerHTML = `<option value="">-- select --</option>`;
  $("#fdQuantity").value = 1;
  $("#fdCondition").value = "any";
  $("#fdUrgency").value = "normal";
  $("#fdReason").value = "";
  $("#fdRemarks").value = "";
  $("#fdDemandId").value = "";

  const catSel = $("#fdCategory");
  const cats = getCategories();
  catSel.innerHTML = `<option value="">Select category</option>` + cats.map(c => `<option value="${c.id}">${c.icon || ""} ${esc(c.name)}</option>`).join("");

  const items = getItems();
  if (items.length) {
    const sel = $("#fdItemSelect");
    items.forEach(it => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = `${it.name} (${it.quantity} in stock)`;
      opt.dataset.name = it.name;
      opt.dataset.categoryId = it.categoryId;
      sel.appendChild(opt);
    });
  }

  const toSel = $("#fdDemandTo");
  const toLocSel = $("#fdDemandToLocation");
  const allDistricts = getDistricts();
  toSel.innerHTML = `<option value="">Select district</option>` + allDistricts.map(d => `<option value="${d.id}" ${d.id === activeDistrictId ? 'selected' : ''}>${esc(d.name)}${d.id === activeDistrictId ? ' (Your District)' : ''}</option>`).join("");
  const myLocs = getLocationsForDistrict(activeDistrictId);
  toLocSel.innerHTML = `<option value="">Select location</option>` + myLocs.map(l => `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`).join("");
  toSel.disabled = false;
  toLocSel.disabled = false;

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
  const urgency = $("#fdUrgency").value;
  const reason = $("#fdReason").value.trim();
  const remarks = $("#fdRemarks").value.trim();
  if (!itemName || !quantity || !categoryId || !demandToDistrict || !demandToLocation || !reason) return toast("Please fill all required fields.", "error");

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
    requestedFromDistrict: activeDistrictId,
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
    demandId: demands[demands.length - 1].id,
  });

  toast("Demand submitted successfully!", "success");
  closeModals();
  render();
}

function openDemandAction(id) {
  const demands = getDemands();
  const d = demands.find(x => x.id === id);
  if (!d) return;

  $("#demandActionTitle").textContent = "Review Demand — " + d.itemName;
  $("#fdActionDemandId").value = d.id;
  $("#fdActionRemarks").value = "";
  $("#fdRejectionReason").value = "";
  $("#rejectionReasonGroup").classList.add("hidden");
  $("#fdActionType").value = "";

  const condLabel = d.condition === "any" ? "Any" : d.condition.charAt(0).toUpperCase() + d.condition.slice(1);
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
      <div class="demand-detail-item"><span class="dd-label">To District</span><span class="dd-value">${esc(toDist ? toDist.name : d.demandToDistrictName || "—")}${d.demandToLocationName ? ' <span style="color:var(--muted);font-size:.75rem">(' + esc(d.demandToLocationName) + ')</span>' : ''}</span></div>
      <div class="demand-detail-item dd-full"><span class="dd-label">Reason</span><span class="dd-value">${esc(d.reason)}</span></div>
      ${d.remarks ? `<div class="demand-detail-item dd-full"><span class="dd-label">Remarks</span><span class="dd-value">${esc(d.remarks)}</span></div>` : ""}
    </div>`;

  openModal("#demandActionModal");
  $("#demandApproveBtn").textContent = "Approve & Submit";
}

function handleDemandAction(e) {
  e.preventDefault();
  const id = $("#fdActionDemandId").value;
  let actionType = $("#fdActionType").value;
  const remarks = $("#fdActionRemarks").value.trim();
  const rejectionReason = $("#fdRejectionReason").value.trim();

  if (!actionType) actionType = "approve";
  if (actionType === "reject" && !rejectionReason) return toast("Rejection reason is required.", "error");

  const demands = getDemands();
  const d = demands.find(x => x.id === id);
  if (!d) return;

  d.status = actionType === "approve" ? "approved" : "rejected";
  d.actionRemarks = remarks;
  d.rejectionReason = actionType === "reject" ? rejectionReason : "";
  d.updatedAt = Date.now();

  saveDemands(demands);

  const fromDist = getDistricts().find(x => x.id === d.requestedFromDistrict);
  if (d.status === "approved") {
    addNotification(d.requestedFromDistrict, {
      type: "demand_approved",
      title: "Demand Approved",
      message: `Your demand for ${d.quantity} x ${d.itemName} has been approved by ${fromDist ? fromDist.name : "the district"}.${remarks ? " Note: " + remarks : ""}`,
      fromDistrictId: activeDistrictId,
      demandId: d.id,
    });
  } else {
    addNotification(d.requestedFromDistrict, {
      type: "demand_rejected",
      title: "Demand Rejected",
      message: `Your demand for ${d.quantity} x ${d.itemName} has been rejected by ${fromDist ? fromDist.name : "the district"}. Reason: ${rejectionReason}`,
      fromDistrictId: activeDistrictId,
      demandId: d.id,
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
      <div class="dr-info"><div class="dr-name">${esc(d.name)}</div><div class="dr-detail">${esc(d.headquarters)} · ${locs.length} locations · ${items.length} items</div></div>
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

function renderStockReport() {
  const items = getItems();
  const cats = getCategories();
  const total = items.length;
  const inStock = items.filter(i => i.quantity > i.minStock).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const damagedUnits = items.reduce((sum, i) => sum + ((i.conditionCounts || {}).damaged || 0), 0);
  const newUnits = items.reduce((sum, i) => sum + ((i.conditionCounts || {}).new || 0), 0);

  let html = `<div class="rpt-summary"><div class="rpt-summary-card"><div class="rpt-s-label">Total Items</div><div class="rpt-s-value">${total}</div></div><div class="rpt-summary-card"><div class="rpt-s-label">In Stock</div><div class="rpt-s-value" style="color:var(--green)">${inStock}</div></div><div class="rpt-summary-card"><div class="rpt-s-label">Low Stock</div><div class="rpt-s-value" style="color:var(--amber)">${lowStock}</div></div><div class="rpt-summary-card"><div class="rpt-s-label">Out of Stock</div><div class="rpt-s-value" style="color:var(--red)">${outOfStock}</div></div><div class="rpt-summary-card"><div class="rpt-s-label">New Units</div><div class="rpt-s-value" style="color:#0ea5e9">${newUnits}</div></div><div class="rpt-summary-card"><div class="rpt-s-label">Damaged Units</div><div class="rpt-s-value" style="color:var(--red)">${damagedUnits}</div></div></div>`;
  html += `<div class="table-wrap"><table><thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Min</th><th>Condition Breakdown</th><th>Status</th><th>Health</th></tr></thead><tbody>`;
  items.sort((a, b) => a.name.localeCompare(b.name)).forEach(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const cc = i.conditionCounts || { good: i.quantity, fair: 0, poor: 0, damaged: 0 };
    const cls = i.quantity === 0 ? "status-out" : i.quantity <= i.minStock ? "status-low" : "status-ok";
    const label = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
    const pct = i.minStock > 0 ? Math.min(Math.round((i.quantity / (i.minStock * 2)) * 100), 100) : 100;
    const barCls = pct > 60 ? "green" : pct > 30 ? "amber" : "red";
    html += `<tr><td class="item-name">${esc(i.name)}</td><td><span class="cat-badge">${esc(cat ? cat.name : "")}</span></td><td class="qty-strong">${i.quantity}</td><td>${i.minStock}</td><td>${buildCondBar(cc)}</td><td><span class="status-badge ${cls}">${label}</span></td><td style="min-width:100px"><div class="rpt-bar"><div class="rpt-bar-fill ${barCls}" style="width:${pct}%"></div></div></td></tr>`;
  });
  html += `</tbody></table></div>`;
  $("#reportContent").innerHTML = html;
}

function renderCategoryReport() {
  const items = getItems();
  const cats = getCategories();
  const catData = cats.map(c => {
    const ci = items.filter(i => i.categoryId === c.id);
    return { ...c, count: ci.length, totalQty: ci.reduce((a, i) => a + i.quantity, 0), lowCount: ci.filter(i => i.quantity <= i.minStock).length };
  }).filter(c => c.count > 0);

  const maxQty = Math.max(...catData.map(c => c.totalQty), 1);
  const colors = ["primary", "green", "amber", "red", "gold"];
  let html = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">`;
  catData.forEach((c, idx) => {
    const pct = Math.round((c.totalQty / maxQty) * 100);
    html += `<div class="card" style="padding:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-size:1.2rem">${c.icon||""}</span><span style="font-weight:700">${esc(c.name)}</span></div><div style="display:flex;justify-content:space-between;font-size:.8rem;color:var(--muted);margin-bottom:6px"><span>${c.count} items</span><span>${c.totalQty} units</span></div><div class="rpt-bar" style="margin-bottom:6px"><div class="rpt-bar-fill ${colors[idx%colors.length]}" style="width:${pct}%"></div></div>${c.lowCount ? `<div style="font-size:.75rem;color:var(--amber);font-weight:600">${c.lowCount} low</div>` : ""}</div>`;
  });
  html += `</div>`;
  $("#reportContent").innerHTML = html;
}

function renderLocationReport() {
  const items = getItems();
  const locs = getLocations();
  let html = `<div class="table-wrap"><table><thead><tr><th>Location</th><th>Type</th><th>Items</th><th>Total Qty</th><th>Low Stock</th></tr></thead><tbody>`;
  locs.forEach(l => {
    const li = items.filter(i => i.locationId === l.id);
    const low = li.filter(i => i.quantity <= i.minStock).length;
    html += `<tr><td class="item-name">${esc(l.name)}</td><td><span class="cat-badge">${esc(l.type)}</span></td><td>${li.length}</td><td class="qty-strong">${li.reduce((a, i) => a + i.quantity, 0)}</td><td>${low ? `<span style="color:var(--amber);font-weight:600">${low}</span>` : "0"}</td></tr>`;
  });
  html += `</tbody></table></div>`;
  $("#reportContent").innerHTML = html;
}

function exportCSV() {
  const items = getItems();
  const cats = getCategories();
  const locs = getLocations();
  const dist = getDistricts().find(d => d.id === activeDistrictId);
  const rows = [["District", "Item", "Category", "Location", "Qty", "Unit", "Min", "New", "Good", "Fair", "Poor", "Damaged", "Status"]];
  items.forEach(i => {
    const cat = cats.find(c => c.id === i.categoryId);
    const loc = locs.find(l => l.id === i.locationId);
    const status = i.quantity === 0 ? "Out" : i.quantity <= i.minStock ? "Low" : "OK";
    const cc = i.conditionCounts || { new: 0, good: 0, fair: 0, poor: 0, damaged: 0 };
    rows.push([dist ? dist.name : "", i.name, cat ? cat.name : "", loc ? loc.name : "", i.quantity, i.unit, i.minStock, cc.new || 0, cc.good || 0, cc.fair || 0, cc.poor || 0, cc.damaged || 0, status]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `inventory-${dist ? dist.code : "all"}.csv`;
  a.click();
  toast("Exported.", "success");
}

/* ==================== INIT ==================== */
async function init() {
  if (window.__apiReadyPromise) await window.__apiReadyPromise;
  seedAll();

  const auth = getAuth();
  if (auth) { currentUser = auth; activeDistrictId = auth.districtId || "dist_1"; setActiveDistrict(activeDistrictId); showApp(); }

  $("#loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const user = login($("#loginUser").value.trim(), $("#loginPass").value);
    if (user) {
      currentUser = user;
      activeDistrictId = user.districtId || "dist_1";
      setActiveDistrict(activeDistrictId);
      setAuth(user);
      showApp();
    } else {
      $("#loginError").classList.remove("hidden");
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

  $("#addItemBtn").addEventListener("click", () => openItemModal(null));
  $("#itemForm").addEventListener("submit", saveItem);
  $("#inventoryBody").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "edit") { const item = getItems().find(i => i.id === btn.dataset.id); if (item) openItemModal(item); }
    else if (btn.dataset.action === "delete") deleteItem(btn.dataset.id);
  });
  $("#searchInput")?.addEventListener("input", renderInventory);
  $("#categoryFilter")?.addEventListener("change", renderInventory);
  $("#locationFilter")?.addEventListener("change", renderInventory);
  $("#conditionFilter")?.addEventListener("change", renderInventory);

  const condIds = ["fCondNew", "fCondGood", "fCondFair", "fCondPoor", "fCondDamaged"];
  const recalcTotal = () => {
    const total = condIds.reduce((sum, id) => sum + (parseInt($("#" + id)?.value, 10) || 0), 0);
    const qtyField = $("#fQuantity");
    if (qtyField) qtyField.value = total;
  };
  condIds.forEach(id => { const el = $("#" + id); if (el) el.addEventListener("input", recalcTotal); });

  $("#newTransBtn").addEventListener("click", openTransModal);
  $("#transForm").addEventListener("submit", saveTransaction);
  $("#tType")?.addEventListener("change", toggleTransferFields);
  $("#transDateFrom")?.addEventListener("change", renderTransactions);
  $("#transDateTo")?.addEventListener("change", renderTransactions);
  $("#transTypeFilter")?.addEventListener("change", renderTransactions);
  $("#clearTransFilter")?.addEventListener("click", () => { ["transDateFrom","transDateTo","transTypeFilter"].forEach(id => { const e = $(`#${id}`); if (e) e.value = ""; }); renderTransactions(); });

  $("#newInspectionBtn").addEventListener("click", () => openInspectionModal(null));
  $("#inspectionForm").addEventListener("submit", saveInspection);
  $("#inspBody").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "edit-insp") { const insp = getInspections().find(i => i.id === btn.dataset.id); if (insp) openInspectionModal(insp); }
    else if (btn.dataset.action === "delete-insp") deleteInspection(btn.dataset.id);
  });
  $("#inspSearch")?.addEventListener("input", renderInspections);
  $("#inspTypeFilter")?.addEventListener("change", renderInspections);
  $("#inspStatusFilter")?.addEventListener("change", renderInspections);

  $("#raiseDemandBtn").addEventListener("click", openDemandModal);
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
    if (!distId) {
      locSel.innerHTML = `<option value="">Select location</option>`;
      locSel.disabled = true;
      return;
    }
    const locs = getLocationsForDistrict(distId);
    locSel.innerHTML = `<option value="">Select location</option>` + locs.map(l => `<option value="${l.id}">[${esc(l.type.toUpperCase())}] ${esc(l.name)}</option>`).join("");
    locSel.disabled = false;
  });
  $("#demandForm").addEventListener("submit", saveDemand);
  $("#demandBody").addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "review-demand") openDemandAction(btn.dataset.id);
  });
  $("#demandSearch")?.addEventListener("input", renderDemands);
  $("#demandStatusFilter")?.addEventListener("change", renderDemands);

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
  $("#exportCSVBtn").addEventListener("click", exportCSV);

  $("#sidebarToggle")?.addEventListener("click", () => { $("#appRoot").classList.toggle("sidebar-collapsed"); });

  $$("[data-close]").forEach(btn => btn.addEventListener("click", closeModals));
  $$(".modal-backdrop").forEach(b => b.addEventListener("click", e => { if (e.target === b) closeModals(); }));
  $("#catInput")?.addEventListener("keydown", e => { if (e.key === "Enter") addCategory(); });
}

function showApp() {
  $("#loginScreen").classList.add("hidden");
  $("#appRoot").classList.remove("hidden");
  applyRoleUI();
  rebuildDropdowns();
  render();
}

document.addEventListener("DOMContentLoaded", init);
