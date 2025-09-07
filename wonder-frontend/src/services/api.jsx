import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { getUniqueId } from 'react-native-device-info';


const API_URL = Platform.select({
  ios: 'http://localhost:3000',
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'X-Device-ID': getUniqueId(),
    'X-Platform': Platform.OS,
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => api.post('/auth/signup', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const appleLogin = (token) => api.post('/auth/apple', { identityToken: token });
export const uploadPhoto = (formData) => api.post('/users/photos', formData);
export const findLookalikes = (formData) => api.post('/users/lookalike', formData);
export const getPotentialMatches = () => api.get('/users/matches');
export const swipeUser = (targetId, action) => api.post('/matches/swipe', { targetId, action });

export default api;