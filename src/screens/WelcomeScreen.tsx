// src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white justify-between px-6 py-12">
      {/* Brand logo / header */}
      <View className="items-center mt-12">
        <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-4 shadow-lg shadow-red-200">
          <Ionicons name="fast-food" size={44} color="#fff" />
        </View>
        <Text className="text-secondary font-black text-4xl tracking-tighter">
          Foody
        </Text>
        <Text className="text-secondaryLight font-medium text-sm mt-1">
          Craving solved in a few taps
        </Text>
      </View>

      {/* Hero illustration or image */}
      <View className="items-center">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' }}
          className="w-64 h-64 rounded-full object-cover shadow-md"
        />
      </View>

      {/* Action buttons */}
      <View className="space-y-3.5">
        <Button
          title="Continue with Email"
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          icon={<Ionicons name="mail" size={20} color="#fff" />}
        />
        
        <Button
          title="Continue with Phone OTP"
          onPress={() => navigation.navigate('Login', { phoneMode: true })}
          variant="outline"
          icon={<Ionicons name="call" size={20} color="#E23744" />}
        />

        {/* Social logins */}
        <View className="flex-row justify-between items-center pt-2">
          <View className="h-[1px] bg-gray-200 flex-1" />
          <Text className="text-secondaryLight text-xs font-semibold px-4">OR CONNECT WITH</Text>
          <View className="h-[1px] bg-gray-200 flex-1" />
        </View>

        <View className="flex-row space-x-4 pt-1">
          <Button
            title="Google"
            onPress={() => alert('OAuth login clicked')}
            variant="secondary"
            className="flex-1 bg-[#4285F4]"
            icon={<Ionicons name="logo-google" size={18} color="#fff" />}
          />
          <Button
            title="Apple"
            onPress={() => alert('OAuth login clicked')}
            variant="secondary"
            className="flex-1 bg-black"
            icon={<Ionicons name="logo-apple" size={18} color="#fff" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
