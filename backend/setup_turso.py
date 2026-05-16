"""
Script zum Erstellen der Turso-Datenbanktabellen.
Führe dieses Script einmalig aus, um die Datenbankstruktur zu erstellen.

Voraussetzungen:
  1. Turso CLI installiert:  curl -sSfL https://get.tur.so/install.sh | bash
  2. Eingeloggt:              turso auth login
  3. DB erstellt:             turso db create wg-organiser
  4. Token erstellt:          turso db tokens create wg-organiser
  5. .env konfiguriert mit TURSO_DATABASE_URL und TURSO_AUTH_TOKEN

Verwendung:
  python backend/setup_turso.py
"""

from libsql_experimental import connect
from dotenv import load_dotenv
from pathlib import Path
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]

SCHEMA_SQL = """
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
"""

TABLES = ["stays", "manuals", "messages", "events", "berlin_links", "settings"]


def main():
    print("=" * 60)
    print("Turso Setup für WG Organiser")
    print("=" * 60)
    print()

    print("[1/2] Verbinde mit Turso...")
    conn = connect(TURSO_URL, auth_token=TURSO_TOKEN)
    cursor = conn.cursor()
    print("  [OK] Verbunden")
    print()

    print("[2/2] Erstelle Tabellen...")
    for statement in SCHEMA_SQL.strip().split(";"):
        statement = statement.strip()
        if statement:
            cursor.execute(statement)
    conn.commit()
    print("  [OK] Alle Tabellen erstellt")
    print()

    # Verifikation
    print("=" * 60)
    print("Verifikation:")
    print("=" * 60)
    for table in TABLES:
        result = cursor.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
        count = result[0] if result else 0
        print(f"  {table}: {count} Zeilen (Tabelle existiert)")

    conn.close()
    print()
    print("=" * 60)
    print("Setup abgeschlossen!")
    print("=" * 60)


if __name__ == "__main__":
    main()
