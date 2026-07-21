// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { resetPassword, loading } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: any) => {
    setGeneralError(null);
    const { error } = await resetPassword(data.email);
    if (error) {
      setGeneralError(error);
    } else {
      setSuccess(true);
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
          Reset Password
        </Text>
        <Text className="text-secondaryLight font-medium text-sm mb-8">
          Enter your registered email and we will send you a link to reset your password
        </Text>

        {generalError && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{generalError}</Text>
          </View>
        )}

        {success ? (
          <View className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={36} color="#0F8A5F" />
            </View>
            <Text className="text-secondary font-bold text-lg mb-2 text-center">Reset Email Sent</Text>
            <Text className="text-secondaryLight text-sm text-center leading-5 mb-4">
              A secure password reset link has been successfully dispatched. Please inspect your inbox and spam folders.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
            />
          </View>
        ) : (
          <View>
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

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              className="mt-4"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
