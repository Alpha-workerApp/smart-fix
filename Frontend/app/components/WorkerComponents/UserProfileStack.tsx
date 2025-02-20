import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';

const initialUsers = [
  { id: 1, name: "John Doe", purpose: "Plumbing Service" },
  { id: 2, name: "Alice Smith", purpose: "Electrical Repair" },
  { id: 3, name: "Mark Johnson", purpose: "Carpentry Work" },
];

const UserProfileStack = () => {
  const [users, setUsers] = useState(initialUsers);

  const handleRemoveUser = (id: number) => {
    Alert.alert(
      "Remove User",
      "Are you sure you want to remove this user from the stack?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeUser(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const removeUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <View className='px-5'>
      <Text className='font-nunito-bold text-2xl mb-4'>Request Stack</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {users.map((user) => (
          <View
            key={user.id}
            className='relative p-3 bg-white rounded-2xl mx-2 w-60 h-60 mb-4 items-center'
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            {/* Cancel Button (Cross) */}
            <TouchableOpacity
              className='absolute top-2 right-2 p-1 bg-gray-200 rounded-full'
              onPress={() => handleRemoveUser(user.id)}
            >
              <Image source={require("../../../assets/icons/close-icon.png")} className='w-5 h-5' />
            </TouchableOpacity>

            {/* Profile Icon */}
            <View className='bg-gray-300 size-28 rounded-full'></View>

            {/* User Details */}
            <View className='flex items-center gap-1'>
              <Text className='text-black text-lg font-nunito-bold mt-2'>{user.name}</Text>
              <Text className='text-gray-600 text-sm mb-2'>{user.purpose}</Text>

              <View className='flex-row gap-3'>
                <TouchableOpacity className='bg-green-500 px-4 py-1 rounded-lg'>
                  <Text className='text-white text-sm'>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity className='bg-blue-600 px-4 py-1 rounded-lg'>
                  <Text className='text-white text-sm'>View Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default UserProfileStack;