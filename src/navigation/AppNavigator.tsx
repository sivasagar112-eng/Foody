// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

// Import Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OTPScreen from '../screens/OTPScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  RestaurantDetail: { restaurantId: string; name: string };
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { phoneMode?: boolean } | undefined;
  SignUp: undefined;
  OTP: { phone: string };
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  FavoritesTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="OTP" component={OTPScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'HomeTab') iconName = 'home-outline';
        else if (route.name === 'SearchTab') iconName = 'search-outline';
        else if (route.name === 'FavoritesTab') iconName = 'heart-outline';
        else if (route.name === 'OrdersTab') iconName = 'receipt-outline';
        else if (route.name === 'ProfileTab') iconName = 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.secondaryLight,
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
    <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarLabel: 'Favorites' }} />
    <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { session, initialized, hasCompletedOnboarding, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !session ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={TabNavigator} />
            <RootStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <RootStack.Screen name="Cart" component={CartScreen} />
            <RootStack.Screen name="Checkout" component={CheckoutScreen} />
            <RootStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
