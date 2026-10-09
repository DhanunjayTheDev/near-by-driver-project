import React from 'react';
import {View, Text, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useRideStore} from '../../store/rideStore';

type Props = NativeStackScreenProps<any, 'RideOTPDisplay'>;

const RideOTPDisplayScreen: React.FC<Props> = () => {
  const {rideOtp, currentRide} = useRideStore();
  const otp = rideOtp || currentRide?.ride_otp || '----';

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View className="w-full">
        <Text className="text-dark text-2xl font-bold text-center mb-2">
          Ride OTP
        </Text>
        <Text className="text-gray-500 text-base text-center mb-8">
          Share this code with your driver to start the ride
        </Text>

        <View className="bg-primary rounded-3xl py-10 items-center shadow-lg">
          <Text className="text-blue-200 text-sm font-medium mb-3">
            YOUR OTP
          </Text>
          <Text className="text-white text-5xl font-bold tracking-[12px]">
            {otp}
          </Text>
        </View>

        <Text className="text-gray-400 text-sm text-center mt-6">
          Do not share this OTP with anyone other than your assigned driver
        </Text>
      </View>
    </View>
  );
};

export default RideOTPDisplayScreen;
