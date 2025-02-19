import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { domain } from "../customStyles/custom";

const Register = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      showToast("warning", "Please fill in all fields");
      return;
    }

    const url = `http://${domain}:8002/register`
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name:fullName, email:email, phone:phone, hashed_password:password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData.message)
        showToast("error", errorData.message || "Registration failed");
        return;
      }
      
      const data = await response.json();
      // Registration successful, navigate back to login
      showToast("success", "Registration success");
      router.replace("/auth/login_user");
    } catch (error) {
      console.error(error);
      showToast("error", "An error occurred during registration");
    }
  };

  const handleLoginRoute = () => {
    router.replace("/auth/login_user");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Ui-background.png")}
      className="h-screen flex justify-center items-center gap-4 px-3"
    >
      <Text className="text-3xl font-nunito-bold">Register Yourself</Text>
      <Text className="font-nunito-medium text-lg">Enter your details</Text>
      
      <TextInput
        className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter your phone"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="px-[145px] my-5 py-4 bg-black rounded-lg"
        onPress={handleRegister}
      >
        <Text className="text-white font-nunito-semibold">Register</Text>
      </TouchableOpacity>

      <View className="flex flex-row">
        <Text className="font-nunito-medium">Already have an account? </Text>
        <TouchableOpacity onPress={handleLoginRoute}>
          <Text className="font-nunito-medium text-primary-blue">Log in</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Register;
