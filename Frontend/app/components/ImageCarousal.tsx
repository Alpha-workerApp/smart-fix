import { useState } from "react";
import * as Animatable from "react-native-animatable";
import {
  FlatList,
  ImageBackground,
  TouchableOpacity,
  View,
} from "react-native";

const zoomIn = {
  0: { scale: 0.9 },
  1: { scale: 1 },
};

const zoomOut = {
  0: { scale: 1 },
  1: { scale: 0.9 },
};

type TrendingItemProps = {
  activeItem: string;
  item: { id: string; thumbnail: { uri: string } };
};

const TrendingItem = ({ activeItem, item }: TrendingItemProps) => {
  return (
    <Animatable.View
      className="mr-4"
      duration={500}
    >
      <TouchableOpacity
        className="relative justify-center items-center"
        activeOpacity={0.7}
      >
        <ImageBackground
          source={item.thumbnail}
          className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const AnimatedCarousel = () => {
  // Define 5 image items for the carousel using the link.
  const posts = [
    { id: "1", thumbnail: { uri: "https://picsum.photos/200/300" } },
    { id: "2", thumbnail: { uri: "https://picsum.photos/200/300" } },
    { id: "3", thumbnail: { uri: "https://picsum.photos/200/300" } },
    { id: "4", thumbnail: { uri: "https://picsum.photos/200/300" } },
    { id: "5", thumbnail: { uri: "https://picsum.photos/200/300" } },
  ];

  const [activeItem, setActiveItem] = useState(posts[0].id);

  const viewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].item.id);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default AnimatedCarousel;
