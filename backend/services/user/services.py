from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import UUID
from typing import Optional

from services.user.schemas import UserCreate, UserUpdate
from services.user.models import User, Base
from shared.utils import get_logger


class UserService:
    def __init__(self, db_url: str):
        self.logger = get_logger("user")
        self.logger.debug("Connecting to database: %s", db_url)

        self.engine = create_engine(db_url, pool_size=20, max_overflow=10)
        Base.metadata.create_all(self.engine)

        self.session = sessionmaker(bind=self.engine)
        self.db = self.session()

        self.logger.info(f"Connected to database: %s", db_url)

    def register_user(self, user_data: UserCreate) -> Optional[User]:
        """Creates a new User"""

        self.logger.debug("Registering new user: %s", user_data.email)

        user: User = User(**user_data.model_dump())

        try:
            self.db.add(user)
            self.db.commit()
            self.logger.info("Registered user: %s", user_data.email)
            return user

        except Exception as e:
            self.logger.error(f"Error in Registering user: {str(e)}")
            self.db.rollback()
            raise e

    def get_user(self, uid: UUID) -> Optional[User]:
        """Gets a user by their UID"""
        user = self.db.query(User).filter_by(uid=uid).first()

        if not user:
            self.logger.debug("User not found with UID: %s", uid)
            return None

        self.logger.debug("Retrieved user with UID: %s", user.uid)

        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Gets a user by their email id"""
        user = self.db.query(User).filter_by(email=email).first()

        if not user:
            self.logger.debug("User not found with Email: %s", email)
            return None

        self.logger.debug("Retrieved user with Email: %s", user.email)

        return user

    def update_user(self, uid: UUID, update_data: UserUpdate) -> Optional[User]:
        """Updates a user's details"""
        self.logger.debug("Updating user with ID: %s", uid)

        user = self.get_user(uid)
        if not user:
            self.logger.warning("User not found for update: %s", uid)
            return None

        for field, value in update_data.model_dump(
            exclude_unset=True, exclude_none=True
        ).items():
            setattr(user, field, value)

        self.db.commit()

        self.logger.info("Updated user with ID: %s", user.uid)
        self.logger.debug("Updated fields: %s", update_data.model_dump())

        return user

    def delete_user(self, uid: UUID) -> Optional[User]:
        """Deletes a user"""

        self.logger.debug("Deleting user with ID: %s", uid)

        user = self.get_user(uid)
        if not user:
            self.logger.warning("User not found for deletion: %s", uid)
            return None

        self.db.delete(user)
        self.db.commit()

        self.logger.info("Deleted user with ID: %s", user.uid)

        return user
