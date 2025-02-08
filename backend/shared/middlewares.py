import jwt
from flask import request, jsonify
from dotenv import load_dotenv
from os import environ

load_dotenv()


def user_token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        print(request.headers)
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        print("Secret key:", environ.get("SECRET_KEY"))
        # try:
        payload = jwt.decode(
            token.split(" ")[1], environ.get("SECRET_KEY"), algorithms=["HS256"]
        )
        user_type = payload.get("user_type")

        if user_type != "user":
            return jsonify({"message": "Unauthorized"}), 403

        uid = payload.get("uid")  # Get uid from payload
        return f(uid, *args, **kwargs)  # Pass uid to the route

        # except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError):
        #     return jsonify({"message": "Invalid or expired token"}), 401

    wrapper.__name__ = f.__name__
    return wrapper


def technician_token_required(f):  # Technician-specific middleware
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        print(request.headers)
        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            payload = jwt.decode(
                token.split(" ")[1], environ.get("SECRET_KEY"), algorithms=["HS256"]
            )
            user_type = payload.get("user_type")

            if user_type != "technician":
                return jsonify({"message": "Unauthorized"}), 403

            tid = payload.get("tid")  # Get tid from payload
            return f(tid, *args, **kwargs)  # Pass tid to the route

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, IndexError):
            return jsonify({"message": "Invalid or expired token"}), 401

    wrapper.__name__ = f.__name__
    return wrapper
