import React, {useEffect} from 'react';
import {View, Text, StatusBar} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import {useAuthStore} from '../../store/authStore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Splash'>;

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const {initialize, isAuthenticated, isLoading} = useAuthStore();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, {duration: 600}),
      withTiming(1, {duration: 200}),
    );
    opacity.value = withTiming(1, {duration: 600});
  }, []);

  useEffect(() => {
    const init = async () => {
      await initialize();
    };
    init();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.reset({index: 0, routes: [{name: 'Main'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
      <Animated.View style={animatedStyle} className="items-center">
        <Text className="text-white text-5xl font-bold">Carride</Text>
        <Text className="text-blue-200 text-base mt-2">
          Your ride, your way
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
