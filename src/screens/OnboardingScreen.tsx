// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { View, Text, Image, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Discover restaurants near you',
    description: 'Explore the best restaurants, local delicacies, and global cuisines in your area.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
  },
  {
    id: 2,
    title: 'Order in a few taps',
    description: 'Ordering is as quick as double tapping. Customize your meal and checkout seamlessly.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
  },
  {
    id: 3,
    title: 'Fast delivery to your door',
    description: 'Track your driver in real-time and get hot, fresh meals delivered straight to your door.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=800'
  }
];

export default function OnboardingScreen() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);

  const handleNext = () => {
    if (currentIdx < slides.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-primary font-black text-2xl tracking-tighter">Foody</Text>
        {currentIdx < slides.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding}>
            <Text className="text-secondaryLight font-semibold text-sm">Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={{ uri: slides[currentIdx].image }}
          className="w-full h-72 rounded-3xl object-cover mb-8 shadow-md"
        />

        <Text className="text-secondary font-black text-2xl text-center mb-3">
          {slides[currentIdx].title}
        </Text>

        <Text className="text-secondaryLight text-base text-center px-4 leading-6">
          {slides[currentIdx].description}
        </Text>
      </View>

      {/* Footer controls */}
      <View className="px-6 py-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center items-center mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIdx ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </View>

        <Button
          title={currentIdx === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}
