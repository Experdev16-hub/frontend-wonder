import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';



const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
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
        // await apiService.updatePushToken(token);
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

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      // FIXED: apiService is commented out, using mock response for now
      // const response = await apiService.login({ email, password });
      
      // Mock response since apiService is not available
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: email,
            profileCompletion: {
              photos: false,
              bio: false
            }
          },
          token: 'mock-token-' + Date.now()
        }
      };
      
      if (mockResponse.success) {
        const { user: userData, token } = mockResponse.data;
        // Store token securely
        await Keychain.setInternetCredentials('wonder-token', email, token);
        
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      // FIXED: apiService is commented out, using mock response for now
      // const response = await apiService.signup(userData);
      
      // Mock response
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: userData.email,
            profileCompletion: {
              photos: false,
              bio: false
            }
          },
          token: 'mock-token-' + Date.now()
        }
      };
      
      if (mockResponse.success) {
        const { user: newUser, token } = mockResponse.data;
       
        // Store token securely
        await Keychain.setInternetCredentials('wonder-token', newUser.email, token);
       
        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
       
        setUser(newUser);
       
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) { // FIXED: Missing catch block opening
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
        // FIXED: apiService is commented out, using mock response for now
        // const response = await apiService.appleSignIn(credential.identityToken);
        
        // Mock response
        const mockResponse = {
          success: true,
          data: {
            user: {
              id: '3',
              email: credential.email || 'apple-user@example.com',
              profileCompletion: {
                photos: false,
                bio: false
              }
            },
            token: 'mock-apple-token-' + Date.now()
          }
        };
        
        if (mockResponse.success) {
          const { user: userData, token } = mockResponse.data;
         
          // Store token securely
          await Keychain.setInternetCredentials('wonder-token', userData.email, token);
          
          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          
          setUser(userData);
          
          // Haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          throw new Error('Apple sign in failed');
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

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      // FIXED: apiService is commented out
      // const response = await apiService.getProfile();
      // if (response.success) {
      //   const userData = response.data.user;
      //   setUser(userData);
      //   await AsyncStorage.setItem('user', JSON.stringify(userData));
      // }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
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