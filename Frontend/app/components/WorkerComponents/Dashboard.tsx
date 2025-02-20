import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CircularProgress from "./ProgressCircle";

const Dashboard = () => {
  const [isToggled, setIsToggled] = useState(false);

  return (
    <View className="">
      <View
        className="m-5 px-4 py-4 rounded-2xl bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5, // For Android shadow
        }}
      >
        <View className="flex flex-row justify-between items-center">
          <Text className="text-2xl font-semibold">Dashboard</Text>
          {/* Toggle Button */}
          <TouchableOpacity
            className={`px-3 py-1 rounded-full ${
              isToggled ? "bg-green-500" : "bg-gray-300"
            }`}
            onPress={() => setIsToggled(!isToggled)}
          >
            <Text className="text-lg font-semibold text-white">
              {isToggled ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row gap-6 mt-6 mb-1">
            <View className="ml-3">
            <CircularProgress progress={50}/>
            </View>
            <View className="flex gap-2">
                <Text className="text-base font-nunito-medium">Total hour worker : 0</Text>
                <Text className="text-base font-nunito-medium">Total Earnings : $0</Text>
                <Text className="text-base font-nunito-medium">Completed : 0</Text>
                <Text className="text-base font-nunito-medium">Due : 0</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

export default Dashboard;
