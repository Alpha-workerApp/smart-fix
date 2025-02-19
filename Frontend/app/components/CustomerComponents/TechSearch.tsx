import { View, Text, TouchableOpacity, Image, TextInput, FlatList, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';

type Technician = {
  id: string;
  name: string;
  status: string;
  service_category: string;
  location: string;
};

const dummyTechnicians: Technician[] = [
  { id: '1', name: 'Alice Johnson', status: 'Available', service_category: 'Plumbing', location: 'New York' },
  { id: '2', name: 'Bob Smith', status: 'Busy', service_category: 'Electrical', location: 'Los Angeles' },
  { id: '3', name: 'Charlie Brown', status: 'Available', service_category: 'Carpentry', location: 'Chicago' },
  { id: '4', name: 'Diana Prince', status: 'Offline', service_category: 'Painting', location: 'Houston' },
  { id: '5', name: 'Ethan Hunt', status: 'Available', service_category: 'Plumbing', location: 'Phoenix' },
];

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>(dummyTechnicians);

  // Filter technicians based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredTechnicians(dummyTechnicians);
    } else {
      const lowerSearch = searchText.toLowerCase();
      const filtered = dummyTechnicians.filter((tech) =>
        tech.name.toLowerCase().includes(lowerSearch) ||
        tech.service_category.toLowerCase().includes(lowerSearch)
      );
      setFilteredTechnicians(filtered);
    }

    const onBackPress = () => {
      router.replace("/customer");
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => backHandler.remove();
  }, [searchText]);

  const renderItem = ({ item }: { item: Technician }) => (
    <View className="bg-white p-4 my-2 rounded shadow-md">
      <Text className="font-bold text-lg">{item.name}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Category: {item.service_category}</Text>
      <Text>Location: {item.location}</Text>
    </View>
  );

  return (
    <View className="w-screen h-screen bg-gray-200 relative mt-8">
      {/* Header */}
      <View className="w-full items-center mt-10">
        <View className="flex flex-row gap-1">
          <Text className="font-nunito-bold text-2xl mt-1">Search</Text>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} className="absolute left-5 top-[3.5%]">
        <Image source={require("../../../assets/icons/left-arrow-icon.png")} className="w-6 h-6" />
      </TouchableOpacity>

      {/* Search Bar */}
      <View className="mt-6 px-5">
        <View className="flex flex-row items-center bg-white rounded-full shadow-md px-3 py-2">
          <Image source={require("../../../assets/icons/search-icon.png")} className="w-6 h-6 mr-2" />
          <TextInput
            placeholder="Search Technicians"
            className="flex-1 text-base" // Reduced text size from text-lg to text-base
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity 
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 9999,
            }}
          >
            <Text className="text-white font-semibold text-base">Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Technician List */}
      <View className="mt-6 px-5 flex-1">
        {filteredTechnicians.length > 0 ? (
          <FlatList
            data={filteredTechnicians}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="items-center mt-10">
            <Text className="text-lg">No technicians found.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Search;
