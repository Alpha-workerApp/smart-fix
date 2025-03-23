import json
from flask import Flask, request, jsonify
from omegaconf import DictConfig
from dotenv import load_dotenv

from shared.utils import with_hydra_config, get_logger

load_dotenv()

app = Flask(__name__)
logger = get_logger("service")

DATA_FILE = "database/services.json"


def load_services():
    """Loads services from the JSON file."""
    try:
        with open(DATA_FILE, "r") as file:
            data = json.load(file)
            return data["services"]
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []


def save_services(services):
    """Saves services to the JSON file."""
    with open(DATA_FILE, "w") as file:
        json.dump({"services": services}, file, indent=4)


@app.route("/services", methods=["POST"])
def create_service():
    """Creates a new service."""
    logger.info(f"Received {request.method} request to /services")
    try:
        service_data = request.get_json()
        services = load_services()
        new_sid = max((s["SID"] for s in services), default=0) + 1
        service_data["SID"] = new_sid
        services.append(service_data)
        save_services(services)
        return jsonify(service_data), 201
    except Exception as e:
        logger.error(f"Error creating service: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/services/<int:sid>", methods=["GET"])
def get_service(sid: int):
    """Retrieves a specific service by ID."""
    logger.info(f"Received {request.method} request to /services/{sid}")
    services = load_services()
    service = next((s for s in services if s["SID"] == sid), None)
    if service:
        return jsonify(service), 200
    else:
        return jsonify({"error": "Service not found"}), 404


@app.route("/services", methods=["GET"])
def get_all_services():
    """Retrieves all services."""
    logger.info(f"Received {request.method} request to /services")
    services = load_services()
    return jsonify(services), 200


@app.route("/services/<int:sid>", methods=["PUT"])
def update_service(sid: int):
    """Updates an existing service."""
    logger.info(f"Received {request.method} request to /services/{sid}")
    try:
        update_data = request.get_json()
        services = load_services()
        for i, service in enumerate(services):
            if service["SID"] == sid:
                services[i] = {**service, **update_data}
                save_services(services)
                return jsonify(services[i]), 200
        return jsonify({"error": "Service not found or update failed"}), 404
    except Exception as e:
        logger.error(f"Error updating service: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/services/<int:sid>", methods=["DELETE"])
def delete_service(sid: int):
    """Deletes a service."""
    logger.info(f"Received {request.method} request to /services/{sid}")
    services = load_services()
    services = [s for s in services if s["SID"] != sid]
    save_services(services)
    return jsonify({"message": "Service deleted successfully"}), 200


@with_hydra_config
def main(cfg: DictConfig):
    """Main function to start the Flask server."""
    logger.info("Starting Flask server...")
    app.run(**cfg.service.server)


if __name__ == "__main__":
    main()
