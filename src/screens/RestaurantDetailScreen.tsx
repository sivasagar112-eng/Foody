// src/screens/RestaurantDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../services/supabaseClient';
import MenuItemRow from '../components/MenuItemRow';
import RatingBadge from '../components/RatingBadge';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

type RestaurantDetailProps = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;

export default function RestaurantDetailScreen({ route, navigation }: RestaurantDetailProps) {
  const { restaurantId, name } = route.params;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { cartItems, addItem, removeItem, forceAddItem } = useCartStore();

  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    setLoading(true);
    try {
      const { data: restData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      setRestaurant(restData);

      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);
      setMenuItems(menuData || []);
    } catch (e) {
      console.error('Failed to load restaurant details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item: any) => {
    const res = addItem(item, { id: restaurantId, name: restaurant?.name || 'Restaurant' });
    if (res.promptRestaurantChange) {
      // Prompt user to clear cart from other restaurant
      const confirmClear = confirm(
        'Your cart contains items from another restaurant. Would you like to discard those items and start a new order?'
      );
      if (confirmClear) {
        forceAddItem(item, { id: restaurantId, name: restaurant?.name || 'Restaurant' });
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text className="text-secondary font-bold">Restaurant not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesVeg = vegOnly ? item.is_veg === true : true;
    const matchesCategory = selectedCategory === 'All' ? true : item.category_id === selectedCategory || item.category === selectedCategory;
    return matchesVeg && matchesCategory;
  });

  // Extract categories dynamically
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category || 'Main Course')))];

  // Cart stats for floating bar
  const restaurantCartItems = cartItems.filter(item => item.restaurantId === restaurantId);
  const cartItemCount = restaurantCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = restaurantCartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Cover Image & Back Button */}
      <View className="relative h-60 w-full">
        <Image
          source={{ uri: restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }}
          className="w-full h-full object-cover"
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow"
        >
          <Ionicons name="arrow-back" size={20} color="#2D3033" />
        </TouchableOpacity>
      </View>

      {/* Restaurant Meta Info */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 py-5 border-b border-gray-100 bg-white">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-secondary font-black text-2xl flex-1 mr-2">{restaurant.name}</Text>
            <RatingBadge rating={restaurant.rating} size="medium" />
          </View>

          <Text className="text-secondaryLight text-sm mb-3">
            {restaurant.cuisine_tags.join(', ')}
          </Text>

          <View className="flex-row items-center text-xs text-secondaryLight font-medium space-x-6 mb-4">
            <View className="flex-row items-center mr-4">
              <Ionicons name="time" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text className="text-secondary">{restaurant.delivery_time_mins} mins</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Ionicons name="card" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text className="text-secondary">${restaurant.cost_for_two} for two</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="bicycle" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text className="text-secondary">${restaurant.delivery_fee.toFixed(2)} delivery</Text>
            </View>
          </View>

          <View className="flex-row items-center border-t border-gray-100 pt-3">
            <Ionicons name="map-outline" size={14} color="#686B6E" style={{ marginRight: 4 }} />
            <Text className="text-secondaryLight text-xs flex-1" numberOfLines={1}>{restaurant.address}</Text>
          </View>
        </View>

        {/* Filter Toggles & Categories */}
        <View className="px-6 py-4 bg-gray-50 flex-row justify-between items-center border-b border-gray-100">
          <Text className="text-secondary font-black text-sm">Veg Only</Text>
          <TouchableOpacity
            onPress={() => setVegOnly(!vegOnly)}
            className={`w-12 h-6.5 rounded-full p-0.5 justify-center ${vegOnly ? 'bg-veg items-end' : 'bg-gray-300 items-start'}`}
          >
            <View className="w-5.5 h-5.5 rounded-full bg-white shadow-sm" />
          </TouchableOpacity>
        </View>

        {/* Menu Items List */}
        <View className="px-6 py-4 pb-24">
          <Text className="text-secondary font-black text-lg mb-4">Full Menu</Text>
          {filteredItems.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Ionicons name="restaurant-outline" size={44} color="#A0A5B1" className="mb-2" />
              <Text className="text-secondaryLight text-sm font-semibold">No menu items match your filters</Text>
            </View>
          ) : (
            filteredItems.map(item => {
              const cartItem = restaurantCartItems.find(c => c.menuItem.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              return (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  quantity={qty}
                  onAdd={() => handleAddItem(item)}
                  onRemove={() => removeItem(item.id)}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <View className="absolute bottom-6 left-6 right-6 bg-primary rounded-2xl flex-row justify-between items-center px-5 py-4 shadow-lg shadow-red-200">
          <View>
            <Text className="text-white font-black text-sm">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</Text>
            <Text className="text-white font-extrabold text-xs opacity-90">${cartSubtotal.toFixed(2)} plus taxes</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Cart')}
            className="flex-row items-center"
          >
            <Text className="text-white font-black text-base mr-1">View Cart</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
