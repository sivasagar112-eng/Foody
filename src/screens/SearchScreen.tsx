// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabaseClient';
import RestaurantCard from '../components/RestaurantCard';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function SearchScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'cost'>('rating');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('restaurants').select('*');
      setRestaurants(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  let filtered = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine_tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = vegOnly ? r.cuisine_tags.some((tag: string) => tag.toLowerCase() === 'veg' || tag.toLowerCase() === 'healthy') : true;
    const matchesRating = minRating ? r.rating >= minRating : true;
    return matchesSearch && matchesVeg && matchesRating;
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'time') {
    filtered.sort((a, b) => a.delivery_time_mins - b.delivery_time_mins);
  } else if (sortBy === 'cost') {
    filtered.sort((a, b) => a.cost_for_two - b.cost_for_two);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-50 bg-white">
        <Text className="text-secondary font-black text-2xl">Search</Text>
        
        {/* Search Input */}
        <View className="flex-row items-center border-2 border-gray-100 rounded-2xl px-4 py-3 bg-accent/30 mt-3">
          <Ionicons name="search" size={20} color="#A0A5B1" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search restaurants, cuisines..."
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

      {/* Filters & Sorting Panel */}
      <View className="px-6 py-3 border-b border-gray-50 flex-row flex-wrap items-center">
        {/* Veg filter */}
        <TouchableOpacity
          onPress={() => setVegOnly(!vegOnly)}
          className={`flex-row items-center px-3 py-1.5 rounded-full border mr-3.5 mb-2 ${
            vegOnly ? 'bg-veg/10 border-veg' : 'bg-white border-gray-200'
          }`}
        >
          <View className={`w-3.5 h-3.5 rounded border items-center justify-center ${vegOnly ? 'border-veg' : 'border-gray-400'}`}>
            {vegOnly && <View className="w-1.5 h-1.5 rounded-full bg-veg" />}
          </View>
          <Text className={`text-xs font-bold ml-1.5 ${vegOnly ? 'text-veg' : 'text-secondary'}`}>Pure Veg</Text>
        </TouchableOpacity>

        {/* Rating filter */}
        <TouchableOpacity
          onPress={() => setMinRating(minRating === 4.0 ? null : 4.0)}
          className={`flex-row items-center px-3 py-1.5 rounded-full border mr-3.5 mb-2 ${
            minRating === 4.0 ? 'bg-amber-500/10 border-amber-500' : 'bg-white border-gray-200'
          }`}
        >
          <Ionicons name="star" size={12} color={minRating === 4.0 ? '#F59E0B' : '#A0A5B1'} style={{ marginRight: 4 }} />
          <Text className={`text-xs font-bold ${minRating === 4.0 ? 'text-amber-500' : 'text-secondary'}`}>Rating 4.0+</Text>
        </TouchableOpacity>

        {/* Sort Chips */}
        <View className="flex-row items-center space-x-2.5 mb-2">
          <TouchableOpacity onPress={() => setSortBy('rating')} className={`px-3 py-1.5 rounded-full ${sortBy === 'rating' ? 'bg-primary' : 'bg-gray-100'}`}>
            <Text className={`text-[10px] font-black ${sortBy === 'rating' ? 'text-white' : 'text-secondaryLight'}`}>RATING</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('time')} className={`px-3 py-1.5 rounded-full ${sortBy === 'time' ? 'bg-primary' : 'bg-gray-100'}`}>
            <Text className={`text-[10px] font-black ${sortBy === 'time' ? 'text-white' : 'text-secondaryLight'}`}>SPEED</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('cost')} className={`px-3 py-1.5 rounded-full ${sortBy === 'cost' ? 'bg-primary' : 'bg-gray-100'}`}>
            <Text className={`text-[10px] font-black ${sortBy === 'cost' ? 'text-white' : 'text-secondaryLight'}`}>COST</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
        <View className="px-6 py-6 pb-12">
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} className="my-8" />
          ) : filtered.length === 0 ? (
            <View className="items-center justify-center py-16 bg-gray-50 rounded-3xl">
              <Ionicons name="search-outline" size={44} color="#A0A5B1" className="mb-2" />
              <Text className="text-secondary font-bold text-base">No results found</Text>
              <Text className="text-secondaryLight text-xs mt-1">Try another search query or filter</Text>
            </View>
          ) : (
            filtered.map(item => (
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
