import React from 'react';
import { View, TextInput, Text } from 'react-native';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  editable = true,
  error,
  icon,
  className = '',
  ...props
}) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>}
      <View className={`flex-row items-center bg-white border ${error ? 'border-red-400' : 'border-gray-200'} rounded-2xl px-4 py-3.5`}>
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={editable}
          className="flex-1 text-base text-gray-900"
          {...props}
        />
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
