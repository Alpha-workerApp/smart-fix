import { View, Text, Image } from 'react-native'
import React from 'react'
import { LinearGradient } from "expo-linear-gradient";

const index = () => {
  return (
    <View className='h-full'>
      <LinearGradient colors={["#171746", "#0F0F19"]} className="flex-1 px-5 py-2">
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
      </LinearGradient>
    </View>
  )
}

export default index