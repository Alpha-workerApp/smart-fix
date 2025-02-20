import React, { useCallback, useState } from "react";
import { View, StyleSheet, Text, FlatList, Dimensions } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const videoIds = [
  "dQw4w9WgXcQ", // Video 1
  "3JZ_D3ELwOQ", // Video 2
  "L_jWHffIx5E", // Video 3
  "fLexgOxsZu0", // Video 4
];

const LearningContent = () => {
  const [playing, setPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      console.log("Video has finished playing!");
    }
  }, []);

  return (
    <View className="px-6">
      <Text className="text-2xl font-nunito-bold ml-3 mb-4 mt-5">Learn</Text>
      <FlatList
        data={videoIds}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="mr-3">
            <YoutubePlayer height={200} width={Dimensions.get("window").width * 0.85} play={playing} videoId={item} onChangeState={onStateChange} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  videoContainer: {
    marginRight: 10,
  },
});

export default LearningContent;
