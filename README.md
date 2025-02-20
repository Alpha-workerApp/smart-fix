# Expo Setup Guide

## Prerequisites
Before installing Expo, ensure that you have the following installed on your system:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Install Expo CLI Globally
To install Expo CLI globally on your system, run the following command:

```sh
npm install -g expo-cli
```
Or if you're using yarn:
```sh
yarn global add expo-cli
```

## Verify Installation
Once installed, verify that Expo CLI is installed correctly by running:
```sh
expo --version
```
This should return the installed Expo CLI version.

## Install Expo Go on Mobile
To preview your app on a physical device, install **Expo Go**:
- [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)


# React Native Project Setup

-   Clone the repository to your local machine:
    ```sh
    git clone https://github.com/Alpha-workerApp/smart-fix.git
    ```
-   Navigate to the `Frontend` folder:
    ```sh
    cd smart-fix/Frontend
    ```
-   Install all dependencies:
    ```sh
    npm install
    ```
-   Get your local IPv4 address:
    ```sh
    ipconfig
    ```
    Find the `IPv4 Address` under your active network adapter.
-   Update the IP address in the `/Frontend/app/customStyles/custom.tsx` file:
    ```tsx
    const domain = "{Your_IP_Address}";
    ```
    Replace `{Your_IP_Address}` with the actual IPv4 address.
-   Start the project:
    ```sh
    npx expo start
    ```
-   Scan the QR code with the Expo Go app on your mobile device to run the application.

---

### Troubleshooting
-   Ensure your mobile device and development machine are on the same Wi-Fi network.
-   If dependencies fail to install, try:
    ```sh
    npm install --force
    ```
-   If the app crashes, clear the Expo cache:
    ```sh
    expo r -c
    ```

---

-   Later add the project documentation here... once completed.

