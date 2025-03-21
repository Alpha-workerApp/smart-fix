from flask import Flask, request, jsonify
from uuid import UUID
from omegaconf import DictConfig
from dotenv import load_dotenv

from services.technician.services import TechnicianService
from services.technician.schemas import TechnicianCreate, TechnicianUpdate
from services.technician.models import Technician
from shared.utils import with_hydra_config, get_logger

load_dotenv()

app = Flask(__name__)
logger = get_logger("technician")
technician_service: TechnicianService


@app.route("/technicians", methods=["POST"])
def create_technician():
    """
    Creates a new technician.

    Expects:
      - POST request to /technicians
      - JSON request body with 'name', 'email', 'phone', 'id_proof_type', 'id_proof_number', 'service_category' and 'hashed_password' fields.

    Returns:
      - 201 Created: JSON response with the created technician data.
      - 409 Conflict: If technician creation fails.
    """

    logger.info(f"Received {request.method} request to /technicians")

    try:
        technician_data = TechnicianCreate(**request.get_json())
        new_technician: Technician = technician_service.register_technician(
            technician_data
        )

        return jsonify(new_technician.to_dict()), 201
    except Exception as e:
        logger.error(f"Error in Registering technician: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@app.route("/technicians/<tid>", methods=["GET"])
def get_technician(tid: str):
    """
    Retrieves a specific technician by ID.

    Args:
      - tid: The ID of the technician to retrieve.

    Expects:
      - GET request to /technicians/<tid>

    Returns:
      - 200 OK: JSON response with the technician data.
      - 404 Not Found: If the technician is not found.
    """

    logger.info(f"Received {request.method} request to /technicians/{tid}")

    try:
        tid_uuid = UUID(tid)
    except ValueError:
        return jsonify({"error": "Invalid TID format"}), 400

    technician: Technician = technician_service.get_technician(tid_uuid)
    if technician:
        return jsonify(technician.to_dict()), 200
    else:
        return jsonify({"error": "Technician not found"}), 404


@app.route("/technicians", methods=["GET"])
def get_technician_by_email():
    """
    Retrieves a technician by email address.

    Expects:
      - GET request to /technicians
      - Query parameter 'email': The email address of the technician to retrieve.

    Returns:
      - 200 OK: JSON response with the technician data.
      - 404 Not Found: If the technician is not found.
    """

    logger.info(
        f"Received {request.method} request to /technicians?email={request.args.get('email')}"
    )

    email: str = request.args.get("email")
    technician: Technician = technician_service.get_technician_by_email(email)

    if technician:
        return jsonify(technician.to_dict()), 200
    else:
        return jsonify({"error": "Technician not found"}), 404


@app.route("/technicians/auth", methods=["GET"])
def get_hashed_password_by_email():
    """
    Retrieves a hashed password by email address.

    Expects:
      - GET request to /technicians
      - Query parameter 'email': The email address of the technician to retrieve.

    Returns:
      - 200 OK: JSON response with the hashed password.
      - 404 Not Found: If the technician is not found.
    """

    logger.info(
        f"Received {request.method} request to /technicians/auth?email={request.args.get('email')}"
    )

    email: str = request.args.get("email")
    technician: Technician = technician_service.get_technician_by_email(email)

    if technician:
        return jsonify({"hashed_password": technician.hashed_password}), 200
    else:
        return jsonify({"error": "Technician not found"}), 404


@app.route("/technicians/<tid>", methods=["PUT"])
def update_technician(tid: str):
    """
    Updates an existing technician.

    Args:
      - tid: The ID of the technician to update.

    Expects:
      - PUT request to /technicians/<tid>
      - JSON request body with at least any one of these fields 'name', 'email', 'phone', 'id_proof_type', 'id_proof_number', 'service_category'.

    Returns:
      - 200 OK: JSON response with the updated technician data.
      - 404 Not Found: If the technician is not found or update fails.
      - 409 Conflict: If update fails due to a conflict.
    """

    logger.info(f"Received {request.method} request to /technicians/{tid}")

    try:
        tid_uuid = UUID(tid)
    except ValueError:
        return jsonify({"error": "Invalid TID format"}), 400

    try:
        update_data = TechnicianUpdate(**request.get_json())
        updated_technician: Technician = technician_service.update_technician(
            tid_uuid, update_data
        )
        if updated_technician:
            return jsonify(updated_technician.to_dict()), 200
        else:
            return jsonify({"error": "Technician not found or update failed"}), 404

    except Exception as e:
        logger.error(f"Error updating technician: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@app.route("/technicians/<tid>", methods=["DELETE"])
def delete_technician(tid: str):
    """
    Deletes a technician.

    Args:
      - tid: The ID of the technician to delete.

    Expects:
      - DELETE request to /technicians/<tid>

    Returns:
      - 200 OK: JSON response with a success message.
      - 404 Not Found: If the technician is not found.
    """

    logger.info(f"Received {request.method} request to /technicians/{tid}")

    try:
        tid_uuid = UUID(tid)
    except ValueError:
        return jsonify({"error": "Invalid TID format"}), 400

    technician: Technician = technician_service.delete_technician(tid_uuid)

    if technician:
        return jsonify({"message": "Technician deleted successfully"}), 200
    else:
        return jsonify({"error": "Technician not found"}), 404


@app.route("/technicians/available", methods=["GET"])
def get_available_technicians():
    """
    Gets available technicians based on service_category, longitude, and latitude.

    Expects:
      - GET request to /technicians/available
      - Query parameters:
        - 'service_category': The service_category of the technicians to retrieve.
        - 'longitude': The longitude of the location.
        - 'latitude': The latitude of the location.

    Returns:
      - 200 OK: JSON response with a list of available technician data.
      - 400 Bad Request: If any of the required query parameters are missing.
    """

    logger.info(f"Received {request.method} request to /technicians/available")

    service_category = request.args.get("service_category")
    longitude = request.args.get("longitude")
    latitude = request.args.get("latitude")

    if not service_category or not longitude or not latitude:
        return jsonify({"error": "Missing required query parameters"}), 400

    try:
        longitude = float(longitude)
        latitude = float(latitude)
    except ValueError:
        return jsonify({"error": "Invalid longitude or latitude values"}), 400

    available_technicians = technician_service.get_available_technicians(
        service_category, longitude, latitude
    )
    return jsonify([tech.to_dict() for tech in available_technicians]), 200


@with_hydra_config
def main(cfg: DictConfig):
    global technician_service

    logger.info("Initializing Technician service")
    technician_service = TechnicianService(cfg.database.url)

    logger.info("Starting Flask server...")
    app.run(**cfg.technician.server)


if __name__ == "__main__":
    main()
