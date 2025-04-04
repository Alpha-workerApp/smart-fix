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
import { useNavigation } from "@react-navigation/native";
import { domain } from "../customStyles/custom";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import RNPickerSelect from "react-native-picker-select";

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

  const [loading, setLoading] = useState(false);

  // Toast notifications
  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  // Handle Input Change
  const handleInputChange = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Form Submission
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
      const requestBody = JSON.stringify(formData);
      console.log("📤 Sending Request Body:", requestBody);

      const response = await fetch(`http://${domain}:8002/technician_register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      const result = await response.json();
      console.log("📥 API Response:", result);

      if (response.ok) {
        router.replace("/auth/login_user");
        showToast("success", "Registration successful!");
      } else {
        Alert.alert("Error", result.message || "Registration failed!");
      }
    } catch (error) {
      showToast("error", "Network request failed!");
      console.error("❌ Registration Error:", error);
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

              {/* Full Name */}
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Full Name"
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />

              {/* Email */}
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
              />

              {/* Phone Number */}
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
              />

              {/* Password */}
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="Password"
                secureTextEntry
                value={formData.hashed_password}
                onChangeText={(text) => handleInputChange("hashed_password", text)}
              />

              {/* ID Proof Type - Picker */}
              <View className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4">
                <RNPickerSelect
                  placeholder={{ label: "Select ID Proof Type", value: "" }}
                  value={formData.id_proof_type}
                  onValueChange={(value) => handleInputChange("id_proof_type", value)}
                  items={[
                    { label: "Aadhar Number", value: "Aadhaar" },
                    { label: "PAN Number", value: "PAN" },
                    { label: "Voter ID", value: "Voter ID" },
                  ]}
                  style={{
                    inputAndroid: {
                      backgroundColor: "#f4f4f4",
                      paddingVertical: 1,
                      height:35,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      fontSize: 16,
                      color: "#333",
                      width: 320,
                      alignSelf: "center",
                    },
                  }}
                />
              </View>

              {/* ID Proof Number */}
              <TextInput
                className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
                placeholder="ID Proof Number"
                value={formData.id_proof_number}
                onChangeText={(text) => handleInputChange("id_proof_number", text)}
              />

              {/* Service Category - Picker */}
              <View className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4">
                <RNPickerSelect
                  placeholder={{ label: "Select Service Category", value: "" }}
                  value={formData.service_category}
                  onValueChange={(value) => handleInputChange("service_category", value)}
                  items={[
                    { label: "Electrician", value: "Electrical Services" },
                    { label: "Plumber", value: "Plumber" },
                    { label: "Mechanic", value: "Mechanic" },
                    { label: "AC Services", value: "AC & HVAC Maintenance" },
                    { label: "Carpentry", value: "Carpentry Services" },
                    { label: "House Cleaning", value: "House Cleaning Services" },
                    { label: "Accessories Repair", value: "Microwave Repair" },
                    { label: "Painting", value: "Painting Services" },
                    { label: "Refrigerator Repair", value: "Refrigerator Repair" },
                    { label: "Washing Machine Repair", value: "Washing Machine Repair" },

                  ]}
                  style={{
                    inputAndroid: {
                      backgroundColor: "#f4f4f4",
                      paddingVertical: 1,
                      height:35,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      fontSize: 10,
                      color: "#333",
                      width: 320,
                      alignSelf: "center",
                    },
                  }}
                />
              </View>

              {/* Register Button */}
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
