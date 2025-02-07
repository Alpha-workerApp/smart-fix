import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const Register = () => {
  const [userType, setUserType] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const onHandleClick = () => {
    if (userType === "customer") {
      router.push("/");
    } else if (userType === "worker") {
      router.push("/worker/(tab)");
    } else {
      alert("Please select a user type before proceeding.");
    }
  };

  return (
    <View>
      <ImageBackground
        source={require("../../assets/images/worker image background.jpg")}
        className="h-screen flex justify-center items-center gap-4"
      >
        <Text className="text-white text-3xl font-nunito-bold">
          Register Yourself
        </Text>
        <Text className="text-white font-nunito text-lg">
          Enter your details
        </Text>
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the Aadhar number"
        />
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the Pan card number (optional)"
        />

        {/* Dropdown for User Type */}
        <Text className="text-white mt-4 text-lg  font-nunito">Type</Text>
        <RNPickerSelect
          onValueChange={(value) => setUserType(value)}
          items={[
            { label: "Customer", value: "customer" },
            { label: "Worker", value: "worker" },
          ]}
          style={{
            inputIOS: {
              backgroundColor: "#f4f4f4",
              borderRadius: 8,
              width: 320,
              textAlign: "center",
              padding: 5,
              alignSelf: "center",
            },
            inputAndroid: {
              backgroundColor: "#f4f4f4",
              borderRadius: 8,
              width: 320,
              textAlign: "center",
              padding: 5,
              alignSelf: "center",
            },
          }}
          placeholder={{ label: "Select User Type", value: null }}
        />

        {/* Dropdown for Worker Type (Only visible if Worker is selected) */}
        {userType === "worker" && (
          <View className="my-5">
            <RNPickerSelect
              onValueChange={(value) => setSelectedService(value)}
              items={[
                { label: "Plumbing", value: "plumbing" },
                { label: "Electrician", value: "electrician" },
                { label: "Carpentry", value: "carpentry" },
                { label: "Painting", value: "painting" },
              ]}
              style={{
                inputIOS: {
                  backgroundColor: "#f4f4f4",
                  borderRadius: 8,
                  width: 320,
                },
                inputAndroid: {
                  backgroundColor: "#f4f4f4",
                  borderRadius: 8,
                  width: 320,
                },
              }}
              placeholder={{ label: "Select a Service", value: null }}
            />
          </View>
        )}

        <TouchableOpacity
          className="px-[135px] my-5 py-4 bg-[#1e1e4a] rounded-lg"
          onPress={onHandleClick}
        >
          <Text className="text-white font-nunito-semibold">Register</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default Register;
