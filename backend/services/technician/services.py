from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import UUID
from typing import Optional, List

from shared.utils import get_logger
from shared.enums import ServiceCategory
from services.technician.schemas import TechnicianCreate, TechnicianUpdate
from services.technician.models import Technician, Base


class TechnicianService:
    def __init__(self, db_url: str):
        self.logger = get_logger("technician")
        self.logger.debug("Connecting to database: %s", db_url)

        self.engine = create_engine(db_url, pool_size=20, max_overflow=10)
        Base.metadata.create_all(self.engine)

        self.session = sessionmaker(bind=self.engine)
        self.db = self.session()

        self.logger.info(f"Connected to database: %s", db_url)

    def register_technician(
        self, technician_data: TechnicianCreate
    ) -> Optional[Technician]:
        """Creates a new Technician"""

        self.logger.debug("Registering new technician: %s", technician_data.email)

        technician: Technician = Technician(**technician_data.model_dump())

        try:
            self.db.add(technician)
            self.db.commit()
            self.logger.info("Registered technician: %s", technician_data.email)
            return technician

        except Exception as e:
            self.logger.error(f"Error in Registering technician: {str(e)}")
            self.db.rollback()
            raise e

    def get_technician(self, TID: UUID) -> Optional[Technician]:
        """Gets a technician by their TID"""
        technician = self.db.query(Technician).filter_by(TID=TID).first()

        if not technician:
            self.logger.debug("Technician not found with TID: %s", TID)
            return None

        self.logger.debug("Retrieved technician with TID: %s", technician.TID)

        return technician

    def get_technician_by_email(self, email: str) -> Optional[Technician]:
        """Gets a technician by their email id"""
        technician = self.db.query(Technician).filter_by(email=email).first()

        if not technician:
            self.logger.debug("Technician not found with Email: %s", email)
            return None

        self.logger.debug("Retrieved technician with Email: %s", technician.email)

        return technician

    def update_technician(
        self, TID: UUID, update_data: TechnicianUpdate
    ) -> Optional[Technician]:
        """Updates a technician's details"""
        self.logger.debug("Updating technician with ID: %s", TID)

        technician = self.get_technician(TID)
        if not technician:
            self.logger.warning("Technician not found for update: %s", TID)
            return None

        for field, value in update_data.model_dump(
            exclude_unset=True, exclude_none=True
        ).items():
            setattr(technician, field, value)

        self.db.commit()

        self.logger.info("Updated technician with ID: %s", technician.TID)
        self.logger.debug("Updated fields: %s", update_data.model_dump())

        return technician

    def delete_technician(self, TID: UUID) -> Optional[Technician]:
        """Deletes a technician"""

        self.logger.debug("Deleting technician with ID: %s", TID)

        technician = self.get_technician(TID)
        if not technician:
            self.logger.warning("Technician not found for deletion: %s", TID)
            return None

        self.db.delete(technician)
        self.db.commit()

        self.logger.info("Deleted technician with ID: %s", technician.TID)

        return technician

    def get_available_technicians(
        self, service_category_str: str, longitude: float, latitude: float
    ) -> List[Technician]:
        """Gets available technicians based on service_category and location"""

        self.logger.debug(f"Getting available technicians for {service_category_str}")

        try:
            service_category = ServiceCategory(service_category_str)
        except ValueError:
            valid_values = [e.value for e in ServiceCategory]
            error_message = f"Invalid value for ServiceCategory: {service_category_str}. Valid values are: {', '.join(valid_values)}"
            self.logger.error(error_message)
            raise ValueError(error_message)

        available_technicians = (
            self.db.query(Technician)
            .filter(
                Technician.service_category == service_category,  # Use the enum member
                Technician.is_available == True,
            )
            .all()
        )

        # **Simplified distance calculation (replace with a more accurate method)**
        # def calculate_distance(tech: Technician):
        # Use a distance formula (e.g., Haversine) for accurate calculation
        # return 0  # Placeholder for distance calculation

        # available_technicians.sort(key=calculate_distance)

        return available_technicians
