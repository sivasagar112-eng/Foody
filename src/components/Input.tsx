// src/components/Input.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function Input({
  label,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  icon,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-secondary font-semibold text-sm mb-1.5 ml-1">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border-2 rounded-2xl px-4 py-3 bg-white ${
          isFocused ? 'border-primary' : error ? 'border-red-500' : 'border-gray-200'
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.secondaryLight}
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className={`flex-1 text-secondary text-base p-0 ${className}`}
          placeholderTextColor="#A0A5B1"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.secondaryLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-2 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
}
