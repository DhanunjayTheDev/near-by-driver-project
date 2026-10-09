import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {formatCurrency} from '../../utils/helpers';

interface RideOptionCardProps {
  vehicleType: string;
  label: string;
  icon: string;
  seats: number;
  fare: number;
  eta?: string;
  selected: boolean;
  onPress: () => void;
}

const RideOptionCard: React.FC<RideOptionCardProps> = ({
  label,
  icon,
  seats,
  fare,
  eta,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
        selected ? 'border-primary bg-blue-50' : 'border-gray-100 bg-white'
      }`}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={{fontSize: 32}}>{icon}</Text>
      <View className="flex-1 ml-4">
        <Text className="text-dark text-base font-semibold">{label}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {seats} seats{eta ? ` • ${eta}` : ''}
        </Text>
      </View>
      <Text className="text-dark text-lg font-bold">
        {formatCurrency(fare)}
      </Text>
    </TouchableOpacity>
  );
};

export default RideOptionCard;
