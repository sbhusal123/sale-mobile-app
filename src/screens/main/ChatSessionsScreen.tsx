import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Card,
  IconButton,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../api/client';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function ChatSessionsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await apiClient.get('chat-sessions/');
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching chat sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSessions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    fetchSessions();
  };

  const filteredSessions = sessions.filter(session => 
    session.chat_user_details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.chat_user_details?.phone?.includes(searchQuery)
  );

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'FACEBOOK': return 'facebook';
      case 'WHATSAPP': return 'whatsapp';
      default: return 'chat';
    }
  };

  const renderShimmer = () => (
    <View style={styles.listContent}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Surface key={i} elevation={1} style={[styles.card, { padding: 12, backgroundColor: theme.colors.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ShimmerPlaceholder width={48} height={48} borderRadius={24} />
            <View style={{ flex: 1 }}>
              <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 6 }} />
              <ShimmerPlaceholder width="40%" height={14} />
            </View>
          </View>
        </Surface>
      ))}
    </View>
  );

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('chat.just_now');
    if (diffInSeconds < 3600) return t('chat.minutes_ago', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('chat.hours_ago', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('chat.days_ago', { count: Math.floor(diffInSeconds / 86400) });
    return date.toLocaleDateString(i18n.language === 'ne' ? 'ne-NP' : 'en-US');
  };

  const renderSessionItem = ({ item }: { item: any }) => (
    <Surface elevation={1} style={styles.card}>
      <Card
        onPress={() => navigation.navigate('OrderChat', { chatSessionId: item.id })}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.avatarSection}>
            <Avatar.Icon
              size={48}
              icon={getChannelIcon(item.channel)}
              style={{ backgroundColor: item.channel === 'WHATSAPP' ? '#25D366' : '#1877F2' }}
              color="#fff"
            />
            {item.reply_from === 'HUMAN_ASSISTANT' && (
              <View style={[styles.agentBadge, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text variant="titleMedium" style={styles.userName} numberOfLines={1}>
                {item.chat_user_details?.name || t('chat.unknown_user')}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                {formatRelativeTime(item.updated_at)}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <View style={[
                styles.modeBadge, 
                { backgroundColor: item.reply_from === 'AI_ASSISTANT' ? '#9C27B0' : theme.colors.primary }
              ]}>
                <Icon 
                  name={item.reply_from === 'AI_ASSISTANT' ? 'robot' : 'account'} 
                  size={12} 
                  color="#fff" 
                />
                <Text variant="labelSmall" style={styles.modeLabel}>
                  {item.reply_from === 'AI_ASSISTANT' ? t('chat.ai_assistant') : t('chat.human_agent')}
                </Text>
              </View>
              <View style={[styles.channelTag, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
                  {item.channel}
                </Text>
              </View>
            </View>
          </View>
          
          <IconButton
            icon="chevron-right"
            size={20}
            style={{ marginRight: -8 }}
            onPress={() => navigation.navigate('OrderChat', { chatSessionId: item.id })}
          />
        </Card.Content>
      </Card>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title={t('chat.title')} onMenu={() => navigation.openDrawer()} />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('chat.search_placeholder')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          elevation={0}
        />
      </View>

      {loading ? renderShimmer() : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 + insets.bottom }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="chat-sleep-outline" size={64} color={theme.colors.outline} />
                <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.outline }}>
                  {t('chat.no_sessions')}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  agentBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  modeLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  channelTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
