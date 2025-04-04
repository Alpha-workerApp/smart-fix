import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import CircularProgress from "./ProgressCircle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { domain } from "@/app/customStyles/custom";

const Dashboard = () => {
  const [isToggled, setIsToggled] = useState(false);
  const toggleStatus = isToggled ? "active" : "inactive"; // Store toggle status

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const email = await AsyncStorage.getItem("registerEmail");
        if (!email) {
          console.log("Email not received or fetched");
          return;
        }

        const response = await fetch(`http://${domain}:8001/technicians?email=${email}`);
        if (!response.ok) {
          console.log("Details could not be loaded");
          return;
        }

        const data = await response.json();
        console.log("Fetched Technician Data:", data);

        const changeStatus = await fetch(`http://${domain}:8006/technicians/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ technician_id: data.TID, status: toggleStatus }),
        });

        if (!changeStatus.ok) {
          console.log("Error updating status");
        } else {
          console.log("Status changed successfully");
        }
      } catch (error) {
        console.error("Error in fetchDetails:", error);
      }
    };

    fetchDetails();
  }, [isToggled]); 

  return (
    <View>
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
            className={`px-3 py-1 rounded-full ${isToggled ? "bg-green-500" : "bg-gray-300"}`}
            onPress={() => setIsToggled((prev) => !prev)}
          >
            <Text className="text-lg font-semibold text-white">{toggleStatus}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-row gap-6 mt-6 mb-1">
          <View className="ml-3">
            <CircularProgress progress={50} />
          </View>
          <View className="flex gap-2">
            <Text className="text-base font-nunito-medium">Total hour worker: 0</Text>
            <Text className="text-base font-nunito-medium">Total Earnings: $0</Text>
            <Text className="text-base font-nunito-medium">Completed: 0</Text>
            <Text className="text-base font-nunito-medium">Due: 0</Text>
          </View>
        </View>
      </View>

      {/* Displaying toggle status separately */}
      <View className="mt-4 ml-5">
        <Text className="text-lg font-semibold">Toggle Status: {toggleStatus}</Text>
      </View>
    </View>
  );
};

export default Dashboard;
