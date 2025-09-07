import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../store/AuthContext';
import { useMatch } from '../../store/MatchContext';
import { useTheme } from '../../store/ThemeContext';
import apiService from '../../services/api';

const { width, height } = Dimensions.get('window');


const SwipeScreen = () => {
  const { user } = useAuth();
  const { addMatch } = useMatch();
  const { theme } = useTheme();
  
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<Swiper<PotentialMatch>>(null);

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMatches();
      if (response.success) {
        setPotentialMatches(response.data.matches);
      }
    } catch (error) {
      console.error('Load matches error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction, swipedCardIndex) => {
    const swipedUser = potentialMatches[swipedCardIndex];
    
    try {
      const action = direction === 'right' ? 'like' : 'pass';
      const response = await apiService.swipe(swipedUser.id, action);
      
      if (action === 'like' && response.data.isMatch) {
        // New match!
        addMatch({
          matchId: response.data.match.matchId,
          matchedUser: response.data.match.matchedUser,
          createdAt: new Date().toISOString(),
        });
      }
      
      // Haptic feedback
      Haptics.impactAsync(
        direction === 'right' 
          ? Haptics.ImpactFeedbackStyle.Medium 
          : Haptics.ImpactFeedbackStyle.Light
      );
      
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleSuperLike = async () => {
    if (!potentialMatches[currentIndex]) return;
    
    try {
      const response = await apiService.swipe(potentialMatches[currentIndex].id, 'like');
      
      if (response.data.isMatch) {
        addMatch({
          matchId: response.data.match.matchId,
          matchedUser: response.data.match.matchedUser,
          createdAt: new Date().toISOString(),
        });
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      swiperRef.current?.swipeRight();
      
    } catch (error) {
      console.error('Super like error:', error);
    }
  };

  const handleRewind = () => {
    // This would require backend support for rewind functionality
    Alert.alert('Premium Feature', 'Rewind is available for premium users!');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Finding matches...</Text>
      </View>
    );
  }

  if (potentialMatches.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No more profiles</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Check back later for new matches!
          </Text>
          <TouchableOpacity
            onPress={loadPotentialMatches}
            style={[styles.refreshButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Swiper
        ref={swiperRef}
        cards={potentialMatches}
        renderCard={(card) => (
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Image source={{ uri: card.photos[0] }} style={styles.cardImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardOverlay}
            >
              <View style={styles.cardContent}>
<Text style={styles.cardName}>
                  {card.name}, {card.age}
                </Text>
                <Text style={styles.cardOccupation}>{card.occupation}</Text>
                {card.bio && (
                  <Text style={styles.cardBio} numberOfLines={2}>
                    {card.bio}
                  </Text>
                )}
                {card.aiScore && (
                  <View style={styles.aiScoreContainer}>
                    <Text style={styles.aiScoreText}>
                      {card.aiScore.score}% Match
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        )}
        onSwipedLeft={(index) => handleSwipe('left', index)}
        onSwipedRight={(index) => handleSwipe('right', index)}
        onSwipedAll={() => setCurrentIndex(0)}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        cardVerticalMargin={20}
        cardHorizontalMargin={20}
        animateOverlayLabelsOpacity
        overlayLabels={{
          left: {
            element: (
              <View style={[styles.overlayLabel, styles.leftLabel]}>
                <Ionicons name="close" size={40} color="white" />
                <Text style={styles.overlayLabelText}>NOPE</Text>
              </View>
            ),
            style: {
              wrapper: styles.overlayLabelWrapper,
            },
          },
          right: {
            element: (
              <View style={[styles.overlayLabel, styles.rightLabel]}>
                <Ionicons name="heart" size={40} color="white" />
                <Text style={styles.overlayLabelText}>LIKE</Text>
              </View>
            ),
            style: {
              wrapper: styles.overlayLabelWrapper,
            },
          },
        }}
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={handleRewind}
          style={[styles.actionButton, styles.rewindButton]}
          disabled={!user?.isPremium}
        >
          <Ionicons name="refresh" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeLeft()}
          style={[styles.actionButton, styles.passButton]}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSuperLike}
          style={[styles.actionButton, styles.superLikeButton]}
        >
          <Ionicons name="star" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => swiperRef.current?.swipeRight()}
          style={[styles.actionButton, styles.likeButton]}
        >
          <Ionicons name="heart" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {/* Boost feature */}}
          style={[styles.actionButton, styles.boostButton]}
          disabled={!user?.isPremium}
        >
          <Ionicons name="flash" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardOccupation: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  cardBio: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  aiScoreContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  aiScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  overlayLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
  },
  leftLabel: {
    backgroundColor: '#FF3B30',
  },
  rightLabel: {
    backgroundColor: '#34C759',
  },
  overlayLabelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  overlayLabelWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewindButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  passButton: {
    backgroundColor: '#FF3B30',
  },
  superLikeButton: {
    backgroundColor: '#007AFF',
  },
  likeButton: {
    backgroundColor: '#34C759',
  },
  boostButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default SwipeScreen;