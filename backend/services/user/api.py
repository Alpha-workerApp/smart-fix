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
      - JSON request body with 'name' and 'email' fields.

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


@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id: int):
    """
    Retrieves a specific user by ID.

    Args:
      - user_id: The ID of the user to retrieve.

    Expects:
      - GET request to /users/<int:user_id>

    Returns:
      - 200 OK: JSON response with the user data.
      - 404 Not Found: If the user is not found.
    """

    logger.info(f"Received {request.method} request to /users/{user_id}")

    user: User = user_service.get_user(user_id)
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


@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id: int):
    """
    Updates an existing user.

    Args:
      - user_id: The ID of the user to update.

    Expects:
      - PUT request to /users/<int:user_id>
      - JSON request body with optional 'name' and 'email' fields.

    Returns:
      - 200 OK: JSON response with the updated user data.
      - 404 Not Found: If the user is not found or update fails.
      - 409 Conflict: If update fails due to a conflict.
    """

    logger.info(f"Received {request.method} request to /users/{user_id}")

    try:
        update_data = UserUpdate(**request.get_json())
        updated_user: User = user_service.update_user(user_id, update_data)
        if updated_user:
            return jsonify(updated_user.to_dict()), 200
        else:
            return jsonify({"error": "User not found or update failed"}), 404

    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return jsonify({"error": type(e).__name__}), 409


@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id: int):
    """
    Deletes a user.

    Args:
      - user_id: The ID of the user to delete.

    Expects:
      - DELETE request to /users/<int:user_id>

    Returns:
      - 200 OK: JSON response with a success message.
      - 404 Not Found: If the user is not found.
    """

    logger.info(f"Received {request.method} request to /users/{user_id}")

    user: User = user_service.delete_user(user_id)

    if user:
        return jsonify({"message": "User deleted successfully"}), 200
    else:
        return jsonify({"error": "User not found"}), 404


@with_hydra_config
def main(cfg: DictConfig):
    global user_service

    logger.info("Initializing User service")
    user_service = UserService(cfg.user.database.url)

    logger.info("Starting Flask server...")
    app.run(**cfg.user.server)


if __name__ == "__main__":
    main()
