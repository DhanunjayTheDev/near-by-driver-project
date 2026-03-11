import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import RideOptionCard from '../../components/ride/RideOptionCard';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useRideStore from '../../store/rideStore';
import { formatDistance, formatDuration } from '../../utils/helpers';

export default function RideOptionsScreen({ navigation }) {
  const {
    pickup,
    drop,
    pickupAddress,
    dropAddress,
    fareEstimates,
    selectedVehicleType,
    setSelectedVehicleType,
    fetchFareEstimates,
    requestRide,
  } = useRideStore();

  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (pickup && drop) {
      // Calculate approximate distance
      const R = 6371; // Earth radius km
      const dLat = ((drop.latitude - pickup.latitude) * Math.PI) / 180;
      const dLon = ((drop.longitude - pickup.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((pickup.latitude * Math.PI) / 180) *
          Math.cos((drop.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      const t = (d / 30) * 60; // Assume 30 km/h average
      setDistance(Math.round(d * 10) / 10);
      setDuration(Math.round(t));
      fetchFareEstimates(d.toFixed(1), Math.round(t));
    }
  }, [pickup, drop]);

  const handleBook = async () => {
    if (!selectedVehicleType) {
      Alert.alert('Select Vehicle', 'Please select a vehicle type');
      return;
    }
    setLoading(true);
    try {
      await requestRide(null, distance, duration);
      navigation.navigate('SearchingDriver');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark ml-4">Choose your ride</Text>
        </View>
      </View>

      {/* Route Summary */}
      <Animated.View entering={FadeInDown.duration(400)} className="mx-5 mb-4 bg-white rounded-2xl p-4 shadow-sm">
        <View className="flex-row items-center mb-3">
          <View className="w-3 h-3 bg-accent rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={1}>{pickupAddress}</Text>
        </View>
        <View className="ml-1.5 h-4 border-l border-dashed border-gray-300" />
        <View className="flex-row items-center mt-1">
          <View className="w-3 h-3 bg-red-500 rounded-full" />
          <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={1}>{dropAddress}</Text>
        </View>
        <View className="flex-row mt-3 pt-3 border-t border-gray-100">
          <Text className="text-sm text-gray-500">
            {formatDistance(distance)} · {formatDuration(duration)}
          </Text>
        </View>
      </Animated.View>

      {/* Options */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {fareEstimates.map((est, i) => (
          <Animated.View key={est.vehicle_type} entering={FadeInDown.delay(i * 100).duration(400)}>
            <RideOptionCard
              vehicleType={est.vehicle_type}
              fare={est}
              selected={selectedVehicleType === est.vehicle_type}
              onSelect={setSelectedVehicleType}
            />
          </Animated.View>
        ))}
        {fareEstimates.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-gray-400">Loading ride options...</Text>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View className="px-5 pb-6 pt-3">
        <PrimaryButton
          title="Book Ride"
          onPress={handleBook}
          loading={loading}
          disabled={!selectedVehicleType}
        />
      </View>
    </SafeAreaView>
  );
}
