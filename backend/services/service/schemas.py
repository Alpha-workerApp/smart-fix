from typing import List, Optional
from pydantic import BaseModel, Field

from shared.enums import ServiceCategory


class ServiceCreate(BaseModel):
    title: str = Field(..., max_length=255)
    service_category: ServiceCategory
    description: str
    price: float = Field(..., gt=0)
    media_files: List[str] = []


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    service_category: Optional[ServiceCategory] = None
    description: Optional[str] = None
    price: Optional[float] = None
    media_files: Optional[List[str]] = None


class Service(BaseModel):
    sid: int
    title: str
    service_category: ServiceCategory
    description: str
    media_files: List[str]
    price: float

    class Config:
        from_attributes = True
