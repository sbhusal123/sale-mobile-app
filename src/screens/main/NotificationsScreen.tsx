import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  // Use dynamic translations for mock data
  const mockNotifications = [
    { id: '1', title: t('notifications.new_order_title'), body: t('notifications.new_order_body'), time: t('chat.minutes_ago', { count: 10 }) },
    { id: '2', title: t('notifications.stock_alert_title'), body: t('notifications.stock_alert_body'), time: t('chat.hours_ago', { count: 1 }) },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton />
          <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            {t('notifications.title')}
          </Text>
        </View>
        <IconButton
          icon="delete-sweep"
          iconColor={theme.colors.error}
          onPress={clearAll}
          disabled={notifications.length === 0}
        />
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.iconContainer}>
                <Icon name="bell-ring" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.content}>
                <View style={styles.row}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {item.time}
                  </Text>
                </View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: 4 }}>
                  {item.body}
                </Text>
              </View>
            </Surface>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="bell-off-outline" size={80} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.3 }} />
          <Text variant="titleLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            {t('notifications.no_notifications')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingRight: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
});
