import uuid
from sqlalchemy import Column, UUID, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    uid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(50), unique=True, nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    name = Column(String(50))
    hashed_password = Column(String(512), nullable=False)

    def to_dict(self):
        return {
            "uid": str(self.uid),
            "email": self.email,
            "phone": self.phone,
            "name": self.name,
        }
