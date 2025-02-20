import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";
import { domain } from "../customStyles/custom";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

type FormDataType = {
  name: string;
  email: string;
  phone: string;
  hashed_password: string;
  id_proof_type: string;
  id_proof_number: string;
  service_category: string;
};

const Register = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    phone: "",
    hashed_password: "",
    id_proof_type: "",
    id_proof_number: "",
    service_category: "",
  });
  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.hashed_password ||
      !formData.id_proof_type ||
      !formData.id_proof_number ||
      !formData.service_category
    ) {
      Alert.alert("Error", "Please fill all fields before registering.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://${domain}:8002/technician_register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        router.replace("/auth/login_user");
        showToast("success","Registration successfull")
      } else {
        Alert.alert("Error", result.message || "Registration failed!");
      }
    } catch (error) {
      showToast("error","Network request failed!")
      console.error("Registration Error:", error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <ImageBackground
              source={require("../../assets/images/Ui-background.png")}
              className="h-full flex justify-center items-center gap-2 p-5"
            >
              <Text className="text-3xl font-nunito-bold">Register Yourself</Text>
              <Text className="font-nunito text-lg">Enter your details</Text>
              
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Enter email"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
              />
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Enter phone number"
                value={formData.phone}
                keyboardType="numeric"
                onChangeText={(text) => handleInputChange("phone", text)}
              />
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Enter password"
                secureTextEntry
                value={formData.hashed_password}
                onChangeText={(text) => handleInputChange("hashed_password", text)}
              />
              
              <TouchableOpacity
                className="px-[135px] my-5 py-4 bg-black rounded-lg flex flex-row justify-center items-center"
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-nunito-semibold">Register</Text>
                )}
              </TouchableOpacity>
            </ImageBackground>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
