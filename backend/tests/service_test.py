import subprocess
import argparse


def run_curl_command(curl_command):
    """Executes the curl command and returns the response."""
    try:
        result = subprocess.run(
            curl_command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        return result.stdout.decode(), result.stderr.decode()
    except subprocess.CalledProcessError as e:
        return None, f"Error: {e}"


def main():
    parser = argparse.ArgumentParser(description="Make API requests to the service.")
    parser.add_argument(
        "command",
        choices=["create", "update"],
        help="Specify the action to perform (create or update)",
    )
    args = parser.parse_args()

    base_url = "http://localhost"
    port = 8003
    create_service_url = f"{base_url}:{port}/services"
    update_service_url = f"{base_url}:{port}/services/1"

    if args.command == "create":
        create_command = f'''curl -X POST {create_service_url} \
        -F "title=Example Service 2" \
        -F "service_category=Plumbing Services" \
        -F "description=This is an example service description." \
        -F "price=50.00" \
        -F "media_files=@C:/Users/Dell/Desktop/Sample_images/Plumbing-Carpentry-Services-20210528075631.2597370015.jpg" \
        -F "media_files=@C:/Users/Dell/Desktop/Sample_images/images.jpg"'''

        create_response, create_error = run_curl_command(create_command)
        if create_response:
            print("Create Service Response:", create_response)
        else:
            print("Error in creating service:", create_error)

    elif args.command == "update":
        update_command = f'''curl -X PUT {update_service_url} \
        -F "title=Updated Example Service 2" \
        -F "description=This is an updated description." \
        -F "service_category=Carpentry Services" \
        -F "media_files=@C:/Users/Dell/Desktop/Sample_images/meerut-uttar-pradesh-indiaapril.jpg"'''

        update_response, update_error = run_curl_command(update_command)
        if update_response:
            print("Update Service Response:", update_response)
        else:
            print("Error in updating service:", update_error)

    else:
        print("Invalid command. Please use 'create' or 'update'.")
        parser.print_help()


if __name__ == "__main__":
    main()
