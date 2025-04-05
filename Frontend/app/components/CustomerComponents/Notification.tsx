import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
};

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const bookingString = await AsyncStorage.getItem("latestBooking");
        if (bookingString) {
          const booking = JSON.parse(bookingString);

          const formattedNotification: Notification = {
            id: Date.now(),
            title: "Booking Confirmed",
            message: `Service: ${booking.serviceName || "N/A"}\nCategory: ${
              booking.serviceCategory || "N/A"
            }\nCost: ₹${booking.details?.price || "N/A"}\nWorker: ${
              booking.technicianName || "N/A"
            }`,
            time: new Date().toLocaleTimeString(),
          };

          setNotifications([formattedNotification]);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error reading local storage", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const onBackPress = () => {
      router.replace("/customer");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View className="flex-1 bg-white px-6 py-10 mt-3 relative">
      {/* Header with Animated Bell Icon */}
      <View className="items-center mb-6">
        <LottieView
          source={require("../../../assets/animations/bell.json")}
          autoPlay
          loop
          style={{ width: 40, height: 40 }}
        />
        <Text className="text-2xl font-nunito-bold">Notifications</Text>
      </View>

      {/* Notifications List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="black" />
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <View
              key={notification.id}
              className="bg-blue-100 p-4 rounded-xl my-2 shadow-md"
            >
              <Text className="text-base font-nunito-bold text-blue-900 mb-2">
                {notification.title}
              </Text>
              <View className="ml-2">
                {notification.message.split("\n").map((line, index) => (
                  <Text
                    key={index}
                    className="text-gray-700 font-nunito-regular"
                  >
                    {line}
                  </Text>
                ))}
              </View>
              <Text className="text-gray-500 text-xs mt-2 text-right">
                {notification.time}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">
            No notifications available.
          </Text>
        )}
      </ScrollView>

      {/* Close Button Container */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white shadow-sky-300 shadow-2xl rounded-full p-4"
        >
          <Image
            source={require("../../../assets/icons/close-icon.png")}
            className="size-6"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Notification;
