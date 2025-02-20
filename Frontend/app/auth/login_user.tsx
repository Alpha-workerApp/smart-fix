import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { domain } from "../customStyles/custom";
import { NetworkInfo } from 'react-native-network-info';


const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | undefined>("");
  const [password, setPassword] = useState<string | undefined>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const user_url = `http://${domain}:8002/login`;
  const tech_url = `http://${domain}:8002/technician_login`;

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const userRole = await AsyncStorage.getItem("userRole");
          if (userRole === "customer") {
            router.replace("/customer");
          } else if (userRole === "worker") {
            router.replace("/worker");
          } else {
            setIsChecking(false);
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setIsChecking(false);
      }
    };

    checkToken();
  }, [router]);

  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  const handleGoogleLogin = async () => {
    showToast("success", "Clicked successfully");
  };

  const handleRegister = async () => {
    try {
      const userRole = await AsyncStorage.getItem("userRole");
      if (userRole === "customer") {
        router.replace("/auth/register_user");
      } else if (userRole === "worker") {
        router.replace("/auth/register_tech");
      } else {
        showToast(
          "warning",
          "User role not set. Please select your role before registering."
        );
      }
    } catch (error) {
      showToast("error", "Error occurred while navigating.");
    }
  };


  const handleManualLogin = async () => {
    if (!email || !password) {
      showToast("warning", "Please enter both email and password");
      return;
    }


    setIsLoading(true);


    try {
      console.log(email,password)
      const userType = await AsyncStorage.getItem("userRole");
      const payload = {
        email: String(email).trim(),
        hashed_password: String(password).trim(),
      };

      const response = userType === "customer"
        ? await fetch(user_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(tech_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const responseText = await response.text();
      console.log("Response:", responseText);

      if (!response.ok) {
        showToast("error", responseText || "Login failed");
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(responseText);
      if (data.token) {
        await AsyncStorage.setItem("jwtToken", data.token);
        showToast("success", "Login successful");
        if (userType === "customer") {
          router.replace("/customer");
        } else {
          router.replace("/worker");
        }
      } else {
        showToast("error", "Invalid login response");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };


  if (isChecking) {
    return (
      <ImageBackground
        source={require("../../assets/images/Ui-background.png")}
        className="h-screen flex justify-center items-center gap-4 px-3"
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/Ui-background.png")}
      className="h-screen flex justify-center items-center gap-4 px-3"
    >
      <Text className="font-nunito-bold text-2xl">Welcome to Our World</Text>
      <Text className="font-nunito-medium text-base my-2">Enter your Details</Text>

      {/* Google Login Button */}
      <TouchableOpacity
        className="bg-[#f4f4f4] py-3 px-24 rounded-lg"
        onPress={handleGoogleLogin}
      >
        <View className="flex flex-row gap-5 justify-center items-center w-[140px]">
          <Image
            source={require("../../assets/images/google_icon.png")}
            className="h-6 w-6"
          />
          <Text className="text-lg font-nunito-medium">Log in with Google</Text>
        </View>
      </TouchableOpacity>

      <Text className="text-lg my-2">OR</Text>

      {/* Manual Login Inputs */}
      <TextInput
        className="bg-slate-100 w-[300px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter the email or email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-slate-100 w-[300px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter the password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="px-[145px] my-5 py-4 bg-black rounded-lg"
        onPress={handleManualLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-nunito-semibold">Login</Text>
        )}
      </TouchableOpacity>

      <View className="flex flex-row">
        <Text className="font-nunito-medium">Don't have an account? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text className="font-nunito-medium text-primary-blue">Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SignIn;

