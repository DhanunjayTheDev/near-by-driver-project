import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PrimaryButton from '../../components/ui/PrimaryButton';
import useRideStore from '../../store/rideStore';
import { formatCurrency, formatDistance, formatDuration } from '../../utils/helpers';

export default function RideCompletedScreen({ navigation }) {
  const { currentRide, pickupAddress, dropAddress, waitingCharge } = useRideStore();

  const ride = currentRide || {};

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {/* Success Icon */}
        <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-6 mt-4">
          <View className="w-20 h-20 bg-accent/10 rounded-full items-center justify-center mb-4">
            <Text style={{ fontSize: 40 }}>✅</Text>
          </View>
          <Text className="text-2xl font-bold text-dark">Ride Completed!</Text>
          <Text className="text-sm text-gray-500 mt-1">Thanks for riding with us</Text>
        </Animated.View>

        {/* Route */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 bg-accent rounded-full" />
            <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={1}>{pickupAddress}</Text>
          </View>
          <View className="ml-1.5 h-4 border-l border-dashed border-gray-300" />
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full" />
            <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={1}>{dropAddress}</Text>
          </View>
        </Animated.View>

        {/* Fare Breakdown */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="text-base font-semibold text-dark mb-4">Fare Breakdown</Text>

          <FareRow label="Base Fare" value={ride.base_fare} />
          <FareRow label="Distance Fare" value={ride.distance_fare} />
          {(ride.waiting_charge > 0 || waitingCharge > 0) && (
            <FareRow label="Waiting Charges" value={ride.waiting_charge || waitingCharge} />
          )}

          <View className="border-t border-gray-100 mt-3 pt-3 flex-row justify-between">
            <Text className="text-base font-bold text-dark">Total</Text>
            <Text className="text-xl font-bold text-primary">
              {formatCurrency(ride.total_fare)}
            </Text>
          </View>
        </Animated.View>

        {/* Trip Stats */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-400">Distance</Text>
              <Text className="text-base font-semibold text-dark mt-1">
                {formatDistance(ride.actual_distance || ride.estimated_distance)}
              </Text>
            </View>
            <View className="w-px bg-gray-200 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-400">Duration</Text>
              <Text className="text-base font-semibold text-dark mt-1">
                {formatDuration(ride.actual_duration || ride.estimated_duration)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Pay Button */}
      <View className="px-5 pb-6">
        <PrimaryButton
          title={`Pay ${formatCurrency(ride.total_fare)}`}
          onPress={() => navigation.navigate('Payment')}
        />
      </View>
    </SafeAreaView>
  );
}

function FareRow({ label, value }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-dark">{formatCurrency(value)}</Text>
    </View>
  );
}
