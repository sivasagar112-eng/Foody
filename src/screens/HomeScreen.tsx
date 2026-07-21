// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../services/supabaseClient';
import RestaurantCard from '../components/RestaurantCard';
import RatingBadge from '../components/RatingBadge';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, addresses } = useAuthStore();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultAddress = addresses.find(a => a.is_default) || addresses[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('*');
      setCategories(catData || []);

      // Fetch restaurants
      const { data: restData } = await supabase.from('restaurants').select('*');
      setRestaurants(restData || []);
    } catch (e) {
      console.error('Error fetching home screen data:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesCategory = selectedCategory
      ? r.cuisine_tags.some((tag: string) => tag.toLowerCase() === selectedCategory.toLowerCase())
      : true;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine_tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header / Location Selection */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-50">
        <View className="flex-row items-center flex-1">
          <Ionicons name="location" size={24} color={theme.colors.primary} />
          <View className="ml-2 flex-1">
            <Text className="text-secondary font-black text-sm">Delivery to</Text>
            <Text className="text-secondaryLight font-semibold text-xs" numberOfLines={1}>
              {defaultAddress ? `${defaultAddress.label}: ${defaultAddress.address_line}` : 'Set delivery address'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Main', { screen: 'ProfileTab' })}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden"
        >
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} className="w-full h-full" />
          ) : (
            <Ionicons name="person" size={20} color={theme.colors.secondary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
        {/* Search Bar */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center border-2 border-gray-100 rounded-2xl px-4 py-3.5 bg-accent/30">
            <Ionicons name="search" size={20} color="#A0A5B1" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for restaurants, dishes..."
              className="flex-1 text-secondary text-sm font-semibold p-0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#A0A5B1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Promo Offers Banners Carousel (FlatList horizontal) */}
        <View className="mt-6">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: '1', title: '50% OFF ON FIRST ORDER', code: 'FOODY50', color: 'bg-red-500', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' },
              { id: '2', title: 'GET 20% OFF TODAY', code: 'SAVE20', color: 'bg-amber-500', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600' },
            ]}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View className={`w-80 h-36 mr-4 rounded-3xl overflow-hidden relative ${item.color}`}>
                <Image source={{ uri: item.img }} className="w-full h-full opacity-60 absolute" />
                <View className="p-5 justify-between h-full">
                  <View>
                    <Text className="text-white font-black text-xl leading-5">{item.title}</Text>
                    <Text className="text-white font-extrabold text-xs mt-1">Use promo code: {item.code}</Text>
                  </View>
                  <View className="bg-white px-3 py-1.5 rounded-xl self-start">
                    <Text className="text-red-500 font-extrabold text-xs">Order Now</Text>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* Category horizontal list */}
        <View className="mt-6">
          <Text className="text-secondary font-black text-lg px-6 mb-3.5">What are you craving?</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedCategory?.toLowerCase() === item.name.toLowerCase();
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(isSelected ? null : item.name)}
                  className="items-center mr-5"
                >
                  <View className={`w-16 h-16 rounded-2xl overflow-hidden mb-2 items-center justify-center border-2 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
                  }`}>
                    <Image source={{ uri: item.image_url }} className="w-12 h-12 rounded-lg" />
                  </View>
                  <Text className={`text-xs font-bold ${
                    isSelected ? 'text-primary' : 'text-secondary'
                  }`}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Restaurant List */}
        <View className="px-6 mt-6 pb-12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-secondary font-black text-lg">Restaurants near you</Text>
            {selectedCategory && (
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Text className="text-primary font-bold text-xs">Clear filter</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} className="my-8" />
          ) : filteredRestaurants.length === 0 ? (
            <View className="items-center justify-center py-12 bg-gray-50 rounded-3xl">
              <Ionicons name="restaurant-outline" size={48} color="#A0A5B1" className="mb-2" />
              <Text className="text-secondary font-bold text-base">No restaurants found</Text>
              <Text className="text-secondaryLight text-xs mt-1">Try resetting your search filters</Text>
            </View>
          ) : (
            filteredRestaurants.map(item => (
              <RestaurantCard
                key={item.id}
                restaurant={item}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id, name: item.name })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
