from sqlalchemy import Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Technician(Base):
    __tablename__ = "technicians"

    TID = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(50), unique=True, nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    name = Column(String(50))
    id_proof_type = Column(String(50))
    id_proof_number = Column(String(50))
    is_verified = Column(Boolean)
    hashed_password = Column(String(512), nullable=False)
    specialization = Column(String(50))
    rating = Column(Float)
    longitude = Column(Float)
    latitude = Column(Float)
    is_available = Column(Boolean)

    def to_dict(self):
        id_proof_number: str = (
            "X" * (len(self.id_proof_number) - 4) + self.id_proof_number[-4:]
        )

        return {
            "TID": self.TID,
            "email": self.email,
            "phone": self.phone,
            "name": self.name,
            "id_proof_type": self.id_proof_type,
            "id_proof_number": id_proof_number,
            "is_verified": self.is_verified,
            "specialization": self.specialization,
            "rating": self.rating,
            "longitude": self.longitude,
            "latitude": self.latitude,
            "is_available": self.is_available,
        }
