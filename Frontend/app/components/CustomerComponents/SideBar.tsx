import { View, Text, TouchableOpacity, Image, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

const { width } = Dimensions.get("window");

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleOptionPress = (route: string) => {
    router.push(route as any);
    onClose();
  };

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 200,
        height: "100%",
        backgroundColor: "white",
        padding: 20,
        transform: [{ translateX: slideAnim }],
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 10,
      }}
      className="z-20 flex flex-col items-center justify-between border-r-2 border-gray-200"
    >
      {/* Close Button */}
      <View className="w-full flex flex-row justify-end">
        <TouchableOpacity onPress={onClose}>
          <Image
            source={require("../../../assets/icons/close-icon.png")}
            style={{ width: 14, height: 14 }}
          />
        </TouchableOpacity>
      </View>

      {/* Sidebar Items */}
      <View className="flex flex-col gap-5 items-center">
        <Text className="text-black font-nunito-bold text-2xl">Menu</Text>

        <TouchableOpacity onPress={() => handleOptionPress("/components/CustomerComponents/TechSearch")} style={{ paddingVertical: 10 }} className="flex flex-row gap-2">
          <Image source={require("../../../assets/icons/search-icon.png")} className="size-5 mt-1"/>
          <Text className="text-black font-nunito-semibold text-xl">Search</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleOptionPress("/components/CustomerComponents/status")} style={{ paddingVertical: 10 }} className="flex flex-row gap-2">
          <Image source={require("../../../assets/icons/status-icon.png")} className="size-5 mt-1"/>
          <Text className="text-black font-nunito-semibold text-xl">Status</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity onPress={() => handleOptionPress("/components/CustomerComponents/EditProfile")} style={{ paddingVertical: 10 }} className="mb-20 flex flex-row gap-2">
        <Image source={require("../../../assets/icons/settings-icon.png")} className="size-5 mt-1"/>
        <Text className="text-black font-nunito-semibold text-xl">Settings</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Sidebar;



