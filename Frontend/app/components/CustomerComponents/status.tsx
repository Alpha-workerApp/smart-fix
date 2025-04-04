import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, SafeAreaView, BackHandler } from "react-native";
import Timeline from "react-native-timeline-flatlist";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { domain } from "@/app/customStyles/custom";

const Status = () => {
  const { technician_id, status } = useLocalSearchParams();
  // console.log(technician_id,status)
  const [technicianDetails, setTechnicianDetails] = useState<any>(null);

  const [completedTasks, setCompletedTasks] = useState(2);

  useEffect(() => {
    const fetchTechnicianDetails = async () => {
      try {
        const response = await fetch(`http://${domain}:8001/technicians/${technician_id}`);
        if (!response.ok) throw new Error("Failed to fetch technician details");
        const data = await response.json();
        console.log(data)
        setTechnicianDetails(data);
      } catch (error) {
        console.error("Technician fetch error:", error);
      }
    };
  
    if (technician_id) {
      fetchTechnicianDetails();
    }
  
    const onBackPress = () => {
      router.replace("/customer");
      return true;
    };
  
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
  
    return () => backHandler.remove();
  }, [technician_id,router]);
  

  const timelineData = [
    { time: "9:00 AM", title: "Registered", description: "Booking confirmed" },
    { time: "9:30 AM", title: "Arriving", description: "Worker on the way" },
    { time: "10:00 AM", title: "Working", description: "Work in progress" },
    { time: "11:00 AM", title: "Checking Phase", description: "Quality check ongoing" },
    { time: "11:30 AM", title: "Payment", description: "Pending payment" },
  ];

  // Corrected dynamic className using template literal.
  const renderCircle = (_: any, index: number) => (
    <View className={`w-5 h-5 rounded-full ${index < completedTasks ? 'bg-green-500' : 'bg-gray-500'}`} />
  );

  const renderDetail = (rowData: any) => (
    <View>
      <Text className=" text-lg font-nuniton-semibold">{rowData.title}</Text>
      <Text className="text-gray-900 font-nunito-light">{rowData.description}</Text>
    </View>
  );

  const renderItem = useCallback(() => (
    <View className="px-5 py-12">
      <View className="flex flex-row gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Image 
            source={require("../../../assets/icons/left-arrow-icon.png")} 
            className="w-6 h-6 mt-[24px]" 
          />
        </TouchableOpacity>
        <Text className="pt-6 text-2xl  font-nunito-bold">Status Tracker</Text>
      </View>
      <Text className="text-gray-800 text-md mt-7 ml-4">Registered</Text>

      <View className="flex-row justify-between items-center bg-white rounded-full p-4 mt-4">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: "https://picsum.photos/200/300" }} 
            className="w-16 h-16 rounded-full" 
          />
          <View className="ml-4">
            <Text className=" text-lg font-semibold">{technicianDetails?technicianDetails.name:"No Technician"}</Text>
            <Text className="text-gray-300 text-sm mt-2">{technicianDetails?technicianDetails.service_category:"Nothing"}</Text>
          </View>
        </View>
        <Text className="text-green-400 font-semibold mr-4">{technicianDetails?"Accepted":"Yet to book"}</Text>
      </View>

      <Text className="text-3xl  mt-8 font-bold">Track</Text>
      <View className="mt-6">
        <Timeline
          data={timelineData}
          circleSize={20}
          circleColor="gray"
          lineColor="transparent"
          timeContainerStyle={{ minWidth: 52 }}
          timeStyle={{
            textAlign: "center",
            backgroundColor: "#14141e",
            color: "white",
            padding: 5,
            borderRadius: 15,
          }}
          titleStyle={{ color: "white", fontWeight: "600" }}
          descriptionStyle={{ color: "gray" }}
          renderDetail={renderDetail}
          renderCircle={renderCircle}
        />
      </View>

      <Text className=" text-xl mt-8">Location of Service</Text>
      <View style={{ width: "100%", height: 240, marginTop: 16, borderRadius: 12, overflow: "hidden" }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} title="Service Location" />
        </MapView>
      </View>
    </View>
  ), [completedTasks, timelineData]);

  return (
    // Uncomment LinearGradient if needed and ensure proper import.
    // <LinearGradient colors={["#0C0C0C", "#14141e"]} className="py-2 h-screen">
    <SafeAreaView>
      <FlatList
        data={[{ key: "status" }]}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
    // </LinearGradient>
  );
};

export default Status;
