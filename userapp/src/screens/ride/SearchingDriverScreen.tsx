import React, {useEffect, useRef} from 'react';
import {View, Text, Alert, StatusBar} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useRideStore} from '../../store/rideStore';
import {cancelRide} from '../../services/apiService';
import socketService from '../../services/socketService';
import {RIDE_STATUS} from '../../utils/constants';
import PrimaryButton from '../../components/ui/PrimaryButton';

type Props = NativeStackScreenProps<any, 'SearchingDriver'>;

const SearchingDriverScreen: React.FC<Props> = ({navigation}) => {
  const {currentRide, setRideStatus, setDriverInfo, setRideOtp, resetRide} =
    useRideStore();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {duration: 2000, easing: Easing.linear}),
      -1,
      false,
    );
    scale.value = withRepeat(
      withTiming(1.2, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    const handleRideAccepted = (data: any) => {
      setRideStatus(RIDE_STATUS.DRIVER_ASSIGNED);
      if (data.driver_id) {
        setDriverInfo({
          _id: data.driver_id,
          name: data.driver_name || 'Driver',
          phone: data.driver_phone || '',
          profile_image: '',
          rating: 4.5,
          vehicle: {
            vehicle_type: '',
            brand: '',
            model: '',
            vehicle_number: '',
            vehicle_color: '',
          },
        });
      }
      navigation.replace('DriverAssigned');
    };

    const handleRideCancelled = () => {
      Alert.alert('Ride Cancelled', 'No drivers available. Please try again.');
      resetRide();
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    };

    socketService.on('ride-accepted', handleRideAccepted);
    socketService.on('ride-cancelled', handleRideCancelled);

    return () => {
      socketService.off('ride-accepted', handleRideAccepted);
      socketService.off('ride-cancelled', handleRideCancelled);
    };
  }, [navigation, setRideStatus, setDriverInfo, setRideOtp, resetRide]);

  const handleCancel = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel?', [
      {text: 'No', style: 'cancel'},
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            if (currentRide) {
              await cancelRide(currentRide._id, 'User cancelled while searching');
            }
          } catch {
            // Cancel failed silently
          }
          resetRide();
          navigation.reset({index: 0, routes: [{name: 'Main'}]});
        },
      },
    ]);
  };

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{rotateZ: `${rotation.value}deg`}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: 2 - scale.value,
  }));

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <Animated.View
        style={pulseStyle}
        className="w-32 h-32 rounded-full bg-blue-100 absolute"
      />
      <Animated.View style={spinStyle} className="w-24 h-24 items-center justify-center">
        <View className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent" />
      </Animated.View>

      <Text className="text-dark text-2xl font-bold mt-10">
        Finding your driver
      </Text>
      <Text className="text-gray-500 text-base mt-2 text-center">
        Hang tight! We're matching you with the best available driver nearby.
      </Text>

      <View className="mt-12 w-full">
        <PrimaryButton
          title="Cancel Ride"
          onPress={handleCancel}
          variant="outline"
        />
      </View>
    </View>
  );
};

export default SearchingDriverScreen;
