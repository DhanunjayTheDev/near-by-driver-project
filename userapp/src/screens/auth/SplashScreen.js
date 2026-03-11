import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import useAuthStore from '../../store/authStore';

export default function SplashScreen() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 500, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 300 })
    );
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => loadUser(), 1500);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Animated.View style={logoStyle} className="items-center">
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-lg">
          <Text style={{ fontSize: 48 }}>🚗</Text>
        </View>
      </Animated.View>
      <Animated.View style={textStyle} className="mt-6 items-center">
        <Text className="text-3xl font-bold text-white">Carride</Text>
        <Text className="text-base text-blue-200 mt-1">Your ride, your way</Text>
      </Animated.View>
    </View>
  );
}
