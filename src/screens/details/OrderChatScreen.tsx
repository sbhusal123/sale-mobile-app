import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Divider,
  IconButton,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { WS_BASE_URL } from '../../api/client';
import apiClient from '../../api/client';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: string;
}

const ShimmerPlaceholder = ({ width, height, borderRadius = 12, style }: any) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: '#E1E9EE', borderRadius },
        style,
        animatedStyle,
      ]}
    />
  );
};

export default function OrderChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, chatSessionId } = route.params || {};
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, orders } = useAuth();
  const ws = useRef<WebSocket | null>(null);

  const currentOrder = orders.find((o) => o.id === Number(id));
  const chatSession = chatSessionId || currentOrder?.chat_session;

  const [message, setMessage] = useState('');
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatSession) return;
      setIsMessagesLoading(true);
      try {
        const [msgRes, sessionRes] = await Promise.all([
          apiClient.get(`messages/?session_id=${chatSession}`),
          apiClient.get(`chat-sessions/${chatSession}/`),
        ]);

        const historicalMessages = msgRes.data.map((m: any) => ({
          id: String(m.id),
          text: m.message,
          sender: m.sender === 'CHAT_USER' ? 'user' : (m.sender === 'AI_ASSISTANT' ? 'bot' : 'agent'),
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })).reverse(); // Reverse for inverted FlatList (latest at index 0)
        setMessages(historicalMessages);

        setSessionDetails(sessionRes.data);
        if (sessionRes.data.reply_from === 'HUMAN_ASSISTANT') {
          setIsHumanAgent(true);
        } else {
          setIsHumanAgent(false);
        }
      } catch (err) {
        console.error('Error fetching messages or session:', err);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [chatSession]);

  useEffect(() => {
    if (!chatSession || !user?.accessToken) return;

    const wsUrl = `${WS_BASE_URL}${chatSession}/?token=${user.accessToken}`;
    console.log('Connecting to WS:', wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WS Connected');
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('WS Message:', data);

        if (data.message) {
          const receivedMessage: Message = {
            id: String(data.id || Date.now()),
            text: data.message,
            sender: data.sender === 'CHAT_USER' ? 'user' : (data.sender === 'AI_ASSISTANT' ? 'bot' : 'agent'),
            timestamp: new Date(data.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          
          setMessages((prev) => {
            // Check for potential duplicate if it's an echo from our own send
            const exists = prev.some((m) => m.id === receivedMessage.id);
            if (exists) return prev;
            return [receivedMessage, ...prev]; // Newest at index 0
          });
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.current.onerror = (e) => {
      console.error('WS Error:', e);
    };

    ws.current.onclose = (e) => {
      console.log('WS Closed:', e.code, e.reason);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chatSession, user?.accessToken]);

  const handleSendMessage = async () => {
    if (message.trim().length === 0 || !chatSession) return;

    if (!isHumanAgent) {
      Alert.alert(
        'मानव मोड आवश्यक छ',
        'प्रत्यूत्तर पठाउनको लागि कृपया पहिले मानव एजेन्ट मोडमा स्विच गर्नुहोस्।'
      );
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        message: message,
        sender: 'HUMAN_ASSISTANT',
        session: chatSession,
      };

      await apiClient.post('chat/', payload);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const toggleReplyFrom = async (value: boolean) => {
    if (!chatSession) return;
    setIsSwitching(true);
    try {
      const replyFrom = value ? 'HUMAN_ASSISTANT' : 'AI_ASSISTANT';
      await apiClient.patch(`chat-sessions/${chatSession}/`, {
        reply_from: replyFrom,
      });
      setIsHumanAgent(value);
    } catch (err) {
      console.error('Error toggling reply_from:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.otherMessage,
        ]}
      >
        {!isUser && (
          <Avatar.Icon
            size={32}
            icon={item.sender === 'bot' ? 'robot' : 'account'}
            style={[
              styles.avatar,
              { backgroundColor: item.sender === 'bot' ? theme.colors.secondary : theme.colors.primary },
            ]}
          />
        )}
        <Surface
          elevation={1}
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser
                ? theme.colors.primary
                : theme.colors.surfaceVariant,
              borderBottomRightRadius: isUser ? 4 : 20,
              borderBottomLeftRadius: isUser ? 20 : 4,
            },
          ]}
        >
          <Text
            style={{
              color: isUser ? '#fff' : theme.colors.onSurfaceVariant,
            }}
          >
            {item.text}
          </Text>
          <Text
            variant="labelSmall"
            style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.outline },
            ]}
          >
            {item.timestamp}
          </Text>
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Surface elevation={2} style={[styles.header, { backgroundColor: theme.colors.surface, paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <BackButton />
          <View style={styles.headerTitleContainer}>
            <Text variant="titleLarge" style={styles.headerTitle} numberOfLines={1}>
              {id ? `अर्डर कुराकानी #${id}` : (sessionDetails?.chat_user_details?.name || 'कुराकानी')}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
              {isHumanAgent ? 'मानव प्रतिनिधि सक्रिय' : 'बोट सक्रिय'}
            </Text>
          </View>
        </View>

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.agentSwitchRow}>
          <View style={styles.switchLabelContainer}>
            <Text 
              variant="labelMedium" 
              style={[styles.switchLabel, !isHumanAgent ? { color: theme.colors.primary, opacity: 1 } : { opacity: 0.5 }]}
            >
              AI प्रतिनिधि
            </Text>
            {isSwitching ? (
              <ActivityIndicator size={24} color={theme.colors.primary} style={{ marginHorizontal: 12 }} />
            ) : (
              <Switch
                value={isHumanAgent}
                onValueChange={toggleReplyFrom}
                color={theme.colors.primary}
              />
            )}
            <Text 
              variant="labelMedium" 
              style={[styles.switchLabel, isHumanAgent ? { color: theme.colors.primary, opacity: 1 } : { opacity: 0.5 }]}
            >
              मानव प्रतिनिधि
            </Text>
          </View>
        </View>
      </Surface>

      {isMessagesLoading ? (
        <View style={styles.shimmerContainer}>
          <ShimmerPlaceholder width="70%" height={60} style={{ alignSelf: 'flex-start', marginBottom: 16 }} />
          <ShimmerPlaceholder width="50%" height={40} style={{ alignSelf: 'flex-end', marginBottom: 16 }} />
          <ShimmerPlaceholder width="80%" height={80} style={{ alignSelf: 'flex-start', marginBottom: 16 }} />
          <ShimmerPlaceholder width="40%" height={40} style={{ alignSelf: 'flex-end', marginBottom: 16 }} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          inverted
          keyboardShouldPersistTaps="handled"
        />
      )}

      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.colors.surface,
          paddingBottom: (Platform.OS === 'ios' ? 12 : 8) + insets.bottom,
        }
      ]}>
        <TextInput
          placeholder="यहाँ लेख्वनुहोस्..."
          value={message}
          onChangeText={setMessage}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
          mode="flat"
          style={[styles.input, { backgroundColor: theme.colors.surface }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          multiline
        />
        <IconButton
          icon="send"
          mode="contained"
          containerColor={theme.colors.primary}
          iconColor="#fff"
          size={24}
          onPress={handleSendMessage}
          disabled={isSending || message.trim().length === 0}
          loading={isSending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  agentSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  switchLabel: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    flexShrink: 1,
  },
  shimmerContainer: {
    padding: 16,
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
    alignSelf: 'flex-end',
    elevation: 2,
  },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timestamp: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 15,
    backgroundColor: 'transparent',
  },
});
