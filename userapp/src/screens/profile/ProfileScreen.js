import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import { formatPhone } from '../../utils/helpers';

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const menuItems = [
    { label: 'Edit Profile', icon: '✏️', action: () => navigation.navigate('EditProfile') },
    { label: 'Ride History', icon: '🕒', action: () => navigation.navigate('History') },
    { label: 'Notifications', icon: '🔔', action: () => navigation.navigate('Notifications') },
    { label: 'Support', icon: '💬', action: () => {} },
    { label: 'About', icon: 'ℹ️', action: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(600)} className="bg-white rounded-2xl p-6 shadow-sm items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden mb-4">
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} className="w-24 h-24" />
            ) : (
              <Text style={{ fontSize: 44 }}>👤</Text>
            )}
          </View>
          <Text className="text-xl font-bold text-dark">{user?.name || 'User'}</Text>
          <Text className="text-sm text-gray-500 mt-1">{formatPhone(user?.phone)}</Text>
          {user?.email && <Text className="text-sm text-gray-400 mt-0.5">{user.email}</Text>}
        </Animated.View>

        {/* Menu */}
        {menuItems.map((item, i) => (
          <Animated.View key={item.label} entering={FadeInDown.delay(i * 80).duration(400)}>
            <TouchableOpacity
              onPress={item.action}
              activeOpacity={0.7}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm"
            >
              <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <Text className="flex-1 ml-4 text-base font-medium text-dark">{item.label}</Text>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} className="mt-4">
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.7}
            className="bg-red-50 rounded-2xl p-4 items-center"
          >
            <Text className="font-semibold text-red-500">Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
