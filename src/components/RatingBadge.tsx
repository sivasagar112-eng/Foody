// src/components/RatingBadge.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingBadgeProps {
  rating: number;
  size?: 'small' | 'medium';
}

export default function RatingBadge({ rating, size = 'small' }: RatingBadgeProps) {
  const isHigh = rating >= 4.0;
  const bgColor = isHigh ? 'bg-veg' : 'bg-amber-500';
  const padding = size === 'small' ? 'px-1.5 py-0.5' : 'px-2 py-1';
  const fontSize = size === 'small' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'small' ? 12 : 14;

  return (
    <View className={`flex-row items-center justify-center rounded-lg ${bgColor} ${padding}`}>
      <Text className={`text-white font-bold mr-0.5 ${fontSize}`}>{rating.toFixed(1)}</Text>
      <Ionicons name="star" size={iconSize} color="#fff" />
    </View>
  );
}
