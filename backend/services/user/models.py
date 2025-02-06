from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    uid = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(50), unique=True, nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    name = Column(String(50))
    hashed_password = Column(String(512), nullable=False)

    def to_dict(self):
        return {
            "uid": self.uid,
            "email": self.email,
            "phone": self.phone,
            "name": self.name,
        }
