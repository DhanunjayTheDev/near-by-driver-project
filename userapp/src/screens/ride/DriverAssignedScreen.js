import React, { useEffect } from 'react';
import { View, Text, Linking, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker } from 'react-native-maps';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MapViewComponent from '../../components/map/MapViewComponent';
import DriverMarker from '../../components/map/DriverMarker';
import DriverInfoCard from '../../components/ride/DriverInfoCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useRideStore from '../../store/rideStore';
import socketService from '../../services/socketService';

export default function DriverAssignedScreen({ navigation }) {
  const {
    pickup,
    assignedDriver,
    driverLocation,
    currentRide,
    onDriverArrived,
    onDriverLocation,
    onRideCancelled,
    cancelCurrentRide,
  } = useRideStore();

  useEffect(() => {
    const handleArrived = (data) => {
      onDriverArrived(data);
      navigation.replace('DriverArrived');
    };
    const handleLocation = (data) => onDriverLocation(data);
    const handleCancelled = () => {
      onRideCancelled();
      Alert.alert('Ride Cancelled', 'The driver cancelled the ride.');
      navigation.popToTop();
    };

    socketService.on('driver-arrived', handleArrived);
    socketService.on('driver-location', handleLocation);
    socketService.on('ride-cancelled', handleCancelled);

    return () => {
      socketService.off('driver-arrived', handleArrived);
      socketService.off('driver-location', handleLocation);
      socketService.off('ride-cancelled', handleCancelled);
    };
  }, []);

  const handleCall = () => {
    if (assignedDriver?.phone) {
      Linking.openURL(`tel:${assignedDriver.phone}`);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure?', [
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
    <View className="flex-1">
      <MapViewComponent region={driverLocation || pickup}>
        {pickup && (
          <Marker coordinate={pickup}>
            <Text style={{ fontSize: 28 }}>📍</Text>
          </Marker>
        )}
        <DriverMarker coordinate={driverLocation} heading={driverLocation?.heading} />
      </MapViewComponent>

      <Animated.View
        entering={FadeInDown.duration(600)}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8"
      >
        <Text className="text-lg font-bold text-dark mb-3">Driver is on the way</Text>

        <DriverInfoCard
          driver={assignedDriver}
          vehicle={currentRide?.driver_id?.vehicle_id}
          eta="5"
        />

        <View className="flex-row mt-4 gap-3">
          <TouchableOpacity
            onPress={handleCall}
            className="flex-1 py-3.5 bg-accent/10 rounded-2xl items-center"
          >
            <Text className="font-semibold text-accent">📞 Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 py-3.5 bg-red-50 rounded-2xl items-center"
          >
            <Text className="font-semibold text-red-500">✕ Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
