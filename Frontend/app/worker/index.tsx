import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  BackHandler,
} from "react-native";
import { BlurView } from "expo-blur";
import Sidebar from "../components/WorkerComponents/SideBarWork";
import { domain } from "../customStyles/custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import Dashboard from "../components/WorkerComponents/Dashboard";

// Updated interface to match server response
interface Technician {
  email: string;
  phone: string;
  name: string;
  id_proof_type: string;
  id_proof_number: string;
  service_category: string;
  rating: number | null;
  is_available: boolean;
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coins, setCoins] = useState(0);
  const [userData, setData] = useState<Technician | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const storeDetails = async () => {
      try {
        const email = await AsyncStorage.getItem("registerEmail");
        if (!email) {
          console.log("No email found in AsyncStorage.");
          return;
        }

        const response = await fetch(`http://${domain}:8001/technicians?email=${email}`);
        if (!response.ok) {
          console.log("Details could not be loaded");
          return;
        }

        const data = await response.json();
        if (data !== null) {
          setData(data); 
          setCoins(data.rating ?? 0);
        } else {
          console.log("No technician found.");
        }

        await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching technician details:", error);
      }
    };

    const initializeDefaultImage = async () => {
      try {
        const existing = await AsyncStorage.getItem("pickedImage");
        if (!existing) {
          const asset = Asset.fromModule(require("../../assets/images/default-profile.png"));
          await asset.downloadAsync();
          if (asset.localUri) {
            await AsyncStorage.setItem("pickedImage", asset.localUri);
            setImageUri(asset.localUri);
          } else {
            console.log("Default image local URI not available.");
          }
        } else {
          setImageUri(existing);
        }
      } catch (error) {
        console.log("Error initializing default image:", error);
      }
    };

    storeDetails();
    initializeDefaultImage();

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 pt-14 bg-white">
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
          className="absolute top-0 left-0 w-full h-full z-10"
        >
          <BlurView intensity={50} tint="light" className="flex-1" />
        </TouchableOpacity>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <View className="flex flex-row justify-between items-center mt-2 px-5">
        <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
          <Image source={require("../../assets/icons/menu-icon.png")} className="w-8 h-8" />
        </TouchableOpacity>
        <View className="flex flex-row items-center space-x-1">
          <Text className="text-2xl font-nunito-bold">Smart</Text>
          <Text className="text-2xl font-nunito-bold text-blue-600">Fix</Text>
        </View>
        <TouchableOpacity className="flex flex-row items-center gap-1">
          <Image source={require("../../assets/icons/coin-icon.png")} className="w-6 h-6" />
          <Text className="font-nunito-bold text-lg">{coins}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/worker/profile")}
        className="mt-7 flex flex-row items-center justify-between gap-3 p-2 rounded-full bg-white shadow-2xl mx-4"
      >
        <View className="flex flex-row items-center gap-3">
          <View className="size-12 rounded-full flex justify-center items-center">
            {imageUri && <Image source={{ uri: imageUri }} className="size-14 rounded-full" />}
          </View>
          <View className="flex flex-col ml-2">
            <Text className="text-lg font-nunito-semibold">
              {userData ? userData.name : "Loading..."}
            </Text>
            <Text className="text-sm text-gray-900 font-nunito-light">
              {userData ? userData.service_category : "Category"}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="mr-2">
          <Image source={require("../../assets/icons/right-arrow-icon.png")} className="size-6" />
        </TouchableOpacity>
      </TouchableOpacity>

      <View>
        <Dashboard/>
      </View>
    </SafeAreaView>
  );
};

export default Index;
