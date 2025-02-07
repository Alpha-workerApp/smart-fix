import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const Profile = () => {
  const trailHistoryData = [
    {
      id: 1,
      username: "JohnDoe",
      img: "https://picsum.photos/200/300",
      workertype: "Plumber",
      paymentstatus: "Pending",
      wageamount: 100
    },
    {
      id: 2,
      username: "JaneSmith",
      img: "https://picsum.photos/200/300",
      workertype: "Electrician",
      paymentstatus: "Completed",
      wageamount: 150
    },
    {
      id: 3,
      username: "MarkJohnson",
      img: "https://picsum.photos/200/300",
      workertype: "Carpenter",
      paymentstatus: "Completed",
      wageamount: 200
    },
    {
      id: 4,
      username: "EmilyDavis",
      img: "https://picsum.photos/200/300",
      workertype: "Mason",
      paymentstatus: "Cancelled",
      wageamount: 120
    },
    {
      id: 5,
      username: "ChrisBrown",
      img: "https://picsum.photos/200/300",
      workertype: "Electrician",
      paymentstatus: "Completed",
      wageamount: 180
    }
  ];

  const pendingData = trailHistoryData.filter(item => item.paymentstatus === "Pending");
  const completedAndCancelledData = trailHistoryData.filter(item => item.paymentstatus !== "Pending");

  return (
    <SafeAreaView className="">
      <LinearGradient colors={["#171746", "#0F0F19"]} className="px-4 py-2 h-full">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 7 }}>
          <View className="flex-row justify-between items-center w-full">
            <Text className="pt-10 text-4xl font-nunito-bold text-white">You</Text>
            <Image source={require("../../../assets/icons/bell-icon.png")} className="w-8 h-8 mt-11" />
          </View>

          <View className="flex flex-col items-center mt-6 gap-7">
            <View className="relative">
              <Image source={require("../../../assets/images/tommy-shelby.png")} className="w-48 h-48 rounded-full" />
              <TouchableOpacity className="absolute bottom-0 right-0 mb-2 mr-2">
                <Image source={require("../../../assets/icons/edit-icon.png")} className="w-8 h-8" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-nunito-medium text-xl">Thomas Shelby | Peaky Blinders</Text>
          </View>

          <View className="mt-14 flex flex-col gap-6">
            <Text className="text-white font-nunito-bold text-2xl">Wallet</Text>
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row gap-5 items-center">
                <View className="size-16 bg-orange-700 rounded-full flex justify-center items-center"><Text className="text-3xl font-nunito-semibold font-bold">T</Text></View>
                <View className="flex flex-col gap-1">
                  <Text className="text-white font-nunito-medium text-2xl">Thomas</Text>
                  <Text className="font-nunito-light text-white text-sm">Shelby Company Pvt. Limited</Text>
                </View>
              </View>
              <Text className="text-white font-nunito font-bold text-4xl">$200</Text>
            </View>
          </View>


          <View className="mt-14 flex flex-col gap-6">
            <Text className="text-white font-nunito-bold text-2xl">Recent OTP</Text>
            <View className="flex flex-row justify-between items-center ">
              <Text className="font-nunito-light text-2xl text-white ml-4">5412</Text>
              <TouchableOpacity>
              <Image source={require("../../../assets/icons/refresh-icon.png")} className="size-5"/>
              </TouchableOpacity>
            </View>
          </View>

          
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Profile;
