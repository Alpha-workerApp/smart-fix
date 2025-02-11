import jwt
from flask import request, jsonify
from dotenv import load_dotenv
from os import environ

load_dotenv()


def user_token_required(f):
    """
    Decorator to check for valid user JWT token in request headers.

    Extracts the 'uid' from the payload and passes it to the decorated function.

    Raises:
        - 401 Unauthorized: If no token is provided in the request header.
        - 401 Unauthorized: If the token is invalid or expired.
        - 403 Forbidden: If the token is for a technician, not a user.
    """

    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            payload = jwt.decode(
                token.split(" ")[1], environ.get("SECRET_KEY"), algorithms=["HS256"]
            )
            user_type = payload.get("user_type")

            if user_type != "user":
                return jsonify({"message": "Unauthorized"}), 403

            uid = payload.get("uid")
            return f(uid, *args, **kwargs)

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError):
            return jsonify({"message": "Invalid or expired token"}), 401

    wrapper.__name__ = f.__name__
    return wrapper


def technician_token_required(f):
    """
    Decorator to check for valid technician JWT token in request headers.

    Extracts the 'tid' from the payload and passes it to the decorated function.

    Raises:
        - 401 Unauthorized: If no token is provided in the request header.
        - 401 Unauthorized: If the token is invalid or expired.
        - 403 Forbidden: If the token is for a user, not a technician.
    """

    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            payload = jwt.decode(
                token.split(" ")[1], environ.get("SECRET_KEY"), algorithms=["HS256"]
            )
            user_type = payload.get("user_type")

            if user_type != "technician":
                return jsonify({"message": "Unauthorized"}), 403

            tid = payload.get("tid")
            return f(tid, *args, **kwargs)

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError):
            return jsonify({"message": "Invalid or expired token"}), 401

    wrapper.__name__ = f.__name__
    return wrapper
