// src/screens/OTPScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type OTPScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export default function OTPScreen({ route, navigation }: OTPScreenProps) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { verifyOtp, sendOtp, loading } = useAuthStore();

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onVerify = async () => {
    setGeneralError(null);
    if (code.length !== 6) {
      setGeneralError('Please enter a 6-digit code');
      return;
    }

    const { error } = await verifyOtp(phone, code);
    if (error) {
      setGeneralError(error);
    }
  };

  const onResend = async () => {
    if (timer > 0) return;
    setGeneralError(null);
    const { error } = await sendOtp(phone);
    if (error) {
      setGeneralError(error);
    } else {
      setTimer(60);
      alert('OTP code sent successfully.');
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
          Verify Phone
        </Text>
        <Text className="text-secondaryLight font-medium text-sm mb-8">
          Enter the 6-digit code sent to your phone number <Text className="text-secondary font-bold">{phone}</Text>
        </Text>

        {generalError && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{generalError}</Text>
          </View>
        )}

        <Input
          label="Verification Code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          icon="key-outline"
          value={code}
          onChangeText={setCode}
          className="tracking-widest text-center text-xl font-bold"
        />

        <Button
          title="Verify & Continue"
          onPress={onVerify}
          loading={loading}
          className="mt-4 mb-6"
        />

        {/* Resend Timer */}
        <View className="items-center">
          {timer > 0 ? (
            <Text className="text-secondaryLight font-semibold text-sm">
              Resend code in <Text className="text-primary font-bold">{timer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={onResend}>
              <Text className="text-primary font-black text-sm">Resend OTP Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
