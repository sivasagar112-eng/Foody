// src/screens/CartScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: CartScreenProps) {
  const {
    cartItems,
    restaurantName,
    promoCode,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode,
    getCartTotals,
    setSelectedAddressId
  } = useCartStore();

  const { addresses } = useAuthStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const { subtotal, deliveryFee, tax, discount, total } = getCartTotals();

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setCouponLoading(true);
    const res = await applyPromoCode(couponInput.toUpperCase());
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.error);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    // Automatically pre-select default address
    const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    }
    navigation.navigate('Checkout');
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Ionicons name="arrow-back" size={20} color="#2D3033" />
          </TouchableOpacity>
          <Text className="text-secondary font-black text-xl">My Cart</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }}
            className="w-48 h-48 rounded-full object-cover mb-6 opacity-80"
          />
          <Text className="text-secondary font-black text-xl mb-1.5 text-center">Your Cart is Empty</Text>
          <Text className="text-secondaryLight text-sm text-center mb-8 px-4">
            Browse our list of local restaurants and discover something delicious today!
          </Text>
          <Button title="Browse Restaurants" onPress={() => navigation.navigate('Main')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Ionicons name="arrow-back" size={20} color="#2D3033" />
          </TouchableOpacity>
          <View>
            <Text className="text-secondary font-black text-lg">My Cart</Text>
            <Text className="text-secondaryLight font-semibold text-xs" numberOfLines={1}>From {restaurantName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearCart}>
          <Text className="text-primary font-bold text-sm">Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow bg-accent/20">
        {/* Cart items list */}
        <View className="bg-white p-6 mb-4">
          <Text className="text-secondary font-black text-base mb-4">Items Ordered</Text>
          {cartItems.map(item => (
            <View key={item.id} className="flex-row justify-between items-center py-3.5 border-b border-gray-50 last:border-0">
              <View className="flex-1 mr-4">
                <Text className="text-secondary font-bold text-sm mb-0.5">{item.menuItem.name}</Text>
                <Text className="text-secondaryLight text-xs font-semibold">${item.menuItem.price.toFixed(2)} each</Text>
              </View>

              {/* Quantity Stepper */}
              <View className="flex-row items-center border border-gray-200 rounded-xl bg-white h-[32px] px-1">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                  className="w-8 h-full items-center justify-center"
                >
                  <Ionicons name="remove" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text className="text-secondary font-black text-sm px-2">{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                  className="w-8 h-full items-center justify-center"
                >
                  <Ionicons name="add" size={14} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>

              <Text className="text-secondary font-bold text-sm min-w-[60px] text-right ml-4">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Promo Code Input */}
        <View className="bg-white p-6 mb-4">
          <Text className="text-secondary font-black text-base mb-3">Promo Code</Text>
          {promoCode ? (
            <View className="flex-row justify-between items-center border border-dashed border-veg bg-emerald-50/50 rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center">
                <Ionicons name="ribbon" size={20} color={theme.colors.veg} style={{ marginRight: 8 }} />
                <View>
                  <Text className="text-veg font-bold text-sm">Coupon '{promoCode.code}' Applied</Text>
                  <Text className="text-secondaryLight text-xs font-semibold">Saved ${(discount).toFixed(2)} on this order</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removePromoCode}>
                <Text className="text-red-500 font-bold text-sm">Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center border border-gray-200 rounded-2xl p-1 bg-gray-50">
                <TextInput
                  placeholder="Enter Promo Code (e.g. SAVE20, FOODY50)"
                  className="flex-1 text-secondary text-sm font-semibold px-3 py-2.5 p-0"
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={handleApplyCoupon}
                  disabled={couponLoading}
                  className="bg-primary rounded-xl px-4 py-2.5"
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-xs">Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
              {couponError && (
                <Text className="text-red-500 text-xs mt-1.5 ml-2 font-medium">{couponError}</Text>
              )}
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View className="bg-white p-6 mb-12">
          <Text className="text-secondary font-black text-base mb-4">Bill Summary</Text>
          
          <View className="flex-row justify-between mb-3 text-sm font-medium">
            <Text className="text-secondaryLight">Subtotal</Text>
            <Text className="text-secondary">${subtotal.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-3 text-sm font-medium">
            <Text className="text-secondaryLight">Delivery Fee</Text>
            <Text className="text-secondary">
              {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3 text-sm font-medium">
            <Text className="text-secondaryLight">Restaurant Charges & Taxes</Text>
            <Text className="text-secondary">${tax.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between mb-3 text-sm font-medium">
              <Text className="text-veg font-bold">Discount Applied</Text>
              <Text className="text-veg font-bold">-${discount.toFixed(2)}</Text>
            </View>
          )}

          <View className="h-[1px] bg-gray-100 my-4.5" />

          <View className="flex-row justify-between text-base font-black">
            <Text className="text-secondary font-black">Grand Total</Text>
            <Text className="text-primary font-black">${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="px-6 py-5 border-t border-gray-50 bg-white">
        <Button title="Proceed to Checkout" onPress={handleCheckout} />
      </View>
    </SafeAreaView>
  );
}
