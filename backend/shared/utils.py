import os
import logging
import bcrypt

from hydra import compose, initialize
from omegaconf import DictConfig
from functools import wraps
from datetime import datetime


def with_hydra_config(func):
    """Decorator to access the hydra configurations. The configuration dictionary will be the first parameter, followed by the by other parameters."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        with initialize(version_base=None, config_path="../config"):
            cfg: DictConfig = compose(config_name="config")

        return func(cfg, *args, **kwargs)

    return wrapper


def hash_password(password: str):
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password


@with_hydra_config
def get_logger(cfg: DictConfig, service_name: str):

    logger_cfg = cfg[service_name]["logger"]

    logger = logging.getLogger(logger_cfg.name)

    if not logger.level == logger_cfg.level:
        logger.setLevel(logger_cfg.level)

    if not logger.handlers:

        formatter = logging.Formatter(
            "[%(asctime)s] [%(name)s] [%(levelname)s] - %(message)s"
        )

        if logger_cfg.enable_console_logging:
            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(formatter)

            logger.addHandler(stream_handler)

        if logger_cfg.enable_file_logging:
            log_filename = (
                f"{service_name}_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.log"
            )
            log_filename = os.path.join(logger_cfg.log_dir, log_filename)

            file_handler = logging.FileHandler(log_filename)
            file_handler.setLevel(logger_cfg.level)

            file_handler.setFormatter(formatter)

            logger.addHandler(file_handler)

    return logger
