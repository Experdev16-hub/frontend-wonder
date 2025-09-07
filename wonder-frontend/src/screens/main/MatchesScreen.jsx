import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { useMatch } from '../../store/MatchContext';
import { useTheme } from '../../store/ThemeContext';
import apiService from '../../services/api';



const MatchesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { newMatches, clearNewMatches } = useMatch();
  const { theme } = useTheme();
  
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMatchList();
      if (response.success) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      console.error('Load matches error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleMatchPress = (match) => {
    navigation.navigate('Chat' , { match } );
  };

  const handleUnmatch = async (matchId) => {
    try {
      await apiService.unmatch(matchId);
      setMatches(prev => prev.filter(match => match.matchId !== matchId));
    } catch (error) {
      console.error('Unmatch error:', error);
    }
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={[styles.matchCard, { backgroundColor: theme.card }]}
      onPress={() => handleMatchPress(item)}
    >
      <View style={styles.matchInfo}>
        <Image source={{ uri: item.matchedUser.photos[0] }} style={styles.matchPhoto} />
        <View style={styles.matchDetails}>
          <Text style={[styles.matchName, { color: theme.text }]}>
            {item.matchedUser.name}, {item.matchedUser.age}
          </Text>
          <Text style={[styles.matchOccupation, { color: theme.textSecondary }]}>
            {item.matchedUser.occupation}
          </Text>
          {item.lastMessage && (
            <Text style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.matchActions}>
        <TouchableOpacity
          onPress={() => handleUnmatch(item.matchId)}
          style={styles.unmatchButton}
        >
          <Ionicons name="close-circle-outline" size={24} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: theme.text }]}>Your Matches</Text>
      {newMatches.length > 0 && (
        <TouchableOpacity
          onPress={clearNewMatches}
          style={[styles.newMatchesBadge, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.newMatchesText}>{newMatches.length} new</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No matches yet</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Start swiping to find your perfect match!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newMatchesBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  newMatchesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
  },
  matchInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  matchDetails: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchOccupation: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  matchActions: {
    marginLeft: 12,
  },
  unmatchButton: {
    padding: 4,
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
  },
});

export default MatchesScreen;