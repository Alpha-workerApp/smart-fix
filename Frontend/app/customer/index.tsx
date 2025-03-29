import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  TextInput,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { domain, shadowStyles } from "../customStyles/custom";
import Sidebar from '../components/CustomerComponents/SideBar';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import Useit from '../components/Useit';
import AnimatedCarousel from '../components/ImageCarousal';

const availableServices = [
  { title: "AC & HVAC Maintenance" },
  { title: "Carpentry Services" },
  { title: "Electrical Services" },
  { title: "House Cleaning Services" },
  { title: "Microwave Repair" },
  { title: "Painting Services" },
  { title: "Plumbing Services" },
  { title: "Refrigerator Repair" },
  { title: "Washing Machine Repair" },
  { title: "Water Purifier Repair" }
];

interface User {
  email: string;
  phone: string;
  name: string;
}

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setData] = useState<User | null>(null);
  const [filteredServices, setFilteredServices] = useState(availableServices);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilteredServices(
      query.trim() === ''
        ? availableServices
        : availableServices.filter(service =>
            service.title.toLowerCase().includes(query.toLowerCase())
          )
    );
  };


  const showToast = useCallback((type: "success" | "error" | "warning", msg: string) => {
    Toast.show({ type, text1: msg });
  }, []);

  useEffect(() => {
    const storeDetails = async () => {
      try {
        const email = await AsyncStorage.getItem("registerEmail");
        if (!email) return;

        const response = await fetch(`http://${domain}:8000/users?email=${email}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data) setData(data);

        await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    };
    storeDetails();

    const initializeDefaultImage = async () => {
      try {
        const existing = await AsyncStorage.getItem('pickedImage');
        if (!existing) {
          const asset = Asset.fromModule(require('../../assets/images/default-profile.png'));
          await asset.downloadAsync();
          if (asset.localUri) await AsyncStorage.setItem('pickedImage', asset.localUri);
        }
      } catch (error) {
        console.log('Error initializing default image:', error);
      }
    };

    initializeDefaultImage();
    AsyncStorage.getItem('pickedImage').then(setImageUri);

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [showToast]);

  return (
    <>
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsSidebarOpen(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        >
          <BlurView intensity={50} tint="light" style={{ flex: 1 }} />
        </TouchableOpacity>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
        className='px-5 bg-white mt-7'
      >
        {/* Header */}
        <View className="flex flex-row justify-between mt-10">
          <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
            <Image source={require("../../assets/icons/menu-icon.png")} className='size-8' />
          </TouchableOpacity>
          <View className="flex flex-row items-center">
            <Text className="font-nunito-bold text-2xl mt-1">Smart</Text>
            <Text className='text-blue-600 font-nunito-bold text-2xl mt-1'>Fix</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/components/CustomerComponents/Notification')}>
            <Image source={require("../../assets/icons/bell-icon.png")} className="w-8 h-8 mr-2 mt-[3px]" />
          </TouchableOpacity>
        </View>

        <View className='mt-10'>
          <Text className='text-xl font-nunito-bold'>Welcome user!</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          onPress={() => router.push('/customer/profile')}
          className="mt-4 flex flex-row items-center justify-between gap-3 p-2 rounded-full bg-white"
          style={[shadowStyles.shadow]}
        >
          <View className="flex flex-row items-center gap-3">
            <View className="size-12 rounded-full flex justify-center items-center">
              {imageUri && (
                <Image source={{ uri: imageUri }} className="size-14 rounded-full" />
              )}
            </View>
            <View className="flex flex-col ml-2">
              <Text className="text-lg font-nunito-semibold">{userData ? userData.name : "Loading..."}</Text>
              <Text className="text-sm text-gray-900 font-nunito-light">customer</Text>
            </View>
          </View>
          <Image source={require("../../assets/icons/right-arrow-icon.png")} className='size-6 mr-2' />
        </TouchableOpacity>

        {/* Services List */}
        <View className="mt-10">
          <Text className='text-xl font-nunito-bold mb-4'>Available Services</Text>

          {/* Search Bar */}
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search services..."
            placeholderTextColor="gray"
            className="px-4 py-3 bg-gray-200 rounded-full mb-3 text-black"
          />

          <View className='bg-white shadow-2xl rounded-xl p-4 h-[40vh]'>
            <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <View key={index} className="py-3 border-b border-gray-300">
                    <TouchableOpacity onPress={() => router.push("/components/CustomerComponents/TechSearch")}>
                      <Text className="text-lg font-nunito-semibold">{service.title}</Text>
                      <Text className='font-nunito-bold text-sm text-blue-500'>Click to Search</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">No services found</Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Offers & Coupons */}
        <View className='mt-10'>
          <Text className='mt-4 mb-5 text-xl font-nunito-bold'>Offers & Coupons</Text>
          <AnimatedCarousel />
        </View>

        <Useit />

        {/* Footer */}
        <View className="bg-white border-t-2 border-gray-500 pt-3 flex flex-col items-center mb-32 mt-10">
          <Image source={require("../../assets/icons/logo-img.png")} className="size-24" />
          <Text className="text-sm font-nunito-light text-gray-500 text-center">
            Connecting you with trusted professionals, anytime, anywhere.
          </Text>
          <Text className="mt-4 font-nunito-semibold text-xl">Follow us!</Text>
        </View>
      </ScrollView>
    </>
  );
};

export default Index;
