import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ScrollView,
  BackHandler,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { domain } from "@/app/customStyles/custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client"; // Import WebSocket library


type Service = {
  SID: string;
  serviceName?: string;
  serviceCategory?: string;
  details: {
    prices?: Record<string, string>;
    price?: string;
  };
};

const SERVER_URL = `http://${domain}:8009`; 
const customerSocket = io(SERVER_URL); 


const ServiceSearch = () => {
  const [fullServices, setFullServices] = useState<Service[]>([]);
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userid,setuserid] = useState("");

  useEffect(() => {
    const fetchservice = async() =>{
      fetch(`http://${domain}:8003/services`)
      .then((response) => response.json())
      .then((data) => {
        setFullServices(data);
        setDisplayedServices(data.slice(0, 12)); // Show only first 12 initially

        // Extract unique categories
        const uniqueCategories: string[] = Array.from(
          new Set(data.map((service: any) => String(service.serviceCategory || "Others")))
        );

        setCategories(uniqueCategories);
      })
      .catch((error) => console.error("Error fetching data:", error));
    }
    const data = async() =>{
      const email = await AsyncStorage.getItem("registerEmail")
      console.log(email)
      const fetchdata = await fetch(`http://${domain}:8000/users?email=${email}`)
      if(!fetchdata.ok){
        console.log("error")
        return
      }
      const data = await fetchdata.json()
      setuserid(data.uid)
    }
    fetchservice()
    data()
  }, []);

  
  useEffect(() => {
    let filtered = fullServices;

    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter((service) => {
        const name = (service.serviceName || "").toLowerCase();
        const category = (service.serviceCategory || "").toLowerCase();
        return name.includes(lowerSearch) || category.includes(lowerSearch);
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.serviceCategory === selectedCategory);
    }

    setDisplayedServices(searchText.trim() || selectedCategory ? filtered : fullServices.slice(0, 12));

    const onBackPress = () => {
      router.replace("/customer");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, [searchText, selectedCategory, fullServices]);

  useEffect(() => {
    customerSocket.connect();

    customerSocket.on("connect", () => {
      console.log("[Customer] Connected to WebSocket server.");
    });

    customerSocket.on("booking_response", (data) => {
      console.log("[Customer] Booking Response:", data);
      Alert.alert("Booking Update", data.message || "Your booking is being processed.");
    });

    return () => {
      customerSocket.disconnect();
    };
  }, []);

  // Toggle category filter
  const toggleCategory = (category: string) => { 
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleBooking = async (service: Service) => {
    const bookingData = {
      service_id: service.SID,
      user_id: userid,
      price: service.details.price || Object.values(service.details.prices || {})[0] || "N/A",
      status: "pending",
    };

    // ✅ Send Booking Request via WebSocket
    customerSocket.emit("booking_request", bookingData);
    console.log("[Customer] Booking request sent via WebSocket:", bookingData);

    // ✅ Also Store Booking in API
    try {
      const response = await fetch(`http://${domain}:8009`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error("Invalid JSON response from server");
      }

      if (response.status === 201) {
        Alert.alert("Booking Confirmed", "Your booking has been successfully created.");
        router.push("/components/CustomerComponents/BookingConfirmation");
      } else {
        Alert.alert("Booking Failed", data.error || "Could not complete the booking.");
      }
    } catch (error) {
      console.error("Error booking service:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };




  // Render each service item
  const renderItem = ({ item }: { item: Service }) => (
    <View className="bg-white p-4 my-2 rounded-3xl shadow-md">
      <Text className="font-nunito-bold text-lg">{item.serviceName || "Unnamed Service"}</Text>
      <Text className="font-nunito-light">Category: {item.serviceCategory || "N/A"}</Text>
      <Text className="font-nunito-bold">
        Cost:{" "}
        {item.details.prices
          ? Object.values(item.details.prices)[0] // Display first price if multiple
          : item.details.price || "N/A"}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 w-[100px] mt-3 rounded-full py-2"
        onPress={() => handleBooking(item)}
      >
        <Text className="font-nunito-semibold text-base px-3 text-white text-center">Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="w-screen h-screen bg-gray-200 relative mt-8">
      {/* Header */}
      <View className="w-full items-center mt-10">
        <Text className="font-nunito-bold text-2xl mt-1">Service Search</Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="absolute left-5 top-[3.5%]">
        <Image source={require("../../../assets/icons/left-arrow-icon.png")} className="w-6 h-6" />
      </TouchableOpacity>

      {/* Search Bar */}
      <View className="mt-6 px-5">
        <View className="flex flex-row items-center bg-white rounded-full shadow-md px-3 py-2">
          <Image source={require("../../../assets/icons/search-icon.png")} className="w-6 h-6 mr-2" />
          <TextInput
            placeholder="Search Services"
            className="flex-1 text-base"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold text-base">Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Buttons */}
      <View className="h-[55px]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-4 px-5">
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => toggleCategory(category)}
              className={`font-nunito-medium px-4 py-1 rounded-2xl mr-2 shadow-sm ${
                selectedCategory === category ? "bg-blue-500" : "bg-white"
              }`}
            >
              <Text className={`font-semibold ${selectedCategory === category ? "text-white" : "text-black"}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      <View className="px-5 flex-1">
        {displayedServices.length > 0 ? (
          <FlatList
            data={displayedServices}
            keyExtractor={(item) => item.SID}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="items-center mt-10">
            <Text className="text-lg">No services found.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ServiceSearch;

