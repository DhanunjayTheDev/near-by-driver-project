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
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/apiService';
import {
  useNotificationStore,
  AppNotification,
} from '../../store/notificationStore';

type Props = NativeStackScreenProps<any, 'Notifications'>;

const NotificationsScreen: React.FC<Props> = ({navigation}) => {
  const {notifications, setNotifications, markRead, markAllRead} =
    useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getNotifications();
        const data = res.data.notifications || res.data;
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      } catch {
        // Error
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [setNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      markRead(id);
    } catch {
      // Error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      markAllRead();
    } catch {
      // Error
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) {
      return `${mins}m ago`;
    }
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) {
      return `${hrs}h ago`;
    }
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const renderItem = ({item}: {item: AppNotification}) => (
    <TouchableOpacity
      className={`rounded-2xl p-4 mb-3 ${
        item.is_read ? 'bg-white' : 'bg-blue-50 border border-blue-100'
      }`}
      onPress={() => {
        if (!item.is_read) {
          handleMarkRead(item._id);
        }
      }}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-dark text-base font-semibold">
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">{item.body}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{timeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && (
        <View className="w-2.5 h-2.5 rounded-full bg-primary absolute top-2 right-2" />
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
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-dark text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="text-dark text-xl font-bold ml-4">
            Notifications
          </Text>
        </View>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-primary text-sm font-medium">
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        className="px-5"
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text style={{fontSize: 48}}>🔔</Text>
            <Text className="text-gray-400 text-base mt-4">
              No notifications yet
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;
