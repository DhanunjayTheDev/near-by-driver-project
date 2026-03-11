import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRideDetails, getRideStatusLogs } from '../../services/apiService';
import { formatCurrency, formatDate, formatTime, formatDistance, formatDuration } from '../../utils/helpers';

export default function RideDetailsScreen({ route }) {
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rideData, logsData] = await Promise.all([
          getRideDetails(rideId),
          getRideStatusLogs(rideId),
        ]);
        setRide(rideData.ride);
        setLogs(logsData.logs || []);
      } catch {}
      setLoading(false);
    })();
  }, [rideId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!ride) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-gray-400">Ride not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} className="mb-4">
          <Text className="text-2xl font-bold text-dark">Ride Details</Text>
          <Text className="text-sm text-gray-400 mt-1">Code: {ride.ride_code}</Text>
        </Animated.View>

        {/* Route */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 bg-accent rounded-full" />
            <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={2}>
              {ride.pickup_location?.address}
            </Text>
          </View>
          <View className="ml-1.5 h-4 border-l border-dashed border-gray-300" />
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full" />
            <Text className="flex-1 ml-3 text-sm text-gray-700" numberOfLines={2}>
              {ride.drop_location?.address}
            </Text>
          </View>
        </Animated.View>

        {/* Fare */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <Text className="text-base font-semibold text-dark mb-3">Fare Breakdown</Text>
          <Row label="Base Fare" value={formatCurrency(ride.base_fare)} />
          <Row label="Distance Fare" value={formatCurrency(ride.distance_fare)} />
          {ride.waiting_charge > 0 && (
            <Row label="Waiting Charge" value={formatCurrency(ride.waiting_charge)} />
          )}
          <View className="border-t border-gray-100 mt-2 pt-2 flex-row justify-between">
            <Text className="font-bold text-dark">Total</Text>
            <Text className="text-lg font-bold text-primary">{formatCurrency(ride.total_fare)}</Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <View className="flex-row">
            <Stat label="Distance" value={formatDistance(ride.actual_distance || ride.estimated_distance)} />
            <Stat label="Duration" value={formatDuration(ride.actual_duration || ride.estimated_duration)} />
            <Stat label="Date" value={formatDate(ride.created_at)} />
          </View>
        </Animated.View>

        {/* Driver */}
        {ride.driver_id && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-base font-semibold text-dark mb-3">Driver</Text>
            <Text className="text-sm text-gray-700">{ride.driver_id.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">⭐ {ride.driver_id.rating}</Text>
          </Animated.View>
        )}

        {/* Status Logs */}
        {logs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)} className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-base font-semibold text-dark mb-3">Timeline</Text>
            {logs.map((log, i) => (
              <View key={i} className="flex-row mb-3">
                <View className="items-center mr-3">
                  <View className="w-2.5 h-2.5 bg-primary rounded-full" />
                  {i < logs.length - 1 && <View className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                </View>
                <View className="flex-1 pb-2">
                  <Text className="text-sm font-medium text-dark">
                    {log.status?.replace(/_/g, ' ')}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{formatTime(log.timestamp)}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-dark">{value}</Text>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-sm font-semibold text-dark mt-1">{value}</Text>
    </View>
  );
}
