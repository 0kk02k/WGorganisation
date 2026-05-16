from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from libsql_experimental import connect
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Turso database connection
TURSO_URL = os.environ["TURSO_DATABASE_URL"]
TURSO_TOKEN = os.environ["TURSO_AUTH_TOKEN"]

conn = connect(TURSO_URL, auth_token=TURSO_TOKEN)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    """Return ISO timestamp without microseconds"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


DEFAULT_ROOMS = [
    {"id": "A", "name": "Zimmer A", "color": "#84cc16"},
    {"id": "B", "name": "Zimmer B", "color": "#0ea5e9"},
]
DEFAULT_CHECKIN_TEMPLATE = [
    "Schlüsselübergabe prüfen",
    "WLAN-Zugang mitteilen",
    "Fenster und Heizung kurz erklären",
    "Bad & Küche zeigen",
]
DEFAULT_CHECKOUT_TEMPLATE = [
    "Müll entsorgen",
    "Bettwäsche abziehen",
    "Fenster schließen",
    "Heizung runterdrehen",
    "Schlüssel zurücklegen",
]


class ChecklistItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    done: bool = False


class StayBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    room: str
    occupant_name: str
    start_date: str
    end_date: str
    notes: Optional[str] = ""
    checklist_in: List[ChecklistItem] = Field(default_factory=list)
    checklist_out: List[ChecklistItem] = Field(default_factory=list)


class StayCreate(StayBase):
    pass


class StayUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    room: Optional[str] = None
    occupant_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    checklist_in: Optional[List[ChecklistItem]] = None
    checklist_out: Optional[List[ChecklistItem]] = None


class Stay(StayBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ManualBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    description: str
    steps: str
    image_url: Optional[str] = None
    image_data: Optional[str] = None


class ManualCreate(ManualBase):
    pass


class ManualUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[str] = None
    image_url: Optional[str] = None
    image_data: Optional[str] = None


class Manual(ManualBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class MessageBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    content: str


class MessageReply(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    content: str
    created_at: str = Field(default_factory=now_iso)


class MessageReplyCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    content: str


class MessageUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = None
    content: Optional[str] = None


class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    replies: List[MessageReply] = Field(default_factory=list)


class EventBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str
    date: str
    location: str
    description: str
    hashtags: List[str] = Field(default_factory=list)


class Event(EventBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class EventUpdate(EventBase):
    model_config = ConfigDict(extra="ignore")


class BerlinLinkBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    url: str
    description: str
    hashtags: List[str] = Field(default_factory=list)


class BerlinLink(BerlinLinkBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)


class BerlinLinkUpdate(BerlinLinkBase):
    model_config = ConfigDict(extra="ignore")


class RoomConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    color: str


class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = "wg-settings"
    rooms: List[RoomConfig] = Field(default_factory=lambda: DEFAULT_ROOMS)
    checkin_template: List[str] = Field(default_factory=lambda: DEFAULT_CHECKIN_TEMPLATE)
    checkout_template: List[str] = Field(default_factory=lambda: DEFAULT_CHECKOUT_TEMPLATE)
    plantsWateredAt: Optional[str] = None
    updated_at: str = Field(default_factory=now_iso)


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    rooms: Optional[List[RoomConfig]] = None
    checkin_template: Optional[List[str]] = None
    checkout_template: Optional[List[str]] = None
    plantsWateredAt: Optional[str] = None


# Helper: convert a DB row (tuple) to a dict using column names
def row_to_dict(cursor, row) -> dict:
    """Convert a database row to a dictionary using cursor column descriptions."""
    columns = [desc[0] for desc in cursor.description]
    return dict(zip(columns, row))


@api_router.get("/")
async def root():
    return {"message": "WG Check-in API (Turso)"}


# ==================== STAYS ====================

@api_router.get("/stays", response_model=List[Stay])
async def list_stays():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stays")
    rows = cursor.fetchall()
    stays = []
    for row in rows:
        d = row_to_dict(cursor, row)
        d["checklist_in"] = json.loads(d.get("checklist_in", "[]"))
        d["checklist_out"] = json.loads(d.get("checklist_out", "[]"))
        stays.append(d)
    return stays


@api_router.post("/stays", response_model=Stay)
async def create_stay(input: StayCreate):
    stay = Stay(**input.model_dump())
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO stays
           (id, room, occupant_name, start_date, end_date, notes,
            checklist_in, checklist_out, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            stay.id,
            stay.room,
            stay.occupant_name,
            stay.start_date,
            stay.end_date,
            stay.notes,
            json.dumps([c.model_dump() for c in stay.checklist_in]),
            json.dumps([c.model_dump() for c in stay.checklist_out]),
            stay.created_at,
            stay.updated_at,
        ),
    )
    conn.commit()
    return stay


@api_router.get("/stays/{stay_id}", response_model=Stay)
async def get_stay(stay_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stays WHERE id = ?", (stay_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")
    d = row_to_dict(cursor, row)
    d["checklist_in"] = json.loads(d.get("checklist_in", "[]"))
    d["checklist_out"] = json.loads(d.get("checklist_out", "[]"))
    return d


@api_router.put("/stays/{stay_id}", response_model=Stay)
async def update_stay(stay_id: str, input: StayUpdate):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM stays WHERE id = ?", (stay_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    # Convert checklist items to JSON
    if "checklist_in" in update_data:
        update_data["checklist_in"] = json.dumps(
            [c.model_dump() if hasattr(c, "model_dump") else c for c in update_data["checklist_in"]]
        )
    if "checklist_out" in update_data:
        update_data["checklist_out"] = json.dumps(
            [c.model_dump() if hasattr(c, "model_dump") else c for c in update_data["checklist_out"]]
        )

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (stay_id,)

    cursor.execute(
        f"UPDATE stays SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM stays WHERE id = ?", (stay_id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["checklist_in"] = json.loads(d.get("checklist_in", "[]"))
    d["checklist_out"] = json.loads(d.get("checklist_out", "[]"))
    return d


@api_router.delete("/stays/{stay_id}")
async def delete_stay(stay_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM stays WHERE id = ?", (stay_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")
    cursor.execute("DELETE FROM stays WHERE id = ?", (stay_id,))
    conn.commit()
    return {"ok": True}


# ==================== MANUALS ====================

@api_router.get("/manuals", response_model=List[Manual])
async def list_manuals():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM manuals")
    rows = cursor.fetchall()
    return [row_to_dict(cursor, row) for row in rows]


@api_router.post("/manuals", response_model=Manual)
async def create_manual(input: ManualCreate):
    manual = Manual(**input.model_dump())
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO manuals
           (id, title, description, steps, image_url, image_data, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            manual.id,
            manual.title,
            manual.description,
            manual.steps,
            manual.image_url,
            manual.image_data,
            manual.created_at,
            manual.updated_at,
        ),
    )
    conn.commit()
    return manual


@api_router.get("/manuals/{manual_id}", response_model=Manual)
async def get_manual(manual_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM manuals WHERE id = ?", (manual_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")
    return row_to_dict(cursor, row)


@api_router.put("/manuals/{manual_id}", response_model=Manual)
async def update_manual(manual_id: str, input: ManualUpdate):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM manuals WHERE id = ?", (manual_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (manual_id,)

    cursor.execute(
        f"UPDATE manuals SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM manuals WHERE id = ?", (manual_id,))
    row = cursor.fetchone()
    return row_to_dict(cursor, row)


@api_router.delete("/manuals/{manual_id}")
async def delete_manual(manual_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM manuals WHERE id = ?", (manual_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")
    cursor.execute("DELETE FROM manuals WHERE id = ?", (manual_id,))
    conn.commit()
    return {"ok": True}


# ==================== MESSAGES ====================

@api_router.get("/messages", response_model=List[Message])
async def list_messages():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY created_at DESC")
    rows = cursor.fetchall()
    messages = []
    for row in rows:
        d = row_to_dict(cursor, row)
        d["replies"] = json.loads(d.get("replies", "[]"))
        messages.append(d)
    return messages


@api_router.post("/messages", response_model=Message)
async def create_message(payload: MessageBase):
    message = Message(**payload.model_dump())
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO messages (id, name, content, created_at, replies)
           VALUES (?, ?, ?, ?, ?)""",
        (message.id, message.name, message.content, message.created_at, "[]"),
    )
    conn.commit()
    return message


@api_router.put("/messages/{message_id}", response_model=Message)
async def update_message(message_id: str, payload: MessageUpdate):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")

    cursor = conn.cursor()
    cursor.execute("SELECT id FROM messages WHERE id = ?", (message_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Message not found")

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (message_id,)

    cursor.execute(
        f"UPDATE messages SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["replies"] = json.loads(d.get("replies", "[]"))
    return d


@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM messages WHERE id = ?", (message_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Message not found")
    cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
    conn.commit()
    return {"status": "ok"}


@api_router.post("/messages/{message_id}/replies", response_model=Message)
async def create_reply(message_id: str, payload: MessageReplyCreate):
    reply = MessageReply(name=payload.name, content=payload.content)
    cursor = conn.cursor()

    cursor.execute("SELECT replies FROM messages WHERE id = ?", (message_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Message not found")

    d = row_to_dict(cursor, row)
    replies = json.loads(d.get("replies", "[]"))
    replies.append(reply.model_dump())

    cursor.execute(
        "UPDATE messages SET replies = ? WHERE id = ?",
        (json.dumps(replies), message_id),
    )
    conn.commit()

    cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["replies"] = json.loads(d.get("replies", "[]"))
    return d


# ==================== EVENTS ====================

@api_router.get("/events", response_model=List[Event])
async def list_events():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM events ORDER BY created_at DESC")
    rows = cursor.fetchall()
    events = []
    for row in rows:
        d = row_to_dict(cursor, row)
        d["hashtags"] = json.loads(d.get("hashtags", "[]"))
        events.append(d)
    return events


@api_router.post("/events", response_model=Event)
async def create_event(payload: EventBase):
    event = Event(**payload.model_dump())
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO events (id, title, date, location, description, hashtags, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            event.id,
            event.title,
            event.date,
            event.location,
            event.description,
            json.dumps(event.hashtags),
            event.created_at,
        ),
    )
    conn.commit()
    return event


@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, payload: EventUpdate):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump()
    update_data["hashtags"] = json.dumps(update_data.get("hashtags", []))

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (event_id,)

    cursor.execute(
        f"UPDATE events SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["hashtags"] = json.loads(d.get("hashtags", "[]"))
    return d


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM events WHERE id = ?", (event_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Event not found")
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    return {"status": "ok"}


# ==================== BERLIN LINKS ====================

@api_router.get("/berlin-links", response_model=List[BerlinLink])
async def list_berlin_links():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM berlin_links ORDER BY created_at DESC")
    rows = cursor.fetchall()
    links = []
    for row in rows:
        d = row_to_dict(cursor, row)
        d["hashtags"] = json.loads(d.get("hashtags", "[]"))
        links.append(d)
    return links


@api_router.post("/berlin-links", response_model=BerlinLink)
async def create_berlin_link(payload: BerlinLinkBase):
    link = BerlinLink(**payload.model_dump())
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO berlin_links (id, url, description, hashtags, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (
            link.id,
            link.url,
            link.description,
            json.dumps(link.hashtags),
            link.created_at,
        ),
    )
    conn.commit()
    return link


@api_router.put("/berlin-links/{link_id}", response_model=BerlinLink)
async def update_berlin_link(link_id: str, payload: BerlinLinkUpdate):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM berlin_links WHERE id = ?", (link_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Link not found")

    update_data = payload.model_dump()
    update_data["hashtags"] = json.dumps(update_data.get("hashtags", []))

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (link_id,)

    cursor.execute(
        f"UPDATE berlin_links SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM berlin_links WHERE id = ?", (link_id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["hashtags"] = json.loads(d.get("hashtags", "[]"))
    return d


@api_router.delete("/berlin-links/{link_id}")
async def delete_berlin_link(link_id: str):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM berlin_links WHERE id = ?", (link_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Link not found")
    cursor.execute("DELETE FROM berlin_links WHERE id = ?", (link_id,))
    conn.commit()
    return {"status": "ok"}


# ==================== SETTINGS ====================

async def get_or_create_settings() -> Settings:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE id = ?", ("wg-settings",))
    row = cursor.fetchone()
    if row:
        d = row_to_dict(cursor, row)
        d["rooms"] = json.loads(d.get("rooms", json.dumps(DEFAULT_ROOMS)))
        d["checkin_template"] = json.loads(d.get("checkin_template", json.dumps(DEFAULT_CHECKIN_TEMPLATE)))
        d["checkout_template"] = json.loads(d.get("checkout_template", json.dumps(DEFAULT_CHECKOUT_TEMPLATE)))
        if len(d.get("rooms", [])) > 2:
            d["rooms"] = d["rooms"][:2]
        return Settings(**d)

    # Create default settings
    default_settings = Settings()
    cursor.execute(
        """INSERT INTO settings
           (id, rooms, checkin_template, checkout_template, plantsWateredAt, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            default_settings.id,
            json.dumps([r if isinstance(r, dict) else r.model_dump() for r in default_settings.rooms]),
            json.dumps(default_settings.checkin_template),
            json.dumps(default_settings.checkout_template),
            default_settings.plantsWateredAt,
            default_settings.updated_at,
        ),
    )
    conn.commit()
    return default_settings


@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await get_or_create_settings()
    return settings


@api_router.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate):
    current = await get_or_create_settings()
    update_data = payload.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}

    if "rooms" in update_data and update_data["rooms"]:
        update_data["rooms"] = json.dumps(
            [r.model_dump() if hasattr(r, "model_dump") else r for r in update_data["rooms"][:2]]
        )
    if "checkin_template" in update_data:
        update_data["checkin_template"] = json.dumps(update_data["checkin_template"])
    if "checkout_template" in update_data:
        update_data["checkout_template"] = json.dumps(update_data["checkout_template"])
    if "plantsWateredAt" in update_data:
        update_data["plantsWateredAt"] = update_data["plantsWateredAt"]

    update_data["updated_at"] = now_iso()

    set_clauses = [f"{key} = ?" for key in update_data.keys()]
    values = tuple(update_data.values()) + (current.id,)

    cursor = conn.cursor()
    cursor.execute(
        f"UPDATE settings SET {', '.join(set_clauses)} WHERE id = ?",
        values,
    )
    conn.commit()

    cursor.execute("SELECT * FROM settings WHERE id = ?", (current.id,))
    row = cursor.fetchone()
    d = row_to_dict(cursor, row)
    d["rooms"] = json.loads(d.get("rooms", json.dumps(DEFAULT_ROOMS)))
    d["checkin_template"] = json.loads(d.get("checkin_template", json.dumps(DEFAULT_CHECKIN_TEMPLATE)))
    d["checkout_template"] = json.loads(d.get("checkout_template", json.dumps(DEFAULT_CHECKOUT_TEMPLATE)))
    return Settings(**d)


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
