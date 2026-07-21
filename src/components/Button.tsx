// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { theme } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  icon
}: ButtonProps) {
  let btnStyle = 'w-full py-4 rounded-2xl flex-row justify-center items-center ';
  let textStyle = 'font-bold text-center text-base ';

  if (variant === 'primary') {
    btnStyle += 'bg-primary ';
    textStyle += 'text-white ';
    if (disabled || loading) btnStyle += 'bg-red-400 ';
  } else if (variant === 'secondary') {
    btnStyle += 'bg-secondary ';
    textStyle += 'text-white ';
    if (disabled || loading) btnStyle += 'bg-gray-400 ';
  } else if (variant === 'outline') {
    btnStyle += 'bg-transparent border-2 border-primary ';
    textStyle += 'text-primary ';
    if (disabled || loading) btnStyle += 'opacity-50 ';
  } else if (variant === 'text') {
    btnStyle += 'bg-transparent py-2 ';
    textStyle += 'text-primary ';
    if (disabled || loading) btnStyle += 'opacity-50 ';
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${btnStyle} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'text' ? theme.colors.primary : '#fff'} />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
