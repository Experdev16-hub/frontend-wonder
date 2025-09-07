import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import apiService from '../../services/api';

const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!name || !age || !occupation) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 18 || ageNum > 100) {
      Alert.alert('Error', 'Age must be between 18 and 100');
      return;
    }

    try {
      setIsLoading(true);
      
      const profileData = {
        name,
        age: ageNum,
        occupation,
        bio,
      };

      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        updateUser(profileData);
        navigation.navigate('PhotoUpload' );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.header}
      >
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help us find your perfect match</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border 
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Age *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border 
              }]}
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Occupation *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border 
              }]}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="What do you do?"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border 
              }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {bio.length}/500
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading}
          style={[
            styles.nextButton,
            { backgroundColor: theme.primary },
            isLoading && { opacity: 0.7 }
          ]}
        >
          <Text style={styles.nextButtonText}>
            {isLoading ? 'Saving...' : 'Next'}
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
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

export default ProfileSetupScreen;