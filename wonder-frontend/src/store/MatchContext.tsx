import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

interface Match {
  matchId: string;
  matchedUser: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    occupation: string;
  };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

interface MatchContextType {
  matches: Match[];
  newMatches: Match[];
  addMatch: (match: Match) => void;
  clearNewMatches: () => void;
  showMatchAlert: (matchedUserName: string) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [newMatches, setNewMatches] = useState<Match[]>([]);

  const addMatch = (match: Match) => {
    setMatches(prev => [match, ...prev]);
    setNewMatches(prev => [match, ...prev]);
    
    // Haptic feedback for new match
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Show match alert
    showMatchAlert(match.matchedUser.name);
  };

  const clearNewMatches = () => {
    setNewMatches([]);
  };

  const showMatchAlert = (matchedUserName: string) => {
    Alert.alert(
      'New Match! 💕',
      You and ${matchedUserName} liked each other!,
      [
        {
          text: 'Start Chatting',
          style: 'default',
        },
        {
          text: 'Keep Swiping',
          style: 'cancel',
        },
      ]
    );
  };

  const value: MatchContextType = {
    matches,
    newMatches,
    addMatch,
    clearNewMatches,
    showMatchAlert,
  };

  return (
    <MatchContext.Provider value={value}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};