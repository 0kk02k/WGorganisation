-- Turso (LibSQL) Schema für WG Organiser
-- Ausführen mit: turso db shell wg-organiser < schema.sql

CREATE TABLE IF NOT EXISTS stays (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    occupant_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    checklist_in TEXT DEFAULT '[]',
    checklist_out TEXT DEFAULT '[]',
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS manuals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps TEXT NOT NULL,
    image_url TEXT,
    image_data TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT,
    replies TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    hashtags TEXT DEFAULT '[]',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS berlin_links (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    description TEXT NOT NULL,
    hashtags TEXT DEFAULT '[]',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    rooms TEXT DEFAULT '[]',
    checkin_template TEXT DEFAULT '[]',
    checkout_template TEXT DEFAULT '[]',
    plantsWateredAt TEXT,
    updated_at TEXT
);
