from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class TechnicianCreate(BaseModel):
    email: EmailStr
    phone: str
    name: str
    id_proof_type: str
    id_proof_number: str
    hashed_password: str
    specialization: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, phone_no):
        if not phone_no.isdigit() or len(phone_no) != 10:
            raise ValueError("Phone number must contain 10 digits.")
        return phone_no


class TechnicianUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    id_proof_type: Optional[str] = None
    id_proof_number: Optional[str] = None
    specialization: Optional[str] = None
    rating: Optional[float] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    is_available: Optional[bool] = None


class Technician(BaseModel):
    TID: int
    email: EmailStr
    phone: str
    name: str
    id_proof_type: str
    id_proof_number: str
    is_verified: bool
    specialization: str
    rating: Optional[float]
    longitude: Optional[float]
    latitude: Optional[float]
    is_available: bool

    class Config:
        from_attributes = True
