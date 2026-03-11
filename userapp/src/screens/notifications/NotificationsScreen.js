import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useNotificationStore from '../../store/notificationStore';
import { formatDate, formatTime } from '../../utils/helpers';

export default function NotificationsScreen() {
  const {
    notifications,
    isLoading,
    page,
    total,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const onRefresh = () => fetchNotifications(1);

  const getIcon = (type) => {
    const icons = {
      RIDE: '🚗',
      PAYMENT: '💳',
      PROMO: '🎉',
      SYSTEM: '⚙️',
    };
    return icons[type] || '🔔';
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(400)}>
      <TouchableOpacity
        onPress={() => !item.is_read && markRead(item._id)}
        activeOpacity={0.7}
        className={`rounded-2xl p-4 mb-3 ${item.is_read ? 'bg-white' : 'bg-blue-50 border border-primary/10'}`}
      >
        <View className="flex-row">
          <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-3">
            <Text style={{ fontSize: 20 }}>{getIcon(item.type)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-dark">{item.title}</Text>
            <Text className="text-sm text-gray-500 mt-1">{item.message}</Text>
            <Text className="text-xs text-gray-400 mt-2">
              {formatDate(item.created_at)} · {formatTime(item.created_at)}
            </Text>
          </View>
          {!item.is_read && <View className="w-2.5 h-2.5 bg-primary rounded-full mt-1" />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-dark">Notifications</Text>
        {notifications.some((n) => !n.is_read) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text className="text-sm font-medium text-primary">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !isLoading && (
            <View className="items-center py-20">
              <Text style={{ fontSize: 48 }}>🔔</Text>
              <Text className="text-base text-gray-400 mt-4">No notifications yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
