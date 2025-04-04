import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { domain } from '@/app/customStyles/custom';

// Define types
type Booking = {
  customer_name?: string;
  service?: string;
  status?: string;
};

type User = {
  name: string;
  email: string;
  phone: string;
  uid: string;
};

const UserProfileStack: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userDetails, setUserDetails] = useState<User>({
    name: '',
    email: '',
    phone: '',
    uid: ''
  });
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("registerEmail");
      if (!email) {
        console.warn("No email found in AsyncStorage");
        return;
      }

      // Fetch technician data
      const techResponse = await fetch(`http://${domain}:8001/technicians?email=${email}`);
      const technician = await techResponse.json();

      const techId = technician?.TID || technician?.technician_id;
      if (!techId) {
        console.warn("Technician ID not found");
        return;
      }

      // Get booking ID using technician ID
      const bookingResponse = await fetch(`http://${domain}:8006/get/booking?tid=${techId}`);
      const bookingData = await bookingResponse.json();
      const bookingId = bookingData.bookings.booking_id;

      // Get booking details using booking ID
      const fetchBookingdata = await fetch(`http://${domain}:8004/bookings/${bookingId}`);
      const dataDetails = await fetchBookingdata.json();

      // Save booking details
      setBookings([
        {
          customer_name: dataDetails.customer_name,
          service: dataDetails.service,
          status: dataDetails.status,
        }
      ]);

      // Get user details using UID
      const userIdFetch = await fetch(`http://${domain}:8000/users/${dataDetails.UID}`);
      const userData = await userIdFetch.json();
      setUserDetails(userData);

    } catch (error) {
      console.log("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View className="px-5 py-4">
      {/* Heading and Refresh Button */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-nunito-bold text-black">Received Bookings</Text>
        <TouchableOpacity
          onPress={fetchBookings}
          className="bg-blue-500 px-4 py-1 rounded-full"
        >
          <Text className="text-white font-nunito-medium">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Section */}
      <View className="mb-4 bg-white p-4 rounded-xl shadow">
        <Text className="text-lg font-nunito-bold text-black">User Profile</Text>
        <Text className="text-sm font-nunito-regular text-gray-800 mt-2">
          Name: {userDetails.name || "N/A"}
        </Text>
        <Text className="text-sm font-nunito-regular text-gray-800">
          Email: {userDetails.email || "N/A"}
        </Text>
        <Text className="text-sm font-nunito-regular text-gray-800">
          Phone: {userDetails.phone || "N/A"}
        </Text>
      </View>

      {/* Bookings Section */}
      {loading ? (
        <Text className="text-gray-500">Loading bookings...</Text>
      ) : bookings.length === 0 ? (
        <Text className="text-gray-400">No bookings found.</Text>
      ) : (
        <ScrollView>
          {bookings.map((item, index) => (
            <View
              key={index}
              className="bg-white p-4 mb-3 rounded-xl shadow"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text className="text-base font-nunito-bold text-blue-900">
                Customer: {item.customer_name || "N/A"}
              </Text>
              <Text className="text-sm font-nunito-regular text-gray-700 mt-1">
                Service: {item.service || "N/A"}
              </Text>
              <Text className="text-sm font-nunito-regular text-gray-700">
                Status: {item.status || "Pending"}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default UserProfileStack;
