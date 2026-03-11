import React from 'react';
import { Marker } from 'react-native-maps';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useEffect as useAnimatedEffect,
} from 'react-native-reanimated';
import { View, Text } from 'react-native';

export default function DriverMarker({ coordinate, heading = 0 }) {
  if (!coordinate) return null;

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={heading}
      flat
    >
      <View className="items-center justify-center">
        <Text style={{ fontSize: 32 }}>🚗</Text>
      </View>
    </Marker>
  );
}
