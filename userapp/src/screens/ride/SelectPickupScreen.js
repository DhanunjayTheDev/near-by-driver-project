import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapViewComponent from '../../components/map/MapViewComponent';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import locationService from '../../services/locationService';
import useRideStore from '../../store/rideStore';

export default function SelectPickupScreen({ navigation, route }) {
  const { currentLocation, currentAddress } = route.params || {};
  const [address, setAddress] = useState(currentAddress || '');
  const [location, setLocation] = useState(currentLocation);
  const setPickup = useRideStore((s) => s.setPickup);

  const handleRegionChange = async (region) => {
    setLocation({ latitude: region.latitude, longitude: region.longitude });
    try {
      const addr = await locationService.reverseGeocode(region.latitude, region.longitude);
      setAddress(addr);
    } catch {}
  };

  const handleConfirm = () => {
    if (location && address) {
      setPickup(location, address);
      navigation.navigate('SelectDrop');
    }
  };

  return (
    <View className="flex-1">
      <MapViewComponent
        region={location}
        onRegionChange={handleRegionChange}
      />

      {/* Center Pin */}
      <View className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center pointer-events-none">
        <View className="mb-10">
          <Text style={{ fontSize: 36 }}>📍</Text>
        </View>
      </View>

      {/* Top Bar */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={['top']}>
        <View className="mx-5 mt-2">
          <View className="bg-white rounded-2xl p-4 shadow-lg flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <View className="flex-1 ml-3">
              <Text className="text-xs text-gray-400">Pickup Location</Text>
              <Text className="text-sm font-medium text-dark" numberOfLines={1}>
                {address || 'Move map to set location'}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8">
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 bg-accent rounded-full" />
          <Text className="flex-1 ml-3 text-sm font-medium text-dark" numberOfLines={2}>
            {address || 'Locating...'}
          </Text>
        </View>
        <PrimaryButton title="Confirm Pickup" onPress={handleConfirm} disabled={!address} />
      </View>
    </View>
  );
}
