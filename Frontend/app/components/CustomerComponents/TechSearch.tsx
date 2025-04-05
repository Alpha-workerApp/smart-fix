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
  ActivityIndicator,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { domain } from "@/app/customStyles/custom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur"; // ✅ Imported here
import LottieView from "lottie-react-native";

type Service = {
  SID: string;
  serviceName?: string;
  serviceCategory?: string;
  details: {
    prices?: Record<string, string>;
    price?: string;
  };
};

const ServiceSearch = () => {
  const [fullServices, setFullServices] = useState<Service[]>([]);
  const [displayedServices, setDisplayedServices] = useState<Service[]>([]);
  const [searchText, setSearchText] = useState("");
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userid, setuserid] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ technician_id: string; status: string } | null>(null);

  useEffect(() => {
    const fetchservice = async () => {
      fetch(`http://${domain}:8003/services`)
        .then((response) => response.json())
        .then((data) => {
          setFullServices(data);
          setDisplayedServices(data.slice(0, 12));

          const uniqueCategories: string[] = Array.from(
            new Set(data.map((service: any) => String(service.serviceCategory || "Others")))
          );

          setCategories(uniqueCategories);
        })
        .catch((error) => console.error("Error fetching data:", error));
    };

    const data = async () => {
      const email = await AsyncStorage.getItem("registerEmail");
      const fetchdata = await fetch(`http://${domain}:8000/users?email=${email}`);
      if (!fetchdata.ok) return;
      const data = await fetchdata.json();
      setuserid(data.uid);
    };

    fetchservice();
    data();
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

  const toggleCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleBooking = async (service: Service) => {
    try {
      const locationString = await AsyncStorage.getItem("userLocation");
      const userInfoString = await AsyncStorage.getItem("userInfo");

      if (!locationString || !userInfoString) {
        Alert.alert("Missing Info", "Location or user data not found.");
        return;
      }

      const { latitude, longitude } = JSON.parse(locationString);
      const { uid } = JSON.parse(userInfoString);

      const bookingData = {
        customer_id: uid,
        service_id: service.SID,
        address: "123 Main St, Anytown, USA",
        latitude,
        longitude,
      };

      const response = await fetch(`http://${domain}:8006/booking/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to book the service");
      }

      const result = await response.json();

      const notificationDetails = {
        technician_id: result.technician_id,
        status: result.status,
        serviceName: service.serviceName || "N/A",
        serviceCategory: service.serviceCategory || "N/A",
        price:
          service.details.prices
            ? Object.values(service.details.prices)[0]
            : service.details.price || "N/A",
      };

      await AsyncStorage.setItem("latestBooking", JSON.stringify(notificationDetails));

      setBookingDetails({ technician_id: result.technician_id, status: result.status });
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        router.push({
          pathname: "/components/CustomerComponents/status",
          params: {
            technician_id: result.technician_id,
            status: result.status,
          },
        });
      }, 2000);

    } catch (error) {
      Alert.alert("Oops!", "No technician available at this moment");
    } finally {
      setBookingServiceId(null);
    }
  };

  const renderItem = ({ item }: { item: Service }) => (
    <View className="bg-white p-4 my-2 rounded-3xl shadow-md">
      <Text className="font-nunito-bold text-lg">{item.serviceName || "Unnamed Service"}</Text>
      <Text className="font-nunito-light">Category: {item.serviceCategory || "N/A"}</Text>
      <Text className="font-nunito-bold">
        Cost:{" "}
        {item.details.prices
          ? Object.values(item.details.prices)[0].slice(3)
          : (item.details.price || "N/A").slice(3)}
      </Text>
      <TouchableOpacity
        className="bg-blue-500 w-[100px] mt-3 rounded-full py-2 items-center"
        onPress={() => handleBooking(item)}
        disabled={bookingServiceId !== null}
      >
        {bookingServiceId === item.SID ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-nunito-semibold text-base px-3 text-white text-center">Book Now</Text>
        )}
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

      {/* Category Filter */}
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

      {/* Service List */}
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

      {/* ✅ Modal Popup with Blur Background */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView
          intensity={50}
          tint="light"
          className="flex-1 justify-center items-center"
        >
          <View className="bg-white p-6 rounded-2xl w-[80%] items-center shadow-lg">
            <LottieView
                      source={require("../../../assets/animations/Success booking.json")}
                      autoPlay
                      loop={false}
                      style={{ width: 90, height: 90 }}
                    />
            <Text className="text-lg font-bold mb-2 text-green-600">Booking Confirmed!</Text>
            <Text className="text-center text-gray-700">Redirecting to status screen...</Text>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default ServiceSearch;
