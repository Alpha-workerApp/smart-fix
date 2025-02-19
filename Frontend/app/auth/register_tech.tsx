import React, { useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";

const Register = () => {
  const [isCustomerChecked, setisCustomerChecked] = useState(false);
  const [isWorkerChecked, setWorkerChecked] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  // Handle checkbox logic to ensure only one is checked at a time
  const handleCustomerCheck = () => {
    setisCustomerChecked(true);
    setWorkerChecked(false);
  };

  const handleWorkerCheck = () => {
    setWorkerChecked(true);
    setisCustomerChecked(false);
  };

  return (
    <View>
      <ImageBackground
        source={require("../../assets/images/Ui-background.png")}
        className="h-screen flex justify-center items-center gap-4"
      >
        <Text className=" text-3xl font-nunito-bold">
          Register Yourself
        </Text>
        <Text className=" font-nunito text-lg">
          Enter your details
        </Text>
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the first name"
        />
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the last name"
        />
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the email"
        />
        <TextInput
          className="bg-[#f4f4f4] w-[320px] rounded-lg px-3 py-4 text-lg"
          placeholder="Enter the password"
        />

        <Text className=" mt-4 text-lg font-nunito">Type</Text>
        <View className="flex flex-row gap-5">
          <View className="flex flex-row items-center gap-1 justify-center mt-4">
            <TouchableOpacity
              className={`w-6 h-6 ${
                isCustomerChecked ? "bg-blue-500" : "bg-gray-300"
              } rounded-lg flex items-center justify-center`}
              onPress={handleCustomerCheck}
            >
              {isCustomerChecked && (
                <MaterialIcons name="check" size={18} color="white" />
              )}
            </TouchableOpacity>
            <Text className="ml-2 text-lg ">Customer</Text>
          </View>

          <View className="flex flex-row items-center gap-1 justify-center mt-4">
            <TouchableOpacity
              className={`w-6 h-6 ${
                isWorkerChecked ? "bg-blue-500" : "bg-gray-300"
              } rounded-lg flex items-center justify-center`}
              onPress={handleWorkerCheck}
            >
              {isWorkerChecked && (
                <MaterialIcons name="check" size={18} color="white" />
              )}
            </TouchableOpacity>
            <Text className="ml-2 text-lg ">Professional</Text>
          </View>
        </View>

        {/* Dropdown for Professional */}
        {isWorkerChecked && (
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

            <TouchableOpacity className="px-[135px] my-5 py-4 bg-[#1e1e4a] rounded-lg">
              <Text className="text-white font-nunito-semibold">Register</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );
};

export default Register;
