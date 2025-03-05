import uuid
from sqlalchemy import Column, UUID, Integer, String, Float, DateTime, Time, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Booking(Base):
    __tablename__ = "bookings"

    BID = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    CID = Column(UUID(as_uuid=True), ForeignKey("users.UID"), nullable=False)
    TID = Column(UUID(as_uuid=True), ForeignKey("technicians.TID"), nullable=False)
    SID = Column(UUID(as_uuid=True), ForeignKey("services.SID"), nullable=False)
    booking_date = Column(DateTime, nullable=False)
    booking_time = Column(Time, nullable=False)
    status = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)

    def to_dict(self):
        return {
            "BID": str(self.BID),
            "CID": str(self.CID),
            "TID": str(self.TID),
            "SID": str(self.SID),
            "booking_date": self.booking_date.isoformat(),
            "booking_time": self.booking_time.isoformat(),
            "status": self.status,
            "address": self.address,
            "longitude": self.longitude,
            "latitude": self.latitude,
        }
