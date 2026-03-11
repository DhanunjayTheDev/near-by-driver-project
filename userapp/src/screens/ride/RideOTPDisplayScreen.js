import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import useRideStore from '../../store/rideStore';
import socketService from '../../services/socketService';

export default function RideOTPDisplayScreen({ navigation }) {
  const { rideOtp, onRideStarted } = useRideStore();

  useEffect(() => {
    const handleStarted = () => {
      onRideStarted();
      navigation.replace('LiveRideTracking');
    };

    socketService.on('ride-started', handleStarted);
    return () => socketService.off('ride-started', handleStarted);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <Animated.View entering={FadeIn.duration(600)} className="items-center">
        <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
          <Text style={{ fontSize: 40 }}>🔐</Text>
        </View>

        <Text className="text-xl font-bold text-dark text-center mb-2">
          Share OTP with driver
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Your driver needs this code to start the ride
        </Text>

        <Animated.View
          entering={FadeInDown.delay(300).duration(600)}
          className="bg-white rounded-3xl py-8 px-12 shadow-lg"
        >
          <Text className="text-sm text-gray-400 text-center mb-2">Ride OTP</Text>
          <Text className="text-5xl font-bold text-primary tracking-[12px] text-center">
            {rideOtp || '----'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mt-8">
          <Text className="text-sm text-gray-400 text-center">
            Waiting for the driver to verify...
          </Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
