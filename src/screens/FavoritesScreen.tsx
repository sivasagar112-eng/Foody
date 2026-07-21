// src/screens/FavoritesScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../services/supabaseClient';
import RestaurantCard from '../components/RestaurantCard';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function FavoritesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
    const focusUnsub = navigation.addListener('focus', () => {
      fetchFavorites();
    });
    return focusUnsub;
  }, [navigation]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          restaurant_id
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Map join-like mock details
      const favList = await Promise.all((data || []).map(async (f: any) => {
        const { data: rest } = await supabase.from('restaurants').select('*').eq('id', f.restaurant_id).single();
        return rest;
      }));

      setFavorites(favList.filter(Boolean));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-50 bg-white">
        <Text className="text-secondary font-black text-2xl">My Favorites</Text>
        <Text className="text-secondaryLight font-semibold text-xs mt-0.5">Quickly order from your top choices</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow">
        <View className="px-6 py-6 pb-12">
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} className="my-8" />
          ) : favorites.length === 0 ? (
            <View className="items-center justify-center py-20 bg-gray-50 rounded-3xl">
              <Ionicons name="heart-dislike-outline" size={48} color="#A0A5B1" className="mb-2" />
              <Text className="text-secondary font-bold text-base">No Favorites Saved</Text>
              <Text className="text-secondaryLight text-xs mt-1">Tap the heart on restaurant pages to save here</Text>
            </View>
          ) : (
            favorites.map(item => (
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
