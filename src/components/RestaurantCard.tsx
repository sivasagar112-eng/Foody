// src/components/RestaurantCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingBadge from './RatingBadge';

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    image_url?: string;
    cuisine_tags: string[];
    rating: number;
    delivery_time_mins: number;
    delivery_fee: number;
    cost_for_two: number;
  };
  onPress: () => void;
}

export default function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-3xl overflow-hidden mb-5 border border-gray-100 shadow-sm"
    >
      <View className="relative">
        <Image
          source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' }}
          className="w-full h-44 object-cover"
        />
        <View className="absolute top-3 right-3">
          <TouchableOpacity className="w-8 h-8 rounded-full bg-white/80 items-center justify-center">
            <Ionicons name="heart-outline" size={18} color="#E23744" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-secondary font-bold text-lg flex-1 mr-2" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <RatingBadge rating={restaurant.rating} />
        </View>
        
        <Text className="text-secondaryLight text-sm mb-2" numberOfLines={1}>
          {restaurant.cuisine_tags.join(', ')}
        </Text>
        
        <View className="h-[1px] bg-gray-100 my-2" />
        
        <View className="flex-row justify-between items-center text-xs text-secondaryLight font-medium">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#686B6E" style={{ marginRight: 3 }} />
            <Text className="text-secondary">{restaurant.delivery_time_mins} mins</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="wallet-outline" size={14} color="#686B6E" style={{ marginRight: 3 }} />
            <Text className="text-secondary">${restaurant.cost_for_two} for two</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="bicycle-outline" size={14} color="#686B6E" style={{ marginRight: 3 }} />
            <Text className="text-secondary">
              {restaurant.delivery_fee === 0 ? 'Free Delivery' : `$${restaurant.delivery_fee.toFixed(2)}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
