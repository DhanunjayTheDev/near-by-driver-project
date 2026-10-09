import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getRideDetails, getRideLogs} from '../../services/apiService';
import {formatCurrency, formatDistance, formatDuration} from '../../utils/helpers';

type Props = NativeStackScreenProps<any, 'RideDetails'>;

const RideDetailsScreen: React.FC<Props> = ({navigation, route}) => {
  const {rideId} = route.params as {rideId: string};
  const [ride, setRide] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [rideRes, logsRes] = await Promise.all([
          getRideDetails(rideId),
          getRideLogs(rideId),
        ]);
        setRide(rideRes.data.ride || rideRes.data);
        setLogs(logsRes.data.logs || logsRes.data || []);
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [rideId]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-gray-400 text-base">Ride not found</Text>
      </View>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-dark text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold ml-4">
            Ride #{ride.ride_code}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Route */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-3 h-3 rounded-full bg-accent mr-3" />
            <Text className="text-dark text-sm flex-1">
              {ride.pickup_location?.address}
            </Text>
          </View>
          <View className="ml-1.5 border-l border-dashed border-gray-300 h-4 mb-1" />
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-primary mr-3" />
            <Text className="text-dark text-sm flex-1">
              {ride.drop_location?.address}
            </Text>
          </View>
        </View>

        {/* Trip Info */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-dark text-lg font-bold mb-3">Trip Info</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Date</Text>
            <Text className="text-dark font-medium">
              {formatDate(ride.created_at)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Distance</Text>
            <Text className="text-dark font-medium">
              {formatDistance(ride.actual_distance || ride.estimated_distance)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Duration</Text>
            <Text className="text-dark font-medium">
              {formatDuration(ride.actual_duration || ride.estimated_duration)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Status</Text>
            <Text className="text-accent font-medium">
              {ride.ride_status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {/* Fare */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-dark text-lg font-bold mb-3">
            Fare Breakdown
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Base Fare</Text>
            <Text className="text-dark">{formatCurrency(ride.base_fare || 0)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Distance Fare</Text>
            <Text className="text-dark">
              {formatCurrency(ride.distance_fare || 0)}
            </Text>
          </View>
          {ride.waiting_charge > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Waiting Charge</Text>
              <Text className="text-dark">
                {formatCurrency(ride.waiting_charge)}
              </Text>
            </View>
          )}
          <View className="border-t border-gray-100 mt-2 pt-3 flex-row justify-between">
            <Text className="text-dark text-lg font-bold">Total</Text>
            <Text className="text-primary text-lg font-bold">
              {formatCurrency(ride.total_fare || 0)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        {logs.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm">
            <Text className="text-dark text-lg font-bold mb-3">Timeline</Text>
            {logs.map((log: any, index: number) => (
              <View key={index} className="flex-row mb-3">
                <View className="items-center mr-3">
                  <View className="w-3 h-3 rounded-full bg-primary" />
                  {index < logs.length - 1 && (
                    <View className="w-0.5 flex-1 bg-gray-200 mt-1" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-dark text-sm font-medium">
                    {log.status?.replace(/_/g, ' ') || log.event}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {formatDate(log.created_at || log.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RideDetailsScreen;
