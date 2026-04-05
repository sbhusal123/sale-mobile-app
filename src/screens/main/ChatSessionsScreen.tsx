import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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

const Icon = MaterialCommunityIcons as any;

export default function ChatSessionsScreen() {
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

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
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

  const renderSessionItem = ({ item }: { item: any }) => (
    <Surface elevation={1} style={styles.card}>
      <Card
        onPress={() => navigation.navigate('OrderChat', { chatSessionId: item.id })}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <Card.Title
          title={item.chat_user_details?.name || 'अज्ञात प्रयोगकर्ता'}
          subtitle={`${item.chat_user_details?.phone || 'फोन छैन'} • ${item.channel}`}
          left={(props) => (
            <Avatar.Icon
              {...props}
              icon={getChannelIcon(item.channel)}
              style={{ backgroundColor: item.channel === 'WHATSAPP' ? '#25D366' : '#1877F2' }}
            />
          )}
          right={(props) => (
            <IconButton
              {...props}
              icon="chevron-right"
              onPress={() => navigation.navigate('OrderChat', { chatSessionId: item.id })}
            />
          )}
        />
      </Card>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader title="कुराकानीहरू" onMenu={() => navigation.openDrawer()} />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="खोज्नुहोस्..."
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
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="chat-sleep-outline" size={64} color={theme.colors.outline} />
                <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.outline }}>
                  कुनै कुराकानी भेटिएन
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
