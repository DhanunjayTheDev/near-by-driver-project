import React from 'react';
import {View, Text, Image} from 'react-native';
import {DriverInfo} from '../../store/rideStore';

interface DriverInfoCardProps {
  driver: DriverInfo;
  arrivalTime?: string;
}

const DriverInfoCard: React.FC<DriverInfoCardProps> = ({
  driver,
  arrivalTime,
}) => {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm">
      <View className="flex-row items-center">
        {driver.profile_image ? (
          <Image
            source={{uri: driver.profile_image}}
            className="w-14 h-14 rounded-full bg-gray-200"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-gray-500 text-xl font-bold">
              {driver.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1 ml-4">
          <Text className="text-dark text-lg font-semibold">
            {driver.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-yellow-500">★</Text>
            <Text className="text-gray-500 text-sm ml-1">
              {driver.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        {arrivalTime && (
          <View className="items-end">
            <Text className="text-primary text-xl font-bold">
              {arrivalTime}
            </Text>
            <Text className="text-gray-500 text-xs">arrival</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs">Vehicle</Text>
          <Text className="text-dark text-sm font-medium mt-0.5">
            {driver.vehicle.brand} {driver.vehicle.model}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-gray-500 text-xs">Number</Text>
          <Text className="text-dark text-sm font-medium mt-0.5">
            {driver.vehicle.vehicle_number}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-gray-500 text-xs">Color</Text>
          <Text className="text-dark text-sm font-medium mt-0.5">
            {driver.vehicle.vehicle_color}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DriverInfoCard;
