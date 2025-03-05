from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import UUID
from typing import Optional

from shared.utils import get_logger
from services.booking.schemas import BookingCreate, BookingUpdate
from services.booking.models import Booking, Base
import requests


class BookingService:
    def __init__(
        self,
        db_url: str,
        user_service_url: str,
        technician_service_url: str,
        service_service_url: str,
    ):
        self.logger = get_logger("booking")
        self.logger.debug("Connecting to database: %s", db_url)

        self.engine = create_engine(db_url, pool_size=20, max_overflow=10)
        Base.metadata.create_all(self.engine)

        self.session = sessionmaker(bind=self.engine)
        self.db = self.session()

        self.logger.info(f"Connected to database: %s", db_url)
        self.user_service_url = user_service_url
        self.technician_service_url = technician_service_url
        self.service_service_url = service_service_url

    def create_booking(self, booking_data: BookingCreate) -> Optional[Booking]:
        """Creates a new Booking"""
        self.logger.debug("Creating new booking")
        booking: Booking = Booking(**booking_data.model_dump())
        try:
            self.db.add(booking)
            self.db.commit()
            self.logger.info("Created booking: %s", booking.BID)
            return booking
        except Exception as e:
            self.logger.error(f"Error creating booking: {str(e)}")
            self.db.rollback()
            raise e

    def get_booking(self, BID: UUID) -> Optional[Booking]:
        """Gets a booking by their BID"""
        booking = self.db.query(Booking).filter_by(BID=BID).first()
        if not booking:
            self.logger.debug("Booking not found with BID: %s", BID)
            return None
        self.logger.debug("Retrieved booking with BID: %s", booking.BID)
        return booking

    def update_booking_status(
        self, BID: UUID, update_data: BookingUpdate
    ) -> Optional[Booking]:
        """Updates a booking's status"""
        self.logger.debug("Updating booking with ID: %s", BID)
        booking = self.get_booking(BID)
        if not booking:
            self.logger.warning("Booking not found for update: %s", BID)
            return None

        for field, value in update_data.model_dump(
            exclude_unset=True, exclude_none=True
        ).items():
            setattr(booking, field, value)

        self.db.commit()

        self.logger.info("Updated booking with ID: %s", booking.BID)
        self.logger.debug("Updated fields: %s", update_data.model_dump())

        return booking

    # Example of how to use the other service APIs (you'll need to adapt these)
    def get_user_details(self, cid: UUID):
        try:
            response = requests.get(f"{self.user_service_url}/{str(cid)}")
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching user details: {e}")
            return None

    def get_technician_details(self, tid: UUID):
        try:
            response = requests.get(f"{self.technician_service_url}/{str(tid)}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching technician details: {e}")
            return None

    def get_service_details(self, sid: UUID):
        try:
            response = requests.get(f"{self.service_service_url}/{str(sid)}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error fetching service details: {e}")
            return None
