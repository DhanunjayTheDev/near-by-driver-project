import React, {useEffect, useRef} from 'react';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {StyleSheet, View} from 'react-native';

interface MapViewComponentProps {
  initialRegion?: Region;
  region?: Region;
  onRegionChange?: (region: Region) => void;
  showsUserLocation?: boolean;
  children?: React.ReactNode;
  style?: any;
  mapRef?: React.RefObject<MapView | null>;
}

const defaultRegion: Region = {
  latitude: 17.385,
  longitude: 78.4867,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  initialRegion = defaultRegion,
  region,
  onRegionChange,
  showsUserLocation = true,
  children,
  style,
  mapRef,
}) => {
  const internalRef = useRef<MapView>(null);
  const ref = mapRef || internalRef;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        region={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        mapPadding={{top: 0, right: 0, bottom: 0, left: 0}}>
        {children}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapViewComponent;
