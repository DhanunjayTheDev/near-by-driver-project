import React from 'react';
import { View, Text, Image } from 'react-native';

export default function DriverInfoCard({ driver, vehicle, eta }) {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-lg">
      <View className="flex-row items-center">
        <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          {driver?.profile_image ? (
            <Image source={{ uri: driver.profile_image }} className="w-14 h-14" />
          ) : (
            <Text style={{ fontSize: 28 }}>👤</Text>
          )}
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-lg font-semibold text-gray-900">{driver?.name || 'Driver'}</Text>
          <View className="flex-row items-center mt-0.5">
            <Text style={{ fontSize: 14 }}>⭐</Text>
            <Text className="text-sm text-gray-600 ml-1">{driver?.rating || '5.0'}</Text>
          </View>
        </View>
        {eta && (
          <View className="items-end">
            <Text className="text-2xl font-bold text-primary">{eta}</Text>
            <Text className="text-xs text-gray-500">min away</Text>
          </View>
        )}
      </View>

      {vehicle && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-500">Vehicle</Text>
              <Text className="text-base font-medium text-gray-900">
                {vehicle.brand} {vehicle.model}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500">Number</Text>
              <Text className="text-base font-bold text-gray-900">{vehicle.vehicle_number}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
