// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15, 'Invalid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { signUp, loading } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });

  const onRegister = async (data: any) => {
    setGeneralError(null);
    const { error } = await signUp(data.fullName, data.email, data.phone, data.password);
    if (error) {
      setGeneralError(error);
    } else {
      // Direct session login or confirmation screen alert
      alert('Registration successful! Please check your email for the confirmation link.');
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-6"
        >
          <Ionicons name="arrow-back" size={20} color="#2D3033" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="text-secondary font-black text-3xl mb-1.5">
          Create Account
        </Text>
        <Text className="text-secondaryLight font-medium text-sm mb-6">
          Sign up to enjoy delicious food delivered to your door
        </Text>

        {generalError && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{generalError}</Text>
          </View>
        )}

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="Sagar Kumar"
              icon="person-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone Number"
              placeholder="9876543210"
              keyboardType="phone-pad"
              icon="call-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              icon="lock-closed-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="••••••••"
              isPassword
              icon="lock-closed-outline"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Terms checkbox */}
        <View className="mb-6">
          <View className="flex-row items-center">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#E2E8F0', true: '#FED7D7' }}
                  thumbColor={value ? '#E23744' : '#F4F6FB'}
                />
              )}
            />
            <Text className="text-secondary text-sm font-semibold ml-2.5 flex-1">
              I agree to the Terms of Service & Privacy Policy
            </Text>
          </View>
          {errors.acceptTerms && (
            <Text className="text-red-500 text-xs mt-1.5 ml-2 font-medium">
              {errors.acceptTerms.message}
            </Text>
          )}
        </View>

        <Button
          title="Sign Up"
          onPress={handleSubmit(onRegister)}
          loading={loading}
          className="mb-6"
        />

        {/* Sign In Link */}
        <View className="flex-1 justify-end items-center mt-6 mb-4">
          <View className="flex-row items-center">
            <Text className="text-secondaryLight font-medium text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary font-bold text-sm">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
