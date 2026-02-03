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