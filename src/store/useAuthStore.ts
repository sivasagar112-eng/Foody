// src/store/useAuthStore.ts
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { storage } from '../utils/storage';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  is_default: boolean;
}

interface AuthState {
  user: Profile | null;
  session: any | null;
  addresses: Address[];
  loading: boolean;
  initialized: boolean;
  hasCompletedOnboarding: boolean;
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signUp: (fullName: string, email: string, phone: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  loadProfile: (userId: string) => Promise<void>;
  loadAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'user_id'>) => Promise<{ error: string | null }>;
  deleteAddress: (id: string) => Promise<{ error: string | null }>;
  updateProfile: (fullName: string, phone: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  addresses: [],
  loading: false,
  initialized: false,
  hasCompletedOnboarding: false,

  initialize: async () => {
    try {
      const onboardingVal = await storage.getItem('foody_onboarding_completed');
      const sessionStr = await storage.getItem('foody_session');
      const hasCompletedOnboarding = onboardingVal === 'true';

      if (sessionStr) {
        const parsedSession = JSON.parse(sessionStr);
        set({ session: parsedSession, hasCompletedOnboarding });
        // Retrieve profile and address data
        await get().loadProfile(parsedSession.user.id);
        await get().loadAddresses();
      } else {
        set({ hasCompletedOnboarding });
      }
    } catch (e) {
      console.error('Auth store initialization error:', e);
    } finally {
      set({ initialized: true });
    }
  },

  completeOnboarding: async () => {
    await storage.setItem('foody_onboarding_completed', 'true');
    set({ hasCompletedOnboarding: true });
  },

  signUp: async (fullName, email, phone, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) throw error;

      // In live mode, they might need email verification before profile creation
      // In mock mode, the session/user is returned immediately
      if (data.session) {
        await storage.setItem('foody_session', JSON.stringify(data.session));
        set({ session: data.session });
        await get().loadProfile(data.user.id);
        await get().loadAddresses();
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Registration failed' };
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        await storage.setItem('foody_session', JSON.stringify(data.session));
        set({ session: data.session });
        await get().loadProfile(data.user.id);
        await get().loadAddresses();
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    } finally {
      set({ loading: false });
    }
  },

  sendOtp: async (phone) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'OTP sending failed' };
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async (phone, token) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) throw error;

      if (data.session) {
        await storage.setItem('foody_session', JSON.stringify(data.session));
        set({ session: data.session });
        await get().loadProfile(data.user.id);
        await get().loadAddresses();
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'OTP verification failed' };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      await storage.removeItem('foody_session');
      set({ user: null, session: null, addresses: [], loading: false });
    }
  },

  resetPassword: async (email) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Reset password request failed' };
    } finally {
      set({ loading: false });
    }
  },

  loadProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Fallback profile if row doesn't exist yet (useful in live if trigger is delayed)
        const currentUser = get().session?.user;
        set({
          user: {
            id: userId,
            full_name: currentUser?.user_metadata?.full_name || 'Foody User',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
          }
        });
      } else {
        set({ user: data });
      }
    } catch (e) {
      console.error('Failed to load user profile:', e);
    }
  },

  loadAddresses: async () => {
    const session = get().session;
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;
      set({ addresses: data || [] });
    } catch (e) {
      console.error('Failed to load addresses:', e);
    }
  },

  addAddress: async (address) => {
    const session = get().session;
    if (!session) return { error: 'Not authenticated' };

    try {
      // If address is set as default, we might need to reset others locally
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: session.user.id,
        });

      if (error) throw error;

      await get().loadAddresses();
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to add address' };
    }
  },

  deleteAddress: async (id) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().loadAddresses();
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to delete address' };
    }
  },

  updateProfile: async (fullName, phone) => {
    const session = get().session;
    if (!session) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      await get().loadProfile(session.user.id);
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Failed to update profile' };
    }
  }
}));
