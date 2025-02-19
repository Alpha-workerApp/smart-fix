import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import AnimatedCarousel from '../components/ImageCarousal';
import Toast from 'react-native-toast-message';
import { domain, shadowStyles } from "../customStyles/custom";
import Sidebar from '../components/CustomerComponents/SideBar';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import Useit from '../components/Useit';

type Service = {
  description: string;
  media_files: string[];
  price: number;
  service_category: string;
  sid: number;
  title: string;
};

const Index = () => {
  const [serviceData, setServiceData] = useState<Service[]>([]);
  const [filteredService, setFilteredService] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fetchURL = `http://${domain}:8003/services`

  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  useEffect(() => {
    const initializeDefaultImage = async () => {
      try {
        const existing = await AsyncStorage.getItem('pickedImage');
        if (!existing) {
          const asset = Asset.fromModule(require('../../assets/images/default-profile.png'));
          await asset.downloadAsync();
          if (asset.localUri) {
            await AsyncStorage.setItem('pickedImage', asset.localUri);
          } else {
            console.log('Default image local URI not available.');
          }
        } else {
          // console.log('Profile image already initialized.');
        }
      } catch (error) {
        console.log('Error initializing default image:', error);
      }
    };

    const fetchDetails = async () => {
      try {
        await initializeDefaultImage();
        const storedUri = await AsyncStorage.getItem('pickedImage');
        const response = await fetch(fetchURL);
        if (response.ok) {
          const data = await response.json();
          //console.log(data)
          setServiceData(data);
          setFilteredService(data);
        } else {
          showToast("error", "Error during Fetch");
        }
        if (storedUri) {
          setImageUri(storedUri);
        }
      } catch (error) {
        showToast("error", "Unable to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    // Back button handling: exit the app on hardware back press.
    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [showToast]);

  const handleFilter = () => {
    if (selectedCategory === "all") {
      setFilteredService(serviceData);
    } else {
      const filtered = serviceData.filter(
        (service) => service.service_category === selectedCategory
      );
      setFilteredService(filtered);
    }
  };

  return (
    <>
      {/* When the sidebar is open, render a full-screen TouchableOpacity that closes it on tap */}
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
            <View className='flex flex-row gap-1'>
              <Text className="font-nunito-bold text-2xl mt-1">Smart</Text>
              <Text className='text-blue-600 font-nunito-bold text-2xl mt-1'>Fix</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/components/CustomerComponents/Notification')}>
            <Image source={require("../../assets/icons/bell-icon.png")} className="w-8 h-8 mr-2 mt-[3px]" />
          </TouchableOpacity>
        </View>

        <View className='mt-10'>
          <Text className='text-xl font-nunito-bold'>Welcome user!</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity onPress={() => router.push('/customer/profile')} className="mt-4 flex flex-row items-center justify-between gap-3 p-2 rounded-full bg-white" style={[shadowStyles.shadow]}>
          <View className="flex flex-row items-center gap-3">
            <View className="size-12 rounded-full flex justify-center items-center">
              {imageUri && (
                <Image source={{ uri: imageUri }} className="size-14 rounded-full" />
              )}
            </View>
            <View className="flex flex-col ml-2">
              <Text className="text-lg font-nunito-semibold">Name</Text>
              <Text className="text-sm text-gray-900 font-nunito-light">category</Text>
            </View>
          </View>
          <TouchableOpacity className='mr-2'>
            <Image source={require("../../assets/icons/right-arrow-icon.png")} className='size-6' />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Available Services */}
        <View className="mt-10">
          <Text className='text-xl font-nunito-bold mb-4'>Available Services</Text>
          <View className='bg-white shadow-2xl rounded-xl mt-1' style={[shadowStyles.shadow]}>
            <View className="flex flex-row justify-between items-center bg-white p-4 rounded-t-xl shadow-xl">
              <RNPickerSelect
                onValueChange={(value) => setSelectedCategory(value)}
                value={selectedCategory}
                items={[
                  { label: "All Services", value: "all" },
                  { label: "Carpenter", value: "Carpentry Services" },
                  { label: "Plumber", value: "Plumbing Services" },
                  { label: "Painting", value: "Painting Services" },
                  { label: "AC Services", value: "A" },
                  { label: "Others", value: "others" }
                ]}
                style={{
                  inputIOS: { backgroundColor: "white", color: "black", padding: 10, borderRadius: 8 },
                  inputAndroid: { backgroundColor: "white", color: "black", padding: 3, borderRadius: 16, width: 200, height: 46, elevation: 5, fontSize: 10 },
                }}
              />
              <TouchableOpacity onPress={handleFilter} className='px-5 py-3 rounded-full bg-gray-950'>
                <Text className="text-white font-nunito-medium">Filter</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 265 }} showsVerticalScrollIndicator={true} className='px-4' nestedScrollEnabled={true}>
              {loading ? (
                <View className='flex-1 justify-center items-center h-[265px]'>
                  <ActivityIndicator size="large" color="black" />
                </View>
              ) : (
                filteredService.length > 0 ? (
                  filteredService.map((service, index) => (
                    <View key={index} className="w-full flex flex-row justify-between rounded-xl my-3 py-4 px-5 bg-white" style={[shadowStyles.shadow]}>
                      <View>
                        <Text className="font-nunito-semibold text-lg">{service.service_category}</Text>
                        <Text className="text-gray-400">{service.description}</Text>
                      </View>
                      <View className='flex flex-row gap-3 justify-center items-center'>
                        <Image source={require("../../assets/icons/right-arrow-icon.png")} className='size-7'/>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-400 text-center py-4">No data available</Text>
                )
              )}
            </ScrollView>
          </View>
        </View>

        {/* Offers & Coupons */}
        <View className='mt-10'>
          <Text className='mt-4 mb-5 text-xl font-nunito-bold'>Offers & Coupens</Text>
          <AnimatedCarousel />
        </View>

        <Useit/>

        {/* Footer */}
        <View className="bg-white border-t-2 border-gray-500 pt-3 flex flex-col items-center mb-32 mt-10">
          <Image source={require("../../assets/icons/logo-img.png")} className="size-24" />
          <View className="flex flex-row mb-2">
            <Text className="text-black font-nunito-bold text-3xl">Smart</Text>
            <Text className="text-blue-600 font-nunito-bold text-3xl">Fix</Text>
          </View>
          <Text className="text-sm font-nunito-light text-gray-500 text-center">
            Connecting you with trusted professionals, anytime, anywhere.
          </Text>
          <Text className="text-sm font-nunito-light text-gray-500">
            SmartFix Reliable services at your fingertips!
          </Text>
          <Text className="mt-4 font-nunito-semibold text-xl">Follow us!</Text>
          <View className="flex-row gap-4 my-3">
            <TouchableOpacity>
              <Image source={require("../../assets/icons/instagram-icon.png")} className="size-10" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/facebook-icon.png")} className="size-9" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={require("../../assets/icons/twitter-icon.png")} className="size-9" />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center mt-3">
            <Text className="text-[#666671] text-base font-nunito-medium">@Copyright 2025</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default Index;



// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   BackHandler,
// } from 'react-native';
// import React, { useCallback, useEffect, useState } from 'react';
// import RNPickerSelect from 'react-native-picker-select';
// import AnimatedCarousel from '../components/ImageCarousal';
// import Toast from 'react-native-toast-message';
// import { shadowStyles } from "../customStyles/custom";
// import Sidebar from '../components/CustomerComponents/SideBar';
// import { router } from 'expo-router';
// import { BlurView } from 'expo-blur';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Asset } from 'expo-asset';

// type Service = {
//   description: string;
//   media_files: string[];
//   price: number;
//   service_category: string;
//   sid: number;
//   title: string;
// };

// const Index = () => {
//   const [serviceData, setServiceData] = useState<Service[]>([]);
//   const [filteredService, setFilteredService] = useState<Service[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [imageUri, setImageUri] = useState<string | null>(null);

//   const fetchURL = "http://192.168.83.89:8003/services";

//   const showToast = useCallback(
//     (type: "success" | "error" | "warning", msg: string) => {
//       Toast.show({ type, text1: msg });
//     },
//     []
//   );

//   // Set up the default image if needed and fetch service details.
//   useEffect(() => {
//     const initializeDefaultImage = async () => {
//       try {
//         const existing = await AsyncStorage.getItem('pickedImage');
//         if (!existing) {
//           const asset = Asset.fromModule(require('../../assets/images/default-profile.png'));
//           await asset.downloadAsync();
//           if (asset.localUri) {
//             await AsyncStorage.setItem('pickedImage', asset.localUri);
//           } else {
//             console.log('Default image local URI not available.');
//           }
//         } else {
//           console.log('Profile image already initialized.');
//         }
//       } catch (error) {
//         console.log('Error initializing default image:', error);
//       }
//     };

//     const fetchDetails = async () => {
//       try {
//         await initializeDefaultImage();
//         const storedUri = await AsyncStorage.getItem('pickedImage');
//         const response = await fetch(fetchURL);
//         if (response.ok) {
//           const data = await response.json();
//           setServiceData(data);
//           setFilteredService(data);
//         } else {
//           showToast("error", "Error during Fetch");
//         }
//         if (storedUri) {
//           setImageUri(storedUri);
//         }
//       } catch (error) {
//         showToast("error", "Unable to fetch data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDetails();

//     // Back button handling: when on the index page, exit the app on hardware back press.
//     const backAction = () => {
//       BackHandler.exitApp();
//       return true;
//     };

//     const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
//     return () => backHandler.remove();
//   }, [showToast]);

//   const handleFilter = () => {
//     if (selectedCategory === "all") {
//       setFilteredService(serviceData);
//     } else {
//       const filtered = serviceData.filter(
//         (service) => service.service_category === selectedCategory
//       );
//       setFilteredService(filtered);
//     }
//   };

//   return (
//     <>
//       {isSidebarOpen && (
//         <BlurView intensity={50} tint="light" className="absolute top-0 left-0 w-full h-full z-10" />
//       )}

//       <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       <ScrollView
//         showsVerticalScrollIndicator={true}
//         contentContainerStyle={{ flexGrow: 1 }}
//         className='px-6 bg-white'
//       >
//         {/* Header */}
//         <View className="flex flex-row justify-between mt-10">
//           <TouchableOpacity onPress={() => setIsSidebarOpen(true)}>
//             <Image source={require("../../assets/icons/menu-icon.png")} className='size-9' />
//           </TouchableOpacity>
//           <View className="flex flex-row items-center">
//             <View className='flex flex-row gap-1'>
//               <Text className="font-nunito-bold text-3xl mt-1">Smart</Text>
//               <Text className='text-blue-600 font-nunito-bold text-3xl mt-1'>Fix</Text>
//             </View>
//           </View>
//           <TouchableOpacity onPress={() => router.push('/components/CustomerComponents/Notification')}>
//             <Image source={require("../../assets/icons/bell-icon.png")} className="size-8 mr-2" />
//           </TouchableOpacity>
//         </View>

//         <View className='mt-10'>
//           <Text className='text-xl font-nunito-bold'>Welcome user!</Text>
//         </View>

//         {/* Profile Card */}
//         <TouchableOpacity onPress={() => router.push('/customer/profile')} className="mt-6 flex flex-row items-center justify-between gap-3 p-2 rounded-full bg-white" style={[shadowStyles.shadow]}>
//           <View className="flex flex-row items-center gap-3">
//             <View className="size-14 rounded-full flex justify-center items-center">
//               {imageUri && (
//                 <Image source={{ uri: imageUri }} className="w-52 h-52 rounded-full mb-6" />
//               )}
//             </View>
//             <View className="flex flex-col gap-1">
//               <Text className="text-xl font-nunito-semibold">Name</Text>
//               <Text className="text-md text-gray-900 font-nunito-light">category</Text>
//             </View>
//           </View>
//           <TouchableOpacity className='mr-2'>
//             <Image source={require("../../assets/icons/right-arrow-icon.png")} className='size-6' />
//           </TouchableOpacity>
//         </TouchableOpacity>

//         {/* Available Services */}
//         <View className="mt-10">
//           <Text className='text-xl font-nunito-bold mb-4'>Available Services</Text>
//           <View className='bg-white shadow-2xl rounded-xl mt-1' style={[shadowStyles.shadow]}>
//             <View className="flex flex-row justify-between items-center bg-white p-4 rounded-t-xl shadow-xl">
//               <RNPickerSelect
//                 onValueChange={(value) => setSelectedCategory(value)}
//                 value={selectedCategory}
//                 items={[
//                   { label: "All Services", value: "all" },
//                   { label: "Carpenter", value: "Carpentry Services" },
//                   { label: "Plumber", value: "Plumbing Services" },
//                   { label: "Painting", value: "Painting Services" },
//                   { label: "AC Services", value: "A" },
//                   { label: "Others", value: "others" }
//                 ]}
//                 style={{
//                   inputIOS: { backgroundColor: "white", color: "black", padding: 10, borderRadius: 8 },
//                   inputAndroid: { backgroundColor: "white", color: "black", padding: 3, borderRadius: 16, width: 200, height: 46, elevation: 5, fontSize: 10 },
//                 }}
//               />
//               <TouchableOpacity onPress={handleFilter} className='px-5 py-3 rounded-full bg-gray-950'>
//                 <Text className="text-white font-nunito-medium">Filter</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={{ maxHeight: 265 }} showsVerticalScrollIndicator={true} className='px-4' nestedScrollEnabled={true}>
//               {loading ? (
//                 <View className='flex-1 justify-center items-center h-[265px]'>
//                   <ActivityIndicator size="large" color="black" />
//                 </View>
//               ) : (
//                 filteredService.length > 0 ? (
//                   filteredService.map((service, index) => (
//                     <View key={index} className="w-full flex flex-row justify-between rounded-xl my-3 py-4 px-5 bg-white" style={[shadowStyles.shadow]}>
//                       <View>
//                         <Text className="font-nunito-semibold text-lg">{service.service_category}</Text>
//                         <Text className="text-gray-400">{service.description}</Text>
//                       </View>
//                       <View className='flex flex-row gap-3 justify-center items-center'>
//                         <Image source={require("../../assets/icons/right-arrow-icon.png")} className='size-7'/>
//                       </View>
//                     </View>
//                   ))
//                 ) : (
//                   <Text className="text-gray-400 text-center py-4">No data available</Text>
//                 )
//               )}
//             </ScrollView>
//           </View>
//         </View>

//         {/* Offers & Coupons */}
//         <View className='mt-10'>
//           <Text className='mt-4 mb-5 text-xl font-nunito-bold'>Offers & Coupens</Text>
//           <AnimatedCarousel />
//         </View>

//         {/* Footer */}
//         <View className="bg-white border-t-2 border-gray-500 pt-3 flex flex-col items-center mb-32 mt-10">
//           <Image source={require("../../assets/icons/logo-img.png")} className="size-24" />
//           <View className="flex flex-row mb-2">
//             <Text className="text-black font-nunito-bold text-3xl">Smart</Text>
//             <Text className="text-blue-600 font-nunito-bold text-3xl">Fix</Text>
//           </View>
//           <Text className="text-base font-nunito-light text-gray-500">
//             Connecting you with trusted professionals, anytime, anywhere.
//           </Text>
//           <Text className="text-base font-nunito-light text-gray-500">
//             SmartFix Reliable services at your fingertips!
//           </Text>
//           <Text className="mt-4 font-nunito-semibold text-xl">Follow us!</Text>
//           <View className="flex-row gap-4 my-3">
//             <TouchableOpacity>
//               <Image source={require("../../assets/icons/instagram-icon.png")} className="size-10" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Image source={require("../../assets/icons/facebook-icon.png")} className="size-9" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Image source={require("../../assets/icons/twitter-icon.png")} className="size-9" />
//             </TouchableOpacity>
//           </View>
//           <View className="flex-row justify-center mt-3">
//             <Text className="text-[#666671] text-base font-nunito-medium">@Copyright 2025</Text>
//           </View>
//         </View>
//       </ScrollView>
//     </>
//   );
// };

// export default Index;
