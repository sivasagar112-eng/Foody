// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

export default function ProfileScreen() {
  const { user, addresses, addAddress, deleteAddress, updateProfile, signOut, loading } = useAuthStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLine, setAddrLine] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return;
    setError(null);
    const res = await updateProfile(profileName, profilePhone);
    if (!res.error) {
      setIsEditingProfile(false);
    } else {
      setError(res.error);
    }
  };

  const handleAddAddress = async () => {
    if (!addrLine.trim() || !addrCity.trim() || !addrPincode.trim()) {
      setError('Please fill in all address fields.');
      return;
    }
    setError(null);
    const res = await addAddress({
      label: addrLabel,
      address_line: addrLine,
      city: addrCity,
      pincode: addrPincode,
      is_default: addrIsDefault
    });

    if (!res.error) {
      setIsAddingAddress(false);
      setAddrLine('');
      setAddrCity('');
      setAddrPincode('');
      setAddrIsDefault(false);
    } else {
      setError(res.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-50 bg-white">
        <Text className="text-secondary font-black text-2xl">My Profile</Text>
        <Text className="text-secondaryLight font-semibold text-xs mt-0.5">Manage details and addresses</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-grow bg-accent/20">
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 m-6 flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 text-sm font-semibold flex-1">{error}</Text>
          </View>
        )}

        {/* 1. Account Details Section */}
        <View className="bg-white p-6 mb-4">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-secondary font-black text-base">Account Information</Text>
            {!isEditingProfile ? (
              <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
                <Text className="text-primary font-bold text-sm">Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingProfile(false)}>
                <Text className="text-secondaryLight font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingProfile ? (
            <View>
              <Input
                label="Full Name"
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter full name"
                icon="person-outline"
              />
              <Input
                label="Phone Number"
                value={profilePhone}
                onChangeText={setProfilePhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                icon="call-outline"
              />
              <Button
                title="Save Profile"
                onPress={handleUpdateProfile}
                loading={loading}
                className="mt-2"
              />
            </View>
          ) : (
            <View className="space-y-4">
              <View className="flex-row items-center pb-3 border-b border-gray-50">
                <Ionicons name="person-circle-outline" size={24} color="#686B6E" style={{ marginRight: 12 }} />
                <View>
                  <Text className="text-secondaryLight text-[10px] font-semibold">FULL NAME</Text>
                  <Text className="text-secondary font-bold text-sm mt-0.5">{user?.full_name || 'Foody User'}</Text>
                </View>
              </View>

              <View className="flex-row items-center pb-3 border-b border-gray-50">
                <Ionicons name="mail-outline" size={24} color="#686B6E" style={{ marginRight: 12 }} />
                <View>
                  <Text className="text-secondaryLight text-[10px] font-semibold">EMAIL ADDRESS</Text>
                  <Text className="text-secondary font-bold text-sm mt-0.5">{user?.email || 'N/A'}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={24} color="#686B6E" style={{ marginRight: 12 }} />
                <View>
                  <Text className="text-secondaryLight text-[10px] font-semibold">PHONE NUMBER</Text>
                  <Text className="text-secondary font-bold text-sm mt-0.5">{user?.phone || 'Not added'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 2. Saved Addresses Section */}
        <View className="bg-white p-6 mb-4">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-secondary font-black text-base">Saved Addresses</Text>
            {!isAddingAddress ? (
              <TouchableOpacity onPress={() => setIsAddingAddress(true)}>
                <Text className="text-primary font-bold text-sm">+ Add New</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsAddingAddress(false)}>
                <Text className="text-secondaryLight font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {isAddingAddress ? (
            <View>
              {/* Label Selector chips */}
              <View className="flex-row mb-4 space-x-3.5">
                {['Home', 'Work', 'Other'].map(lbl => (
                  <TouchableOpacity
                    key={lbl}
                    onPress={() => setAddrLabel(lbl)}
                    className={`px-4 py-2 rounded-xl border flex-grow items-center ${
                      addrLabel === lbl ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-bold text-xs ${addrLabel === lbl ? 'text-primary' : 'text-secondary'}`}>{lbl}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Address Line"
                value={addrLine}
                onChangeText={setAddrLine}
                placeholder="Apt 4B, Sector 2, Outer Ring Rd"
                icon="location-outline"
              />

              <Input
                label="City"
                value={addrCity}
                onChangeText={setAddrCity}
                placeholder="Bengaluru"
                icon="business-outline"
              />

              <Input
                label="Pincode"
                value={addrPincode}
                onChangeText={setAddrPincode}
                placeholder="560103"
                keyboardType="number-pad"
                icon="pin-outline"
              />

              <View className="flex-row justify-between items-center mb-5 px-1">
                <Text className="text-secondary font-semibold text-sm">Set as default address</Text>
                <Switch
                  value={addrIsDefault}
                  onValueChange={setAddrIsDefault}
                  trackColor={{ false: '#E2E8F0', true: '#FED7D7' }}
                  thumbColor={addrIsDefault ? '#E23744' : '#F4F6FB'}
                />
              </View>

              <Button
                title="Add Address"
                onPress={handleAddAddress}
                loading={loading}
              />
            </View>
          ) : (
            <View>
              {addresses.length === 0 ? (
                <View className="py-8 items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                  <Ionicons name="location-outline" size={32} color="#A0A5B1" className="mb-2" />
                  <Text className="text-secondaryLight text-xs font-semibold">No addresses saved yet</Text>
                </View>
              ) : (
                addresses.map(addr => (
                  <View key={addr.id} className="flex-row items-start p-4 border border-gray-100 rounded-2xl mb-3 bg-white">
                    <Ionicons
                      name={addr.label === 'Home' ? 'home-outline' : addr.label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                      size={20}
                      color={theme.colors.primary}
                      style={{ marginRight: 12, marginTop: 2 }}
                    />
                    <View className="flex-grow flex-1 mr-4">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-secondary font-bold text-sm mr-2">{addr.label}</Text>
                        {addr.is_default && (
                          <View className="bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Text className="text-veg font-black text-[9px]">DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-secondaryLight text-xs leading-4">
                        {addr.address_line}, {addr.city} - {addr.pincode}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteAddress(addr.id)} className="p-1">
                      <Ionicons name="trash-outline" size={18} color="#C93B3B" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* 3. Settings & Log Out */}
        <View className="px-6 py-6 mb-16">
          <Button
            title="Log Out"
            onPress={signOut}
            variant="outline"
            icon={<Ionicons name="log-out" size={20} color={theme.colors.primary} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
