import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiService from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photos: string[];
  preferences: {
    ageRange: { min: number; max: number };
    maxDistance: number;
    interestedIn: 'men' | 'women' | 'both';
  };
  isPremium: boolean;
  premiumExpiresAt?: string;
  lastActive: string;
  createdAt: string;
  profileCompletion: {
    photos: boolean;
    bio: boolean;
    preferences: boolean;
    location: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  appleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
    checkAuthStatus();
    setupPushNotifications();
  }, []);

  const setupPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      
      // Send token to backend
      if (user) {
        await apiService.updatePushToken(token);
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const credentials = await Keychain.getInternetCredentials('wonder-token');
      
      if (storedUser && credentials?.password) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Refresh user data from server
        await refreshUser();
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.success) {
        const { user: userData, token } = response.data;
     // Store token securely
        await Keychain.setInternetCredentials('wonder-token', email, token);
        
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.signup(userData);
      
      if (response.success) {
        const { user: newUser, token } = response.data;
        
        // Store token securely
        await Keychain.setInternetCredentials('wonder-token', newUser.email, token);
        
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        
        setUser(newUser);
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const appleSignIn = async () => {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign In is only available on iOS');
      }

      setIsLoading(true);
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const response = await apiService.appleSignIn(credential.identityToken);
        
        if (response.success) {
          const { user: userData, token } = response.data;
          
          // Store token securely
          await Keychain.setInternetCredentials('wonder-token', userData.email, token);
          
          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          
          setUser(userData);
          
          // Haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          throw new Error(response.message);
        }
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled Apple Sign In
        return;
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await Keychain.resetInternetCredentials('wonder-token');
      await AsyncStorage.removeItem('user');
      
      setUser(null);
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        const userData = response.data.user;
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    appleSignIn,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};