"""
Migrationsskript: Appwrite → Turso
Liest alle Daten aus Appwrite und schreibt sie in Turso.

Voraussetzungen:
  1. Turso DB erstellt:    turso db create wg-organiser
  2. Schema angelegt:      turso db shell wg-organiser < backend/schema.sql
  3. Token erstellt:       turso db tokens create wg-organiser
  4. .env enthält BOTH Appwrite- und Turso-Credentials

Verwendung:
  python backend/migrate_appwrite_to_turso.py
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from libsql_experimental import connect
from dotenv import load_dotenv
from pathlib import Path
import os
import sys
import json

# Fix encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ── Appwrite Client (Quelle) ─────────────────────────────────────────
print("=" * 60)
print("Migration: Appwrite → Turso")
print("=" * 60)
print()

print("[1/4] Verbinde mit Appwrite...")
aw_client = Client()
aw_client.set_endpoint(os.environ["APPWRITE_ENDPOINT"])
aw_client.set_project(os.environ["APPWRITE_PROJECT_ID"])
aw_client.set_key(os.environ["APPWRITE_API_KEY"])
aw_db = Databases(aw_client)
DATABASE_ID = os.environ["APPWRITE_DATABASE_ID"]
print("  [OK] Appwrite verbunden")

# ── Turso Client (Ziel) ──────────────────────────────────────────────
print("[2/4] Verbinde mit Turso...")
TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]

conn = connect(TURSO_URL, auth_token=TURSO_TOKEN)
print("  [OK] Turso verbunden")

# ── Hilfsfunktionen ───────────────────────────────────────────────────

def fetch_all_appwrite(collection_id: str) -> list[dict]:
    """Alle Dokumente aus einer Appwrite-Collection holen."""
    try:
        result = aw_db.list_documents(DATABASE_ID, collection_id)
        # Appwrite SDK v18 returns Pydantic objects
        if hasattr(result, "documents"):
            raw_docs = result.documents
        elif isinstance(result, dict):
            raw_docs = result.get("documents", [])
        else:
            raw_docs = []
        # Convert to plain dicts
        docs = []
        for doc in raw_docs:
            if hasattr(doc, "model_dump"):
                docs.append(doc.model_dump())
            elif hasattr(doc, "__dict__"):
                docs.append(vars(doc))
            else:
                docs.append(doc)
        print(f"  {collection_id}: {len(docs)} Dokumente gefunden")
        return docs
    except AppwriteException as e:
        if "Collection not found" in str(e) or "not found" in str(e).lower():
            print(f"  {collection_id}: Collection nicht gefunden (überspringe)")
            return []
        raise


def safe_str(doc: dict, key: str, default: str = "") -> str:
    """String-Wert aus Appwrite-Dokument holen, mit Fallback."""
    return doc.get(key, default) or default


def safe_json(doc: dict, key: str, default: str = "[]") -> str:
    """JSON-String aus Appwrite-Dokument holen und validieren."""
    raw = doc.get(key, default) or default
    try:
        json.loads(raw)  # Validiere, dass es gültiges JSON ist
        return raw
    except (json.JSONDecodeError, TypeError):
        return default


# ── Migration pro Collection ─────────────────────────────────────────

def migrate_stays(docs: list[dict]):
    """Stays migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO stays
                   (id, room, occupant_name, start_date, end_date, notes,
                    checklist_in, checklist_out, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_str(doc, "room"),
                    safe_str(doc, "occupant_name"),
                    safe_str(doc, "start_date"),
                    safe_str(doc, "end_date"),
                    safe_str(doc, "notes"),
                    safe_json(doc, "checklist_in"),
                    safe_json(doc, "checklist_out"),
                    safe_str(doc, "created_at"),
                    safe_str(doc, "updated_at"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Stay {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Stays migriert")


def migrate_manuals(docs: list[dict]):
    """Manuals migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO manuals
                   (id, title, description, steps, image_url, image_data,
                    created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_str(doc, "title"),
                    safe_str(doc, "description"),
                    safe_str(doc, "steps"),
                    safe_str(doc, "image_url"),
                    safe_str(doc, "image_data"),
                    safe_str(doc, "created_at"),
                    safe_str(doc, "updated_at"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Manual {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Manuals migriert")


def migrate_messages(docs: list[dict]):
    """Messages migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO messages
                   (id, name, content, created_at, replies)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_str(doc, "name"),
                    safe_str(doc, "content"),
                    safe_str(doc, "created_at"),
                    safe_json(doc, "replies"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Message {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Messages migriert")


def migrate_events(docs: list[dict]):
    """Events migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO events
                   (id, title, date, location, description, hashtags, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_str(doc, "title"),
                    safe_str(doc, "date"),
                    safe_str(doc, "location"),
                    safe_str(doc, "description"),
                    safe_json(doc, "hashtags"),
                    safe_str(doc, "created_at"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Event {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Events migriert")


def migrate_berlin_links(docs: list[dict]):
    """Berlin Links migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO berlin_links
                   (id, url, description, hashtags, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_str(doc, "url"),
                    safe_str(doc, "description"),
                    safe_json(doc, "hashtags"),
                    safe_str(doc, "created_at"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Berlin Link {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Berlin Links migriert")


def migrate_settings(docs: list[dict]):
    """Settings migrieren."""
    cursor = conn.cursor()
    count = 0
    for doc in docs:
        doc_id = doc.get("id", doc.get("$id", ""))
        try:
            cursor.execute(
                """INSERT OR REPLACE INTO settings
                   (id, rooms, checkin_template, checkout_template,
                    plantsWateredAt, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    doc_id,
                    safe_json(doc, "rooms", "[]"),
                    safe_json(doc, "checkin_template", "[]"),
                    safe_json(doc, "checkout_template", "[]"),
                    safe_str(doc, "plantsWateredAt"),
                    safe_str(doc, "updated_at"),
                ),
            )
            count += 1
        except Exception as e:
            print(f"    [WARN] Setting {doc_id} übersprungen: {e}")
    conn.commit()
    print(f"  [OK] {count} Settings migriert")


# ── Haupt-Migration ──────────────────────────────────────────────────

MIGRATIONS = [
    ("stays", migrate_stays),
    ("manuals", migrate_manuals),
    ("messages", migrate_messages),
    ("events", migrate_events),
    ("berlin_links", migrate_berlin_links),
    ("settings", migrate_settings),
]


def main():
    print("[3/4] Lese Daten aus Appwrite...")
    all_data = {}
    for collection_id, _ in MIGRATIONS:
        all_data[collection_id] = fetch_all_appwrite(collection_id)

    print()
    print("[4/4] Schreibe Daten in Turso...")
    for collection_id, migrate_fn in MIGRATIONS:
        docs = all_data[collection_id]
        if docs:
            migrate_fn(docs)
        else:
            print(f"  {collection_id}: Keine Daten, überspringe")

    # ── Verifikation ──────────────────────────────────────────────────
    print()
    print("=" * 60)
    print("Verifikation:")
    print("=" * 60)
    cursor = conn.cursor()
    for table_name in ["stays", "manuals", "messages", "events", "berlin_links", "settings"]:
        result = cursor.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()
        count = result[0] if result else 0
        print(f"  {table_name}: {count} Zeilen")

    print()
    print("=" * 60)
    print("Migration abgeschlossen!")
    print("=" * 60)
    print()
    print("Nächste Schritte:")
    print("  1. Backend-Code auf Turso umstellen (server.py)")
    print("  2. requirements.txt aktualisieren")
    print("  3. .env aktualisieren (Turso-Credentials)")
    print("  4. Backend testen")

    conn.close()


if __name__ == "__main__":
    main()
