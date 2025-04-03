

from datetime import datetime
from uuid import UUID
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from threading import Lock
from omegaconf import DictConfig
import requests
from dotenv import load_dotenv

from services.booking.services import BookingService
from services.booking.schemas import Booking, BookingCreate
from shared.utils import get_logger, with_hydra_config, get_device_ip

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)
thread_lock = Lock()

logger = get_logger("app")

# Store active technicians and their statuses
active_technicians = {}
customer_connections = {}

service_api_url: str
technician_api_url: str

booking_service: BookingService


@app.route("/technicians/status", methods=["POST"])
def update_technician_status():
    """
    Updates the status of a technician.

    Expects a JSON payload with 'technician_id' and 'status' (either 'active' or 'inactive').

    Returns:
        - 200 OK with a success message if the status is updated.
        - 400 Bad Request if 'technician_id' is missing.
    """
    data = request.get_json()
    technician_id = data.get("technician_id")
    status = data.get("status")

    if technician_id:
        active_technicians[technician_id] = status
        logger.info(f"Technician {technician_id} status updated to {status}")
        return jsonify({"message": "Status updated"}), 200
    logger.error("Technician ID is required")
    return jsonify({"error": "Technician ID is required"}), 400


@socketio.on("connect")
def handle_connect():
    """
    Handles WebSocket client connections.

    Emits a 'response' message to the connected client.
    """
    logger.info("Client connected")
    emit("response", {"message": "Connected to WebSocket server"})


@socketio.on("booking_request")
def handle_booking_request(data):
    """
    Handles booking requests from customers.

    Expects a JSON payload with 'customer_id' and 'service_id'.
    Finds an available technician and forwards the booking request.

    Emits 'booking_response' to the customer with the booking status.
    Emits 'booking_request' to the selected technician.
    Creates a booking record in the booking service.
    """
    print(type(data))
    print(data)
    customer_id = data.get("customer_id")
    service_id = data.get("service_id")
    logger.info(
        f"Booking request received from customer {customer_id} for service {service_id}"
    )

    def find_technician(available_technicians, sid):
        response = requests.get(f"{service_api_url}/{sid}")

        if response.status_code == 200:
            service_data = response.json()
        elif response.status_code == 404:
            logger.warning(f"Service with ID {sid} not found.")
            return None
        else:
            logger.error(f"Error retrieving service data: {response.status_code}")
            return None

        for tid in available_technicians.keys():
            response = requests.get(f"{technician_api_url}/{tid}")
            technician_data = response.json()

            logger.info(service_data)
            logger.info(technician_data)

            if technician_data["service_category"] == service_data["serviceCategory"]:
                return tid
        logger.warning("No matching technician found")
        return None

    # Store customer connection
    customer_connections[customer_id] = service_id

    # Forward booking request to available technicians
    available_technicians = {
        tid: status for tid, status in active_technicians.items() if status == "active"
    }

    logger.info(available_technicians)

    selected_technician = find_technician(available_technicians, service_id)

    if selected_technician:
        emit(
            "booking_response",
            {"status": "pending", "technician_id": selected_technician},
            room=customer_id,
        )
        socketio.emit(
            "booking_request",
            {"customer_id": customer_id, "service_id": service_id},
            room=selected_technician,
        )
        logger.info(f"Booking request forwarded to technician {selected_technician}")
        # Create a booking in booking service.
        # try:
        booking_data = BookingCreate(
            UID=UUID(customer_id),
            TID=UUID(selected_technician),
            SID=service_id,
            booking_date=datetime.now(),  # Add the current date and time
            booking_time=datetime.now().time(),
            status="pending",
            address="Test Address",  # Add test address
            longitude=0.0,  # Add test longitude
            latitude=0.0,  # Add test latitude
        )
        new_booking: Booking = booking_service.create_booking(booking_data)
        logger.info(
            f"Booking created in booking service: {new_booking.BID}"
        )  # Log the booking id
        # except Exception as e:
        #     logger.error(f"Error creating booking in booking service: {str(e)}")
    else:
        emit(
            "booking_response", {"status": "no_technician_available"}, room=customer_id
        )
        logger.warning(f"No technician available for customer {customer_id}")


@socketio.on("booking_accept")
def handle_booking_accept(data):
    """
    Handles booking acceptance from technicians.

    Expects a JSON payload with 'technician_id', 'customer_id', and 'customer_location'.
    Notifies the customer and sends the customer's location to the technician.
    """
    technician_id = data.get("technician_id")
    customer_id = data.get("customer_id")
    customer_location = data.get("customer_location")
    logger.info(
        f"Booking accepted by technician {technician_id} for customer {customer_id}"
    )

    # Notify customer of booking acceptance
    emit(
        "booking_response",
        {"status": "accepted", "technician_id": technician_id},
        room=customer_id,
    )

    # Send customer location to technician
    socketio.emit(
        "customer_location", {"location": customer_location}, room=technician_id
    )
    logger.info(f"Customer location sent to technician {technician_id}")


@socketio.on("location_update")
def handle_location_update(data):
    """
    Handles location updates from technicians.

    Expects a JSON payload with 'technician_id', 'location', and 'customer_id'.
    Notifies the customer of the technician's location.
    """
    technician_id = data.get("technician_id")
    location = data.get("location")
    customer_id = data.get("customer_id")
    logger.info(
        f"Location update from technician {technician_id} for customer {customer_id}"
    )

    # Notify customer of technician's location
    emit(
        "location_update",
        {"technician_id": technician_id, "location": location},
        room=customer_id,
    )


@socketio.on("work_done")
def handle_work_done(data):
    """
    Handles work completion notifications from technicians.

    Expects a JSON payload with 'technician_id', 'customer_id', and 'work_report'.
    Notifies the customer that the work is done.
    """
    technician_id = data.get("technician_id")
    customer_id = data.get("customer_id")
    work_report = data.get("work_report")
    logger.info(f"Work done by technician {technician_id} for customer {customer_id}")

    # Notify customer that work is done
    emit(
        "work_done",
        {"technician_id": technician_id, "work_report": work_report},
        room=customer_id,
    )


@socketio.on("otp_request")
def handle_otp_request(data):
    # Change the logic as you want
    customer_id = data.get("customer_id")
    technician_id = data.get("technician_id")
    logger.info(
        f"OTP request from customer {customer_id} for technician {technician_id}"
    )

    # Request OTP from technician
    technician_response = requests.get(f"{technician_api_url}/{technician_id}/auth")
    if technician_response.status_code == 200:
        hashed_password = technician_response.json().get("hashed_password")
        emit("otp_response", {"hashed_password": hashed_password}, room=customer_id)
        logger.info(f"OTP response sent to customer {customer_id}")
    else:
        emit("otp_response", {"error": "Technician not found"}, room=customer_id)
        logger.error(f"Technician {technician_id} not found for OTP request")


@socketio.on("otp_verification")
def handle_otp_verification(data):
    # Change the logic as you want
    customer_id = data.get("customer_id")
    otp = data.get("otp")
    logger.info(f"OTP verification from customer {customer_id}")

    # Here you would verify the OTP (this is a placeholder)
    if otp == "123456":  # Replace with actual OTP verification logic
        emit("otp_verification_response", {"status": "verified"}, room=customer_id)
        logger.info(f"OTP verified for customer {customer_id}")
    else:
        emit("otp_verification_response", {"status": "invalid"}, room=customer_id)
        logger.warning(f"Invalid OTP for customer {customer_id}")


@socketio.on("payment_request")
def handle_payment_request(data):
    # Change the logic as you want
    customer_id = data.get("customer_id")
    technician_id = data.get("technician_id")
    payment_info = data.get("payment_info")
    logger.info(
        f"Payment request from customer {customer_id} to technician {technician_id}"
    )

    # Process payment (this is a placeholder)

    socketio.emit(
        "payment_received", {"technician_id": technician_id}, room=technician_id
    )
    logger.info(f"Payment received notification sent to technician {technician_id}")


@socketio.on("issue_report")
def handle_issue_report(data):
    """
    Handles issue reports from customers.

    Expects a JSON payload with 'customer_id', 'technician_id', and 'issue_description'.
    Notifies the technician of the issue.
    """
    customer_id = data.get("customer_id")
    technician_id = data.get("technician_id")
    issue_description = data.get("issue_description")

    logger.info(
        f"Issue report from customer {customer_id} to technician {technician_id}"
    )

    # Notify technician of the issue
    socketio.emit(
        "issue_reported",
        {"customer_id": customer_id, "issue_description": issue_description},
        room=technician_id,
    )


@socketio.on("disconnect")
def handle_disconnect(disconnect_id):
    """
    Handles client disconnections.

    Removes the client from the active lists (customers or technicians).
    """
    # To disconnect customer pass sid as id, to disconnect technician pass tid as id

    # Find and remove the customer or technician from active lists
    for customer_id, sid in customer_connections.items():
        if sid == disconnect_id:
            del customer_connections[customer_id]
            logger.info(f"Customer Service with id = {sid} is disconnected")
            break

    # Optionally, you can also handle technician disconnection
    for technician_id, status in active_technicians.items():
        if status == "active" and disconnect_id == technician_id:
            active_technicians[technician_id] = "inactive"  # Mark as inactive
            logger.info(f"Technician {technician_id} status updated to inactive")
            break

    print(f"Client disconnected: {disconnect_id}")


@with_hydra_config
def main(cfg: DictConfig):
    global service_api_url, technician_api_url, booking_service

    logger.info("Initializing App server...")

    ip_addr = get_device_ip()

    service_api_url = f"http://{ip_addr}:{cfg.service.server.port}/services"
    technician_api_url = f"http://{ip_addr}:{cfg.technician.server.port}/technicians"

    user_api_url = f"http://{ip_addr}:{cfg.user.server.port}/users"

    booking_service = BookingService(
        cfg.database.url,
        user_service_url=user_api_url,
        technician_service_url=technician_api_url,
        service_service_url=service_api_url,
    )

    logger.info("Starting Flask and Websocket server...")

    socketio.run(app, **cfg.app.server)


if __name__ == "__main__":
    main()
