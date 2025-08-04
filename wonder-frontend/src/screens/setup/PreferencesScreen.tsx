import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import apiService from '@/services/api';

const PreferencesScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  
  const [interestedIn, setInterestedIn] = useState<'men' | 'women' | 'both'>(
    user?.preferences?.interestedIn || 'both'
  );
  const [ageRange, setAgeRange] = useState({
    min: user?.preferences?.ageRange?.min || 18,
    max: user?.preferences?.ageRange?.max || 35,
  });
  const [maxDistance, setMaxDistance] = useState(
    user?.preferences?.maxDistance || 25
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      const preferences = {
        interestedIn,
        ageRange,
        maxDistance,
      };

      const response = await apiService.updateProfile({ preferences });
      
      if (response.success) {
        updateUser({ preferences });
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAgeRangeSlider = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Age Range</Text>
      <View style={styles.ageRangeContainer}>
        <Text style={[styles.ageText, { color: theme.text }]}>
          {ageRange.min} - {ageRange.max} years old
        </Text>
        <View style={styles.ageSliders}>
          <View style={styles.ageSlider}>
            <Text style={[styles.ageLabel, { color: theme.textSecondary }]}>Min</Text>
            <View style={styles.ageButtons}>
              {[18, 20, 25, 30, 35, 40, 45, 50].map(age => (
                <TouchableOpacity
                  key={age}
                  onPress={() => setAgeRange(prev => ({ ...prev, min: age }))}
                  style={[
                    styles.ageButton,
                    { backgroundColor: ageRange.min === age ? theme.primary : theme.surface },
                  ]}
                >
                  <Text style={[
                    styles.ageButtonText,
                    { color: ageRange.min === age ? 'white' : theme.text }
                  ]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.ageSlider}>
            <Text style={[styles.ageLabel, { color: theme.textSecondary }]}>Max</Text>
            <View style={styles.ageButtons}>
              {[25, 30, 35, 40, 45, 50, 55, 60].map(age => (
                <TouchableOpacity
                  key={age}
                  onPress={() => setAgeRange(prev => ({ ...prev, max: age }))}
                  style={[
                    styles.ageButton,
                    { backgroundColor: ageRange.max === age ? theme.primary : theme.surface },
                  ]}
                >
                  <Text style={[
                    styles.ageButtonText,
                    { color: ageRange.max === age ? 'white' : theme.text }
                  ]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
        </View>
  );

  const renderInterestedIn = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Show Me</Text>
      <View style={styles.interestedInButtons}>
        {(['men', 'women', 'both'] as const).map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setInterestedIn(option)}
            style={[
              styles.interestedInButton,
              { backgroundColor: interestedIn === option ? theme.primary : theme.surface }
            ]}
          >
            <Text style={[
              styles.interestedInText,
              { color: interestedIn === option ? 'white' : theme.text }
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDistance = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Maximum Distance</Text>
      <View style={styles.distanceContainer}>
        {[5, 10, 25, 50, 100].map(distance => (
          <TouchableOpacity
            key={distance}
            onPress={() => setMaxDistance(distance)}
            style={[
              styles.distanceButton,
              { backgroundColor: maxDistance === distance ? theme.primary : theme.surface }
            ]}
          >
            <Text style={[
              styles.distanceText,
              { color: maxDistance === distance ? 'white' : theme.text }
            ]}>
              {distance} km
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.header}
      >
        <Text style={styles.title}>Your Preferences</Text>
        <Text style={styles.subtitle}>Let us know who you want to meet</Text>
      </LinearGradient>

      {renderInterestedIn()}
      {renderAgeRangeSlider()}
      {renderDistance()}

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleComplete}
          disabled={isLoading}
          style={[
            styles.completeButton,
            { backgroundColor: theme.primary },
            isLoading && { opacity: 0.7 }
          ]}
        >
          <Text style={styles.completeButtonText}>
            {isLoading ? 'Saving...' : 'Complete'}
          </Text>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  interestedInButtons: { flexDirection: 'row', gap: 12 },
  interestedInButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  interestedInText: { fontSize: 16, fontWeight: '600' },
  ageRangeContainer: { marginTop: 8 },
  ageText: { fontSize: 16, marginBottom: 8 },
  ageSliders: { flexDirection: 'row', gap: 16 },
  ageSlider: { flex: 1 },
  ageLabel: { fontSize: 14, marginBottom: 4 },
  ageButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ageButton: { padding: 8, borderRadius: 8, minWidth: 40, alignItems: 'center' },
  ageButtonText: { fontSize: 14 },
  distanceContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  distanceButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  distanceText: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 20, paddingBottom: 40 },
  completeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 28 },
  completeButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 8 },
});

export default PreferencesScreen;