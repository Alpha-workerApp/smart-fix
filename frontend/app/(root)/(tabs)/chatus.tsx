import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ChatUs = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Welcome\nHow can I help you today?", sender: "bot" },
  ]);
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (query.trim()) {
      setMessages([...messages, { id: Date.now(), text: query, sender: "user" }]);
      setQuery("");
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now() + 1, text: "Got it! Let me help you with that.", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  return (
    <LinearGradient colors={["#171746", "#0F0F19"]} className="flex-1">
      
      <Text className="text-2xl text-white  font-nunito-bold px-4 py-4 mt-6 ">Chat with us!</Text>

      {/* Message List */}
      <ScrollView className="flex-1 mb-60 px-6">
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`${
              msg.sender === "user"
                ? "bg-blue-500 self-end rounded-xl rounded-tr-none"
                : "bg-[#14141e] self-start rounded-xl rounded-tl-none"
            } max-w-[75%] p-3  my-2 px-4`}
          >
            <Text className="text-white font-nunito-medium text-lg">{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Query Input */}
      <View className="absolute bottom-32 left-0 mx-5 bg-gray-800 flex-row items-center px-4 py-2 rounded-full">
        <TextInput
          className="flex-1 text-white px-2"
          value={query}
          onChangeText={setQuery}
          placeholder="Ask Your Query"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={handleSend} className="p-2">
          <Image
            source={require("../../../assets/icons/send-icon.png")}
            style={{ width: 24, height: 24, tintColor: "white" }}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ChatUs;
