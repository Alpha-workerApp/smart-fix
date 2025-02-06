from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    name: str
    hashed_password: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, phone_no):
        if not phone_no.isdigit() or len(phone_no) != 10:
            raise ValueError("Phone number must contain 10 digits.")
        return phone_no


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    hashed_password: Optional[str] = None


class User(BaseModel):
    uid: int
    email: EmailStr
    phone: str
    name: str

    class Config:
        from_attributes = True
