from flask import Flask, jsonify, request
from omegaconf import DictConfig
from services.search.services import SearchService

from shared.utils import get_logger, with_hydra_config

app = Flask(__name__)
search_service: SearchService

logger = get_logger("search")


@app.route("/service/sid/<int:sid>", methods=["GET"])
def get_service_by_sid(sid):
    service = search_service.get_service_by_sid(sid)
    if service:
        return jsonify(service), 200
    return jsonify({"error": "Service not found"}), 404


@app.route("/service/category/<string:category>", methods=["GET"])
def get_services_by_category(category):
    services = search_service.get_services_by_category(category)
    if services:
        return jsonify(services), 200
    return jsonify({"error": "No services found for this category"}), 404


@app.route("/service/search", methods=["GET"])
def search_services():
    search_term = request.args.get("name", "")
    services = search_service.search_services_by_name(search_term)
    if services:
        return jsonify(services), 200
    return jsonify({"error": "No services found matching the search term"}), 404


@with_hydra_config
def main(cfg: DictConfig):
    global search_service

    search_service = SearchService(cfg.search.db_file)


if __name__ == "__main__":
    app.run(debug=True)
