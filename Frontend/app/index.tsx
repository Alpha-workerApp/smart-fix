import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const Index = () => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const dropdownData = [
    { label: "Customer", value: "customer" },
    { label: "Worker", value: "worker" },
  ];

  // Check if a JWT token exists. If it does, redirect accordingly.
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (token) {
          const userType = await AsyncStorage.getItem("userRole");
          if (userType === "customer") {
            router.replace("/customer");
          } else if (userType === "worker") {
            router.replace("/worker");
          }
        }
      } catch (error) {
        console.error("Error checking JWT token", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, []);

  const handleExplore = async () => {
    if (!selectedValue) {
      Alert.alert("Error", "Please select a user type.");
      return;
    }
    try {
      // Store user role in AsyncStorage
      await AsyncStorage.setItem("userRole", selectedValue);
      console.log("Selected user type:", selectedValue);
      // Navigate based on selected user type
      if (selectedValue === "customer") {
        router.replace("/auth/login_user");
      } else if (selectedValue === "worker") {
        router.replace("/auth/login_user");
      }
    } catch (error) {
      console.error("Error storing user role: ", error);
      Alert.alert("Error", "An error occurred while proceeding.");
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={require("../assets/images/Ui-background.png")}
        className="flex-1 w-full justify-center items-center"
      >
        <View className="items-center">
          <Image
            source={require("../assets/icons/logo-img.png")}
            className="w-52 h-52 mb-5"
          />
          <View className="flex flex-row gap-1 mb-4 -mt-12">
            <Text className="text-3xl font-nunito-bold">Smart</Text>
            <Text className="text-3xl font-nunito-bold text-primary-blue">
              Fix
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-sm font-nunito-semibold mb-8 text-gray-700">
              Linking hands, delivering seamless service
            </Text>
          </View>

          {isChecking ? (
            <ActivityIndicator size="large" color="black" />
          ) : (
            <>
              <Dropdown
                data={dropdownData}
                labelField="label"
                valueField="value"
                placeholder="Select an option"
                value={selectedValue}
                onChange={(item) => setSelectedValue(item.value)}
                style={{
                  width: 180,
                  height: 40,
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 50,
                  paddingHorizontal: 15,
                }}
                containerStyle={{
                  width: 180,
                }}
                placeholderStyle={{
                  fontSize: 16,
                  color: "#888",
                }}
                selectedTextStyle={{
                  fontSize: 16,
                  color: "#000",
                }}
              />
              <TouchableOpacity
                onPress={handleExplore}
                className="px-16 py-3 bg-black rounded-full mt-6"
              >
                <Text className="font-nunito-bold text-white">Explore</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

export default Index;
