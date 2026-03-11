import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapViewComponent from '../../components/map/MapViewComponent';
import PrimaryButton from '../../components/ui/PrimaryButton';
import locationService from '../../services/locationService';
import useRideStore from '../../store/rideStore';

export default function SelectDropScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const pickup = useRideStore((s) => s.pickup);
  const setDrop = useRideStore((s) => s.setDrop);

  const handleRegionChange = async (region) => {
    setLocation({ latitude: region.latitude, longitude: region.longitude });
    try {
      const addr = await locationService.reverseGeocode(region.latitude, region.longitude);
      setAddress(addr);
    } catch {}
  };

  const handleConfirm = () => {
    if (location && address) {
      setDrop(location, address);
      navigation.navigate('RideOptions');
    }
  };

  return (
    <View className="flex-1">
      <MapViewComponent
        region={pickup}
        onRegionChange={handleRegionChange}
      />

      {/* Center Pin */}
      <View className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center pointer-events-none">
        <View className="mb-10">
          <Text style={{ fontSize: 36 }}>🔴</Text>
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
              <Text className="text-xs text-gray-400">Drop Location</Text>
              <Text className="text-sm font-medium text-dark" numberOfLines={1}>
                {address || 'Move map to set drop'}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl px-5 pt-5 pb-8">
        <View className="flex-row items-center mb-4">
          <View className="w-3 h-3 bg-red-500 rounded-full" />
          <Text className="flex-1 ml-3 text-sm font-medium text-dark" numberOfLines={2}>
            {address || 'Locating...'}
          </Text>
        </View>
        <PrimaryButton title="Confirm Drop" onPress={handleConfirm} disabled={!address} />
      </View>
    </View>
  );
}
