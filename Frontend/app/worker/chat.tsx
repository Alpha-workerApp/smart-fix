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
import axios from "axios";

const API_URL = "http://192.168.254.89:5000/chat";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Welcome\nHow can I help you today?", sender: "bot" },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (query.trim()) {
      const userMessage = { id: Date.now(), text: query, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setQuery("");
      setLoading(true); // Set loading state

      // Delay before showing "Typing..." message
      setTimeout(() => {
        const typingMessage = { id: Date.now() + 1, text: "Typing...", sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, typingMessage]);
        
        // Auto-scroll after "Typing..." appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1000); // 1-second delay

      try {
        // Send user message to Flask server
        const response = await axios.post(API_URL, { user_input: query });

        // Remove "Typing..." message
        setMessages((prevMessages) => prevMessages.filter(msg => msg.text !== "Typing..."));

        // Add bot response
        const botMessage = {
          id: Date.now() + 2,
          text: response.data.response[0], // Extracting bot reply from response
          sender: "bot",
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prevMessages) => [
          ...prevMessages.filter(msg => msg.text !== "Typing..."), // Remove "Typing..."
          { id: Date.now() + 3, text: "Error connecting to chatbot.", sender: "bot" },
        ]);
      } finally {
        setLoading(false); // Reset loading state
      }
      
      // Auto-scroll after bot response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <ImageBackground
      source={require("../../assets/images/Ui-background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Text className="text-2xl font-nunito-bold px-4 py-4 mt-14">
        Chat with us!
      </Text>

      {/* Chat Messages */}
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
        <TouchableOpacity onPress={handleSend} className="p-2" disabled={loading}>
          <Image
            source={require("../../assets/icons/send-icon.png")}
            style={{ width: 24, height: 24, opacity: loading ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Chat;
