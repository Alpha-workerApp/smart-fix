from flask import Flask, request, jsonify, redirect
from omegaconf import DictConfig
from dotenv import load_dotenv
from os import environ


from services.auth.services import AuthService
from shared.middlewares import user_token_required, technician_token_required
from shared.utils import get_logger, with_hydra_config

load_dotenv()

app = Flask(__name__)
logger = get_logger("auth")

auth_service: AuthService
user_api_url: str
technician_api_url: str


@app.route("/login", methods=["POST"])
def user_login():
    data = request.get_json()
    try:
        token = auth_service.user_login(data.get("email"), data.get("hashed_password"))
        return jsonify({"token": token}), 200
    except Exception as e:
        logger.error(f"User login error: {e}")
        return jsonify({"message": str(e)}), 401


@app.route("/technician_login", methods=["POST"])
def technician_login():
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
    return jsonify({"message": f"This is a protected route. Hello, {uid}!"}), 200


@app.route("/technician_protected")
@technician_token_required
def technician_protected_route(tid):
    return (
        jsonify({"message": f"This is a protected route. Hello, {tid}!"}),
        200,
    )


@app.route("/register", methods=["POST"])
def user_register():
    return redirect(user_api_url, code=307)


@app.route("/technician_register", methods=["POST"])
def technician_register():
    return redirect(technician_api_url, code=307)


@with_hydra_config
def main(cfg: DictConfig):
    global auth_service, user_api_url, technician_api_url

    logger.info("Initializing Auth service")

    user_api_url = f"http://localhost:{cfg.user.server.port}/users"
    technician_api_url = f"http://localhost:{cfg.technician.server.port}/technicians"

    auth_service = AuthService(
        user_api_url, technician_api_url, environ.get("SECRET_KEY")
    )

    logger.info("Starting Flask server...")
    app.run(**cfg.auth.server)


if __name__ == "__main__":
    main()
