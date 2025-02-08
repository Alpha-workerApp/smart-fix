from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

from shared.enums import IDProofType, ServiceCategory


class TechnicianCreate(BaseModel):
    email: EmailStr
    phone: str
    name: str
    id_proof_type: IDProofType
    id_proof_number: str
    hashed_password: str
    service_category: ServiceCategory

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
    id_proof_type: Optional[IDProofType] = None
    id_proof_number: Optional[str] = None
    service_category: Optional[ServiceCategory] = None
    rating: Optional[float] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    is_available: Optional[bool] = None


class Technician(BaseModel):
    TID: UUID
    email: EmailStr
    phone: str
    name: str
    id_proof_type: IDProofType
    id_proof_number: str
    is_verified: bool
    service_category: ServiceCategory
    rating: Optional[float]
    longitude: Optional[float]
    latitude: Optional[float]
    is_available: bool

    class Config:
        from_attributes = True
