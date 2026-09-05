-- ============================================================
-- Haryana Police Inventory Management System
-- Neon (PostgreSQL) Schema
-- Run this once in the Neon SQL Editor
-- ============================================================

-- Districts
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  headquarters TEXT NOT NULL,
  created_at BIGINT
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT,
  district_id TEXT,
  location_id TEXT,
  created_at BIGINT
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT
);

-- Locations (all districts in one table, keyed by district_id)
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  district_id TEXT NOT NULL
);

-- Items (all districts in one table)
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT,
  quantity INTEGER DEFAULT 0,
  unit TEXT,
  min_stock INTEGER DEFAULT 0,
  location_id TEXT,
  district_id TEXT NOT NULL,
  condition_counts JSONB DEFAULT '{}',
  created_at BIGINT
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_name TEXT,
  type TEXT,
  quantity INTEGER,
  from_location TEXT,
  to_location TEXT,
  performed_by TEXT,
  notes TEXT,
  district_id TEXT,
  created_at BIGINT
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_name TEXT,
  inspector TEXT,
  findings TEXT,
  status TEXT,
  district_id TEXT,
  location_id TEXT,
  date TEXT,
  created_at BIGINT
);

-- Demands
CREATE TABLE IF NOT EXISTS demands (
  id TEXT PRIMARY KEY,
  item_name TEXT,
  quantity INTEGER,
  category_id TEXT,
  category_name TEXT,
  condition TEXT,
  urgency TEXT,
  reason TEXT,
  remarks TEXT,
  requested_by TEXT,
  requested_from_district TEXT,
  demand_to_district TEXT,
  demand_to_district_name TEXT,
  demand_to_location TEXT,
  demand_to_location_name TEXT,
  status TEXT,
  action_remarks TEXT,
  rejection_reason TEXT,
  created_at BIGINT,
  updated_at BIGINT
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  message TEXT,
  district_id TEXT,
  from_district_id TEXT,
  request_id TEXT,
  demand_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at BIGINT
);

-- Access requests (sign up)
CREATE TABLE IF NOT EXISTS access_requests (
  id TEXT PRIMARY KEY,
  name TEXT,
  post TEXT,
  mobile TEXT,
  district_id TEXT,
  location_id TEXT,
  user_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_items_district ON items(district_id);
CREATE INDEX IF NOT EXISTS idx_transactions_district ON transactions(district_id);
CREATE INDEX IF NOT EXISTS idx_notifications_district ON notifications(district_id);
