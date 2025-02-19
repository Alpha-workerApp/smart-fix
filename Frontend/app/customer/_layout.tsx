import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { BlurView } from "expo-blur";

type TabIconProps = {
  focused: boolean;
  icon: any;
  title: string;
};

const TabIcon = ({ focused, icon, title }: TabIconProps) => (
  <View style={{ width: 100, alignItems: "center", marginTop: 25 }}>
    {focused ? (
      // When focused, use a BlurView to create a glass-effect background.
      <BlurView
        intensity={50}
        tint="light"
        style={{
          width: 45,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#D0DDD0",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={icon}
          style={{ width: 26, height: 26, tintColor: "black" }}
          resizeMode="contain"
        />
      </BlurView>
    ) : (
      <View
        style={{
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
        }}
      >
        <Image
          source={icon}
          style={{ width: 26, height: 26, tintColor: "black" }}
          resizeMode="contain"
        />
      </View>
    )}
    <Text
      style={{
        fontSize: 12,
        color: focused ? "black" : "gray",
        marginTop: 5,
        fontWeight: "bold",
      }}
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
          backgroundColor: "white",
          position: "absolute",
          minHeight: 80,
          borderTopWidth: 0,
          // Add shadow properties:
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 6,
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
              icon={require("../../assets/icons/white-home.png")}
              title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chatus"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={require("../../assets/icons/chat-icon.png")}
              title="Chat"
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
              icon={require("../../assets/icons/user-icon.png")}
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
