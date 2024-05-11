import { FlatList, ImageBackground, Image, TouchableOpacity, ViewToken } from "react-native";
import { FC, useState } from "react";
import { IVideo } from "@/lib/types";
import { CustomAnimation, View } from "react-native-animatable";
import { ResizeMode, Video } from "expo-av";
import { icons } from "@/constants";

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
} as CustomAnimation;

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
} as CustomAnimation;

const TrendingItem: FC<{ item: IVideo; activeItem: string }> = ({ activeItem, item }) => {
  const [play, setPlay] = useState(false);

  return (
    <View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          source={{ uri: item.video }}
          className="w-52 h-72 rounded-[33px] mt-3 bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if ('didJustFinish' in status && status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative flex justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{
              uri: item.thumbnail,
            }}
            className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const Trending: FC<{ posts: IVideo[] }> = ({ posts = [] }) => {
  const [activeItem, setActiveItem] = useState(posts[0].$id);

  const viewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken<IVideo>[]; }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170, y: 0 }}
    />
  );
}

export default Trending;
