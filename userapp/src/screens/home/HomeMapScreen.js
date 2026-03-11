import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker } from 'react-native-maps';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import MapViewComponent from '../../components/map/MapViewComponent';
import locationService from '../../services/locationService';
import useRideStore from '../../store/rideStore';
import useAuthStore from '../../store/authStore';

export default function HomeMapScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [addressText, setAddressText] = useState('');
  const user = useAuthStore((s) => s.user);
  const setPickup = useRideStore((s) => s.setPickup);

  useEffect(() => {
    (async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        setUserLocation(loc);
        const addr = await locationService.reverseGeocode(loc.latitude, loc.longitude);
        setAddressText(addr);
        setPickup(loc, addr);
      } catch (e) {
        Alert.alert('Location Error', e.message);
      }
    })();
  }, []);

  const handlePickup = useCallback(() => {
    navigation.navigate('Ride', {
      screen: 'SelectPickup',
      params: { currentLocation: userLocation, currentAddress: addressText },
    });
  }, [userLocation, addressText]);

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        region={userLocation}
      >
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View className="items-center">
              <View className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow" />
            </View>
          </Marker>
        )}
      </MapViewComponent>

      {/* Top Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <Animated.View entering={FadeInUp.duration(600)} className="mx-5 mt-2">
          <View className="bg-white rounded-2xl p-4 shadow-lg flex-row items-center">
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
              <Text style={{ fontSize: 20 }}>👋</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-400">Good to see you</Text>
              <Text className="text-base font-semibold text-dark" numberOfLines={1}>
                {user?.name || 'User'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Bottom Card */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8"
      >
        <Text className="text-lg font-bold text-dark mb-3">Where are you going?</Text>

        <TouchableOpacity
          onPress={handlePickup}
          activeOpacity={0.8}
          className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3"
        >
          <View className="w-3 h-3 bg-accent rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-500" numberOfLines={1}>
            {addressText || 'Set pickup location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Ride', { screen: 'SelectDrop' })}
          activeOpacity={0.8}
          className="flex-row items-center bg-gray-50 rounded-2xl p-4"
        >
          <View className="w-3 h-3 bg-red-500 rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-400">Where to?</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
