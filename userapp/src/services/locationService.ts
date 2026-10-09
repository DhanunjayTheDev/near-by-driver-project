import Geolocation, {
  GeoPosition,
} from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform} from 'react-native';

class LocationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Carride needs access to your location to find nearby drivers.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  watchPosition(
    onUpdate: (position: GeoPosition) => void,
    onError?: (error: any) => void,
  ): number {
    return Geolocation.watchPosition(
      onUpdate,
      onError || (() => {}),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  }

  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }
}

export default new LocationService();
