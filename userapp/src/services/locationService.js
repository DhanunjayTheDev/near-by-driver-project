import * as Location from 'expo-location';

class LocationService {
  async requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation() {
    const granted = await this.requestPermission();
    if (!granted) {
      throw new Error('Location permission denied');
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
    };
  }

  async watchLocation(callback) {
    const granted = await this.requestPermission();
    if (!granted) {
      throw new Error('Location permission denied');
    }
    return await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
        timeInterval: 5000,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading,
          speed: location.coords.speed,
        });
      }
    );
  }

  async reverseGeocode(latitude, longitude) {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results.length > 0) {
      const addr = results[0];
      const parts = [addr.name, addr.street, addr.district, addr.city].filter(Boolean);
      return parts.join(', ');
    }
    return 'Unknown location';
  }
}

export default new LocationService();
