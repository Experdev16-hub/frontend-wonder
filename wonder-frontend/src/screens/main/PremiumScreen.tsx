import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import apiService from '@/services/api';

const PremiumScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSubscriptionPlans();
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Load plans error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const successUrl = 'wonderdating://premium-success';
      const cancelUrl = 'wonderdating://premium-cancel';
      
      const response = await apiService.createCheckoutSession(
        planId,
        successUrl,
        cancelUrl
      );
      
      if (response.success) {
        // Open Stripe checkout in browser
        await Linking.openURL(response.data.url);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      Alert.alert('Error', 'Failed to start subscription process');
    }
  };

  const premiumFeatures = [
    {
      icon: 'heart',
      title: 'Unlimited Likes',
      description: 'Like as many profiles as you want',
    },
    {
      icon: 'eye',
      title: 'See Who Liked You',
      description: 'Find out who's interested in you',
    },
    {
      icon: 'filter',
      title: 'Advanced Filters',
      description: 'Filter by height, education, and more',
    },
    {
      icon: 'star',
      title: 'Super Likes',
      description: 'Stand out with super likes',
    },
    {
      icon: 'refresh',
      title: 'Rewind',
      description: 'Go back to profiles you passed on',
    },
    {
      icon: 'flash',
      title: 'Boost',
      description: 'Get more visibility for 30 minutes',
    },
  ];

  const vipFeatures = [
    ...premiumFeatures,
    {
      icon: 'checkmark-circle',
      title: 'Priority Support',
      description: 'Get help faster with priority support',
    },
    {
      icon: 'calendar',
      title: 'Exclusive Events',
      description: 'Access to VIP dating events',
    },
    {
      icon: 'analytics',
      title: 'Profile Analytics',
      description: 'See how your profile performs',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.primaryGradient}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Upgrade to Premium</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Current Status */}
      {user?.isPremium && (
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <Ionicons name="checkmark-circle" size={24} color={theme.success} />
          <Text style={[styles.statusText, { color: theme.text }]}>
            You're currently a Premium member
          </Text>
        </View>
      )}

      {/* Plans */}
      <View style={styles.plansContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Choose Your Plan
        </Text>
        
        <View style={styles.planCards}>
          {/* Premium Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              { backgroundColor: theme.card },
              user?.isPremium && styles.disabledCard
            ]}
            onPress={() => handleSubscribe('premium')}
            disabled={user?.isPremium}
          >
            <LinearGradient
              colors={theme.primaryGradient}
              style={styles.planHeader}
            >
              <Text style={styles.planName}>Premium</Text>
              <Text style={styles.planPrice}>$9.99/month</Text>
            </LinearGradient>
            
            <View style={styles.planFeatures}>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name={feature.icon as any} size={16} color={theme.primary} />
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          {/* VIP Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              { backgroundColor: theme.card },
              user?.isPremium && styles.disabledCard
            ]}
            onPress={() => handleSubscribe('vip')}
            disabled={user?.isPremium}
          >
            <LinearGradient
              colors={theme.secondaryGradient}
              style={styles.planHeader}
            >
              <Text style={styles.planName}>VIP</Text>
              <Text style={styles.planPrice}>$19.99/month</Text>
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>MOST POPULAR</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.planFeatures}>
              {vipFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name={feature.icon as any} size={16} color={theme.secondary} />
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms */}
      <View style={styles.termsContainer}>
        <Text style={[styles.termsText, { color: theme.textSecondary }]}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  plansContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  planCards: {
    gap: 20,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledCard: {
    opacity: 0.6,
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  vipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  vipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planFeatures: {
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsContainer: {
    padding: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default PremiumScreen;