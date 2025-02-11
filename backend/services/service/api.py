import os
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from omegaconf import DictConfig
from dotenv import load_dotenv

from services.service.services import ServiceService
from services.service.schemas import ServiceCreate, ServiceUpdate
from services.service.models import Service
from shared.enums import ServiceCategory
from shared.utils import with_hydra_config, get_logger

load_dotenv()

app = Flask(__name__)
logger = get_logger("service")
service_service: ServiceService


@app.route("/services", methods=["POST"])
def create_service():
    """
    Creates a new service.

    Expects:
        - POST request to /services
        - JSON request body with 'title', 'service_category', 'description', 'price' fields.
        - Optional: File uploads for 'media_files' (using multipart/form-data)

    Returns:
        - 201 Created: JSON response with the created service data.
        - 400 Bad Request: If request data is invalid.
        - 409 Conflict: If service creation fails.
        - 500 Internal Server Error: For unexpected exceptions.
    """

    logger.info(f"Received {request.method} request to /services")

    try:
        if request.content_type == "application/json":
            service_data = ServiceCreate(**request.get_json())
            media_files = []
        elif "multipart/form-data" in request.content_type:
            service_data = ServiceCreate(
                title=request.form.get("title"),
                service_category=ServiceCategory(request.form.get("service_category")),
                description=request.form.get("description"),
                price=float(request.form.get("price")),
            )
            media_files = request.files.getlist("media_files")
        else:
            return jsonify({"error": "Unsupported Media Type"}), 415

        new_service: Service = service_service.add_service(service_data, media_files)

        return jsonify(new_service.to_dict()), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/services/<sid>", methods=["GET"])
def get_service(sid: int):
    """
    Retrieves a specific service by ID.

    Args:
        - sid: The ID of the service to retrieve.

    Expects:
        - GET request to /services/<sid>

    Returns:
        - 200 OK: JSON response with the service data.
        - 404 Not Found: If the service is not found.
    """

    logger.info(f"Received {request.method} request to /services/{sid}")

    service: Service = service_service.get_service(sid)
    if service:
        return jsonify(service.to_dict()), 200
    else:
        return jsonify({"error": "Service not found"}), 404


@app.route("/services", methods=["GET"])
def get_all_services():
    """
    Retrieves all services.

    Expects:
        - GET request to /services

    Returns:
        - 200 OK: JSON response with a list of all services.
    """

    logger.info(f"Received {request.method} request to /services")

    services: list[Service] = service_service.get_all_services()
    return jsonify([service.to_dict() for service in services]), 200


@app.route("/services/<sid>", methods=["PUT"])
def update_service(sid: int):
    """
    Updates an existing service.

    Args:
        - sid: The ID of the service to update.

    Expects:
        - PUT request to /services/<sid>
        - JSON or multipart/form-data request body with any of these fields:
          'title', 'service_category', 'description', 'media_files', or 'price'.

    Returns:
        - 200 OK: JSON response with the updated service data.
        - 400 Bad Request: If request data is invalid.
        - 404 Not Found: If the service is not found or update fails.
        - 409 Conflict: If update fails due to a conflict.
    """

    logger.info(f"Received {request.method} request to /services/{sid}")

    try:
        if request.content_type == "application/json":
            update_data = ServiceUpdate(**request.get_json())
            media_files = []
        elif "multipart/form-data" in request.content_type:
            update_data = ServiceUpdate(
                title=request.form.get("title"),
                service_category=request.form.get("service_category"),
                description=request.form.get("description"),
                price=request.form.get("price"),
            )
            media_files = request.files.getlist("media_files")
        else:
            return jsonify({"error": "Unsupported Media Type"}), 415

        update_data.media_files = media_files

        updated_service: Service = service_service.update_service(sid, update_data)
        if updated_service:
            return jsonify(updated_service.to_dict()), 200
        else:
            return jsonify({"error": "Service not found or update failed"}), 404

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        logger.error(f"Error updating service: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/services/<sid>", methods=["DELETE"])
def delete_service(sid: int):
    """
    Deletes a service.

    Args:
        - sid: The ID of the service to delete.

    Expects:
        - DELETE request to /services/<sid>

    Returns:
        - 200 OK: JSON response with a success message.
        - 404 Not Found: If the service is not found.
    """

    logger.info(f"Received {request.method} request to /services/{sid}")

    service: Service = service_service.delete_service(sid)

    if service:
        return jsonify({"message": "Service deleted successfully"}), 200
    else:
        return jsonify({"error": "Service not found"}), 404


@app.route("/services/media_file", methods=["GET"])
def get_media_files():
    """
    Retrieves a specific media file.

    Args:
        path (query parameter): The path to the media file relative to BACKEND_DIR.

    Returns:
        - 200 OK: The media file.
        - 404 Not Found: If the file is not found.
        - 500 Internal Server Error: For other exceptions.
    """
    logger.info("Received GET request for a media file")

    path = request.args.get("path")
    if not path:
        logger.warning("No 'path' query parameter provided")
        return jsonify({"error": "Missing 'path' query parameter"}), 400

    file_path = os.path.join(os.environ.get("BACKEND_DIR"), path)
    file_path_obj = Path(file_path)

    if not file_path_obj.exists() or not file_path_obj.is_file():
        logger.error(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

    try:
        directory = str(file_path_obj.parent)
        filename = file_path_obj.name
        logger.info(f"Attempting to send file: {filename} from directory: {directory}")

        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        logger.exception(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500


@with_hydra_config
def main(cfg: DictConfig):
    global service_service

    logger.info("Initializing Service service")
    service_service = ServiceService(cfg.database.url, cfg.media.media_dir)

    logger.info("Starting Flask server...")
    app.run(**cfg.service.server)


if __name__ == "__main__":
    main()
