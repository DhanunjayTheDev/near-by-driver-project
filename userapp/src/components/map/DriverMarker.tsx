import React from 'react';
import {View, Text} from 'react-native';
import {Marker} from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface DriverMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  heading?: number;
  driverName?: string;
}

const DriverMarker: React.FC<DriverMarkerProps> = ({
  coordinate,
  heading = 0,
  driverName,
}) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{x: 0.5, y: 0.5}}
      rotation={heading}
      flat>
      <View className="items-center">
        <View className="bg-dark rounded-full p-2">
          <Text style={{fontSize: 20}}>🚗</Text>
        </View>
        {driverName && (
          <View className="bg-white px-2 py-1 rounded-lg mt-1 shadow-sm">
            <Text className="text-xs font-medium text-dark">
              {driverName}
            </Text>
          </View>
        )}
      </View>
    </Marker>
  );
};

export default DriverMarker;
