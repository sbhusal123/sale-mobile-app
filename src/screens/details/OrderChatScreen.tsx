import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient, { WS_BASE_URL } from '../../api/client';
import BackButton from '../../components/BackButton';
import LoadingOverlay from '../../components/LoadingOverlay';
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
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, chatSessionId } = route.params || {};
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, orders } = useAuth();
  const ws = useRef<WebSocket | null>(null);

  const currentOrder = id
    ? orders.find((o) => o.id === Number(id))
    : (chatSessionId ? orders.find((o) => o.chat_session === chatSessionId) : undefined);

  const orderId = currentOrder?.id || id;
  const chatSession = chatSessionId || currentOrder?.chat_session;

  const [message, setMessage] = useState('');
  const [isHumanAgent, setIsHumanAgent] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionDetails, setSessionDetails] = useState<any>(null);

  const translateY = useSharedValue(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        translateY.value = withTiming(
          Platform.OS === 'ios' ? -e.endCoordinates.height + 90 : -320,
          { duration: 300 }
        );
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        translateY.value = withTiming(0, { duration: 300 });
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));


  console.log("chatSession", chatSession);
  console.log("orderId", orderId);


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
        })).reverse();
        setMessages(historicalMessages);

        setSessionDetails(sessionRes.data);
        setIsHumanAgent(sessionRes.data.reply_from === 'HUMAN_ASSISTANT');
      } catch (err) {
        console.error('Error fetching messages or session:', err);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [chatSession]);

  const [wsStatus, setWsStatus] = useState<'connecting' | 'open' | 'closed' | 'error'>('closed');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    connectWebSocket();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Unmounting');
        ws.current = null;
      }
    };
  }, [chatSession, user?.accessToken]);

  const connectWebSocket = () => {
    if (!chatSession || !user?.accessToken || !isMountedRef.current) return;
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;

    const wsUrl = `${WS_BASE_URL}${chatSession}/?token=${user.accessToken}`;
    setWsStatus('connecting');

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      if (!isMountedRef.current) {
        socket.close();
        return;
      }
      setWsStatus('open');
      reconnectAttemptRef.current = 0;
    };

    socket.onmessage = (e) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(e.data);
        if (data.message) {
          const receivedMessage: Message = {
            id: String(data.id || Date.now()),
            text: data.message,
            sender: data.sender === 'CHAT_USER' ? 'user' : (data.sender === 'AI_ASSISTANT' ? 'bot' : 'agent'),
            timestamp: new Date(data.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === receivedMessage.id)) return prev;
            return [receivedMessage, ...prev];
          });
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    socket.onerror = () => setWsStatus('error');
    socket.onclose = (e) => {
      if (!isMountedRef.current) return;
      setWsStatus('closed');
      ws.current = null;
      if (e.code === 1000) return;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
      reconnectAttemptRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) connectWebSocket();
      }, delay);
    };
  };

  const handleSendMessage = async () => {
    if (message.trim().length === 0 || !chatSession) return;
    if (!isHumanAgent) {
      Alert.alert(t('order_chat.human_mode_required'), t('order_chat.human_mode_desc'));
      return;
    }
    setIsSending(true);
    try {
      await apiClient.post('chat/', { message, sender: 'HUMAN_ASSISTANT', session: chatSession });
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
      await apiClient.patch(`chat-sessions/${chatSession}/`, { reply_from: value ? 'HUMAN_ASSISTANT' : 'AI_ASSISTANT' });
      setIsHumanAgent(value);
    } catch (err) {
      console.error('Error toggling reply_from:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isBot = item.sender === 'bot';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.otherRow]}>
        {!isUser && (
          <Avatar.Icon
            size={36}
            icon={isBot ? 'robot-outline' : 'account-tie-outline'}
            style={[styles.avatar, { backgroundColor: isBot ? theme.colors.secondary : theme.colors.primary }]}
          />
        )}
        <View style={[styles.bubbleContainer, isUser ? styles.userBubbleContainer : styles.otherBubbleContainer]}>
          <Surface
            elevation={1}
            style={[
              styles.bubble,
              {
                backgroundColor: isUser ? theme.colors.primary : theme.colors.secondaryContainer,
                borderBottomRightRadius: isUser ? 4 : 20,
                borderBottomLeftRadius: isUser ? 20 : 4,
              },
            ]}
          >
            <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : theme.colors.onSecondaryContainer }]}>
              {item.text}
            </Text>
          </Surface>
          <Text variant="labelSmall" style={[styles.timestamp, { color: theme.colors.onSurfaceVariant, opacity: 0.5 }]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background }, animatedStyle]}>
      <Surface elevation={4} style={[styles.header, { backgroundColor: theme.colors.surface, paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <BackButton />
          <View style={styles.headerInfo}>
            <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
              {orderId ? `Order #${orderId}` : (sessionDetails?.chat_user_details?.name || 'Customer')}
            </Text>
            <View style={styles.statusRow}>
              {orderId && chatSession && (
                <>
                  <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                    Session: {chatSession.substring(0, 8)}...
                  </Text>
                  <Text style={{ color: theme.colors.outline }}> • </Text>
                </>
              )}
              <View style={[styles.onlineDot, { backgroundColor: wsStatus === 'open' ? '#10B981' : (wsStatus === 'connecting' ? '#F59E0B' : '#EF4444') }]} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>
                {wsStatus === 'open' ? t('order_chat.online') : (wsStatus === 'connecting' ? t('order_chat.connecting') : t('order_chat.offline'))}
              </Text>
              <Text style={{ color: theme.colors.outline }}> • </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '800' }}>
                {isHumanAgent ? t('order_chat.human_active') : t('order_chat.bot_active')}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.modeSection, { backgroundColor: theme.colors.primary + '08' }]}>
          <View style={styles.modeControl}>
            <Text variant="labelMedium" style={[styles.modeLabel, !isHumanAgent && { color: theme.colors.primary, fontWeight: '900' }]}>
              {t('order_chat.ai_rep')}
            </Text>
            {isSwitching ? (
              <ActivityIndicator size={20} color={theme.colors.primary} style={{ marginHorizontal: 16 }} />
            ) : (
              <Switch value={isHumanAgent} onValueChange={toggleReplyFrom} color={theme.colors.primary} style={styles.modeSwitch} />
            )}
            <Text variant="labelMedium" style={[styles.modeLabel, isHumanAgent && { color: theme.colors.primary, fontWeight: '900' }]}>
              {t('order_chat.human_rep')}
            </Text>
          </View>
        </View>
      </Surface>

      <View style={{ flex: 1 }}>
        {isMessagesLoading ? (
          <View style={styles.shimmerContainer}>
            <ShimmerPlaceholder width="60%" height={50} style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
            <ShimmerPlaceholder width="40%" height={40} style={{ alignSelf: 'flex-end', marginBottom: 20 }} />
            <ShimmerPlaceholder width="75%" height={80} style={{ alignSelf: 'flex-start', marginBottom: 20 }} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
            inverted
            showsVerticalScrollIndicator={false}
          />
        )}

        <Surface elevation={4} style={[styles.inputSurface, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            placeholder={t('order_chat.placeholder')}
            value={message}
            onChangeText={setMessage}
            mode="flat"
            multiline
            cursorColor={theme.colors.primary}
            selectionColor={theme.colors.primary}
            style={[styles.input, { backgroundColor: theme.colors.primary + '05' }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={isSending || message.trim().length === 0}
            style={[
              styles.sendBtn,
              { backgroundColor: theme.colors.primary },
              (isSending || message.trim().length === 0) && { opacity: 0.5 }
            ]}
          >
            {isSending ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Icon name="send-variant" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </Surface>
      </View>

      <LoadingOverlay visible={isSending} message={t('common.sending') || 'Sending...'} icon="send-circle-outline" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeSection: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  modeSwitch: {
    marginHorizontal: 10,
    transform: [{ scale: 0.8 }],
  },
  messageList: {
    padding: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 24,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    elevation: 3,
  },
  bubbleContainer: {
    flex: 1,
  },
  userBubbleContainer: {
    marginRight: 0,
    marginLeft: 40,
    alignItems: 'flex-end',
  },
  otherBubbleContainer: {
    marginLeft: 12,
    marginRight: 40,
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  timestamp: {
    marginTop: 6,
    fontWeight: '700',
  },
  shimmerContainer: {
    padding: 20,
  },
  inputSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    // maxHeight: 120,
    marginRight: 12,
    paddingTop: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
