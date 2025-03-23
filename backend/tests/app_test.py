import time
import socketio
import threading
import requests

# Server details
SERVER_URL = "http://127.0.0.1:8006"  # Update if needed
USER_ID = "83075689-9319-419b-a60c-9f9235960189"
TECHNICIAN_ID = "55b93cb7-27ec-403d-9f0e-09a487dd987d"
SERVICE_ID = 110

# Create WebSocket clients for customer and technician
customer_socket = socketio.Client()
technician_socket = socketio.Client()

customer_disconnected = threading.Event()
technician_disconnected = threading.Event()
technician_status_updated = threading.Event()


def connect_customer():
    """Simulates a customer connecting and making a booking request."""
    customer_socket.connect(SERVER_URL)
    print("[Customer] Connected to WebSocket server.")

    # Listen for messages
    @customer_socket.on("response")
    def on_response(data):
        print(f"[Customer] Server Response: {data}")

    @customer_socket.on("booking_response")
    def on_booking_response(data):
        print(f"[Customer] Booking Response: {data}")
        customer_socket.disconnect()
        print("[Customer] Disconnected.")
        customer_disconnected.set()

    # Send booking request
    booking_request = {"customer_id": USER_ID, "service_id": SERVICE_ID}
    customer_socket.emit("booking_request", booking_request)


def connect_technician():
    """Simulates a technician connecting and accepting a booking."""

    # Listen for booking requests
    @technician_socket.on("booking_request")
    def on_booking_request(data):
        print(f"[Technician] Received booking request: {data}")

        # Accept the booking
        accept_data = {
            "technician_id": TECHNICIAN_ID,
            "customer_id": USER_ID,
            "customer_location": {"lat": 12.9716, "lon": 77.5946},
        }
        technician_socket.emit("booking_accept", accept_data)

    @technician_socket.on("customer_location")
    def on_customer_location(data):
        print(f"[Technician] Customer Location: {data}")
        technician_socket.disconnect()
        print("[Technician] Disconnected.")
        technician_disconnected.set()

    # Update technician status using HTTP request
    status_update_url = f"{SERVER_URL}/technicians/status"
    status_update_data = {"technician_id": TECHNICIAN_ID, "status": "active"}

    response = requests.post(status_update_url, json=status_update_data)

    if response.status_code == 200:
        technician_status_updated.set()
    else:
        print(f"Technician status update failed: {response.status_code}")

    print("[Technician] Connected to WebSocket server.")


# Run tests
connect_technician()
technician_status_updated.wait(10)
if not technician_status_updated.is_set():
    print("Technician status update timeout")

connect_customer()

# Wait for both disconnects
customer_disconnected.wait(10)
technician_disconnected.wait(10)

if not customer_disconnected.is_set():
    print("[Customer] Disconnect timeout.")

if not technician_disconnected.is_set():
    print("[Technician] Disconnect timeout.")
