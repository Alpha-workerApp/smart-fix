import jwt
import datetime
import requests

from shared.utils import get_logger


class AuthService:
    def __init__(self, user_api_url: str, technician_api_url: str, secret_key: str):
        self.logger = get_logger("auth")
        self.secret_key = secret_key

        print(self.secret_key)

        self.user_api_url = user_api_url
        self.technician_api_url = technician_api_url

    def user_login(self, email, hashed_password):
        try:
            response = requests.get(f"{self.user_api_url}/auth?email={email}")
            response.raise_for_status()
            user_data = response.json()
            if user_data and user_data.get("hashed_password") == hashed_password:
                return self._generate_user_token(str(user_data.get("uid")))
            else:
                raise Exception("Invalid user credentials")
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error calling User API: {e}")
            raise Exception("Error during login")

    def technician_login(self, email, hashed_password):
        try:
            response = requests.get(f"{self.technician_api_url}/auth?email={email}")
            response.raise_for_status()
            technician_data = response.json()
            if (
                technician_data
                and technician_data.get("hashed_password") == hashed_password
            ):
                return self._generate_technician_token(str(technician_data.get("tid")))
            else:
                raise Exception("Invalid technician credentials")
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error calling Technician API: {e}")
            raise Exception("Error during login")

    def register_user(self, user_data):
        return self.user_service.register_user(user_data)

    def register_technician(self, technician_data):
        return self.technician_service.register_technician(technician_data)

    def _generate_user_token(self, uid):
        payload = {
            "uid": uid,
            "user_type": "user",
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(days=10),
            "iat": datetime.datetime.now(datetime.timezone.utc),
        }
        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        return token

    def _generate_technician_token(self, tid):
        payload = {
            "tid": tid,
            "user_type": "technician",
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(days=2),
            "iat": datetime.datetime.now(datetime.timezone.utc),
        }
        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        return token
