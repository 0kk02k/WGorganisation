"""
Script zum Loeschen und Neu erstellen der stays Collection mit kleineren Attributen.
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
COLLECTION_ID = "stays"

def main():
    print("Loesche stays Collection...")
    try:
        db_service.delete_collection(DATABASE_ID, COLLECTION_ID)
        print("[OK] Collection geloescht")
    except AppwriteException as e:
        print(f"[INFO] {e}")
    
    print("Erstelle stays Collection neu...")
    try:
        db_service.create_collection(DATABASE_ID, COLLECTION_ID, "Stays")
        print("[OK] Collection erstellt")
    except AppwriteException as e:
        print(f"[ERR] {e}")
        return
    
    # Attribute mit kleineren Groessen
    attributes = [
        {"key": "id", "size": 36, "required": True},
        {"key": "room", "size": 10, "required": True},
        {"key": "occupant_name", "size": 100, "required": True},
        {"key": "start_date", "size": 20, "required": True},
        {"key": "end_date", "size": 20, "required": True},
        {"key": "notes", "size": 1000, "required": False},
        {"key": "checklist_in", "size": 5000, "required": False},
        {"key": "checklist_out", "size": 5000, "required": False},
        {"key": "created_at", "size": 30, "required": False},
        {"key": "updated_at", "size": 30, "required": False},
    ]
    
    for attr in attributes:
        try:
            db_service.create_string_attribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr["key"],
                attr["size"],
                attr["required"]
            )
            print(f"  [OK] {attr['key']}")
        except AppwriteException as e:
            print(f"  [ERR] {attr['key']}: {e}")
    
    print("Fertig!")

if __name__ == "__main__":
    main()
