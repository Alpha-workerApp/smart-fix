from hydra import compose, initialize
from functools import wraps

def with_hydra_config(func):
    """Decorator to access the hydra configurations. The configuration dictionary will be the first parameter, followed by the by other parameters.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        config:dict
        with initialize(version_base=None, config_path="../config"):
            cfg = compose(config_name="config")
            print(cfg)
        return func(cfg, *args, **kwargs)
    return wrapper