import React, { useRef, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { View } from 'react-native';

const INITIAL_REGION = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapViewComponent({ children, region, onRegionChange, style, ...props }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...region,
          latitudeDelta: region.latitudeDelta || 0.01,
          longitudeDelta: region.longitudeDelta || 0.01,
        },
        1000
      );
    }
  }, [region?.latitude, region?.longitude]);

  return (
    <View className="flex-1" style={style}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        className="flex-1"
        style={{ flex: 1 }}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChange}
        {...props}
      >
        {children}
      </MapView>
    </View>
  );
}
