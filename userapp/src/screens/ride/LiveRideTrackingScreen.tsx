import React, {useEffect, useRef} from 'react';
import {View, Text, StatusBar} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapViewComponent from '../../components/map/MapViewComponent';
import DriverMarker from '../../components/map/DriverMarker';
import {useRideStore} from '../../store/rideStore';
import socketService from '../../services/socketService';
import {RIDE_STATUS} from '../../utils/constants';
import {formatDistance, formatDuration} from '../../utils/helpers';

type Props = NativeStackScreenProps<any, 'LiveRideTracking'>;

const LiveRideTrackingScreen: React.FC<Props> = ({navigation}) => {
  const mapRef = useRef<MapView | null>(null);
  const {
    currentRide,
    driverInfo,
    driverLocation,
    pickup,
    drop,
    setDriverLocation,
    setRideStatus,
    setCurrentRide,
  } = useRideStore();

  useEffect(() => {
    if (driverInfo?._id) {
      socketService.trackDriver(driverInfo._id);
    }

    const handleDriverLocation = (data: any) => {
      setDriverLocation({
        longitude: data.location?.longitude || data.longitude,
        latitude: data.location?.latitude || data.latitude,
        heading: data.heading || 0,
        speed: data.speed || 0,
      });
    };

    const handleRideCompleted = (data: any) => {
      setRideStatus(RIDE_STATUS.RIDE_COMPLETED);
      if (data.ride_id && currentRide) {
        setCurrentRide({
          ...currentRide,
          ride_status: RIDE_STATUS.RIDE_COMPLETED,
          total_fare: data.total_fare || currentRide.total_fare,
          actual_distance: data.actual_distance || currentRide.actual_distance,
          actual_duration: data.actual_duration || currentRide.actual_duration,
        });
      }
      if (driverInfo?._id) {
        socketService.stopTracking(driverInfo._id);
      }
      navigation.replace('RideCompleted');
    };

    socketService.on('driver-location', handleDriverLocation);
    socketService.on('ride-completed', handleRideCompleted);

    return () => {
      socketService.off('driver-location', handleDriverLocation);
      socketService.off('ride-completed', handleRideCompleted);
    };
  }, [driverInfo, currentRide]);

  const driverCoord = driverLocation
    ? {latitude: driverLocation.latitude, longitude: driverLocation.longitude}
    : null;

  const dropCoord = drop
    ? {latitude: drop.coordinates[1], longitude: drop.coordinates[0]}
    : null;

  const routeCoords = [
    ...(driverCoord ? [driverCoord] : []),
    ...(dropCoord ? [dropCoord] : []),
  ];

  return (
    <View className="flex-1">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <MapViewComponent showsUserLocation={false} mapRef={mapRef}>
        {driverCoord && (
          <DriverMarker
            coordinate={driverCoord}
            heading={driverLocation?.heading}
          />
        )}
        {dropCoord && (
          <Marker coordinate={dropCoord} pinColor="#2563EB">
            <View className="items-center">
              <View className="bg-primary rounded-full p-2">
                <Text className="text-white text-xs font-bold">DROP</Text>
              </View>
            </View>
          </Marker>
        )}
        {routeCoords.length >= 2 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="#2563EB"
            lineDashPattern={[0]}
          />
        )}
      </MapViewComponent>

      {/* Info Panel */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-dark text-lg font-bold">Ride in progress</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Heading to your destination
            </Text>
          </View>
          <View className="bg-accent/10 px-4 py-2 rounded-full">
            <Text className="text-accent text-sm font-semibold">LIVE</Text>
          </View>
        </View>

        <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4">
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-xs">Distance</Text>
            <Text className="text-dark text-lg font-bold mt-1">
              {formatDistance(currentRide?.estimated_distance || 0)}
            </Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-xs">ETA</Text>
            <Text className="text-dark text-lg font-bold mt-1">
              {formatDuration(currentRide?.estimated_duration || 0)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
          <View className="w-3 h-3 rounded-sm bg-primary mr-3" />
          <Text className="text-dark text-sm flex-1" numberOfLines={1}>
            {drop?.address || 'Destination'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LiveRideTrackingScreen;
