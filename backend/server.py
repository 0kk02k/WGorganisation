from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


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


class Message(MessageBase):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=generate_id)
    created_at: str = Field(default_factory=now_iso)


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


@api_router.get("/")
async def root():
    return {"message": "WG Check-in API"}


@api_router.get("/stays", response_model=List[Stay])
async def list_stays():
    stays = await db.stays.find({}, {"_id": 0}).to_list(1000)
    return stays


@api_router.post("/stays", response_model=Stay)
async def create_stay(input: StayCreate):
    stay = Stay(**input.model_dump())
    await db.stays.insert_one(stay.model_dump())
    return stay


@api_router.get("/stays/{stay_id}", response_model=Stay)
async def get_stay(stay_id: str):
    stay = await db.stays.find_one({"id": stay_id}, {"_id": 0})
    if not stay:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")
    return stay


@api_router.put("/stays/{stay_id}", response_model=Stay)
async def update_stay(stay_id: str, input: StayUpdate):
    existing = await db.stays.find_one({"id": stay_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    await db.stays.update_one({"id": stay_id}, {"$set": update_data})
    updated = await db.stays.find_one({"id": stay_id}, {"_id": 0})
    return updated


@api_router.delete("/stays/{stay_id}")
async def delete_stay(stay_id: str):
    result = await db.stays.delete_one({"id": stay_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Aufenthalt nicht gefunden")
    return {"ok": True}


@api_router.get("/manuals", response_model=List[Manual])
async def list_manuals():
    manuals = await db.manuals.find({}, {"_id": 0}).to_list(1000)
    return manuals


@api_router.post("/manuals", response_model=Manual)
async def create_manual(input: ManualCreate):
    manual = Manual(**input.model_dump())
    await db.manuals.insert_one(manual.model_dump())
    return manual


@api_router.get("/manuals/{manual_id}", response_model=Manual)
async def get_manual(manual_id: str):
    manual = await db.manuals.find_one({"id": manual_id}, {"_id": 0})
    if not manual:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")
    return manual


@api_router.put("/manuals/{manual_id}", response_model=Manual)
async def update_manual(manual_id: str, input: ManualUpdate):
    existing = await db.manuals.find_one({"id": manual_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")

    update_data = input.model_dump(exclude_unset=True)
    update_data = {key: value for key, value in update_data.items() if value is not None}
    update_data["updated_at"] = now_iso()

    await db.manuals.update_one({"id": manual_id}, {"$set": update_data})
    updated = await db.manuals.find_one({"id": manual_id}, {"_id": 0})
    return updated


@api_router.delete("/manuals/{manual_id}")
async def delete_manual(manual_id: str):
    result = await db.manuals.delete_one({"id": manual_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anleitung nicht gefunden")
    return {"ok": True}


@api_router.get("/messages", response_model=List[Message])
async def list_messages():
    messages = (
        await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    )
    return messages


@api_router.post("/messages", response_model=Message)
async def create_message(payload: MessageBase):
    message = Message(**payload.model_dump())
    await db.messages.insert_one(message.model_dump())
    return message


async def get_or_create_settings() -> Settings:
    settings = await db.settings.find_one({"id": "wg-settings"}, {"_id": 0})
    if settings:
        return Settings(**settings)
    default_settings = Settings()
    await db.settings.insert_one(default_settings.model_dump())
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
    update_data["updated_at"] = now_iso()
    await db.settings.update_one({"id": current.id}, {"$set": update_data}, upsert=True)
    updated = await db.settings.find_one({"id": current.id}, {"_id": 0})
    return Settings(**updated)


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


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()