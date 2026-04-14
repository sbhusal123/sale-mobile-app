import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Alert } from 'react-native';
import { Avatar, Surface, Text, useTheme, Searchbar, FAB, Dialog, TextInput, Button, IconButton, TouchableRipple, Menu, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../api/client';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

const ChatUserItem = React.memo(({ item, theme, onNavigate, onLongPress }: any) => (
  <Surface elevation={2} style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
    <TouchableRipple
      onPress={() => onNavigate(item.id)}
      onLongPress={(e) => onLongPress(item, e)}
      delayLongPress={500}
      style={styles.cardRipple}
      rippleColor={theme.colors.primary + '1A'}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
          <Icon name="account-outline" size={26} color={theme.colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="titleMedium" style={[styles.userName, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.name || 'Unknown User'}
            </Text>
            {item.orders_count !== undefined && (
              <View style={[styles.orderBadge, { backgroundColor: theme.colors.error + '15' }]}>
                <Icon name="shopping-outline" size={12} color={theme.colors.error} />
                <Text style={[styles.orderBadgeText, { color: theme.colors.error }]}>{item.orders_count}</Text>
              </View>
            )}
          </View>
          <Text variant="bodySmall" style={[styles.userDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {item.phone || item.email || 'No contact info available'}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={22}
          iconColor={theme.colors.primary}
          style={styles.arrowBtn}
        />
      </View>
    </TouchableRipple>
  </Surface>
));

export default function ChatUsersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { chatUsers: users, fetchChatUsers: fetchUsers, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Customer Dialog State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Menu State
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.phone?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleCreateCustomer = async () => {
    if (!newCustomerName || !newCustomerPhone) {
      Alert.alert(t('common.error', 'Error'), 'Name and Phone are required.');
      return;
    }
    setIsCreating(true);
    try {
      const response = await apiClient.post('chat-users/', {
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || null,
      });
      setCreateModalVisible(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      fetchUsers(); // Refresh global state
    } catch (err) {
      console.error('Create user error:', err);
      Alert.alert(t('common.error', 'Error'), 'Failed to create customer');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLongPress = (user: any, event: any) => {
    const { nativeEvent } = event;
    const anchor = { x: nativeEvent.pageX, y: nativeEvent.pageY };
    setSelectedUser(user);
    setMenuAnchor(anchor);
    setMenuVisible(true);
  };

  const handleCreateOrder = () => {
    setMenuVisible(false);
    if (selectedUser) {
      navigation.navigate('OrderDetail', { id: 'new', customerId: selectedUser.id });
    }
  };

  const renderShimmer = () => (
    <View style={styles.listContent}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Surface key={i} elevation={1} style={[styles.card, { padding: 12, backgroundColor: theme.colors.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ShimmerPlaceholder width={48} height={48} borderRadius={24} />
            <View style={{ flex: 1 }}>
              <ShimmerPlaceholder width="50%" height={20} style={{ marginBottom: 6 }} />
              <ShimmerPlaceholder width="30%" height={14} />
            </View>
          </View>
        </Surface>
      ))}
    </View>
  );

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <ChatUserItem
      item={item}
      theme={theme}
      onNavigate={(id: string) => navigation.navigate('ChatUserDetail', { id })}
      onLongPress={handleLongPress}
    />
  ), [theme, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={t('navigation.chat_users', 'Customers')}
        onMenu={() => navigation.openDrawer()}
        icon="account-group"
        onAdd={() => setCreateModalVisible(true)}
        addIcon="account-plus"
      />

      <View style={styles.headerControls}>
        <Searchbar
          placeholder={t('order_detail.search_customers', 'Search customers...')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          inputStyle={[styles.searchInput, { color: theme.colors.onSurface }]}
          elevation={2}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      {authLoading && users.length === 0 ? renderShimmer() : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Icon name="account-search-outline" size={64} color={theme.colors.outline} />
                <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.outline }}>
                  No chat users found
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
      >
        <Menu.Item 
          onPress={handleCreateOrder} 
          title={t('order_detail.create_new_order', 'Create an order')} 
          leadingIcon="plus-circle-outline"
        />
        <Menu.Item 
          onPress={() => { setMenuVisible(false); navigation.navigate('ChatUserDetail', { id: selectedUser.id }); }} 
          title={t('common.edit', 'Edit Profile')} 
          leadingIcon="pencil-outline"
        />
      </Menu>

      <FAB
        icon="account-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 32 + insets.bottom }]}
        onPress={() => setCreateModalVisible(true)}
        color="#FFFFFF"
        label={t('order_detail.create_new_customer', 'Create New Customer')}
      />

      <Dialog visible={createModalVisible} onDismiss={() => !isCreating && setCreateModalVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 24 }}>
        <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('order_detail.create_new_customer', 'Create New Customer')}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label={t('order_detail.customer_name', 'Customer Name') + ' *'}
            value={newCustomerName}
            onChangeText={setNewCustomerName}
            mode="outlined"
            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
          />
          <TextInput
            label="Phone *"
            value={newCustomerPhone}
            onChangeText={setNewCustomerPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
          />
          <TextInput
            label={t('order_detail.customer_email', 'Customer Email')}
            value={newCustomerEmail}
            onChangeText={setNewCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={{ backgroundColor: theme.colors.surface }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
          />
        </Dialog.Content>
        <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <Button onPress={() => setCreateModalVisible(false)} textColor={theme.colors.onSurfaceVariant} disabled={isCreating}>{t('common.cancel')}</Button>
          <Button onPress={handleCreateCustomer} mode="contained" style={{ borderRadius: 20 }} disabled={isCreating} loading={isCreating}>{t('common.save')}</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControls: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginHorizontal: 20,
    borderRadius: 18,
    height: 52,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 15,
    minHeight: 52,
    fontWeight: '500',
  },
  listContent: { paddingHorizontal: 20, paddingTop: 8, gap: 18 },
  cardSurface: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardRipple: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  userDesc: {
    lineHeight: 18,
    fontWeight: '600',
    opacity: 0.8,
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 3,
  },
  arrowBtn: {
    margin: 0,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 20,
    elevation: 6,
  },
  card: { // For Shimmer matching
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
});
