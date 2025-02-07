import { useState, useRef } from "react";
import { Text, View, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const workers = [
  { id: 1, name: "John Doe", service: "Electrician", rating: 4.5 },
  { id: 2, name: "Jane Smith", service: "Plumber", rating: 4.2 },
  { id: 3, name: "Samuel Lee", service: "Carpenter", rating: 4.0 },
  { id: 4, name: "Mike Johnson", service: "Painter", rating: 4.7 },
  { id: 5, name: "Anna Taylor", service: "Mechanic", rating: 4.3 },
  { id: 6, name: "Emma Brown", service: "Electrician", rating: 4.8 },
];

const discounts = [
  { id: 1, image: "https://picsum.photos/200/300" },
  { id: 2, image: "https://picsum.photos/200/300?random=2" },
  { id: 3, image: "https://picsum.photos/200/300?random=3" },
  { id: 4, image: "https://picsum.photos/200/300?random=4" },
];

export default function Index() {
  const [showAll, setShowAll] = useState(false);
  
  // Ref for horizontal scroll view
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollLeft = () => {
    // Scroll left by a fixed distance (320px)
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
  };

  const scrollRight = () => {
    // Scroll right by a fixed distance (320px)
    scrollViewRef.current?.scrollTo({ x: 320, animated: true });
  };

  const handleImageClick = () => {
    Alert.alert("Feature Under Progress");
  };

  return (
    <ScrollView >
      <LinearGradient colors={["#171746", "#0F0F19"]} className="px-5 py-4 h-full">
        <View className="flex flex-row justify-between">
          <View>
            <View className="flex flex-row items-center">
              <Image source={require("../../../assets/icons/logo-img.png")} className="size-24 -mx-5" />
              <Text className="font-nunito-medium text-3xl text-white">Logo</Text>
            </View>
          </View>
          <View>
            <Image source={require("../../../assets/icons/search-icon.png")} className="size-8 mt-8" />
          </View>
        </View>

        <View className="flex flex-row items-center gap-3 mt-3">
          <View className="size-12 bg-slate-400 rounded-full flex justify-center items-center">
            <Text className="text-black">T</Text>
          </View>
          <View className="flex flex-col">
            <Text className="text-white text-lg font-nunito-semibold">Thomas Shelby</Text>
            <Text className="text-md text-gray-400 font-nunito-light">Customer</Text>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-white font-nunito-medium text-2xl">Recommendation</Text>
          <View className="bg-[#14141e] mt-4 rounded-3xl">
            <ScrollView>
              {(showAll ? workers : workers.slice(0, 3)).map((worker) => (
                <View key={worker.id} className="px-5 py-3 my-2 rounded-lg border-b-2 border-gray-600 flex flex-row justify-between">
                  <View className="flex flex-row gap-3">
                    <View className="size-16 bg-slate-300 rounded-full"></View>
                    <View className="flex flex-col gap-1">
                      <Text className="text-white font-nunito-semibold">{worker.name}</Text>
                      <Text className="text-gray-300">{worker.service}</Text>
                      <Text className="text-yellow-400">⭐ {worker.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <View className="self-center">
                    <TouchableOpacity className="px-4 py-2 bg-[#1e1e4a] rounded-xl">
                      <Text className="font-nunito-light text-white">Book now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setShowAll(!showAll)}
                className="mt-4 p-2 rounded-lg flex justify-center"
              >
                <View className="flex flex-row items-center justify-center">
                  <Image
                    source={
                      showAll
                        ? require("../../../assets/icons/up-arrow-icon.png")
                        : require("../../../assets/icons/down-arrow-icon.png")
                    }
                    className="size-6"
                  />
                  <Text className="text-blue-500 text-center ml-2">
                    {showAll ? "Show Less" : "Show More"}
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-white font-nunito-semibold text-2xl mb-3">Discounts</Text>
          <View className="flex flex-row items-center mt-3">
            <TouchableOpacity onPress={scrollLeft}>
              <Image source={require("../../../assets/icons/left-arrow-icon.png")} className="size-8" />
            </TouchableOpacity>
            <ScrollView horizontal ref={scrollViewRef} showsHorizontalScrollIndicator={false} className="px-3">
              {discounts.map((item) => (
                <TouchableOpacity key={item.id} onPress={handleImageClick}>
                  <View className="mr-4 bg-[#1e1e4a] rounded-xl">
                    <Image
                      source={{ uri: item.image }}
                      className="h-[150px] w-[320px] rounded-lg"
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={scrollRight}>
              <Image source={require("../../../assets/icons/right-arrow-icon.png")} className="size-8" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-14">
          <Text className="text-3xl text-center text-white font-nunito-semibold">How to Use this App</Text>
          <Text className="text-justify mt-4 text-lg text-gray-300 font-nunito-light">
            Getting started is easy! Simply sign up or log in to the app using your 
            email or social media. Browse through various service categories like plumbing,
             carpentry, and electrical work. Once you find a worker, you can book an appointment 
             with just a few taps. After your service is complete,
             make secure payments directly through the app and leave a rating to help others.Track your 
             appointments in real-time, receive important updates, and view your past bookings and 
             payments all in one place. If you ever need help, our support team is just a message away!
          </Text>
        </View>

        <View className="mb-24 mt-10">
          <Text className="text-center text-2xl text-white font-nunito-bold mb-4">Developers</Text>
          <View className="flex flex-row justify-between mt-5">
            <View className="flex items-center">
              <Image source={{ uri: "https://picsum.photos/200" }} className="size-24 rounded-full" />
              <Text className="text-white mt-2 font-nunito-semibold">Syed Masood S</Text>
              <Text className="text-gray-400">AI Developer</Text>
              <Text className="text-yellow-400">Team Role: Leader</Text>
            </View>
            <View className="flex items-center">
              <Image source={{ uri: "https://picsum.photos/200/300?random=1" }} className="size-24 rounded-full" />
              <Text className="text-white mt-2 font-nunito-semibold">GoppyKrishna P</Text>
              <Text className="text-gray-400">App Developer</Text>
              <Text className="text-yellow-400">Team Role: Member</Text>
            </View>
            <View className="flex items-center">
              <Image source={{ uri: "https://picsum.photos/200/300?random=2" }} className="size-24 rounded-full" />
              <Text className="text-white mt-2 font-nunito-semibold">Suryaa D</Text>
              <Text className="text-gray-400">App Developer</Text>
              <Text className="text-yellow-400">Team Role: Member</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}
