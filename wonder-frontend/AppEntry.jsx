import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { ThemeProvider } from './src/store/ThemeContext';
import { NotificationProvider } from './src/store/NotificationContext';
import { MatchProvider } from './src/store/MatchContext';




SplashScreen.preventAutoHideAsync();

export default function App() {
  

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <MatchProvider>
                <NavigationContainer>
                  <StatusBar style="light" />
                  <AppNavigator onLayout={onLayoutRootView} />
                </NavigationContainer>
              </MatchProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
