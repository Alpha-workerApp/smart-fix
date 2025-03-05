from uuid import UUID
from pydantic import BaseModel, field_validator
from datetime import datetime, time
from typing import Optional


class BookingCreate(BaseModel):
    CID: UUID
    TID: UUID
    SID: UUID
    booking_date: datetime
    booking_time: time
    status: str
    address: str
    longitude: float
    latitude: float


class BookingUpdate(BaseModel):
    status: Optional[str] = None


class Booking(BaseModel):
    BID: UUID
    CID: UUID
    TID: UUID
    SID: UUID
    booking_date: datetime
    booking_time: time
    status: str
    address: str
    longitude: float
    latitude: float

    class Config:
        from_attributes = True
