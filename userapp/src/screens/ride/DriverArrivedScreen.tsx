import React, {useEffect} from 'react';
import {View, Text, Linking, TouchableOpacity, StatusBar} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DriverInfoCard from '../../components/ride/DriverInfoCard';
import WaitingTimer from '../../components/ride/WaitingTimer';
import {useRideStore} from '../../store/rideStore';
import socketService from '../../services/socketService';
import {RIDE_STATUS} from '../../utils/constants';

type Props = NativeStackScreenProps<any, 'DriverArrived'>;

const DriverArrivedScreen: React.FC<Props> = ({navigation}) => {
  const {driverInfo, currentRide, rideOtp, setRideStatus, setRideOtp} =
    useRideStore();

  useEffect(() => {
    const handleRideStarted = () => {
      setRideStatus(RIDE_STATUS.RIDE_STARTED);
      navigation.replace('LiveRideTracking');
    };

    socketService.on('ride-started', handleRideStarted);
    return () => {
      socketService.off('ride-started', handleRideStarted);
    };
  }, [navigation, setRideStatus]);

  const handleCall = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    }
  };

  // Display the ride OTP if not yet stored from event
  const displayOtp = rideOtp || currentRide?.ride_otp;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="flex-1 px-5 pt-14">
        <View className="bg-accent/10 rounded-2xl p-6 items-center mb-6">
          <Text className="text-accent text-lg font-bold">
            🚗 Driver has arrived!
          </Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            Your driver is waiting at the pickup point
          </Text>
        </View>

        {driverInfo && <DriverInfoCard driver={driverInfo} />}

        <View className="mt-6">
          <WaitingTimer
            startTime={
              currentRide?.driver_arrived_time || new Date().toISOString()
            }
            freeMinutes={3}
            chargePerMinute={2}
          />
        </View>

        {/* OTP Display */}
        {displayOtp && (
          <View className="mt-6">
            <Text className="text-gray-500 text-sm text-center mb-2">
              Share this OTP with your driver
            </Text>
            <View className="bg-primary rounded-2xl py-5 items-center">
              <Text className="text-white text-sm font-medium mb-1">
                RIDE OTP
              </Text>
              <Text className="text-white text-4xl font-bold tracking-widest">
                {displayOtp}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          className="mt-6 bg-white border border-gray-200 rounded-2xl py-4 items-center"
          onPress={handleCall}>
          <Text className="text-primary text-base font-semibold">
            📞 Call Driver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverArrivedScreen;
