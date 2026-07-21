// src/components/SkeletonLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = ''
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: '#E1E9F4',
          opacity
        }
      ]}
      className={className}
    />
  );
}

export function RestaurantSkeleton() {
  return (
    <View className="mb-5 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
      <SkeletonLoader height={160} borderRadius={24} className="mb-3" />
      <View className="flex-row justify-between mb-2">
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="15%" height={20} />
      </View>
      <SkeletonLoader width="40%" height={15} className="mb-3" />
      <View className="flex-row justify-between">
        <SkeletonLoader width="25%" height={15} />
        <SkeletonLoader width="25%" height={15} />
        <SkeletonLoader width="25%" height={15} />
      </View>
    </View>
  );
}
