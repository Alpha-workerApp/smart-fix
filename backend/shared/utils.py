import os
import logging
from datetime import datetime
from socket import gethostname, gethostbyname

from hydra import compose, initialize
from omegaconf import DictConfig, OmegaConf
from functools import wraps


def with_hydra_config(func):
    """
    Decorator to access Hydra configuration within a function.

    The configuration dictionary will be the first parameter, followed by other parameters.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        with initialize(version_base=None, config_path="../config"):
            cfg: DictConfig = compose(config_name="config")
            cli_args = OmegaConf.from_cli()
            cfg = OmegaConf.merge(cfg, cli_args)
        return func(cfg, *args, **kwargs)

    return wrapper


@with_hydra_config
def get_logger(cfg: DictConfig, service_name: str):
    """
    Creates and configures a logger for the given service.

    Args:
        cfg: Hydra configuration object.
        service_name: Name of the service (e.g., "user", "technician", "auth").

    Returns:
        A configured logger object.
    """
    logger_cfg = cfg[service_name]["logger"]
    logger = logging.getLogger(logger_cfg.name)

    if not logger.level == logger_cfg.level:
        logger.setLevel(logger_cfg.level)

    if not logger.handlers:
        formatter = logging.Formatter(
            "[%(asctime)s] [%(name)s] [%(levelname)s] - %(message)s"
        )

        if cfg.app_logger.enable_logging:
            log_filename = cfg.app_logger.log_file
            log_filename = os.path.join(cfg.app_logger.log_dir, log_filename)
            file_handler = logging.FileHandler(log_filename)
            file_handler.setLevel(logger_cfg.level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

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


def get_device_ip():
    """Fetches the IP address of this device. Used to redirect the request fro one service to another"""
    return gethostbyname(gethostname())
