import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) => (
  <View style={{ width: 100, alignItems: "center", marginTop: 20 }}>
    <Image
      source={icon}
      style={{
        width: 26,
        height: 26,
        tintColor: focused ? "#0061FF" : "#D2D2D2",
      }}
      resizeMode="contain"
    />
    <Text
      style={{
        fontSize: 12,
        color: focused ? "#0061FF" : "#666876",
        marginTop: 5,
      }}
      className="font-nunito-bold"
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#14141e",
          position: "absolute",
          minHeight: 80,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../../assets/icons/white-home.png")}
              title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "chatbot",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../../assets/icons/chat-icon.png")}
              title="Chat us"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="locateme"
        options={{
          title: "chatbot",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../../assets/icons/location-icon.png")}
              title="Find"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../../assets/icons/user-icon.png")}
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
