import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import apiService from '@/services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handlePremiumUpgrade = () => {
    navigation.navigate('Premium' as never);
  };

  const handleLookalikeSearch = () => {
    navigation.navigate('Lookalike' as never);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your photos and bio',
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      icon: 'heart-outline',
      title: 'My Matches',
      subtitle: ${user?.matches?.length || 0} matches,
      onPress: () => navigation.navigate('Matches' as never),
    },
    {
      icon: 'camera-outline',
      title: 'Lookalike Search',
      subtitle: 'Find people who look like your type',
      onPress: handleLookalikeSearch,
    },
    {
      icon: 'star-outline',
      title: 'Premium Features',
      subtitle: user?.isPremium ? 'Active' : 'Upgrade now',
      onPress: handlePremiumUpgrade,
      isPremium: true,
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Privacy, notifications, and more',
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      onPress: () => Alert.alert('Help', 'Contact support at support@wonderdating.app'),
    },
    {
      icon: 'log-out-outline',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <Image source={{ uri: user?.photos[0] }} style={styles.profilePhoto} />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name}, {user?.age}</Text>
            <Text style={styles.profileOccupation}>{user?.occupation}</Text>
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="white" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Profile Completion */}
      <View style={[styles.completionCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.completionTitle, { color: theme.text }]}>
          Profile Completion
        </Text>
        <View style={styles.completionBar}>
          <View 
            style={[
              styles.completionProgress, 
              { 
                width: `${user?.profileCompletion ? 
                  Object.values(user.profileCompletion).filter(Boolean).length * 25 : 0}%`,
                backgroundColor: theme.primary 
              }
            ]} 
          />
        </View>
        <Text style={[styles.completionText, { color: theme.textSecondary }]}>
          {user?.profileCompletion ? 
            Object.values(user.profileCompletion).filter(Boolean).length * 25 : 0}% complete
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <View style={[
                styles.menuIcon, 
                { 
                  backgroundColor: item.isDestructive 
                    ? theme.error 
                    : item.isPremium && !user?.isPremium 
                      ? theme.primary 
                      : theme.surface 
                }
              ]}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.isDestructive ? 'white' : theme.text} 
                />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Wonder Dating v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileOccupation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completionCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  completionBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  completionProgress: {
    height: '100%',
    borderRadius: 4,
  },
  completionText: {
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 12,
  },
});

export default ProfileScreen;