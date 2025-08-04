import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { GiftedChat, IMessage, User as ChatUser } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import socketService from '@/services/socket';
import apiService from '@/services/api';

interface ChatRouteParams {
  match: {
    matchId: string;
    matchedUser: {
      id: string;
      name: string;
      age: number;
      photos: string[];
      occupation: string;
    };
  };
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const { match } = route.params as ChatRouteParams;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    return () => {
      socketService.off('message:new');
      socketService.off('typing:start');
      socketService.off('typing:stop');
    };
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMessages(match.matchId);
      if (response.success) {
        const formattedMessages = response.data.messages.map((msg: any) => ({
          _id: msg._id,
          text: msg.content,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.senderId,
            name: msg.senderId === user?.id ? user.name : match.matchedUser.name,
            avatar: msg.senderId === user?.id 
              ? user?.photos[0] 
              : match.matchedUser.photos[0],
          },
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((data) => {
      if (data.matchId === match.matchId) {
        const newMessage: IMessage = {
          _id: data.message._id,
          text: data.message.content,
          createdAt: new Date(data.message.createdAt),
          user: {
            _id: data.message.senderId,
            name: data.message.senderId === user?.id ? user.name : match.matchedUser.name,
            avatar: data.message.senderId === user?.id 
              ? user?.photos[0] 
              : match.matchedUser.photos[0],
          },
        };
        setMessages(prev => GiftedChat.append(prev, [newMessage]));
      }
    });

    socketService.onTypingStart((data) => {
      if (data.matchId === match.matchId && data.userId !== user?.id) {
        setIsTyping(true);
      }
    });

    socketService.onTypingStop((data) => {
      if (data.matchId === match.matchId && data.userId !== user?.id) {
        setIsTyping(false);
      }
    });
  };

  const onSend = async (newMessages: IMessage[] = []) => {
    try {
      const message = newMessages[0];
      const response = await apiService.sendMessage(
        match.matchId,
        message.text,
        'text'
      );
      
      if (response.success) {
        setMessages(prev => GiftedChat.append(prev, newMessages));
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const onInputTextChanged = (text: string) => {
    if (text.length > 0) {
      socketService.emitTypingStart(match.matchId);
    } else {
      socketService.emitTypingStop(match.matchId);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.profileInfo}>
        <Image source={{ uri: match.matchedUser.photos[0] }} style={styles.profilePhoto} />
        <View style={styles.profileDetails}>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {match.matchedUser.name}, {match.matchedUser.age}
          </Text>
          <Text style={[styles.profileOccupation, { color: theme.textSecondary }]}>
            {match.matchedUser.occupation}
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          onInputTextChanged={onInputTextChanged}
          user={{
            _id: user?.id || '',
            name: user?.name || '',
            avatar: user?.photos[0] || '',
          }}
          placeholder="Type a message..."
          alwaysShowSend
          scrollToBottom
          infiniteScroll
          isLoadingEarlier={isLoading}
          renderAvatarOnTop
          showUserAvatar
          showAvatarForEveryMessage={false}
          renderUsernameOnMessage
          isTyping={isTyping}
          renderTicks={() => null}
          timeFormat="HH:mm"
          dateFormat="MMM DD"
          renderDay={() => null}
          renderTime={() => null}
          renderAvatar={() => null}
          renderBubble={(props) => (
            <View style={[
              styles.messageBubble,
              {
                backgroundColor: props.position === 'left' 
                  ? theme.surface 
                  : theme.primary,
                alignSelf: props.position === 'left' ? 'flex-start' : 'flex-end',
              }
            ]}>
              <Text style={[
                styles.messageText,
                {
                  color: props.position === 'left' ? theme.text : 'white',
                }
              ]}>
                {props.currentMessage?.text}
              </Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  profileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileOccupation: {
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
});

export default ChatScreen;