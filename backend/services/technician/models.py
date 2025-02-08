import uuid
from sqlalchemy import Column, UUID, Enum, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base

from shared.enums import IDProofType, ServiceCategory

Base = declarative_base()


class Technician(Base):
    __tablename__ = "technicians"

    TID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(50), unique=True, nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    id_proof_type = Column(Enum(IDProofType), nullable=False)
    id_proof_number = Column(String(50), nullable=False)
    is_verified = Column(Boolean)
    hashed_password = Column(String(512), nullable=False)
    service_category = Column(Enum(ServiceCategory), nullable=False)
    rating = Column(Float)
    longitude = Column(Float)
    latitude = Column(Float)
    is_available = Column(Boolean)

    def to_dict(self):
        id_proof_number: str = (
            ("X" * (len(self.id_proof_number) - 4) + self.id_proof_number[-4:])
            if self.id_proof_number
            else None
        )

        return {
            "TID": str(self.TID),
            "email": self.email,
            "phone": self.phone,
            "name": self.name,
            "id_proof_type": self.id_proof_type.value if self.id_proof_type else None,
            "id_proof_number": id_proof_number,
            "is_verified": self.is_verified,
            "service_category": (
                self.service_category.value if self.service_category else None
            ),
            "rating": self.rating,
            "longitude": self.longitude,
            "latitude": self.latitude,
            "is_available": self.is_available,
        }
