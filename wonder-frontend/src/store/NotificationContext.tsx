// store/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Define types for context
type NotificationContextType = {
  scheduleMotivationNotification: (message: string, secondsFromNow?: number) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for notifications');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (status !== 'granted') {
      const { status: askStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = askStatus;
    }

    setPermissionGranted(finalStatus === 'granted');
    if (finalStatus !== 'granted') {
      Alert.alert('Notification permissions not granted!');
    }
  };

  const scheduleMotivationNotification = async (message: string, secondsFromNow: number = 10) => {
    if (!permissionGranted) {
      console.warn('Notification permission not granted.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 Stay Focused!',
        body: message,
        sound: true,
      },
      trigger: {
        seconds: secondsFromNow,
      },
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return (
    <NotificationContext.Provider
      value={{
        scheduleMotivationNotification,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};