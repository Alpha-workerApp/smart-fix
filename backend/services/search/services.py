import json


class SearchService:
    def __init__(self, json_file):
        with open(json_file, "r") as file:
            self.data = json.load(file)

    def get_service_by_sid(self, sid):
        for service in self.data["services"]:
            if service["SID"] == sid:
                return service
        return None

    def get_services_by_category(self, category):
        return [
            service
            for service in self.data["services"]
            if service["serviceCategory"] == category
        ]

    def search_services_by_name(self, search_term):
        return [
            service
            for service in self.data["services"]
            if search_term.lower() in service["serviceName"].lower()
        ]
