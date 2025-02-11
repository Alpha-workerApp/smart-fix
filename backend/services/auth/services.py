import jwt
import datetime
import requests

from shared.utils import get_logger


class AuthService:
    def __init__(self, user_api_url: str, technician_api_url: str, secret_key: str):
        self.logger = get_logger("auth")
        self.secret_key = secret_key
        self.user_api_url = user_api_url
        self.technician_api_url = technician_api_url

    def user_login(self, email, hashed_password):
        """
        Handles user login logic.

        Args:
          email: User's email address.
          hashed_password: Hashed password of the user.

        Returns:
          JWT token on successful login.

        Raises:
          Exception: If login fails (invalid credentials, API errors, etc.).
        """
        self.logger.debug(f"Attempting user login for email: {email}")
        try:
            response = requests.get(f"{self.user_api_url}/auth?email={email}")
            response.raise_for_status()
            user_data = response.json()
            if user_data and user_data.get("hashed_password") == hashed_password:
                self.logger.info(f"User login successful for email: {email}")
                return self._generate_user_token(str(user_data.get("uid")))
            else:
                self.logger.error(f"Invalid credentials for user: {email}")
                raise Exception("Invalid user credentials")
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error calling User API: {e}")
            raise Exception("Error during login")

    def technician_login(self, email, hashed_password):
        """
        Handles technician login logic.

        Args:
          email: Technician's email address.
          hashed_password: Hashed password of the technician.

        Returns:
          JWT token on successful login.

        Raises:
          Exception: If login fails (invalid credentials, API errors, etc.).
        """
        self.logger.debug(f"Attempting technician login for email: {email}")
        try:
            response = requests.get(f"{self.technician_api_url}/auth?email={email}")
            response.raise_for_status()
            technician_data = response.json()
            if (
                technician_data
                and technician_data.get("hashed_password") == hashed_password
            ):
                self.logger.info(f"Technician login successful for email: {email}")
                return self._generate_technician_token(str(technician_data.get("tid")))
            else:
                self.logger.error(f"Invalid credentials for technician: {email}")
                raise Exception("Invalid technician credentials")
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error calling Technician API: {e}")
            raise Exception("Error during login")

    def _generate_user_token(self, uid):
        """
        Generates a JWT token for a user.

        Args:
          uid: User's unique identifier.

        Returns:
          JWT token.
        """
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
        """
        Generates a JWT token for a technician.

        Args:
          tid: Technician's unique identifier.

        Returns:
          JWT token.
        """
        payload = {
            "tid": tid,
            "user_type": "technician",
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(days=2),
            "iat": datetime.datetime.now(datetime.timezone.utc),
        }
        token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        return token
