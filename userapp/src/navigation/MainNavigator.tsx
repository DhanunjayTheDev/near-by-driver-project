import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';

import HomeMapScreen from '../screens/home/HomeMapScreen';
import RideHistoryScreen from '../screens/history/RideHistoryScreen';
import RideDetailsScreen from '../screens/history/RideDetailsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import RideNavigator from './RideNavigator';
import {useNotificationStore} from '../store/notificationStore';

type TabParamList = {
  Home: undefined;
  History: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabIcon: React.FC<{icon: string; focused: boolean; badge?: number}> = ({
  icon,
  focused,
  badge,
}) => (
  <View className="items-center justify-center">
    <Text style={{fontSize: 22, opacity: focused ? 1 : 0.5}}>{icon}</Text>
    {badge && badge > 0 ? (
      <View className="absolute -top-1 -right-2 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
        <Text className="text-white text-[9px] font-bold">{badge}</Text>
      </View>
    ) : null}
  </View>
);

const HomeTabs: React.FC = () => {
  const {unreadCount} = useNotificationStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeMapScreen as any}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={RideHistoryScreen as any}
        options={{
          tabBarIcon: ({focused}) => <TabIcon icon="🕐" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen as any}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => (
            <TabIcon icon="👤" focused={focused} badge={unreadCount} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export type MainStackParamList = {
  HomeTabs: undefined;
  SelectPickup: undefined;
  SelectDrop: undefined;
  RideOptions: undefined;
  SearchingDriver: undefined;
  DriverAssigned: undefined;
  DriverArrived: undefined;
  RideOTPDisplay: undefined;
  LiveRideTracking: undefined;
  RideCompleted: undefined;
  Payment: undefined;
  RateDriver: undefined;
  RideDetails: {rideId: string};
  EditProfile: undefined;
  Notifications: undefined;
  RideHistory: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="SelectPickup" component={require('../screens/ride/SelectPickupScreen').default} />
      <Stack.Screen name="SelectDrop" component={require('../screens/ride/SelectDropScreen').default} />
      <Stack.Screen name="RideOptions" component={require('../screens/ride/RideOptionsScreen').default} />
      <Stack.Screen name="SearchingDriver" component={require('../screens/ride/SearchingDriverScreen').default} options={{gestureEnabled: false}} />
      <Stack.Screen name="DriverAssigned" component={require('../screens/ride/DriverAssignedScreen').default} options={{gestureEnabled: false}} />
      <Stack.Screen name="DriverArrived" component={require('../screens/ride/DriverArrivedScreen').default} options={{gestureEnabled: false}} />
      <Stack.Screen name="RideOTPDisplay" component={require('../screens/ride/RideOTPDisplayScreen').default} />
      <Stack.Screen name="LiveRideTracking" component={require('../screens/ride/LiveRideTrackingScreen').default} options={{gestureEnabled: false}} />
      <Stack.Screen name="RideCompleted" component={require('../screens/ride/RideCompletedScreen').default} options={{gestureEnabled: false}} />
      <Stack.Screen name="Payment" component={require('../screens/payment/PaymentScreen').default} />
      <Stack.Screen name="RateDriver" component={require('../screens/ride/RateDriverScreen').default} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
