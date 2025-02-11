import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import List, Optional
from werkzeug.datastructures import FileStorage

from services.service.models import Service, Base
from services.service.schemas import ServiceCreate, ServiceUpdate
from shared.utils import get_logger


class ServiceService:
    def __init__(self, db_url: str, media_dir: str):

        self.logger = get_logger("service")
        self.logger.debug("Initializing ServiceService")

        self.engine = create_engine(db_url, pool_size=20, max_overflow=10)
        Base.metadata.create_all(self.engine)

        self.session = sessionmaker(bind=self.engine)
        self.db = self.session()

        self.media_dir = media_dir
        os.makedirs(self.media_dir, exist_ok=True)

        self.logger.info("ServiceService initialized successfully")

    def get_all_services(self):
        """Retrieves all services."""

        self.logger.debug("Fetching all services")

        services = self.db.query(Service).all()

        self.logger.info("Fetched all services successfully")

        return services

    def get_service(self, sid: int):
        """Retrieves a specific service by its ID."""

        self.logger.debug(f"Fetching service with ID: {sid}")
        service = self.db.query(Service).filter_by(sid=sid).first()

        if service:
            self.logger.info(f"Fetched service with ID: {sid} successfully")
            return service

        self.logger.info(f"Service with ID: {sid} not found")

        return None

    def add_service(self, service_data: ServiceCreate, media_files: List[FileStorage]):
        """Adds a new service to the database."""

        self.logger.debug("Adding new service")
        try:
            service = Service(
                title=service_data.title,
                service_category=service_data.service_category,
                description=service_data.description,
                price=service_data.price,
            )

            dir = os.path.join(
                self.media_dir, service.service_category.value, service.title
            )

            file_paths = self._save_media_files(media_files, dir)

            service.media_files = ";".join(file_paths)

            self.db.add(service)
            self.db.commit()
            self.logger.info("New service added successfully")
            return service

        except Exception as e:
            self.logger.error(f"Error adding service: {str(e)}")
            self.db.rollback()
            raise e

    def _save_media_files(self, media_files: List[FileStorage], dir: str):
        """Handles media file uploads and returns a list of file paths."""
        file_paths = []
        os.makedirs(dir, exist_ok=True)
        for file in media_files:
            try:
                filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join(dir, filename)
                file.save(file_path)
                file_paths.append(file_path)
            except Exception as e:
                raise ValueError(f"Error uploading file: {str(e)}")

        return file_paths

    def update_service(self, sid, service_data: ServiceUpdate):
        """Updates an existing service."""
        self.logger.debug(f"Updating service with ID: {sid}")
        try:
            service = self.db.query(Service).filter_by(sid=sid).first()
            if not service:
                self.logger.warning(f"Service not found for update: {sid}")
                return None

            for field, value in service_data.model_dump(
                exclude_unset=True, exclude_none=True, exclude={"media_files"}
            ).items():
                setattr(service, field, value)

            if service_data.media_files:
                self._delete_media_files(service)

                dir = os.path.join(
                    self.media_dir, service.service_category.value, service.title
                )
                new_media_files = self._save_media_files(service_data.media_files, dir)
                service.media_files = ";".join(new_media_files)

            self.db.commit()
            self.logger.info(f"Service with ID: {sid} updated successfully")
            return service

        except Exception as e:
            self.logger.error(f"Error updating service: {str(e)}")
            self.db.rollback()
            raise e

    def _delete_media_files(self, service: Service):
        """Handles deletion of media files of a given service"""
        media_files = service.media_files.split(";")
        for media_file in media_files:
            try:
                os.remove(media_file)
            except FileNotFoundError:
                self.logger.warning(f"Could not delete old media file: {media_file}")

    def delete_service(self, sid: int):
        """Deletes a service."""
        self.logger.debug(f"Deleting service with ID: {sid}")
        try:
            service = self.db.query(Service).filter_by(sid=sid).first()
            if not service:
                self.logger.warning(f"Service not found for deletion: {sid}")
                return None

            self._delete_media_files(service)

            self.db.delete(service)
            self.db.commit()
            self.logger.info(f"Service with ID: {sid} deleted successfully")
            return True

        except Exception as e:
            self.logger.error(f"Error deleting service: {str(e)}")
            self.db.rollback()
            raise e
