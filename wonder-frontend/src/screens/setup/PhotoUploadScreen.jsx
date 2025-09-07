import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import apiService from '../../services/api';

const PhotoUploadScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [photos, setPhotos] = useState(user?.photos || []);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadPhoto = async (uri) => {
    try {
      setIsUploading(true);
      
      const response = await apiService.uploadPhoto(uri);
      
      if (response.success) {
        setPhotos(prev => [...prev, response.data.photoUrl]);
        updateUser({ photos: [...photos, response.data.photoUrl] });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (index) => {
    try {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);
      updateUser({ photos: updatedPhotos });
      
      // Note: In production, you'd also delete from server
    } catch (error) {
      Alert.alert('Error', 'Failed to remove photo');
    }
  };

  const handleNext = () => {
    if (photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }
    navigation.navigate('Preferences' );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.header}
      >
        <Text style={styles.title}>Add your photos</Text>
        <Text style={styles.subtitle}>Show off your best self</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={[styles.photoSlot, { backgroundColor: theme.card }]}>
              {photos[index] ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photos[index] }} style={styles.photo} />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => Alert.alert(
                    'Add Photo',
                    'Choose how to add a photo',
                    [
                      { text: 'Camera', onPress: takePhoto },
                      { text: 'Photo Library', onPress: pickImage },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  )}
                  style={styles.addPhotoButton}
                >
                  <Ionicons name="add" size={32} color={theme.textSecondary} />
                  <Text style={[styles.addPhotoText, { color: theme.textSecondary }]}>
                    Add Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.tips}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>Photo Tips:</Text>
          <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
            • Use clear, high-quality photos{'\n'}
            • Show your face clearly{'\n'}
            • Include photos of your hobbies{'\n'}
            • Avoid group photos as your first photo{'\n'}
            • Add 3-6 photos for best results
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={photos.length === 0 || isUploading}
          style={[
            styles.nextButton,
            { backgroundColor: theme.primary },
            (photos.length === 0 || isUploading) && { opacity: 0.7 }
          ]}
        >
          <Text style={styles.nextButtonText}>
            {isUploading ? 'Uploading...' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  photoSlot: {
    width: (width - 52) / 2,
    height: (width - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoContainer: {
    width: '100%',
    height: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addPhotoText: {
    fontSize: 14,
    marginTop: 8,
  },
  tips: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default PhotoUploadScreen;