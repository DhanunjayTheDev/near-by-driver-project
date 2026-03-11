import React, { useEffect, useState } from 'react';
import { View, Text, Linking, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MapViewComponent from '../../components/map/MapViewComponent';
import DriverMarker from '../../components/map/DriverMarker';
import DriverInfoCard from '../../components/ride/DriverInfoCard';
import WaitingTimer from '../../components/ride/WaitingTimer';
import useRideStore from '../../store/rideStore';
import socketService from '../../services/socketService';

const FREE_WAITING_SECONDS = 180;
const CHARGE_PER_MINUTE = 2;

export default function DriverArrivedScreen({ navigation }) {
  const {
    pickup,
    assignedDriver,
    driverLocation,
    currentRide,
    rideOtp,
    onRideStarted,
    onDriverLocation,
    updateWaitingTimer,
    waitingTime,
    waitingCharge,
    freeWaitingOver,
  } = useRideStore();

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        const isFreeOver = next > FREE_WAITING_SECONDS;
        const charge = isFreeOver
          ? ((next - FREE_WAITING_SECONDS) / 60) * CHARGE_PER_MINUTE
          : 0;
        updateWaitingTimer(next, Math.round(charge * 100) / 100, isFreeOver);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleStarted = () => {
      onRideStarted();
      navigation.replace('RideOTPDisplay');
    };
    const handleLocation = (data) => onDriverLocation(data);

    socketService.on('ride-started', handleStarted);
    socketService.on('driver-location', handleLocation);

    return () => {
      socketService.off('ride-started', handleStarted);
      socketService.off('driver-location', handleLocation);
    };
  }, []);

  return (
    <View className="flex-1">
      <MapViewComponent region={pickup}>
        {pickup && (
          <Marker coordinate={pickup}>
            <Text style={{ fontSize: 28 }}>📍</Text>
          </Marker>
        )}
        <DriverMarker coordinate={driverLocation || pickup} heading={driverLocation?.heading} />
      </MapViewComponent>

      <Animated.View
        entering={FadeInDown.duration(600)}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8"
      >
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-dark">Driver has arrived!</Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Share the OTP with your driver
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (assignedDriver?.phone) Linking.openURL(`tel:${assignedDriver.phone}`);
            }}
            className="w-11 h-11 bg-accent/10 rounded-full items-center justify-center"
          >
            <Text style={{ fontSize: 20 }}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Display */}
        <View className="bg-primary/5 rounded-2xl p-5 items-center mb-4">
          <Text className="text-sm text-gray-500 mb-1">Ride OTP</Text>
          <Text className="text-4xl font-bold text-primary tracking-widest">{rideOtp}</Text>
        </View>

        {/* Waiting Timer */}
        <WaitingTimer
          waitingTime={waitingTime}
          waitingCharge={waitingCharge}
          freeWaitingOver={freeWaitingOver}
        />
      </Animated.View>
    </View>
  );
}
