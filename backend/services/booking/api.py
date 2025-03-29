from flask import Flask, request, jsonify
from uuid import UUID
from omegaconf import DictConfig
from dotenv import load_dotenv

from services.booking.services import BookingService
from services.booking.schemas import BookingCreate, BookingUpdate
from services.booking.models import Booking
from shared.utils import with_hydra_config, get_logger, get_device_ip

load_dotenv()

app = Flask(__name__)
logger = get_logger("booking")

booking_service: BookingService


@app.route("/bookings", methods=["POST"])
def create_booking():
    """
    Creates a new booking.
    """
    logger.info(f"Received {request.method} request to /bookings")
    try:
        booking_data = BookingCreate(**request.get_json())
        new_booking: Booking = booking_service.create_booking(booking_data)
        return jsonify(new_booking.to_dict()), 201
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@app.route("/bookings/<bid>", methods=["GET"])
def get_booking(bid: str):
    """
    Retrieves a specific booking by ID.
    """
    logger.info(f"Received {request.method} request to /bookings/{bid}")
    try:
        bid_uuid = UUID(bid)
    except ValueError:
        return jsonify({"error": "Invalid BID format"}), 400

    booking: Booking = booking_service.get_booking(bid_uuid)
    if booking:
        return jsonify(booking.to_dict()), 200
    else:
        return jsonify({"error": "Booking not found"}), 404


@app.route("/bookings/<bid>", methods=["PUT"])
def update_booking_status(bid: str):
    """
    Updates an existing booking's status.
    """
    logger.info(f"Received {request.method} request to /bookings/{bid}")
    try:
        bid_uuid = UUID(bid)
    except ValueError:
        return jsonify({"error": "Invalid BID format"}), 400

    try:
        update_data = BookingUpdate(**request.get_json())
        updated_booking: Booking = booking_service.update_booking_status(
            bid_uuid, update_data
        )
        if updated_booking:
            return jsonify(updated_booking.to_dict()), 200
        else:
            return jsonify({"error": "Booking not found or update failed"}), 404
    except Exception as e:
        logger.error(f"Error updating booking status: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@with_hydra_config
def main(cfg: DictConfig):
    global booking_service
    logger.info("Initializing Booking service")

    ip_addr = get_device_ip()

    user_api_url = f"http://{ip_addr}:{cfg.user.server.port}/users"
    technician_api_url = f"http://{ip_addr}:{cfg.technician.server.port}/technicians"

    service_api_url = f"http://{ip_addr}:{cfg.service.server.port}/services"

    booking_service = BookingService(
        cfg.database.url,
        user_api_url,
        technician_api_url,
        service_api_url,
    )
    logger.info("Starting Flask server...")
    app.run(**cfg.booking.server)


if __name__ == "__main__":
    main()
