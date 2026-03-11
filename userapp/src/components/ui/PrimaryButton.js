import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary', className = '' }) {
  const baseStyle = 'py-4 rounded-2xl items-center justify-center flex-row';
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    outline: 'border-2 border-primary bg-transparent',
    danger: 'bg-red-500',
    ghost: 'bg-transparent',
  };
  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    accent: 'text-white',
    outline: 'text-primary',
    danger: 'text-white',
    ghost: 'text-primary',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#2563EB' : '#fff'} />
      ) : (
        <Text className={`font-semibold text-base ${textVariants[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
