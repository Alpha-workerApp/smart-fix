from uuid import UUID
from pydantic import BaseModel
from datetime import datetime, time
from typing import Optional


class BookingCreate(BaseModel):
    UID: UUID
    TID: UUID
    SID: int
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
    UID: UUID
    TID: UUID
    SID: int
    booking_date: datetime
    booking_time: time
    status: str
    address: str
    longitude: float
    latitude: float

    class Config:
        from_attributes = True
