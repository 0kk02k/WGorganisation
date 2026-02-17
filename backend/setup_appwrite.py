"""
Script zum Erstellen der Appwrite-Datenbank und Collections.
Fuehre dieses Script einmalig aus, um die Datenbankstruktur zu erstellen.
"""

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv
from pathlib import Path
import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Appwrite client setup
client = Client()
client.set_endpoint(os.environ["APPWRITE_ENDPOINT"])
client.set_project(os.environ["APPWRITE_PROJECT_ID"])
client.set_key(os.environ["APPWRITE_API_KEY"])

db_service = Databases(client)
DATABASE_ID = os.environ["APPWRITE_DATABASE_ID"]

# Collection definitions with attributes
COLLECTIONS = {
    "stays": {
        "name": "Stays",
        "attributes": [
            {"key": "id", "type": "string", "size": 36, "required": True},
            {"key": "room", "type": "string", "size": 50, "required": True},
            {"key": "occupant_name", "type": "string", "size": 255, "required": True},
            {"key": "start_date", "type": "string", "size": 50, "required": True},
            {"key": "end_date", "type": "string", "size": 50, "required": True},
            {"key": "notes", "type": "string", "size": 5000, "required": False},
            {"key": "checklist_in", "type": "string", "size": 10000, "required": False},
            {"key": "checklist_out", "type": "string", "size": 10000, "required": False},
            {"key": "created_at", "type": "string", "size": 50, "required": False},
            {"key": "updated_at", "type": "string", "size": 50, "required": False},
        ]
    },
    "manuals": {
        "name": "Manuals",
        "attributes": [
            {"key": "id", "type": "string", "size": 36, "required": True},
            {"key": "title", "type": "string", "size": 255, "required": True},
            {"key": "description", "type": "string", "size": 5000, "required": True},
            {"key": "steps", "type": "string", "size": 50000, "required": True},
            {"key": "image_url", "type": "string", "size": 500, "required": False},
            {"key": "image_data", "type": "string", "size": 500000, "required": False},
            {"key": "created_at", "type": "string", "size": 50, "required": False},
            {"key": "updated_at", "type": "string", "size": 50, "required": False},
        ]
    },
    "messages": {
        "name": "Messages",
        "attributes": [
            {"key": "id", "type": "string", "size": 36, "required": True},
            {"key": "name", "type": "string", "size": 255, "required": True},
            {"key": "content", "type": "string", "size": 5000, "required": True},
            {"key": "created_at", "type": "string", "size": 50, "required": False},
            {"key": "replies", "type": "string", "size": 50000, "required": False},
        ]
    },
    "events": {
        "name": "Events",
        "attributes": [
            {"key": "id", "type": "string", "size": 36, "required": True},
            {"key": "title", "type": "string", "size": 255, "required": True},
            {"key": "date", "type": "string", "size": 50, "required": True},
            {"key": "location", "type": "string", "size": 255, "required": True},
            {"key": "description", "type": "string", "size": 5000, "required": True},
            {"key": "hashtags", "type": "string", "size": 5000, "required": False},
            {"key": "created_at", "type": "string", "size": 50, "required": False},
        ]
    },
    "berlin_links": {
        "name": "Berlin Links",
        "attributes": [
            {"key": "id", "type": "string", "size": 36, "required": True},
            {"key": "url", "type": "string", "size": 500, "required": True},
            {"key": "description", "type": "string", "size": 5000, "required": True},
            {"key": "hashtags", "type": "string", "size": 5000, "required": False},
            {"key": "created_at", "type": "string", "size": 50, "required": False},
        ]
    },
    "settings": {
        "name": "Settings",
        "attributes": [
            {"key": "id", "type": "string", "size": 50, "required": True},
            {"key": "rooms", "type": "string", "size": 5000, "required": False},
            {"key": "checkin_template", "type": "string", "size": 5000, "required": False},
            {"key": "checkout_template", "type": "string", "size": 5000, "required": False},
            {"key": "plantsWateredAt", "type": "string", "size": 50, "required": False},
            {"key": "updated_at", "type": "string", "size": 50, "required": False},
        ]
    }
}


def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Try to list databases using the correct method
        result = db_service.list()
        for db in result.get("databases", []):
            if db.get("$id") == DATABASE_ID:
                print(f"[OK] Datenbank '{DATABASE_ID}' existiert bereits")
                return True
        
        # Database not found, create it
        print(f"[...] Erstelle Datenbank '{DATABASE_ID}'...")
        db_service.create(DATABASE_ID, "WG Organiser")
        print(f"[OK] Datenbank '{DATABASE_ID}' erstellt")
        return True
    except AppwriteException as e:
        # If database doesn't exist, try to create it
        if "not found" in str(e).lower() or "could not be found" in str(e).lower():
            try:
                print(f"[...] Erstelle Datenbank '{DATABASE_ID}'...")
                db_service.create(DATABASE_ID, "WG Organiser")
                print(f"[OK] Datenbank '{DATABASE_ID}' erstellt")
                return True
            except AppwriteException as err:
                print(f"[ERR] Fehler beim Erstellen der Datenbank: {err}")
                return False
        else:
            print(f"[ERR] Fehler beim Pruefen der Datenbank: {e}")
            return False
    except AttributeError:
        # Fallback: Just try to create the database
        try:
            print(f"[...] Erstelle Datenbank '{DATABASE_ID}'...")
            db_service.create(DATABASE_ID, "WG Organiser")
            print(f"[OK] Datenbank '{DATABASE_ID}' erstellt")
            return True
        except AppwriteException as err:
            if "already exists" in str(err).lower():
                print(f"[OK] Datenbank '{DATABASE_ID}' existiert bereits")
                return True
            print(f"[ERR] Fehler beim Erstellen der Datenbank: {err}")
            return False


def create_collection(collection_id: str, collection_data: dict):
    """Create a collection with attributes and public permissions"""
    try:
        # Check if collection exists
        result = db_service.list_collections(DATABASE_ID)
        for col in result.get("collections", []):
            if col.get("$id") == collection_id:
                print(f"  [OK] Collection '{collection_id}' existiert bereits")
                # Update permissions for existing collection
                try:
                    db_service.update_collection(
                        DATABASE_ID,
                        collection_id,
                        collection_data["name"],
                        permissions=[
                            "create(\"any\")",
                            "read(\"any\")",
                            "update(\"any\")",
                            "delete(\"any\")"
                        ]
                    )
                    print(f"  [OK] Berechtigungen für '{collection_id}' aktualisiert")
                except AppwriteException as perm_err:
                    print(f"  [WARN] Konnte Berechtigungen nicht aktualisieren: {perm_err}")
                return True
        
        # Create collection with public permissions
        print(f"  [...] Erstelle Collection '{collection_id}'...")
        db_service.create_collection(
            DATABASE_ID,
            collection_id,
            collection_data["name"],
            permissions=[
                "create(\"any\")",
                "read(\"any\")",
                "update(\"any\")",
                "delete(\"any\")"
            ]
        )
        print(f"  [OK] Collection '{collection_id}' erstellt mit öffentlichen Berechtigungen")
        
        # Create attributes
        for attr in collection_data["attributes"]:
            try:
                db_service.create_string_attribute(
                    DATABASE_ID,
                    collection_id,
                    attr["key"],
                    attr["size"],
                    attr.get("required", False)
                )
                print(f"    [OK] Attribut '{attr['key']}' erstellt")
            except AppwriteException as attr_err:
                if "already exists" not in str(attr_err).lower():
                    print(f"    [ERR] Fehler bei Attribut '{attr['key']}': {attr_err}")
                else:
                    print(f"    [OK] Attribut '{attr['key']}' existiert bereits")
        
        return True
    except AppwriteException as e:
        print(f"  [ERR] Fehler bei Collection '{collection_id}': {e}")
        return False


def main():
    print("=" * 60)
    print("Appwrite Setup fuer WG Organiser")
    print("=" * 60)
    print()
    
    print("Schritt 1: Datenbank erstellen")
    if not create_database():
        print("Abbruch: Datenbank konnte nicht erstellt werden")
        return
    print()
    
    print("Schritt 2: Collections erstellen")
    for collection_id, collection_data in COLLECTIONS.items():
        create_collection(collection_id, collection_data)
    
    print()
    print("=" * 60)
    print("Setup abgeschlossen!")
    print("=" * 60)


if __name__ == "__main__":
    main()
