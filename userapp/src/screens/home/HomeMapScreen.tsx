import React, {useEffect, useState, useRef, useCallback} from 'react';
import {View, Text, TouchableOpacity, StatusBar, Alert} from 'react-native';
import MapView, {Region} from 'react-native-maps';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapViewComponent from '../../components/map/MapViewComponent';
import locationService from '../../services/locationService';
import {useRideStore} from '../../store/rideStore';

type Props = NativeStackScreenProps<any, 'HomeMap'>;

const HomeMapScreen: React.FC<Props> = ({navigation}) => {
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 17.385,
    longitude: 78.4867,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const {pickup} = useRideStore();

  const getCurrentLocation = useCallback(async () => {
    try {
      const hasPermission = await locationService.requestPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const position = await locationService.getCurrentPosition();
      const newRegion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch {
      // Location error - use default
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <MapViewComponent
        initialRegion={region}
        showsUserLocation
        mapRef={mapRef}
      />

      {/* My Location Button */}
      <TouchableOpacity
        className="absolute right-4 top-16 bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
        onPress={getCurrentLocation}>
        <Text style={{fontSize: 18}}>📍</Text>
      </TouchableOpacity>

      {/* Bottom Booking Card */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-lg">
        <Text className="text-dark text-xl font-bold mb-4">
          Where are you going?
        </Text>

        <TouchableOpacity
          className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 mb-3"
          onPress={() => navigation.navigate('SelectPickup')}>
          <View className="w-3 h-3 rounded-full bg-accent mr-3" />
          <Text
            className={
              pickup
                ? 'flex-1 text-dark text-base'
                : 'flex-1 text-gray-400 text-base'
            }
            numberOfLines={1}>
            {pickup?.address || 'Select pickup location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4"
          onPress={() => navigation.navigate('SelectDrop')}>
          <View className="w-3 h-3 rounded-sm bg-primary mr-3" />
          <Text className="flex-1 text-gray-400 text-base" numberOfLines={1}>
            Where to?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeMapScreen;
