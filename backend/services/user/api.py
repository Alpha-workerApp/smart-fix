from uuid import UUID
from flask import Flask, request, jsonify
from omegaconf import DictConfig
from dotenv import load_dotenv

from services.user.services import UserService
from services.user.schemas import UserCreate, UserUpdate
from services.user.models import User
from shared.utils import with_hydra_config, get_logger

load_dotenv()

app = Flask(__name__)
logger = get_logger("user")
user_service: UserService


@app.route("/users", methods=["POST"])
def create_user():
    """
    Creates a new user.

    Expects:
      - POST request to /users
      - JSON request body with 'name', 'email', 'phone' and 'encrypted_password' fields.

    Returns:
      - 201 Created: JSON response with the created user data.
      - 409 Conflict: If user creation fails.
    """

    logger.info(f"Received {request.method} request to /users")

    try:
        user_data = UserCreate(**request.get_json())
        new_user: User = user_service.register_user(user_data)

        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        return jsonify({"error": type(e).__name__}), 409


@app.route("/users/<uid>", methods=["GET"])
def get_user(uid: str):
    """
    Retrieves a specific user by ID.

    Args:
      - uid: The ID of the user to retrieve.

    Expects:
      - GET request to /users/<uid>

    Returns:
      - 200 OK: JSON response with the user data.
      - 404 Not Found: If the user is not found.
    """

    logger.info(f"Received {request.method} request to /users/{uid}")

    try:
        uid_uuid = UUID(uid)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400

    user: User = user_service.get_user(uid_uuid)
    if user:
        return jsonify(user.to_dict()), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/users", methods=["GET"])
def get_user_by_email():
    """
    Retrieves a user by email address.

    Expects:
      - GET request to /users
      - Query parameter 'email': The email address of the user to retrieve.

    Returns:
      - 200 OK: JSON response with the user data.
      - 404 Not Found: If the user is not found.
    """

    logger.info(
        f"Received {request.method} request to /users?email={request.args.get('email')}"
    )

    email: str = request.args.get("email")
    user: User = user_service.get_user_by_email(email)

    if user:
        return jsonify(user.to_dict()), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/users/auth", methods=["GET"])
def get_hashed_password_by_email():
    """
    Retrieves the hashed_password by email address.

    Expects:
      - GET request to /users/auth
      - Query parameter 'email': The email address of the user to retrieve.

    Returns:
      - 200 OK: JSON response with the hashed password.
      - 404 Not Found: If the user is not found.
    """

    logger.info(
        f"Received {request.method} request to /users/auth?email={request.args.get('email')}"
    )

    email: str = request.args.get("email")
    user: User = user_service.get_user_by_email(email)

    if user:
        return jsonify({"hashed_password": user.hashed_password}), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route("/users/<uid>", methods=["PUT"])
def update_user(uid: str):
    """
    Updates an existing user.

    Args:
      - uid: The ID of the user to update.

    Expects:
      - PUT request to /users/<uid>
      - JSON request body with at least any one of these fields 'name', 'email', 'phone' or 'encrypted_password'.

    Returns:
      - 200 OK: JSON response with the updated user data.
      - 404 Not Found: If the user is not found or update fails.
      - 409 Conflict: If update fails due to a conflict.
    """

    logger.info(f"Received {request.method} request to /users/{uid}")

    try:
        update_data = UserUpdate(**request.get_json())
        updated_user: User = user_service.update_user(uid, update_data)
        if updated_user:
            return jsonify(updated_user.to_dict()), 200
        else:
            return jsonify({"error": "User not found or update failed"}), 404

    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@app.route("/users/<uid>", methods=["DELETE"])
def delete_user(uid: str):
    """
    Deletes a user.

    Args:
      - uid: The ID of the user to delete.

    Expects:
      - DELETE request to /users/<uid>

    Returns:
      - 200 OK: JSON response with a success message.
      - 404 Not Found: If the user is not found.
    """

    logger.info(f"Received {request.method} request to /users/{uid}")

    user: User = user_service.delete_user(uid)

    if user:
        return jsonify({"message": "User deleted successfully"}), 200
    else:
        return jsonify({"error": "User not found"}), 404


@with_hydra_config
def main(cfg: DictConfig):
    global user_service

    logger.info("Initializing User service")
    user_service = UserService(cfg.database.url)

    logger.info("Starting Flask server...")
    app.run(**cfg.user.server)


if __name__ == "__main__":
    main()
