import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";

const Chatus = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Welcome\nHow can I help you today?", sender: "bot" },
  ]);
  const [query, setQuery] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (query.trim()) {
      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: query, sender: "user" },
      ]);
      setQuery("");

      // After sending, scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Simulate bot reply after 1 second
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 1,
            text: "Got it! Let me help you with that.",
            sender: "bot",
          },
        ]);
        // Scroll to bottom after adding bot reply
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000);
    }
  };

  useEffect(() => {
    // Whenever messages update, scroll to bottom.
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ImageBackground
      source={require("../../assets/images/Ui-background.png")} // Replace with your background image path
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Text className="text-2xl font-nunito-bold px-4 py-4 mt-14">
        Chat with us!
      </Text>

      {/* Message List */}
      <ScrollView ref={scrollViewRef} className="flex-1 mb-[160px] px-6">
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`${
              msg.sender === "user"
                ? "bg-gray-600 self-end rounded-xl rounded-tr-none"
                : "bg-[#14141e] self-start rounded-xl rounded-tl-none"
            } max-w-[75%] p-3 my-2 px-4`}
          >
            <Text className="text-white font-nunito-medium text-lg">
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Query Input */}
      <View className="absolute bottom-[100px] left-0 shadow-2xl flex-row items-center rounded-full px-4 py-2 mx-4 bg-white">
        <TextInput
          className="flex-1 px-2"
          value={query}
          onChangeText={setQuery}
          placeholder="Ask Your Query"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity onPress={handleSend} className="p-2">
          <Image
            source={require("../../assets/icons/send-icon.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Chatus;


