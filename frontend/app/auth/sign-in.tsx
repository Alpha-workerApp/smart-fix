import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";

const SignIn = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");



  return (
    <ImageBackground
      source={require("../../assets/images/worker image background.jpg")}
      className="h-screen flex justify-center items-center gap-4"
    >
      <Text className="text-white font-nunito-bold text-3xl">
        Welcome to Our World
      </Text>
      <Text className="text-white font-nunito-medium text-lg my-2">
        Enter your Details
      </Text>

      <TouchableOpacity
        className="bg-[#f4f4f4] py-3 px-24 rounded-lg"
      >
        <View className="flex flex-row gap-5 justify-center items-center">
          <Image
            source={require("../../assets/images/google_icon.png")}
            className="h-6 w-6"
          />
          <Text className="text-lg font-nunito-medium">Log in with Google</Text>
        </View>
      </TouchableOpacity>

      <Text className="text-white text-lg my-2">OR</Text>

      <TextInput
        className="bg-slate-100 w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter the username or email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="bg-slate-100 w-[320px] rounded-lg px-3 py-4 text-lg"
        placeholder="Enter the password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="px-[145px] my-5 py-4 bg-[#1e1e4a] rounded-lg"
      >
        <Text className="text-white font-nunito-semibold">Login</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default SignIn;
