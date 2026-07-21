// src/screens/OrdersScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../services/supabaseClient';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { forceAddItem } = useCartStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const focusUnsub = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return focusUnsub;
  }, [navigation]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          restaurant_id,
          total_amount,
          status,
          created_at,
          payment_method
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock additional restaurant name and item data since joins are simulated
      const ordersWithDetails = await Promise.all((data || []).map(async (ord: any) => {
        // Fetch restaurant details
        const { data: rest } = await supabase.from('restaurants').select('name, image_url').eq('id', ord.restaurant_id).single();
        // Fetch menu items (simulate order items)
        return {
          ...ord,
          restaurant_name: rest?.name || 'Local Restaurant',
          image_url: rest?.image_url,
          items_summary: '1x Veg Burger, 1x Fries' // Mock summary
        };
      }));

      setOrders(ordersWithDetails);
    } catch (e) {
      console.error('Error fetching order history:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: any) => {
    try {
      // Find a menu item from the restaurant to mock reorder
      const { data: items } = await supabase.from('menu_items').select('*').eq('restaurant_id', order.restaurant_id);
      if (items && items.length > 0) {
        forceAddItem(items[0], { id: order.restaurant_id, name: order.restaurant_name });
        navigation.navigate('Cart');
      }
    } catch (e) {
      console.error('Reorder failed:', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-50 bg-white">
        <Text className="text-secondary font-black text-2xl">My Orders</Text>
        <Text className="text-secondaryLight font-semibold text-xs mt-0.5">Track active and review past orders</Text>
      </View>

      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="receipt-outline" size={64} color="#A0A5B1" className="mb-4" />
          <Text className="text-secondary font-black text-xl mb-1.5">No Orders Placed Yet</Text>
          <Text className="text-secondaryLight text-sm text-center mb-8 px-4">
            Hungry? Browse your favorite restaurants and order your favorite food now!
          </Text>
          <Button title="Browse Restaurants" onPress={() => navigation.navigate('HomeTab')} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <View className="bg-white rounded-3xl border border-gray-100 p-4 mb-4 shadow-sm flex-row items-start">
                <Image
                  source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' }}
                  className="w-14 h-14 rounded-2xl object-cover mr-4"
                />
                
                <View className="flex-1 flex-grow">
                  <View className="flex-row justify-between items-start mb-0.5">
                    <Text className="text-secondary font-bold text-base flex-1 mr-2" numberOfLines={1}>
                      {item.restaurant_name}
                    </Text>
                    <View className={`px-2 py-0.5 rounded-lg ${
                      item.status === 'Delivered' ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      <Text className={`font-black text-[10px] ${
                        item.status === 'Delivered' ? 'text-veg' : 'text-primary'
                      }`}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-secondaryLight text-xs font-semibold mb-2">{dateStr}</Text>
                  <Text className="text-secondary font-medium text-xs mb-3.5" numberOfLines={1}>{item.items_summary}</Text>
                  
                  <View className="h-[1px] bg-gray-100 mb-3" />

                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-secondaryLight text-[10px] font-semibold">TOTAL PAID</Text>
                      <Text className="text-secondary font-black text-sm">${item.total_amount.toFixed(2)}</Text>
                    </View>
                    
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleReorder(item)}
                      className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2"
                    >
                      <Text className="text-primary font-bold text-xs">Reorder</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
