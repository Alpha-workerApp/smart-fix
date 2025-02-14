from flask import Flask, request, jsonify
from omegaconf import DictConfig
from dotenv import load_dotenv
from os import environ

import requests

from services.auth.services import AuthService
from shared.middlewares import user_token_required, technician_token_required
from shared.utils import get_logger, with_hydra_config, get_device_ip

load_dotenv()

app = Flask(__name__)
logger = get_logger("auth")

auth_service: AuthService
user_api_url: str
technician_api_url: str


@app.route("/login", methods=["POST"])
def user_login():
    """
    Handles user login requests.

    Expects:
      - POST request to /login
      - JSON request body with 'email' and 'hashed_password' fields.

    Returns:
      - 200 OK: JSON response with the access token.
      - 401 Unauthorized: If login fails.
    """
    logger.info(f"Received {request.method} request to /login")
    data = request.get_json()
    try:
        token = auth_service.user_login(data.get("email"), data.get("hashed_password"))
        return jsonify({"token": token}), 200
    except Exception as e:
        logger.error(f"User login error: {e}")
        return jsonify({"message": str(e)}), 401


@app.route("/technician_login", methods=["POST"])
def technician_login():
    """
    Handles technician login requests.

    Expects:
      - POST request to /technician_login
      - JSON request body with 'email' and 'hashed_password' fields.

    Returns:
      - 200 OK: JSON response with the access token.
      - 401 Unauthorized: If login fails.
    """
    logger.info(f"Received {request.method} request to /technician_login")
    data = request.get_json()
    try:
        token = auth_service.technician_login(
            data.get("email"), data.get("hashed_password")
        )
        return jsonify({"token": token}), 200
    except Exception as e:
        logger.error(f"Technician login error: {e}")
        return jsonify({"message": str(e)}), 401


@app.route("/protected")
@user_token_required
def user_protected_route(uid):
    """
    Protected route for authenticated users.

    Expects:
      - Valid user JWT token in the request headers.

    Returns:
      - 200 OK: JSON response with a success message.
    """
    logger.info(f"Received {request.method} request to /protected")
    return jsonify({"message": f"This is a protected route. Hello, {uid}!"}), 200


@app.route("/technician_protected")
@technician_token_required
def technician_protected_route(tid):
    """
    Protected route for authenticated technicians.

    Expects:
      - Valid technician JWT token in the request headers.

    Returns:
      - 200 OK: JSON response with a success message.
    """
    logger.info(f"Received {request.method} request to /technician_protected")
    return (
        jsonify({"message": f"This is a protected route. Hello, {tid}!"}),
        200,
    )


@app.route("/register", methods=["POST"])
def user_register():
    """Handles user registration requests, forwarding them to the User service.

    Expects:
        - POST request to /register
        - JSON request body with user registration data.

    Returns:
        - JSON response from the User service, including status code.
        - 500 status code with error message if request fails.
    """
    logger.info(f"Received {request.method} request to /register")
    try:
        response = requests.post(user_api_url, json=request.get_json())
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"Error forwarding registration request: {e}")
        return jsonify({"message": "Error registering user"}), 500


@app.route("/technician_register", methods=["POST"])
def technician_register():
    """Handles technician registration requests, forwarding them to the Technician service.

    Expects:
        - POST request to /technician_register
        - JSON request body with technician registration data.

    Returns:
        - JSON response from the Technician service, including status code.
        - 500 status code with error message if request fails.
    """
    logger.info(f"Received {request.method} request to /technician_register")
    try:
        response = requests.post(technician_api_url, json=request.get_json())
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        logger.error(f"Error forwarding technician registration request: {e}")
        return jsonify({"message": "Error registering technician"}), 500


@with_hydra_config
def main(cfg: DictConfig):
    global auth_service, user_api_url, technician_api_url

    logger.info("Initializing Auth service")

    ip_addr = get_device_ip()

    user_api_url = f"http://{ip_addr}:{cfg.user.server.port}/users"
    technician_api_url = f"http://{ip_addr}:{cfg.technician.server.port}/technicians"

    auth_service = AuthService(
        user_api_url, technician_api_url, environ.get("SECRET_KEY")
    )

    logger.info("Starting Flask server...")
    app.run(**cfg.auth.server)


if __name__ == "__main__":
    main()
