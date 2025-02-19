import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

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
        // Replace with your actual API endpoint
        // const response = await fetch("http://192.168.83.89:8003/notifications");
        // if (response.ok) {
        //   const data = await response.json();
        //   setNotifications(data);
        // } else {
        //   console.error("Error fetching notifications");
        // }
        console.log("notification area")
      } catch (error) {
        console.error("Network error", error);
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
            <View key={notification.id} className="bg-gray-100 p-4 rounded-lg my-2">
              <Text className="text-lg font-nunito-semibold">{notification.title}</Text>
              <Text className="text-gray-600">{notification.message}</Text>
              <Text className="text-gray-400 text-sm mt-1">{notification.time}</Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">No notifications available.</Text>
        )}
      </ScrollView>

      {/* Close Button Container */}
      <View className="absolute bottom-16 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white shadow-sky-300 shadow-2xl rounded-full p-4"
        >
          <Image source={require("../../../assets/icons/close-icon.png")} className="size-6" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Notification;
