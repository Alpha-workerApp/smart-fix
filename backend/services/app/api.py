from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from threading import Lock
from omegaconf import DictConfig
import requests
from dotenv import load_dotenv

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


@app.route("/technicians/status", methods=["POST"])
def update_technician_status():
    # status can be "active" or "inactive"
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
    logger.info("Client connected")
    emit("response", {"message": "Connected to WebSocket server"})


@socketio.on("booking_request")
def handle_booking_request(data):
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
    else:
        emit(
            "booking_response", {"status": "no_technician_available"}, room=customer_id
        )
        logger.warning(f"No technician available for customer {customer_id}")


@socketio.on("booking_accept")
def handle_booking_accept(data):
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
    global service_api_url, technician_api_url

    logger.info("Initializing App server...")

    ip_addr = get_device_ip()

    service_api_url = f"http://{ip_addr}:{cfg.service.server.port}/services"
    technician_api_url = f"http://{ip_addr}:{cfg.technician.server.port}/technicians"

    logger.info("Starting Flask and Websocket server...")

    socketio.run(app, **cfg.app.server)


if __name__ == "__main__":
    main()
