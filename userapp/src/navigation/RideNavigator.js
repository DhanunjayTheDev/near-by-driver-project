import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectPickupScreen from '../screens/ride/SelectPickupScreen';
import SelectDropScreen from '../screens/ride/SelectDropScreen';
import RideOptionsScreen from '../screens/ride/RideOptionsScreen';
import SearchingDriverScreen from '../screens/ride/SearchingDriverScreen';
import DriverAssignedScreen from '../screens/ride/DriverAssignedScreen';
import DriverArrivedScreen from '../screens/ride/DriverArrivedScreen';
import RideOTPDisplayScreen from '../screens/ride/RideOTPDisplayScreen';
import LiveRideTrackingScreen from '../screens/ride/LiveRideTrackingScreen';
import RideCompletedScreen from '../screens/ride/RideCompletedScreen';
import RateDriverScreen from '../screens/ride/RateDriverScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function RideNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="SelectPickup" component={SelectPickupScreen} />
      <Stack.Screen name="SelectDrop" component={SelectDropScreen} />
      <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
      <Stack.Screen name="SearchingDriver" component={SearchingDriverScreen} />
      <Stack.Screen name="DriverAssigned" component={DriverAssignedScreen} />
      <Stack.Screen name="DriverArrived" component={DriverArrivedScreen} />
      <Stack.Screen name="RideOTPDisplay" component={RideOTPDisplayScreen} />
      <Stack.Screen name="LiveRideTracking" component={LiveRideTrackingScreen} />
      <Stack.Screen name="RideCompleted" component={RideCompletedScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="RateDriver" component={RateDriverScreen} />
    </Stack.Navigator>
  );
}
