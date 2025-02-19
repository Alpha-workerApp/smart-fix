import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { useFonts } from "expo-font";
import { SafeAreaView, ActivityIndicator } from "react-native";
import ToastMessage from "../hooks/ToastMessage";
import { useEffect, useState, useContext } from "react";
import { ipAddress } from "../hooks/GetIP";



export default function RootLayout() {
  
  const [fontsLoaded] = useFonts({
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-Medium": require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
  });


  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }

  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return 
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="white" />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastMessage />
    </SafeAreaView>
  );
}

