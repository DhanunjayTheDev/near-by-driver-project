import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import './global.css';

import {useAuthStore} from './src/store/authStore';
import socketService from './src/services/socketService';
import notificationService from './src/services/notificationService';

import SplashScreen from './src/screens/auth/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import MainNavigator from './src/navigation/MainNavigator';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OTPVerification: {phone: string};
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const {isAuthenticated} = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      notificationService.requestPermission().then(() => {
        notificationService.registerToken();
      });

      const unsubscribeMessage = notificationService.onMessage(
        (remoteMessage: any) => {
          console.log('FCM Message:', remoteMessage.notification);
        },
      );

      const unsubscribeTokenRefresh = notificationService.onTokenRefresh(
        () => {
          notificationService.registerToken();
        },
      );

      return () => {
        unsubscribeMessage();
        unsubscribeTokenRefresh();
      };
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{headerShown: false, animation: 'fade'}}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
            />
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{gestureEnabled: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
