import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useRideStore from '../../store/rideStore';
import socketService from '../../services/socketService';

export default function SearchingDriverScreen({ navigation }) {
  const { cancelCurrentRide, onRideAccepted, onRideCancelled } = useRideStore();
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1
    );
  }, []);

  useEffect(() => {
    const handleAccepted = (data) => {
      onRideAccepted(data);
      navigation.replace('DriverAssigned');
    };
    const handleCancelled = (data) => {
      onRideCancelled(data);
      Alert.alert('Ride Cancelled', 'No drivers available. Please try again.');
      navigation.popToTop();
    };

    socketService.on('ride-accepted', handleAccepted);
    socketService.on('ride-cancelled', handleCancelled);

    return () => {
      socketService.off('ride-accepted', handleAccepted);
      socketService.off('ride-cancelled', handleCancelled);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      { text: 'No' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelCurrentRide('Changed my mind');
            navigation.popToTop();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
      <View className="items-center mb-10">
        {/* Animated searching indicator */}
        <View className="w-40 h-40 items-center justify-center">
          <Animated.View
            style={pulseStyle}
            className="absolute w-40 h-40 bg-primary/10 rounded-full"
          />
          <Animated.View
            style={pulseStyle}
            className="absolute w-28 h-28 bg-primary/20 rounded-full"
          />
          <Animated.View style={rotateStyle}>
            <Text style={{ fontSize: 56 }}>🚗</Text>
          </Animated.View>
        </View>
      </View>

      <Text className="text-2xl font-bold text-dark text-center">
        Finding your driver...
      </Text>
      <Text className="text-base text-gray-500 text-center mt-2">
        Searching for nearby drivers.{'\n'}This may take a moment.
      </Text>

      <View className="w-full mt-10">
        <PrimaryButton title="Cancel" variant="outline" onPress={handleCancel} />
      </View>
    </SafeAreaView>
  );
}
