import time
import socketio

# Server details
SERVER_URL = "http://127.0.0.1:8006"  # Update if needed
CUSTOMER_ID = "83075689-9319-419b-a60c-9f9235960189"
TECHNICIAN_ID = "55b93cb7-27ec-403d-9f0e-09a487dd987d"
SERVICE_ID = 1

# Create WebSocket clients for customer and technician
customer_socket = socketio.Client()
technician_socket = socketio.Client()


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

    # Send booking request
    booking_request = {"customer_id": CUSTOMER_ID, "service_id": SERVICE_ID}
    customer_socket.emit("booking_request", booking_request)

    # Wait for response
    time.sleep(5)
    customer_socket.disconnect()
    print("[Customer] Disconnected.")


def connect_technician():
    """Simulates a technician connecting and accepting a booking."""
    technician_socket.connect(SERVER_URL)
    print("[Technician] Connected to WebSocket server.")

    # Listen for booking requests
    @technician_socket.on("booking_request")
    def on_booking_request(data):
        print(f"[Technician] Received booking request: {data}")

        # Accept the booking
        accept_data = {
            "technician_id": TECHNICIAN_ID,
            "customer_id": CUSTOMER_ID,
            "customer_location": {"lat": 12.9716, "lon": 77.5946},
        }
        technician_socket.emit("booking_accept", accept_data)

    # Update technician status
    status_update = {"technician_id": TECHNICIAN_ID, "status": "active"}
    technician_socket.emit("technicians/status", status_update)

    time.sleep(5)
    technician_socket.disconnect()
    print("[Technician] Disconnected.")


# Run tests
connect_technician()
time.sleep(2)  # Ensure technician connects first
connect_customer()
