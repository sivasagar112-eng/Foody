// src/screens/OrderTrackingScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCartStore } from '../store/useCartStore';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

type OrderTrackingScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

const statusSteps = [
  { status: 'Placed', label: 'Order Confirmed', description: 'We have received your order' },
  { status: 'Preparing', label: 'Preparing Food', description: 'Chef is preparing your tasty meal' },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Driver is on the way to you' },
  { status: 'Delivered', label: 'Delivered', description: 'Order completed, enjoy your meal!' }
];

export default function OrderTrackingScreen({ navigation }: OrderTrackingScreenProps) {
  const { activeOrder, simulateOrderProgress, clearActiveOrder } = useCartStore();

  // Set up timer to progress order status every 8 seconds for visual testing
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'Delivered') return;

    const timer = setInterval(() => {
      simulateOrderProgress();
    }, 8000);

    return () => clearInterval(timer);
  }, [activeOrder]);

  if (!activeOrder) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
        <Ionicons name="receipt-outline" size={48} color="#A0A5B1" className="mb-2" />
        <Text className="text-secondary font-bold text-base">No active orders</Text>
        <Button title="Go to Home" onPress={() => navigation.navigate('Main')} className="mt-4" />
      </SafeAreaView>
    );
  }

  const currentIdx = statusSteps.findIndex(s => s.status === activeOrder.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-50 bg-white">
        <View className="flex-row items-center">
          <Text className="text-secondary font-black text-xl">Order Tracking</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            clearActiveOrder();
            navigation.replace('Main');
          }}
        >
          <Ionicons name="close" size={24} color="#2D3033" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow bg-accent/20">
        {/* Estimated Delivery & Restaurant Card */}
        <View className="bg-white p-6 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-secondaryLight font-semibold text-xs">ESTIMATED DELIVERY TIME</Text>
              <Text className="text-secondary font-black text-2xl mt-0.5">25 - 30 Mins</Text>
            </View>
            <View className="bg-primary/5 border border-primary/10 rounded-2xl px-3 py-1.5">
              <Text className="text-primary font-black text-xs">Arriving Hot</Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-secondary font-bold text-sm" numberOfLines={1}>
              Ordering from {activeOrder.restaurant_name}
            </Text>
            <Text className="text-secondaryLight text-xs font-semibold">Order ID: #{activeOrder.id.substr(0, 8)}</Text>
          </View>
        </View>

        {/* Live Map Placeholder */}
        <View className="bg-white p-2 mb-4 h-64 relative overflow-hidden justify-center items-center">
          {/* Mock Map graphics using Unsplash satellite image */}
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600' }}
            className="w-full h-full opacity-70 absolute"
          />
          {/* Driver Pin Indicator overlay */}
          <View className="absolute items-center">
            <View className="bg-primary rounded-full p-2.5 shadow-lg border border-white">
              <Ionicons name="bicycle" size={24} color="#fff" />
            </View>
            <View className="bg-white px-2 py-0.5 rounded shadow mt-1">
              <Text className="text-secondary font-extrabold text-[9px]">Driver Moving</Text>
            </View>
          </View>
          <Text className="text-secondary font-black text-xs absolute bottom-4 bg-white/95 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            Live delivery tracking active
          </Text>
        </View>

        {/* Driver Details Card (Conditional on state: Out for Delivery or Delivered) */}
        {currentIdx >= 2 && (
          <View className="bg-white p-6 mb-4 flex-row items-center justify-between border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                  className="w-full h-full object-cover"
                />
              </View>
              <View className="ml-3">
                <Text className="text-secondary font-black text-sm">Rider Rahul</Text>
                <Text className="text-secondaryLight text-xs font-semibold">Your delivery partner</Text>
              </View>
            </View>
            <View className="flex-row space-x-3.5">
              <TouchableOpacity className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <Ionicons name="call" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
                <Ionicons name="chatbubble" size={18} color={theme.colors.veg} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Status Stepper */}
        <View className="bg-white p-6 mb-12">
          <Text className="text-secondary font-black text-base mb-6">Status Stepper</Text>

          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const isLast = idx === statusSteps.length - 1;
            const bulletColor = isCompleted ? 'bg-primary' : 'bg-gray-200';
            const textColor = isCompleted ? 'text-secondary' : 'text-secondaryLight';

            return (
              <View key={step.status} className="flex-row items-start relative pb-8 last:pb-0">
                {/* Visual Connector Line */}
                {!isLast && (
                  <View
                    className={`absolute left-[9px] top-6 w-[2px] h-[calc(100%-8px)] ${
                      idx < currentIdx ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}

                {/* Bullet Icon */}
                <View className={`w-5 h-5 rounded-full items-center justify-center z-10 ${bulletColor} mr-4`}>
                  {isCompleted && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>

                {/* Status text */}
                <View className="flex-1 -mt-0.5">
                  <Text className={`font-bold text-sm ${textColor} ${isCurrent ? 'text-primary font-black' : ''}`}>
                    {step.label}
                  </Text>
                  <Text className="text-secondaryLight text-xs leading-4 mt-0.5">
                    {step.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {activeOrder.status === 'Delivered' && (
        <View className="px-6 py-5 border-t border-gray-50 bg-white">
          <Button
            title="Return to Home Screen"
            onPress={() => {
              clearActiveOrder();
              navigation.replace('Main');
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
