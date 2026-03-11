import React, { useEffect } from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheet({ visible, onClose, snapPoints = [0.5], children }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const maxSnap = snapPoints[snapPoints.length - 1];
  const sheetHeight = SCREEN_HEIGHT * maxSnap;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [visible]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > sheetHeight * 0.3) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[{ height: sheetHeight }, animatedStyle]}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>
          <View className="flex-1 px-5 pb-6">{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
