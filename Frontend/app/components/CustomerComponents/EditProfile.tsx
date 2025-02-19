import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, SafeAreaView, BackHandler, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { shadowStyles} from "../../customStyles/custom";
import Toast from 'react-native-toast-message';

const EditProfile = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const defaultImage = require('../../../assets/images/default-profile.png');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const showToast = useCallback(
    (type: "success" | "error" | "warning", msg: string) => {
      Toast.show({ type, text1: msg });
    },
    []
  );

  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedUri = await AsyncStorage.getItem('pickedImage');
        if (storedUri) {
          setImageUri(storedUri);
        }
      } catch (error) {
        console.log('Error loading image:', error);
      }
    };
    loadImage();

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

    if (result.canceled) {
      console.log('User cancelled image picker');
    } else if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      try {
        await AsyncStorage.setItem('pickedImage', uri);
      } catch (error) {
        console.log('Error saving image:', error);
      }
    }
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-white px-5 py-10">
          <View className="flex- flex-row gap-2">
            <TouchableOpacity onPress={() => router.back()} className="mt-5">
              <Image source={require("../../../assets/icons/left-arrow-icon.png")} className="size-7 mt-1" />
            </TouchableOpacity>
            <Text className="pt-6 text-3xl  font-nunito-bold">Your Info | Edit</Text>
          </View>
          <View className='items-center mt-5'>
          <TouchableOpacity onPress={pickImage}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-52 h-52 rounded-full border-2 border-gray-300"
              />
            ) : (
              <View className="w-40 h-40 rounded-full bg-gray-200 justify-center items-center">
                <Text className="text-gray-700">Select Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className='text-lg font-nunito-medium text-gray-900  mt-3'>Click the image to edit</Text>
          </View>
          <View className='mt-5'>
              {/* Name Input */}
              <Text className='text-xl font-nunito-bold mb-2'>Name</Text>
            <TextInput
              className="bg-white w-full rounded-lg px-3 py-4 text-lg mb-4 shadow-2xl"
              style={[shadowStyles.shadow]}
              placeholder="Enter FullName" value={name} onChangeText={setName}
            />
            {/* Email Input */}
            <Text className='text-xl font-nunito-bold mb-2'>Email</Text>
            <TextInput
              className="bg-white w-full rounded-lg px-3 py-4 text-lg mb-4 shadow-2xl"
              style={[shadowStyles.shadow]}
              placeholder="Enter Email Address" value={email} onChangeText={setEmail}
            />
            {/* Phone Input */}
            <Text className='text-xl font-nunito-bold mb-2'>Phone</Text>
            <TextInput
              className="bg-white w-full rounded-lg px-3 py-4 text-lg mb-4 shadow-2xl"
              style={[shadowStyles.shadow]}
              placeholder="Enter Phone Number" value={phone} onChangeText={setPhone}
            />
            <Text className='text-xl font-nunito-bold mb-2'>Phone</Text>
            <TextInput
              className="bg-white w-full rounded-lg px-3 py-4 text-lg mb-4 shadow-2xl"
              style={[shadowStyles.shadow]}
              placeholder="Enter Phone Number" value={phone} onChangeText={setPhone}
            />
            <Text className='text-xl font-nunito-bold mb-2'>Location</Text>
            <TextInput
              className="bg-white w-full rounded-lg px-3 py-4 text-lg mb-7 shadow-2xl"
              style={[shadowStyles.shadow]}
              placeholder="Enter Phone Number" value={phone} onChangeText={setPhone}
            />
         <TouchableOpacity className='bg-black rounded-full px-4 py-3 items-center' onPress={() => showToast("success","Saved info")}>
          <Text className='text-white text-xl font-nunito-semibold'>Save</Text>
         </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default EditProfile;