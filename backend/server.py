from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
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

# Appwrite client setup
client = Client()
client.set_endpoint(os.environ["APPWRITE_ENDPOINT"])
client.set_project(os.environ["APPWRITE_PROJECT_ID"])
client.set_key(os.environ["APPWRITE_API_KEY"])

db_service = Databases(client)
DATABASE_ID = os.environ["APPWRITE_DATABASE_ID"]

# Collection IDs
COLLECTION_STAYS = "stays"
COLLECTION_MANUALS = "manuals"
COLLECTION_MESSAGES = "messages"
COLLECTION_EVENTS = "events"
COLLECTION_BERLIN_LINKS = "berlin_links"
COLLECTION_SETTINGS = "settings"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    """Return ISO timestamp without microseconds (max 30 chars for Appwrite)"""
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
    updated_at: str = Field(default_factory=now_iso)


class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    rooms: Optional[List[RoomConfig]] = None
    checkin_template: Optional[List[str]] = None
    checkout_template: Optional[List[str]] = None


# Helper functions for Appwrite
def doc_to_stay(doc: dict) -> dict:
    """Convert Appwrite document to Stay dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "room": doc.get("room"),
        "occupant_name": doc.get("occupant_name"),
        "start_date": doc.get("start_date"),
        "end_date": doc.get("end_date"),
        "notes": doc.get("notes", ""),
        "checklist_in": json.loads(doc.get("checklist_in", "[]")),
        "checklist_out": json.loads(doc.get("checklist_out", "[]")),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def doc_to_manual(doc: dict) -> dict:
    """Convert Appwrite document to Manual dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "title": doc.get("title"),
        "description": doc.get("description"),
        "steps": doc.get("steps"),
        "image_url": doc.get("image_url"),
        "image_data": doc.get("image_data"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }


def doc_to_message(doc: dict) -> dict:
    """Convert Appwrite document to Message dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "name": doc.get("name"),
        "content": doc.get("content"),
        "created_at": doc.get("created_at"),
        "replies": json.loads(doc.get("replies", "[]")),
    }


def doc_to_event(doc: dict) -> dict:
    """Convert Appwrite document to Event dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "title": doc.get("title"),
        "date": doc.get("date"),
        "location": doc.get("location"),
        "description": doc.get("description"),
        "hashtags": json.loads(doc.get("hashtags", "[]")),
        "created_at": doc.get("created_at"),
    }


def doc_to_berlin_link(doc: dict) -> dict:
    """Convert Appwrite document to BerlinLink dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "url": doc.get("url"),
        "description": doc.get("description"),
        "hashtags": json.loads(doc.get("hashtags", "[]")),
        "created_at": doc.get("created_at"),
    }


def doc_to_settings(doc: dict) -> dict:
    """Convert Appwrite document to Settings dict"""
    return {
        "id": doc.get("id", doc.get("$id")),
        "rooms": json.loads(doc.get("rooms", json.dumps(DEFAULT_ROOMS))),
        "checkin_template": json.loads(doc.get("checkin_template", json.dumps(DEFAULT_CHECKIN_TEMPLATE))),
        "checkout_template": json.loads(doc.get("checkout_template", json.dumps(DEFAULT_CHECKOUT_TEMPLATE))),
        "updated_at": doc.get("updated_at"),
    }


@api_router.get("/")
async def root():
    return {"message": "WG Check-in API (Appwrite)"}


# ==================== STAYS ====================

@api_router.get("/stays", response_model=List[Stay])
async def list_stays():
    try:
        result = db_service.list_documents(DATABASE_ID, COLLECTION_STAYS)
        stays = [doc_to_stay(doc) for doc in result.get("documents", [])]
        return stays
    except AppwriteException as e:
        if "Collection not found" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/stays", response_model=Stay)
async def create_stay(input: StayCreate):
    stay = Stay(**input.model_dump())
    try:
        db_service.create_document(
            DATABASE_ID,
            COLLECTION_STAYS,
            stay.id,
            {
                "id": stay.id,
                "room": stay.room,
                "occupant_name": stay.occupant_name,
                "start_date": stay.start_date,
                "end_date": stay.end_date,
                "notes": stay.notes,
                "checklist_in": json.dumps([c.model_dump() for c in stay.checklist_in]),
                "checklist_out": json.dumps([c.model_dump() for c in stay.checklist_out]),
                "created_at": stay.created_at,
                "updated_at": stay.updated_at,
            }
        )
        return stay
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/stays/{stay_id}", response_model=Stay)
async def get_stay(stay_id: str):
    try:
        doc = db_service.get_document(DATABASE_ID, COLLECTION_STAYS, stay_id)
        return doc_to_stay(doc)
    except AppwriteException as e:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")


@api_router.put("/stays/{stay_id}", response_model=Stay)
async def update_stay(stay_id: str, input: StayUpdate):
    try:
        existing = db_service.get_document(DATABASE_ID, COLLECTION_STAYS, stay_id)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    # Convert checklist items to JSON
    if "checklist_in" in update_data:
        update_data["checklist_in"] = json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in update_data["checklist_in"]])
    if "checklist_out" in update_data:
        update_data["checklist_out"] = json.dumps([c.model_dump() if hasattr(c, 'model_dump') else c for c in update_data["checklist_out"]])

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_STAYS, stay_id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_STAYS, stay_id)
        return doc_to_stay(doc)
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/stays/{stay_id}")
async def delete_stay(stay_id: str):
    try:
        db_service.delete_document(DATABASE_ID, COLLECTION_STAYS, stay_id)
        return {"ok": True}
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")


# ==================== MANUALS ====================

@api_router.get("/manuals", response_model=List[Manual])
async def list_manuals():
    try:
        result = db_service.list_documents(DATABASE_ID, COLLECTION_MANUALS)
        manuals = [doc_to_manual(doc) for doc in result.get("documents", [])]
        return manuals
    except AppwriteException as e:
        if "Collection not found" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/manuals", response_model=Manual)
async def create_manual(input: ManualCreate):
    manual = Manual(**input.model_dump())
    try:
        db_service.create_document(
            DATABASE_ID,
            COLLECTION_MANUALS,
            manual.id,
            {
                "id": manual.id,
                "title": manual.title,
                "description": manual.description,
                "steps": manual.steps,
                "image_url": manual.image_url,
                "image_data": manual.image_data,
                "created_at": manual.created_at,
                "updated_at": manual.updated_at,
            }
        )
        return manual
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/manuals/{manual_id}", response_model=Manual)
async def get_manual(manual_id: str):
    try:
        doc = db_service.get_document(DATABASE_ID, COLLECTION_MANUALS, manual_id)
        return doc_to_manual(doc)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")


@api_router.put("/manuals/{manual_id}", response_model=Manual)
async def update_manual(manual_id: str, input: ManualUpdate):
    try:
        existing = db_service.get_document(DATABASE_ID, COLLECTION_MANUALS, manual_id)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_MANUALS, manual_id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_MANUALS, manual_id)
        return doc_to_manual(doc)
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/manuals/{manual_id}")
async def delete_manual(manual_id: str):
    try:
        db_service.delete_document(DATABASE_ID, COLLECTION_MANUALS, manual_id)
        return {"ok": True}
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")


# ==================== MESSAGES ====================

@api_router.get("/messages", response_model=List[Message])
async def list_messages():
    try:
        result = db_service.list_documents(DATABASE_ID, COLLECTION_MESSAGES)
        messages = [doc_to_message(doc) for doc in result.get("documents", [])]
        # Sort by created_at descending
        messages.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return messages
    except AppwriteException as e:
        if "Collection not found" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/messages", response_model=Message)
async def create_message(payload: MessageBase):
    message = Message(**payload.model_dump())
    try:
        db_service.create_document(
            DATABASE_ID,
            COLLECTION_MESSAGES,
            message.id,
            {
                "id": message.id,
                "name": message.name,
                "content": message.content,
                "created_at": message.created_at,
                "replies": json.dumps([]),
            }
        )
        return message
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/messages/{message_id}", response_model=Message)
async def update_message(message_id: str, payload: MessageUpdate):
    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No updates provided")

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_MESSAGES, message_id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_MESSAGES, message_id)
        return doc_to_message(doc)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Message not found")


@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    try:
        db_service.delete_document(DATABASE_ID, COLLECTION_MESSAGES, message_id)
        return {"status": "ok"}
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Message not found")


@api_router.post("/messages/{message_id}/replies", response_model=Message)
async def create_reply(message_id: str, payload: MessageReplyCreate):
    reply = MessageReply(name=payload.name, content=payload.content)
    try:
        doc = db_service.get_document(DATABASE_ID, COLLECTION_MESSAGES, message_id)
        replies = json.loads(doc.get("replies", "[]"))
        replies.append(reply.model_dump())
        db_service.update_document(DATABASE_ID, COLLECTION_MESSAGES, message_id, {"replies": json.dumps(replies)})
        doc = db_service.get_document(DATABASE_ID, COLLECTION_MESSAGES, message_id)
        return doc_to_message(doc)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Message not found")


# ==================== EVENTS ====================

@api_router.get("/events", response_model=List[Event])
async def list_events():
    try:
        result = db_service.list_documents(DATABASE_ID, COLLECTION_EVENTS)
        events = [doc_to_event(doc) for doc in result.get("documents", [])]
        # Sort by created_at descending
        events.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return events
    except AppwriteException as e:
        if "Collection not found" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/events", response_model=Event)
async def create_event(payload: EventBase):
    event = Event(**payload.model_dump())
    try:
        db_service.create_document(
            DATABASE_ID,
            COLLECTION_EVENTS,
            event.id,
            {
                "id": event.id,
                "title": event.title,
                "date": event.date,
                "location": event.location,
                "description": event.description,
                "hashtags": json.dumps(event.hashtags),
                "created_at": event.created_at,
            }
        )
        return event
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, payload: EventUpdate):
    update_data = payload.model_dump()
    update_data["hashtags"] = json.dumps(update_data.get("hashtags", []))

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_EVENTS, event_id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_EVENTS, event_id)
        return doc_to_event(doc)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Event not found")


@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    try:
        db_service.delete_document(DATABASE_ID, COLLECTION_EVENTS, event_id)
        return {"status": "ok"}
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Event not found")


# ==================== BERLIN LINKS ====================

@api_router.get("/berlin-links", response_model=List[BerlinLink])
async def list_berlin_links():
    try:
        result = db_service.list_documents(DATABASE_ID, COLLECTION_BERLIN_LINKS)
        links = [doc_to_berlin_link(doc) for doc in result.get("documents", [])]
        # Sort by created_at descending
        links.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return links
    except AppwriteException as e:
        if "Collection not found" in str(e):
            return []
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/berlin-links", response_model=BerlinLink)
async def create_berlin_link(payload: BerlinLinkBase):
    link = BerlinLink(**payload.model_dump())
    try:
        db_service.create_document(
            DATABASE_ID,
            COLLECTION_BERLIN_LINKS,
            link.id,
            {
                "id": link.id,
                "url": link.url,
                "description": link.description,
                "hashtags": json.dumps(link.hashtags),
                "created_at": link.created_at,
            }
        )
        return link
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/berlin-links/{link_id}", response_model=BerlinLink)
async def update_berlin_link(link_id: str, payload: BerlinLinkUpdate):
    update_data = payload.model_dump()
    update_data["hashtags"] = json.dumps(update_data.get("hashtags", []))

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_BERLIN_LINKS, link_id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_BERLIN_LINKS, link_id)
        return doc_to_berlin_link(doc)
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Link not found")


@api_router.delete("/berlin-links/{link_id}")
async def delete_berlin_link(link_id: str):
    try:
        db_service.delete_document(DATABASE_ID, COLLECTION_BERLIN_LINKS, link_id)
        return {"status": "ok"}
    except AppwriteException:
        raise HTTPException(status_code=404, detail="Link not found")


# ==================== SETTINGS ====================

async def get_or_create_settings() -> Settings:
    try:
        doc = db_service.get_document(DATABASE_ID, COLLECTION_SETTINGS, "wg-settings")
        settings_dict = doc_to_settings(doc)
        if len(settings_dict.get("rooms", [])) > 2:
            settings_dict["rooms"] = settings_dict.get("rooms", [])[:2]
        return Settings(**settings_dict)
    except AppwriteException:
        # Create default settings
        default_settings = Settings()
        try:
            db_service.create_document(
                DATABASE_ID,
                COLLECTION_SETTINGS,
                default_settings.id,
                {
                    "id": default_settings.id,
                    "rooms": json.dumps([r if isinstance(r, dict) else r.model_dump() for r in default_settings.rooms]),
                    "checkin_template": json.dumps(default_settings.checkin_template),
                    "checkout_template": json.dumps(default_settings.checkout_template),
                    "updated_at": default_settings.updated_at,
                }
            )
        except AppwriteException:
            pass
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
        update_data["rooms"] = json.dumps([r.model_dump() if hasattr(r, 'model_dump') else r for r in update_data["rooms"][:2]])
    if "checkin_template" in update_data:
        update_data["checkin_template"] = json.dumps(update_data["checkin_template"])
    if "checkout_template" in update_data:
        update_data["checkout_template"] = json.dumps(update_data["checkout_template"])

    update_data["updated_at"] = now_iso()

    try:
        db_service.update_document(DATABASE_ID, COLLECTION_SETTINGS, current.id, update_data)
        doc = db_service.get_document(DATABASE_ID, COLLECTION_SETTINGS, current.id)
        return Settings(**doc_to_settings(doc))
    except AppwriteException as e:
        raise HTTPException(status_code=500, detail=str(e))


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
