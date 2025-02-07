import React, { useState } from "react";
import { View, Text, Image, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Timeline from "react-native-timeline-flatlist";
import MapView, { Marker } from "react-native-maps"; // Import MapView and Marker

const Status = () => {
  const [currentPhase, setCurrentPhase] = useState(4); // Payment phase for QR display

  // Timeline Data
  const timelineData = [
    { time: "9:00 AM", title: "Registered", description: "Booking confirmed" },
    { time: "9:30 AM", title: "Arriving", description: "Worker on the way" },
    { time: "10:00 AM", title: "Working", description: "Work in progress" },
    { time: "11:00 AM", title: "Checking Phase", description: "Quality check ongoing" },
    { time: "11:30 AM", title: "Payment", description: "Pending payment" },
  ];

  const renderItem = () => (
    <View className="px-5 py-6">
      <Text className="pt-10 text-4xl font-nunito-bold text-white">Status Tracker</Text>
      <Text className="text-gray-300 text-md font-nunito-light mt-4">Registered</Text>

      <View className="flex-row justify-between items-center bg-[#14141e] rounded-xl p-4 mt-4">
        <View className="flex-row items-center">
          <Image
            source={{ uri: "https://picsum.photos/200/300" }}
            className="w-16 h-16 rounded-full"
          />
          <View className="ml-4">
            <Text className="text-white text-lg font-nunito-semibold">John Doe</Text>
            <Text className="text-gray-300 text-sm font-nunito-light mt-2">Plumber</Text>
          </View>
        </View>
        <Text className="text-green-400 font-semibold">Accepted</Text>
      </View>

      {/* Timeline Section */}
      <Text className="text-3xl text-white mt-8 font-nunito-bold">Track</Text>
      <View className="mt-6">
        <Timeline
          data={timelineData}
          circleSize={20}
          circleColor="#4CAF50"
          lineColor="#4CAF50"
          timeContainerStyle={{ minWidth: 52 }}
          timeStyle={{
            textAlign: "center",
            backgroundColor: "#14141e",
            color: "white",
            padding: 5,
            borderRadius: 15,
          }}
          titleStyle={{
            color: "white",
            fontWeight: "600",
          }}
          descriptionStyle={{
            color: "gray",
          }}
        />
      </View>

      {/* Map Section */}
      <Text className="text-white text-xl mt-8">Location of Service</Text>
      <View className="w-full h-60 mt-4 mb-40 rounded-lg" >
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 37.78825, // Default latitude for the map
            longitude: -122.4324, // Default longitude for the map
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Marker to show the location */}
          <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} title="Service Location" />
        </MapView>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#171746", "#0F0F19"]} className="flex-1">
      <FlatList
        data={[{ key: 'status' }]} 
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </LinearGradient>
  );
};

export default Status;
