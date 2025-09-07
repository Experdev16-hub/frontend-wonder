import io from 'socket.io-client';
import { API_URL } from './api';
import { Platform } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: any = null;

export const initSocket = async () => {
  const token = await AsyncStorage.getItem('authToken');
  
  socket = io(API_URL, {
    transports: ['websocket'],
    query: {
      deviceId: getUniqueId(),
      platform: Platform.OS,
    },
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const socketEvents = {
  NEW_MATCH: 'new_match',
  NEW_MESSAGE: 'new_message',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MESSAGE_READ: 'message_read',
};