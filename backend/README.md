# smart-fix backend

### Before you run

-   Create a .env file in the `/backend` directory.
-   Add the following environment variables in it (Copy and paste the following)

```sh
SECRET_KEY=<secret key>
BACKEND_DIR=<Absoulte Path to smart-fix\backend>
```

`SECRET_KEY=9edb76cc-4bf6-42a1-8837-1e964e57a96d`

### Run the Services Individually

```shell
$ cd backend

$ python -m services.user.api

$ python -m services.technician.api

$ python -m services.user.api user.server.port=5000

$ python -m services.technician.api technician.server.port=5001
```

### Run the Services using scripts/run_services.py

```shell
$ cd backend

$ python .\scripts\run_services all

$ python .\scripts\run_services user

$ python .\scripts\run_services user technician

$ python .\scripts\run_services user technician -c technician.server.port=5001

$ python .\scripts\run_services user technician --config technician.server.port=5001

$ python .\scripts\run_services -h

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

### UML Diagrams

-   **Class Diagram:** [https://www.mermaidchart.com/raw/8316f551-70d6-4b0f-96e2-21fe48057ee1?theme=dark&version=v0.1&format=svg](https://www.mermaidchart.com/raw/8316f551-70d6-4b0f-96e2-21fe48057ee1?theme=dark&version=v0.1&format=svg)
-   **ER Diagram:** [https://www.mermaidchart.com/raw/dbc711ac-3e40-4fa0-996c-773d2392fb30?theme=light&version=v0.1&format=svg](https://www.mermaidchart.com/raw/dbc711ac-3e40-4fa0-996c-773d2392fb30?theme=light&version=v0.1&format=svg)
-   **Flow Diagram:** [https://www.mermaidchart.com/raw/3c0075d1-9daf-4f81-9c9e-8ea811382d99?theme=dark&version=v0.1&format=svg](https://www.mermaidchart.com/raw/3c0075d1-9daf-4f81-9c9e-8ea811382d99?theme=dark&version=v0.1&format=svg)
-   **Sequence Diagram:** [https://www.mermaidchart.com/raw/bdf5a122-5724-4b62-9452-5d2da8c91233?theme=dark&version=v0.1&format=svg](https://www.mermaidchart.com/raw/bdf5a122-5724-4b62-9452-5d2da8c91233?theme=dark&version=v0.1&format=svg)

### Procedure to run the `app_test.py`

-   Few new packages were added to install them do the following. Doing once is enough.

```shell
$ conda activate smart_fix

$ cd backend

$ poetry install

```

-   Terminal 1

```shell
$ conda activate smart_fix

$ cd backend

$ python .\scripts\run_services all
```

> Press Ctrl + C to stop

-   Terminal 2

```shell
$ conda activate smart_fix

$ cd backend

$ python -m tests.app_test
```
