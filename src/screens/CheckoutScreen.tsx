// src/screens/CheckoutScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const { user, addresses } = useAuthStore();
  const {
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    getCartTotals,
    placeOrder
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { subtotal, deliveryFee, tax, discount, total } = getCartTotals();

  const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!activeAddress) {
      setError('Please select or add a delivery address.');
      return;
    }
    setError(null);
    setLoading(true);

    const addressLine = `${activeAddress.address_line}, ${activeAddress.city} - ${activeAddress.pincode}`;
    const res = await placeOrder(user.id, addressLine);
    setLoading(false);

    if (res.success) {
      // Clear navigation history and navigate straight to Tracking
      navigation.replace('OrderTracking');
    } else {
      setError(res.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-50 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
          <Ionicons name="arrow-back" size={20} color="#2D3033" />
        </TouchableOpacity>
        <Text className="text-secondary font-black text-xl">Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow bg-accent/20">
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 m-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{error}</Text>
          </View>
        )}

        {/* 1. Address Selection */}
        <View className="bg-white p-6 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-secondary font-black text-base">Delivery Address</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Main', { screen: 'ProfileTab' })}>
              <Text className="text-primary font-bold text-sm">+ Add New</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View className="py-4 border border-dashed border-gray-200 rounded-2xl items-center justify-center">
              <Ionicons name="location-outline" size={28} color="#A0A5B1" className="mb-1" />
              <Text className="text-secondaryLight text-xs font-semibold">No addresses saved yet</Text>
            </View>
          ) : (
            addresses.map(addr => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedAddressId(addr.id)}
                  className={`flex-row items-start p-4 border rounded-2xl mb-3 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
                  }`}
                >
                  <Ionicons
                    name={addr.label === 'Home' ? 'home-outline' : addr.label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                    size={20}
                    color={isSelected ? theme.colors.primary : theme.colors.secondaryLight}
                    style={{ marginRight: 12, marginTop: 2 }}
                  />
                  <View className="flex-grow flex-1 mr-4">
                    <Text className={`font-bold text-sm mb-1 ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                      {addr.label}
                    </Text>
                    <Text className="text-secondaryLight text-xs leading-4" numberOfLines={2}>
                      {addr.address_line}, {addr.city} - {addr.pincode}
                    </Text>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 2. Payment Method Selector */}
        <View className="bg-white p-6 mb-4">
          <Text className="text-secondary font-black text-base mb-4">Select Payment Method</Text>

          {/* UPI Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('UPI')}
            className={`flex-row items-center justify-between p-4 border rounded-2xl mb-3 ${
              paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="apps-outline" size={22} color={paymentMethod === 'UPI' ? theme.colors.primary : theme.colors.secondaryLight} style={{ marginRight: 12 }} />
              <View>
                <Text className={`font-bold text-sm ${paymentMethod === 'UPI' ? 'text-primary' : 'text-secondary'}`}>UPI / NetBanking</Text>
                <Text className="text-secondaryLight text-xs font-semibold">Google Pay, PhonePe, UPI Apps</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              paymentMethod === 'UPI' ? 'border-primary bg-primary' : 'border-gray-300'
            }`}>
              {paymentMethod === 'UPI' && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>

          {/* Card Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('Card')}
            className={`flex-row items-center justify-between p-4 border rounded-2xl mb-3 ${
              paymentMethod === 'Card' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={22} color={paymentMethod === 'Card' ? theme.colors.primary : theme.colors.secondaryLight} style={{ marginRight: 12 }} />
              <View>
                <Text className={`font-bold text-sm ${paymentMethod === 'Card' ? 'text-primary' : 'text-secondary'}`}>Credit or Debit Card</Text>
                <Text className="text-secondaryLight text-xs font-semibold">Visa, MasterCard, RuPay</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              paymentMethod === 'Card' ? 'border-primary bg-primary' : 'border-gray-300'
            }`}>
              {paymentMethod === 'Card' && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>

          {/* Cash on Delivery Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('COD')}
            className={`flex-row items-center justify-between p-4 border rounded-2xl mb-3 ${
              paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="cash-outline" size={22} color={paymentMethod === 'COD' ? theme.colors.primary : theme.colors.secondaryLight} style={{ marginRight: 12 }} />
              <View>
                <Text className={`font-bold text-sm ${paymentMethod === 'COD' ? 'text-primary' : 'text-secondary'}`}>Cash on Delivery (COD)</Text>
                <Text className="text-secondaryLight text-xs font-semibold">Pay cash or scan QR on delivery</Text>
              </View>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              paymentMethod === 'COD' ? 'border-primary bg-primary' : 'border-gray-300'
            }`}>
              {paymentMethod === 'COD' && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Order Summary */}
        <View className="bg-white p-6 mb-12">
          <Text className="text-secondary font-black text-base mb-4">Total Amount Due</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-secondaryLight text-sm font-semibold">Grand Total (incl. GST)</Text>
            <Text className="text-primary font-black text-xl">${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View className="px-6 py-5 border-t border-gray-50 bg-white">
        <Button
          title={paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay & Place Order'}
          onPress={handlePlaceOrder}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}
