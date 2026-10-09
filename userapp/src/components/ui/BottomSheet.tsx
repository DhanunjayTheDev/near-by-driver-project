import React, {useCallback, useEffect} from 'react';
import {
  View,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose?: () => void;
  snapPoints?: number[];
  children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  snapPoints = [0.5],
  children,
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({y: 0});
  const maxSnap = Math.max(...snapPoints) * SCREEN_HEIGHT;

  const scrollTo = useCallback(
    (destination: number) => {
      'worklet';
      translateY.value = withSpring(destination, {damping: 50});
    },
    [translateY],
  );

  useEffect(() => {
    if (visible) {
      scrollTo(SCREEN_HEIGHT - maxSnap);
    } else {
      scrollTo(SCREEN_HEIGHT);
    }
  }, [visible, maxSnap, scrollTo]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = Math.max(
        event.translationY + context.value.y,
        SCREEN_HEIGHT - maxSnap,
      );
    })
    .onEnd(event => {
      if (event.translationY > 100) {
        scrollTo(SCREEN_HEIGHT);
        if (onClose) {
          runOnJS(onClose)();
        }
      } else {
        scrollTo(SCREEN_HEIGHT - maxSnap);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: visible ? 0.5 : 0,
  }));

  if (!visible) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-gray-300 rounded-full" />
          </View>
          <View className="flex-1 px-5 pb-8">{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 11,
  },
});

export default BottomSheet;
