import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getRideHistory} from '../../services/apiService';
import {formatCurrency} from '../../utils/helpers';

type Props = NativeStackScreenProps<any, 'RideHistory'>;

interface RideHistoryItem {
  _id: string;
  ride_code: string;
  ride_status: string;
  pickup_location: {address: string};
  drop_location: {address: string};
  total_fare: number;
  created_at: string;
}

const RideHistoryScreen: React.FC<Props> = ({navigation}) => {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRides = async (pageNum: number) => {
    try {
      const res = await getRideHistory(pageNum);
      const data = res.data.rides || res.data;
      if (Array.isArray(data)) {
        if (pageNum === 1) {
          setRides(data);
        } else {
          setRides(prev => [...prev, ...data]);
        }
        setHasMore(data.length >= 20);
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides(1);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRides(nextPage);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RIDE_COMPLETED':
      case 'PAID':
        return 'text-accent';
      case 'CANCELLED':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const renderItem = ({item}: {item: RideHistoryItem}) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={() => navigation.navigate('RideDetails', {rideId: item._id})}>
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-dark text-sm font-bold">{item.ride_code}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <Text className={`text-sm font-medium ${getStatusColor(item.ride_status)}`}>
          {item.ride_status.replace(/_/g, ' ')}
        </Text>
      </View>
      <View className="flex-row items-center mb-2">
        <View className="w-2.5 h-2.5 rounded-full bg-accent mr-3" />
        <Text className="text-dark text-sm flex-1" numberOfLines={1}>
          {item.pickup_location?.address || 'Pickup'}
        </Text>
      </View>
      <View className="flex-row items-center">
        <View className="w-2.5 h-2.5 rounded-sm bg-primary mr-3" />
        <Text className="text-dark text-sm flex-1" numberOfLines={1}>
          {item.drop_location?.address || 'Drop'}
        </Text>
      </View>
      {item.total_fare > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between">
          <Text className="text-gray-500 text-sm">Fare</Text>
          <Text className="text-dark text-base font-bold">
            {formatCurrency(item.total_fare)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View className="px-5 pt-14 pb-4">
        <Text className="text-dark text-2xl font-bold">Ride History</Text>
      </View>
      <FlatList
        className="px-5"
        data={rides}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text style={{fontSize: 48}}>🚗</Text>
            <Text className="text-gray-400 text-base mt-4">No rides yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default RideHistoryScreen;
