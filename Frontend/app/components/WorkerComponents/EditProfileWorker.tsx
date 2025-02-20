import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, SafeAreaView, BackHandler, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { domain, shadowStyles } from "../../customStyles/custom";
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';

interface Technician {
  email: string;
  phone: string;
  name: string;
  id_proof_type: string;
  id_proof_number: string;
  service_category: string;
  lattitude: number | null,
  longitude: number | null
}

const EditProfileWorker = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [idProofType, setIdProofType] = useState("");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [tid, settid] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUri = await AsyncStorage.getItem('pickedImage');
        const userInfoString = await AsyncStorage.getItem("userInfo");
        console.log(userInfoString)
        if (storedUri) setImageUri(storedUri);

        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setName(userInfo.name || "");
          setEmail(userInfo.email || "");
          settid(userInfo.TID || "");
          setPhone(userInfo.phone || "");
          setIdProofType(userInfo.id_proof_type || "");
          setIdProofNumber(userInfo.id_proof_number || "");
          setServiceCategory(userInfo.service_category || "");
          console.log(tid)
        }
      } catch (error) {
        console.log('Error loading user info:', error);
      }
    };

    loadUserInfo();

    const onBackPress = () => {
      router.replace("/worker");
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backHandler.remove();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      showToast("success", "Location fetched successfully!");
    } catch (error) {
      console.error("Error fetching location:", error);
      showToast("error", "Failed to get location");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access the gallery is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await AsyncStorage.setItem('pickedImage', uri);
    }
  };

  const handleSave = async () => {
    if (!email) {
      showToast("error", "Email is required");
      return;
    }

    if (!tid) {
      showToast("error", "Invalid user ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://${domain}:8001/technicians/${tid}`, {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          id_proof_type: idProofType,
          id_proof_number: idProofNumber,
          service_category: serviceCategory,
          latitude,
          longitude,
        }),
      });

      const responseText = await response.text();
      //console.log("Response Body:", responseText);

      if (response.ok) {
        showToast("success", "Profile updated successfully!");
        const updatedUserInfo: Technician = {
          email,
          phone,
          name,
          id_proof_type: idProofType,
          id_proof_number: idProofNumber,
          service_category: serviceCategory,
          lattitude: latitude,
          longitude: longitude,
        };
  
        await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        router.back();
      } else {
        showToast("error", "Failed to update profile!");
      }
    } catch (error) {
      showToast("error", "Network error!");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-white px-5 py-10">
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => router.back()} className="mt-5">
              <Image source={require("../../../assets/icons/left-arrow-icon.png")} className="size-7 mt-1" />
            </TouchableOpacity>
            <Text className="pt-6 text-3xl font-nunito-bold">Your Info | Edit</Text>
          </View>

          <View className="items-center mt-9">
            <TouchableOpacity onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-52 h-52 rounded-full border-2 border-gray-300" />
              ) : (
                <View className="w-40 h-40 rounded-full bg-gray-200 justify-center items-center">
                  <Text className="text-gray-700">Select Image</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text className="text-lg font-nunito-medium text-gray-900 mt-3">Click the image to edit</Text>
          </View>

          <View className="mt-5">
            <Text className='text-lg font-nunito-semibold mb-2'>Full name:</Text>
            <TextInput placeholder="Enter Full Name" value={name} onChangeText={setName}  className='bg-gray-200 rounded-xl px-3 mb-3'/>
            <Text className='text-lg font-nunito-semibold mb-2'>Email:</Text>
            <TextInput placeholder="Enter Email Address" value={email} editable={false} className='bg-gray-200 rounded-xl px-3 mb-3'/>
            <Text className='text-lg font-nunito-semibold mb-2'>Phone:</Text>
            <TextInput placeholder="Enter Phone Number" value={phone} onChangeText={setPhone} className='bg-gray-200 rounded-xl px-3 mb-3'/>
            <Text className='text-lg font-nunito-semibold mb-2'>ID Proof Type:</Text>
            <TextInput placeholder="Enter ID Proof Type" value={idProofType} onChangeText={setIdProofType} className='bg-gray-200 rounded-xl px-3 mb-3'/>
            <Text className='text-lg font-nunito-semibold mb-2'>ID Proof Number:</Text>
            <TextInput placeholder="Enter ID Proof Number" value={idProofNumber} onChangeText={setIdProofNumber} className='bg-gray-200 rounded-xl px-3 mb-3'/>
            <Text className='text-lg font-nunito-semibold mb-2'>Service:</Text>
            <TextInput placeholder="Enter Service Category" value={serviceCategory} onChangeText={setServiceCategory} className='bg-gray-200 rounded-xl px-3 mb-3'/>

            <TouchableOpacity onPress={getLocation} className="bg-blue-500 p-3 rounded-full mb-4 mt-4">
              <Text className="text-white font-nunito-bold text-center">Get Location</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-black rounded-full px-4 py-3 items-center" onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-xl">Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default EditProfileWorker;
