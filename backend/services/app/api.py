from datetime import datetime
from uuid import UUID
from flask import Flask, request, jsonify
from omegaconf import DictConfig
import requests
from dotenv import load_dotenv

from services.booking.services import BookingService
from services.booking.schemas import Booking, BookingCreate
from shared.utils import get_logger, with_hydra_config, get_device_ip

load_dotenv()

app = Flask(__name__)

logger = get_logger("app")

# Store active technicians and their statuses
active_technicians = {}
bookings = {}  # tid: (sid, cid, bid)

technician_loc = {}  # tid: (lat, long)
customer_loc = {}  # cid: (lat, long)

service_api_url: str
technician_api_url: str

booking_service: BookingService


@app.route("/")
def home():
    return "home"


# 1: Called by technician to set status active
@app.route("/technicians/status", methods=["POST"])
def update_technician_status():
    """
    Update the status of a technician.

    Expected JSON input:
    {
        "technician_id": "string",  # The ID of the technician
        "status": "string"           # The status of the technician ("active" or "inactive")
    }

    Returns:
    - 200: Status updated successfully
    - 400: Technician ID is required
    """

    data = request.get_json()
    technician_id = data.get("technician_id")
    status = data.get("status")  # "active" or "inactive"

    if technician_id:
        active_technicians[technician_id] = status
        logger.info(f"Technician {technician_id} status updated to {status}")
        return jsonify({"message": "Status updated"}), 200
    logger.error("Technician ID is required")
    return jsonify({"error": "Technician ID is required"}), 400


# 2: Called by Customer to make booking
@app.route("/booking/request", methods=["POST"])
def handle_booking_request():
    """
    Handle booking requests from customers.

    Expected JSON input:
    {
        "customer_id": "string",  # The ID of the customer
        "service_id": "string",    # The ID of the service requested
        "address": "string",        # The address for the booking
        "latitude": float,          # The latitude of the location
        "longitude": float          # The longitude of the location
    }

    Returns:
    - 200: Booking request processed successfully
    - 404: No technician available for the requested service
    """
    data = request.get_json()
    customer_id = data.get("customer_id")
    service_id = data.get("service_id")
    address = data.get("address")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    logger.info(
        f"Booking request received from customer {customer_id} for service {service_id}"
    )

    def find_technician(available_technicians, sid):
        """Find a technician that matches the service category."""
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

    available_technicians = {
        tid: status for tid, status in active_technicians.items() if status == "active"
    }

    logger.info(f"Available technicians: {available_technicians}")

    selected_technician = find_technician(available_technicians, service_id)

    if selected_technician:
        # Create booking data using the extracted address, latitude, and longitude
        booking_data = BookingCreate(
            UID=UUID(customer_id),
            TID=UUID(selected_technician),
            SID=service_id,
            booking_date=datetime.now(),
            booking_time=datetime.now().time(),
            status="pending",
            address=address,  # Use the address from the request
            longitude=longitude,  # Use the longitude from the request
            latitude=latitude,  # Use the latitude from the request
        )
        new_booking: Booking = booking_service.create_booking(booking_data)
        logger.info(f"Booking created in booking service: {new_booking.BID}")
        bookings[selected_technician] = (service_id, customer_id, new_booking.BID)
        return jsonify({"status": "pending", "technician_id": selected_technician}), 200
    else:
        logger.warning(f"No technician available for customer {customer_id}")
        return jsonify({"status": "no_technician_available"}), 404


# 3: Called by technician continuously until gets response
@app.route("/get/booking", methods=["GET"])
def get_bookings():
    """
    Retrieve booking for a given technician ID (TID).

    Expected query parameters:
    - tid: string (Technician ID)

    Returns:
    - 200: Bookings retrieved successfully
    - 400: Technician ID is required
    - 404: No bookings found for this technician
    """
    technician_id = request.args.get("tid")  # Get technician ID from query parameters

    if not technician_id:
        logger.error("Technician ID (tid) is required")
        return jsonify({"error": "Technician ID (tid) is required"}), 400

    # Retrieve booking for the given technician ID
    technician_bookings = (
        {
            "service_id": bookings[technician_id][0],
            "customer_id": bookings[technician_id][1],
            "booking_id": bookings[technician_id][2],
        }
        if technician_id in bookings
        else None
    )

    if technician_bookings:
        logger.info(
            f"Bookings retrieved for technician {technician_id}: {technician_bookings}"
        )
        return jsonify({"bookings": technician_bookings}), 200
    else:
        logger.warning(f"No bookings found for technician {technician_id}")
        return jsonify({"message": "No bookings found for this technician"}), 404


# 4: Technician calls the "{booking_api}/bookings/<bid>" to get the booking info (incl customer id as uid)


# Called by technician
@app.route("/technician/location", methods=["POST"])
def update_technician_location():
    """
    Add a technician's location.

    Expected JSON input:
    {
        "tid": "string",      # The ID of the technician
        "longitude": float,    # The longitude of the technician's location
        "latitude": float      # The latitude of the technician's location
    }

    Returns:
    - 200: Technician location added successfully
    - 400: Technician ID, longitude, and latitude are required
    """
    data = request.get_json()
    technician_id = data.get("tid")
    longitude = data.get("longitude")
    latitude = data.get("latitude")

    if not technician_id or longitude is None or latitude is None:
        logger.error("Technician ID, longitude, and latitude are required")
        return (
            jsonify({"error": "Technician ID, longitude, and latitude are required"}),
            400,
        )

    # Store the technician's location
    technician_loc[technician_id] = (latitude, longitude)
    logger.info(
        f"Technician {technician_id} location updated to: ({longitude}, {latitude})"
    )
    return jsonify({"message": "Technician location added successfully"}), 200


# Called by customer
@app.route("/customer/location", methods=["POST"])
def update_customer_location():
    """
    Add a customer's location.

    Expected JSON input:
    {
        "cid": "string",      # The ID of the customer
        "longitude": float,    # The longitude of the customer's location
        "latitude": float      # The latitude of the customer's location
    }

    Returns:
    - 201: Customer location added successfully
    - 400: Customer ID, longitude, and latitude are required
    """
    data = request.get_json()
    customer_id = data.get("cid")
    longitude = data.get("longitude")
    latitude = data.get("latitude")

    if not customer_id or longitude is None or latitude is None:
        logger.error("Customer ID, longitude, and latitude are required")
        return (
            jsonify({"error": "Customer ID, longitude, and latitude are required"}),
            400,
        )

    # Store the customer's location
    customer_loc[customer_id] = (latitude, longitude)
    logger.info(
        f"Customer {customer_id} location updated to: ({longitude}, {latitude})"
    )
    return jsonify({"message": "Customer location added successfully"}), 201


# Called by technician
@app.route("/customer/location", methods=["GET"])
def get_customer_location():
    """
    Retrieve the location (latitude, longitude) of a given customer ID (CID).

    Expected query parameters:
    - cid: string (Customer ID)

    Returns:
    - 200: Customer location retrieved successfully
    - 400: Customer ID (cid) is required
    - 404: No location found for this customer
    """
    customer_id = request.args.get("cid")  # Get customer ID from query parameters

    if not customer_id:
        logger.error("Customer ID (cid) is required")
        return jsonify({"error": "Customer ID (cid) is required"}), 400

    # Retrieve the customer's location
    location = customer_loc.get(customer_id)

    if location:
        logger.info(f"Location retrieved for customer {customer_id}: {location}")
        return (
            jsonify(
                {
                    "customer_id": customer_id,
                    "location": {"latitude": location[0], "longitude": location[1]},
                }
            ),
            200,
        )
    else:
        logger.warning(f"No location found for customer {customer_id}")
        return jsonify({"message": "No location found for this customer"}), 404


# Called by customer
@app.route("/technician/location", methods=["GET"])
def get_technician_location():
    """
    Retrieve the location (latitude, longitude) of a given technician ID (TID).

    Expected query parameters:
    - tid: string (Technician ID)

    Returns:
    - 200: Technician location retrieved successfully
    - 400: Technician ID (tid) is required
    - 404: No location found for this technician
    """
    technician_id = request.args.get("tid")

    if not technician_id:
        logger.error("Technician ID (tid) is required")
        return jsonify({"error": "Technician ID (tid) is required"}), 400

    # Retrieve the technician's location
    location = technician_loc.get(technician_id)

    if location:
        logger.info(f"Location retrieved for technician {technician_id}: {location}")
        return (
            jsonify(
                {
                    "technician_id": technician_id,
                    "location": {"latitude": location[0], "longitude": location[1]},
                }
            ),
            200,
        )
    else:
        logger.warning(f"No location found for technician {technician_id}")
        return jsonify({"message": "No location found for this technician"}), 404


# Called by customer
@app.route("/customer/location", methods=["DELETE"])
def delete_customer_location():
    """
    Delete a customer's location by customer ID (CID).

    Expected query parameters:
    - cid: string (Customer ID)

    Returns:
    - 200: Customer location deleted successfully
    - 400: Customer ID (cid) is required
    - 404: No location found for this customer
    """
    customer_id = request.args.get("cid")  # Get customer ID from query parameters

    if not customer_id:
        logger.error("Customer ID (cid) is required")
        return jsonify({"error": "Customer ID (cid) is required"}), 400

    if customer_id in customer_loc:
        del customer_loc[customer_id]
        logger.info(f"Deleted location for customer {customer_id}")
        return jsonify({"message": "Customer location deleted successfully"}), 200
    else:
        logger.warning(f"No location found for customer {customer_id}")
        return jsonify({"message": "No location found for this customer"}), 404


# Called by technician
@app.route("/technician/location", methods=["DELETE"])
def delete_technician_location():
    """
    Delete a technician's location by technician ID (TID).

    Expected query parameters:
    - tid: string (Technician ID)

    Returns:
    - 200: Technician location deleted successfully
    - 400: Technician ID (tid) is required
    - 404: No location found for this technician
    """
    technician_id = request.args.get("tid")  # Get technician ID from query parameters

    if not technician_id:
        logger.error("Technician ID (tid) is required")
        return jsonify({"error": "Technician ID (tid) is required"}), 400

    if technician_id in technician_loc:
        del technician_loc[technician_id]
        logger.info(f"Deleted location for technician {technician_id}")
        return jsonify({"message": "Technician location deleted successfully"}), 200
    else:
        logger.warning(f"No location found for technician {technician_id}")
        return jsonify({"message": "No location found for this technician"}), 404


# Called by technician
@app.route("/delete/active_technician", methods=["DELETE"])
def delete_active_technician():
    """
    Delete an active technician by technician ID (TID).

    Expected query parameters:
    - tid: string (Technician ID)

    Returns:
    - 200: Active technician deleted successfully
    - 400: Technician ID (tid) is required
    - 404: No active technician found with this ID
    """
    technician_id = request.args.get("tid")  # Get technician ID from query parameters

    if not technician_id:
        logger.error("Technician ID (tid) is required")
        return jsonify({"error": "Technician ID (tid) is required"}), 400

    if technician_id in active_technicians:
        del active_technicians[technician_id]
        logger.info(f"Deleted active technician {technician_id}")
        return jsonify({"message": "Active technician deleted successfully"}), 200
    else:
        logger.warning(f"No active technician found with ID {technician_id}")
        return jsonify({"message": "No active technician found with this ID"}), 404


# Called by technician
@app.route("/delete/booking", methods=["DELETE"])
def delete_booking():
    """
    Delete an active technician by technician ID (TID).

    Expected query parameters:
    - tid: string (Technician ID)

    Returns:
    - 200: Active technician deleted successfully
    - 400: Technician ID (tid) is required
    - 404: No active technician found with this ID
    """
    technician_id = request.args.get("tid")  # Get technician ID from query parameters

    if not technician_id:
        logger.error("Technician ID (tid) is required")
        return jsonify({"error": "Technician ID (tid) is required"}), 400

    if technician_id in bookings:
        del bookings[technician_id]
        logger.info(f"Deleted booking for technician {technician_id}")
        return jsonify({"message": "Booking deleted successfully"}), 200
    else:
        logger.warning(f"No booking found for technician {technician_id}")
        return jsonify({"message": "No booking found for this technician"}), 404


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

    logger.info("Starting Flask server...")

    app.run(host="0.0.0.0", port=cfg.app.server.port, debug=True)


if __name__ == "__main__":
    main()
