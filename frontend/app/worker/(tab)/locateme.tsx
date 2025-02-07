import React, { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, ActivityIndicator, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; // Expo Location

export default function LocateMe() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Log current location to check whether it's being fetched properly
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log('Fetched Location:', currentLocation); // Check fetched coordinates
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    };

    fetchLocation();
  }, []);

  const handleLocateMe = async () => {
    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log('New Location:', currentLocation); // Log location on button click
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      alert('Error fetching location.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: location ? location.latitude : 37.78825, // Default if location not set
          longitude: location ? location.longitude : -122.4324, // Default if location not set
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Render Marker only if location is available */}
        {location && (
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
        )}
      </MapView>

      <View className="absolute bottom-[100px] right-6 p-5 bg-[#14141e] rounded-full shadow-md">
        <TouchableOpacity onPress={handleLocateMe}>
          {loading ? (
            <ActivityIndicator color="blue" />
          ) : (
            <Image source={require("../../../assets/icons/locate-me-icon.png")} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
