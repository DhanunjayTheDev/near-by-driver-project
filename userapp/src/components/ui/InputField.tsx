import React from 'react';
import {View, TextInput, Text, TextInputProps} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-dark text-sm font-medium mb-2">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-white rounded-2xl px-4 py-3 border ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}>
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-dark text-base"
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
};

export default InputField;
