import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, BackHandler } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { shadowStyles } from "../customStyles/custom";

interface UserData {
  name?: string;
  service_category?: string;
}

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const showToast = useCallback((type: "success" | "error" | "warning", msg: string) => {
    Toast.show({ type, text1: msg });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        const userDetails = await AsyncStorage.getItem("userInfo");
        if (!token) {
          router.replace("/");
        }
        if (userDetails) {
          setUserData(JSON.parse(userDetails));
        }
      } catch (error) {
        showToast("error", "Failed to retrieve user data");
      }
    };
    checkAuth();

    const fetchImg = async () => {
      try {
        const storedImg = await AsyncStorage.getItem("pickedImage");
        if (storedImg) {
          setProfileImage(storedImg);
        }
      } catch (error) {
        showToast("warning", "No Profile Found");
      }
    };
    fetchImg();

    const backAction = () => {
      router.replace("/");
      return true;
    };
    
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router, showToast]);

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["jwtToken", "userRole", "pickedImage", "userInfo"]);
              router.replace("/");
            } catch (error) {
              showToast("error", "Log out failed");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 7 }} className="bg-white">
        <View className="flex-row justify-between items-center w-full px-4">
          <Text className="pt-10 text-4xl font-nunito-bold text-black">You</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Image source={require("../../assets/icons/logout-icon.png")} className="w-8 h-8 mt-7 mr-2" />
          </TouchableOpacity>
        </View>

        <View className="flex flex-col items-center mt-6">
          {profileImage && (
            <Image source={{ uri: profileImage }} className="w-52 h-52 rounded-full mb-6" />
          )}
          <Text className="font-nunito-medium text-3xl text-black">{userData?.name || "Name"}</Text>
          <Text className="font-nunito-light text-xl text-gray-500">{userData?.service_category || "Category"}</Text>
        </View>

        <View className="mt-14 flex flex-col gap-6 px-4">
          <Text className="text-black font-nunito-bold text-2xl">Recent OTP</Text>
          <View className="flex flex-row justify-between items-center">
            <Text className="font-nunito-light text-2xl text-black ml-4">5412</Text>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/refresh-icon.png")} className="size-8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="my-4 flex flex-col gap-6 px-4">
          <Text className="text-black font-nunito-bold text-2xl">History</Text>
          <View className="bg-white w-full flex justify-center items-center p-2 rounded-lg" style={[shadowStyles.shadow]}>
            {history.length === 0 ? (
              <Text className="text-[#4c4c57] font-nunito-light text-lg">No data available...</Text>
            ) : (
              history.map((item, index) => (
                <View key={index} className="border-b border-gray-700 py-3">
                  <Text className="text-black font-nunito-medium text-lg">{item}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="bg-white border-t-2 border-gray-500 pt-3 flex flex-col items-center mb-20 mt-10 mx-4">
          <Image source={require("../../assets/icons/logo-img.png")} className="size-24" />
          <View className="flex flex-row mb-2">
            <Text className="text-black font-nunito-bold text-3xl">Smart</Text>
            <Text className="text-blue-600 font-nunito-bold text-3xl">Fix</Text>
          </View>
          <Text className="text-sm font-nunito-light text-gray-500 text-center">
            Connecting you with trusted professionals, anytime, anywhere.
          </Text>
          <Text className="text-sm font-nunito-light text-gray-500">
            SmartFix Reliable services at your fingertips!
          </Text>
          <Text className="mt-4 font-nunito-semibold text-xl">Follow us!</Text>
          <View className="flex-row gap-4 my-3">
            <TouchableOpacity>
              <Image source={require("../../assets/icons/instagram-icon.png")} className="size-10" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/facebook-icon.png")} className="size-9" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/twitter-icon.png")} className="size-9" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center mt-3">
            <Text className="text-[#666671] text-base font-nunito-medium">@Copyright 2025</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
