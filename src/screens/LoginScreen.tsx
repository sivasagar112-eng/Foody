// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
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

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Validation Schemas
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(15, 'Invalid phone number'),
});

export default function LoginScreen({ route, navigation }: LoginScreenProps) {
  const { phoneMode: initialPhoneMode } = route.params || {};
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { signIn, sendOtp, loading } = useAuthStore();

  useEffect(() => {
    if (initialPhoneMode) {
      setIsPhoneMode(true);
    }
  }, [initialPhoneMode]);

  // Email form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '', password: '' },
  });

  // Phone form
  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const onEmailLogin = async (data: any) => {
    setGeneralError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setGeneralError(error);
    }
  };

  const onPhoneLogin = async (data: any) => {
    setGeneralError(null);
    const { error } = await sendOtp(data.phone);
    if (error) {
      setGeneralError(error);
    } else {
      navigation.navigate('OTP', { phone: data.phone });
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
          {isPhoneMode ? 'OTP Login' : 'Welcome Back'}
        </Text>
        <Text className="text-secondaryLight font-medium text-sm mb-8">
          {isPhoneMode ? 'Enter your phone number to receive a 6-digit verification code' : 'Log in to continue ordering delicious meals'}
        </Text>

        {generalError && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{generalError}</Text>
          </View>
        )}

        {/* Form Fields */}
        {!isPhoneMode ? (
          <View>
            <Controller
              control={emailControl}
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
                  error={emailErrors.email?.message}
                />
              )}
            />

            <Controller
              control={emailControl}
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
                  error={emailErrors.password?.message}
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: '#E2E8F0', true: '#FED7D7' }}
                  thumbColor={rememberMe ? '#E23744' : '#F4F6FB'}
                />
                <Text className="text-secondary text-sm font-semibold ml-2">Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-primary font-bold text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Log In"
              onPress={handleEmailSubmit(onEmailLogin)}
              loading={loading}
              className="mb-4"
            />
          </View>
        ) : (
          <View>
            <Controller
              control={phoneControl}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="+19876543210"
                  keyboardType="phone-pad"
                  icon="call-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={phoneErrors.phone?.message}
                />
              )}
            />

            <Button
              title="Send Verification Code"
              onPress={handlePhoneSubmit(onPhoneLogin)}
              loading={loading}
              className="mb-6 mt-4"
            />
          </View>
        )}

        {/* Toggle Mode */}
        <TouchableOpacity
          onPress={() => {
            setIsPhoneMode(!isPhoneMode);
            setGeneralError(null);
          }}
          className="items-center py-2"
        >
          <Text className="text-secondary font-bold text-sm">
            {isPhoneMode ? 'Or log in using Email & Password' : 'Or log in using Phone Number'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-1 justify-end items-center mt-12 mb-4">
          <View className="flex-row items-center">
            <Text className="text-secondaryLight font-medium text-sm">New to Foody? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text className="text-primary font-bold text-sm">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
