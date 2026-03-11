import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { VEHICLE_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export default function RideOptionCard({ vehicleType, fare, selected, onSelect }) {
  const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleType) || {};

  return (
    <TouchableOpacity
      onPress={() => onSelect(vehicleType)}
      activeOpacity={0.7}
      className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
        selected ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white'
      }`}
    >
      <Text style={{ fontSize: 36 }}>{vehicle.icon || '🚗'}</Text>
      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-gray-900">{vehicle.label || vehicleType}</Text>
        <Text className="text-sm text-gray-500">{vehicle.seats} seats</Text>
      </View>
      <View className="items-end">
        <Text className="text-lg font-bold text-gray-900">{formatCurrency(fare?.total_fare)}</Text>
        {fare?.distance_fare > 0 && (
          <Text className="text-xs text-gray-400">
            Base {formatCurrency(fare?.base_fare)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
