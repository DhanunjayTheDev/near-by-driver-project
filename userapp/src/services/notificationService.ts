import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import {updateFcmToken} from './apiService';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch {
      return null;
    }
  }

  async registerToken(): Promise<void> {
    const token = await this.getToken();
    if (token) {
      try {
        await updateFcmToken(token);
      } catch (error) {
        console.error('Failed to register FCM token:', error);
      }
    }
  }

  onMessage(callback: (message: any) => void): () => void {
    return messaging().onMessage(callback);
  }

  onNotificationOpenedApp(callback: (message: any) => void): () => void {
    return messaging().onNotificationOpenedApp(callback);
  }

  async getInitialNotification(): Promise<any> {
    return messaging().getInitialNotification();
  }

  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(callback);
  }
}

export default new NotificationService();
