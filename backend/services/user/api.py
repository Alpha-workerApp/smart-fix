from flask import Flask
from shared.utils import with_hydra_config
from omegaconf import DictConfig
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/')
@with_hydra_config
def hello(cfg: DictConfig):
    print(cfg)
    return "Hello"

@with_hydra_config
def main(cfg: DictConfig):
    app.run(**cfg.user.server)

if __name__ == '__main__':
    main()