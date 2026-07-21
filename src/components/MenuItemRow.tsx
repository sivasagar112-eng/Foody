// src/components/MenuItemRow.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  is_veg: boolean;
  description?: string;
}

interface MenuItemRowProps {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MenuItemRow({ item, quantity, onAdd, onRemove }: MenuItemRowProps) {
  return (
    <View className="flex-row justify-between items-center py-4 border-b border-gray-100 bg-white">
      {/* Item info */}
      <View className="flex-1 mr-4">
        {/* Veg/Non-veg indicator */}
        <View className="flex-row items-center mb-1">
          <View className={`w-4.5 h-4.5 border-2 rounded items-center justify-center ${
            item.is_veg ? 'border-veg' : 'border-nonveg'
          }`}>
            <View className={`w-2 h-2 rounded-full ${
              item.is_veg ? 'bg-veg' : 'bg-nonveg'
            }`} />
          </View>
          <Text className={`text-xs font-bold ml-1.5 ${
            item.is_veg ? 'text-veg' : 'text-nonveg'
          }`}>
            {item.is_veg ? 'VEG' : 'NON-VEG'}
          </Text>
        </View>

        <Text className="text-secondary font-bold text-base mb-1">
          {item.name}
        </Text>

        <Text className="text-primary font-bold text-base mb-1.5">
          ${item.price.toFixed(2)}
        </Text>

        {item.description && (
          <Text className="text-secondaryLight text-xs leading-4" numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>

      {/* Item image & quantity control */}
      <View className="relative items-center w-28 h-28">
        <Image
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300' }}
          className="w-24 h-24 rounded-2xl object-cover"
        />
        
        {/* ADD button / stepper */}
        <View className="absolute -bottom-2 bg-white rounded-xl shadow border border-gray-100 flex-row items-center justify-center overflow-hidden min-w-[76px] h-[32px]">
          {quantity === 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onAdd}
              className="w-full h-full justify-center items-center px-4"
            >
              <Text className="text-veg font-extrabold text-sm">ADD</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-between w-full h-full px-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onRemove}
                className="w-7 h-full items-center justify-center"
              >
                <Ionicons name="remove" size={16} color={theme.colors.veg} />
              </TouchableOpacity>
              
              <Text className="text-veg font-black text-sm">{quantity}</Text>
              
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onAdd}
                className="w-7 h-full items-center justify-center"
              >
                <Ionicons name="add" size={16} color={theme.colors.veg} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
