from sqlalchemy import Column, Integer, String, Enum, Text, Float
from sqlalchemy.ext.declarative import declarative_base

from shared.enums import ServiceCategory

Base = declarative_base()


class Service(Base):
    __tablename__ = "services"

    sid = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    service_category = Column(Enum(ServiceCategory), nullable=False)
    description = Column(Text, nullable=False)
    media_files = Column(Text)
    price = Column(Float, nullable=False)

    def to_dict(self):
        return {
            "sid": self.sid,
            "title": self.title,
            "service_category": self.service_category.value,
            "description": self.description,
            "media_files": self.media_files.split(","),
            "price": self.price,
        }
