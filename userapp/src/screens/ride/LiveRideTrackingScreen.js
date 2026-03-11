import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker } from 'react-native-maps';
import MapViewComponent from '../../components/map/MapViewComponent';
import DriverMarker from '../../components/map/DriverMarker';
import useRideStore from '../../store/rideStore';
import socketService from '../../services/socketService';
import { formatDistance, formatDuration } from '../../utils/helpers';

export default function LiveRideTrackingScreen({ navigation }) {
  const {
    pickup,
    drop,
    pickupAddress,
    dropAddress,
    driverLocation,
    currentRide,
    onRideCompleted,
    onDriverLocation,
  } = useRideStore();

  useEffect(() => {
    const handleCompleted = (data) => {
      onRideCompleted(data);
      navigation.replace('RideCompleted');
    };
    const handleLocation = (data) => onDriverLocation(data);

    socketService.on('ride-completed', handleCompleted);
    socketService.on('driver-location', handleLocation);

    return () => {
      socketService.off('ride-completed', handleCompleted);
      socketService.off('driver-location', handleLocation);
    };
  }, []);

  return (
    <View className="flex-1">
      <MapViewComponent region={driverLocation || pickup}>
        {pickup && (
          <Marker coordinate={pickup} anchor={{ x: 0.5, y: 1 }}>
            <View className="items-center">
              <Text style={{ fontSize: 24 }}>📍</Text>
            </View>
          </Marker>
        )}
        {drop && (
          <Marker coordinate={drop} anchor={{ x: 0.5, y: 1 }}>
            <View className="items-center">
              <Text style={{ fontSize: 24 }}>🏁</Text>
            </View>
          </Marker>
        )}
        <DriverMarker coordinate={driverLocation} heading={driverLocation?.heading} />
      </MapViewComponent>

      {/* Top Info */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <View className="mx-5 mt-2">
          <View className="bg-white rounded-2xl p-4 shadow-lg">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-400">EN ROUTE</Text>
                <Text className="text-lg font-bold text-dark">Ride in progress</Text>
              </View>
              <View className="bg-accent/10 px-3 py-1.5 rounded-full">
                <Text className="text-sm font-semibold text-accent">LIVE</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Card */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8">
        <View className="flex-row items-center mb-3">
          <View className="w-3 h-3 bg-accent rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-600" numberOfLines={1}>{pickupAddress}</Text>
        </View>
        <View className="ml-1.5 h-3 border-l border-dashed border-gray-300" />
        <View className="flex-row items-center mt-1">
          <View className="w-3 h-3 bg-red-500 rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-600" numberOfLines={1}>{dropAddress}</Text>
        </View>

        {currentRide && (
          <View className="flex-row mt-4 pt-4 border-t border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-400">Distance</Text>
              <Text className="text-base font-semibold text-dark">
                {formatDistance(currentRide.estimated_distance)}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-400">ETA</Text>
              <Text className="text-base font-semibold text-dark">
                {formatDuration(currentRide.estimated_duration)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
