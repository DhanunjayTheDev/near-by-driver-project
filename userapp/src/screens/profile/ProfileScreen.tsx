import React from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuthStore} from '../../store/authStore';
import socketService from '../../services/socketService';

type Props = NativeStackScreenProps<any, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const {user, logout} = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          socketService.disconnect();
          await logout();
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  const menuItems = [
    {icon: '✏️', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile')},
    {icon: '🕐', label: 'Ride History', onPress: () => navigation.navigate('RideHistory')},
    {icon: '🔔', label: 'Notifications', onPress: () => navigation.navigate('Notifications')},
    {icon: '🎧', label: 'Help & Support', onPress: () => {}},
    {icon: '📜', label: 'Terms & Conditions', onPress: () => {}},
    {icon: '🔒', label: 'Privacy Policy', onPress: () => {}},
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Profile Header */}
      <View className="bg-white px-5 pt-14 pb-6 items-center">
        {user?.profile_image ? (
          <Image
            source={{uri: user.profile_image}}
            className="w-24 h-24 rounded-full bg-gray-200"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-primary text-3xl font-bold">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-dark text-xl font-bold mt-3">
          {user?.name || 'User'}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">{user?.phone}</Text>
        {user?.email && (
          <Text className="text-gray-400 text-sm mt-0.5">{user.email}</Text>
        )}
      </View>

      {/* Menu */}
      <View className="flex-1 px-5 mt-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center bg-white rounded-2xl px-5 py-4 mb-3"
            onPress={item.onPress}>
            <Text style={{fontSize: 18}} className="mr-4">
              {item.icon}
            </Text>
            <Text className="text-dark text-base font-medium flex-1">
              {item.label}
            </Text>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="flex-row items-center bg-red-50 rounded-2xl px-5 py-4 mt-4"
          onPress={handleLogout}>
          <Text style={{fontSize: 18}} className="mr-4">🚪</Text>
          <Text className="text-red-500 text-base font-medium">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
