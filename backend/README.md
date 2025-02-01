# smart-fix backend

### Poetry add command

```shell
$ poetry add urllib3@1.26.15 Flask hydra-core pydantic pydantic[email] SQLAlchemy db-sqlite3 redis python-dotenv appwrite passlib
```

### Run User service

```shell
$ cd backend

$ python -m services.user.api
```

## Setup the environment for backend

1. Clone the repository into your local filesystem.
2. Install Mini-conda in your computer.
3. Navigate to `/backend` directory.

```shell
$ cd /backend
```

4. Create a new conda environment with the `environment.yml` file.

```shell
$ conda env create -f environment.yml
```

5. Activate the Conda environment.

```shell
$ conda activate smart_fix
```

6. Check if poetry is installed by conda else use `conda install poetry`.

```shell
$ poetry -V
```

7. Configure Poetry to use the conda environment:

```shell
$ poetry config virtualenvs.path $CONDA_ENV_PATH

$ poetry config virtualenvs.create false
```

8. Install the packages using poetry.

```shell
$ poetry install
```
