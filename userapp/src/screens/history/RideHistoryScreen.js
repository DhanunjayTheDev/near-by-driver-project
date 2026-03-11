import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRideHistory } from '../../services/apiService';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';

export default function RideHistoryScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async (pg = 1, refresh = false) => {
    try {
      const data = await getRideHistory(pg);
      setRides(refresh ? data.rides : [...rides, ...data.rides]);
      setTotalPages(data.pages);
      setPage(pg);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [rides]);

  useEffect(() => {
    fetchRides(1, true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides(1, true);
  };

  const onEndReached = () => {
    if (page < totalPages) fetchRides(page + 1);
  };

  const getStatusColor = (status) => {
    const colors = {
      RIDE_COMPLETED: 'text-accent',
      PAID: 'text-accent',
      CANCELLED: 'text-red-500',
      RIDE_STARTED: 'text-primary',
    };
    return colors[status] || 'text-gray-500';
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        onPress={() => navigation.navigate('RideDetails', { rideId: item._id })}
        activeOpacity={0.7}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-400">{formatDate(item.created_at)}</Text>
            <Text className={`text-xs font-medium mt-0.5 ${getStatusColor(item.ride_status)}`}>
              {item.ride_status?.replace(/_/g, ' ')}
            </Text>
          </View>
          <Text className="text-base font-bold text-dark">{formatCurrency(item.total_fare)}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <View className="w-2.5 h-2.5 bg-accent rounded-full" />
          <Text className="flex-1 ml-2.5 text-sm text-gray-600" numberOfLines={1}>
            {item.pickup_location?.address}
          </Text>
        </View>
        <View className="ml-1 h-3 border-l border-dashed border-gray-300" />
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <Text className="flex-1 ml-2.5 text-sm text-gray-600" numberOfLines={1}>
            {item.drop_location?.address}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-2 pb-4">
        <Text className="text-2xl font-bold text-dark">Ride History</Text>
      </View>

      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading && (
            <View className="items-center py-20">
              <Text style={{ fontSize: 48 }}>🚗</Text>
              <Text className="text-base text-gray-400 mt-4">No rides yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
