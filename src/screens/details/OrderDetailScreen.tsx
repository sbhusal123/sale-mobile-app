import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Divider, Menu, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../api/client';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params || { id: 'new' };
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { orders, products, addOrder, editOrder, deleteOrder } = useAuth();

  const isNew = id === 'new';
  const existingOrder = !isNew ? orders.find(o => o.id === Number(id)) : null;

  const [productId, setProductId] = useState<number | null>(existingOrder?.product || null);
  const [qty, setQty] = useState(existingOrder?.quantity?.toString() || '1');
  const [totalPrice, setTotalPrice] = useState(existingOrder?.total_price?.toString() || '');
  const [location, setLocation] = useState(existingOrder?.location || '');
  const [phone, setPhone] = useState(existingOrder?.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState(existingOrder?.special_instructions || '');
  const [orderStatus, setOrderStatus] = useState(existingOrder?.order_status || 'PENDING');

  const [productDialogVisible, setProductDialogVisible] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t('common.saving') || 'Saving...');
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);

  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [chatUserDialogVisible, setChatUserDialogVisible] = useState(false);
  const [chatUserSearchQuery, setChatUserSearchQuery] = useState('');
  const [newCustomerModalVisible, setNewCustomerModalVisible] = useState(false);

  const [customerName, setCustomerName] = useState(existingOrder?.chat_user?.name || (existingOrder as any)?.user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(existingOrder?.chat_user?.email || (existingOrder as any)?.user?.email || '');
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(existingOrder?.chat_user?.id || null);

  useEffect(() => {
    if (!isNew && id) {
      apiClient.get(`orders/${id}/`)
        .then(res => setFetchedOrder(res.data))
        .catch(err => console.error("Error fetching single order:", err));
    }
  }, [isNew, id]);

  useEffect(() => {
    apiClient.get('chat-users/')
      .then(res => setChatUsers(res.data || []))
      .catch(err => console.error("Error fetching chat users:", err));
  }, []);

  useEffect(() => {
    if (!isNew && !existingOrder) {
      navigation.goBack();
    }
  }, [isNew, existingOrder]);

  const selectedProduct = products.find(p => p.id === productId);

  const handleSave = async () => {
    if (!productId) {
      Alert.alert(t('common.error'), (t('order_detail.product') || 'Product') + ' ' + (t('common.required') || 'is required'));
      return;
    }
    if (!selectedChatUserId && (!customerName || !phone)) {
      Alert.alert(t('common.error'), 'Customer Name and Phone are required for new customer');
      return;
    }

    const data: any = {
      product: productId,
      quantity: parseInt(qty, 10) || 1,
      total_price: totalPrice || "0",
      location,
      phone,
      name: customerName,
      email: customerEmail,
      special_instructions: specialInstructions,
      order_status: orderStatus,
      chat_user: selectedChatUserId || null,
      chat_session: existingOrder?.chat_session || null,
    };

    setLoadingMessage(t('common.saving') || 'Saving...');
    setIsSaving(true);
    let success = false;
    if (isNew) {
      success = await addOrder(data);
    } else {
      success = await editOrder(Number(id), data);
    }
    setIsSaving(false);

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleCreateCustomer = async () => {
    if (!customerName || !phone) {
      Alert.alert(t('common.error'), 'Name and Phone are required');
      return;
    }

    setLoadingMessage('Creating customer...');
    setIsSaving(true);

    try {
      const payload = {
        name: customerName,
        phone: phone,
        email: customerEmail || null
      };
      const response = await apiClient.post('chat-users/', payload);
      const newUser = response.data;

      setChatUsers(prev => [...prev, newUser]);
      setSelectedChatUserId(newUser.id);
      setNewCustomerModalVisible(false);
    } catch (error) {
      console.error('Create customer error:', error);
      Alert.alert(t('common.error'), 'Failed to create customer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('order_detail.delete_confirm'), t('common.confirm_delete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          setLoadingMessage(t('common.deleting') || 'Deleting...');
          setIsSaving(true);
          const success = await deleteOrder(Number(id));
          setIsSaving(false);
          if (success) navigation.goBack();
        }
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return '#10B981';
      case 'DELIVERING': return '#6366F1';
      case 'CANCELLED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const customerUser = fetchedOrder?.chat_user || (existingOrder as any)?.user;

  console.log("customerUser", customerUser);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={isNew ? t('order_detail.add_title') : t('order_detail.title')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 64 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerIcon}>
            <Surface elevation={0} style={[styles.iconSurface, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="cart-variant" size={48} color={theme.colors.primary} />
            </Surface>
            {!isNew && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(orderStatus) }]} />
                <Text variant="labelSmall" style={[styles.statusText, { color: getStatusColor(orderStatus) }]}>
                  {orderStatus.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
            <View style={styles.inputGap}>
              <TouchableOpacity onPress={() => setProductDialogVisible(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <TextInput
                    label={t('order_detail.product', 'Product') + ' *'}
                    value={selectedProduct ? selectedProduct.name : ''}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={{ borderRadius: 18 }}
                    left={<TextInput.Icon icon="package-variant" color={theme.colors.primary} />}
                    right={<TextInput.Icon icon="chevron-down" color={theme.colors.onSurfaceVariant} />}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.rowInputs}>
                <TextInput
                  label={t('order_detail.quantity')}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ flex: 1 }}
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Icon icon="counter" color={theme.colors.primary} />}
                />
                <TextInput
                  label={t('order_detail.total_price')}
                  value={totalPrice}
                  onChangeText={setTotalPrice}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ flex: 1.5 }}
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Affix text="₹ " />}
                />
              </View>

              <TextInput
                label={t('order_detail.location')}
                value={location}
                onChangeText={setLocation}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="map-marker-outline" color={theme.colors.primary} />}
              />

              <TouchableOpacity onPress={() => setChatUserDialogVisible(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <TextInput
                    label={t('order_detail.customer_info', 'Customer') + ' *'}
                    value={selectedChatUserId ? (chatUsers.find((u) => String(u.id) === String(selectedChatUserId))?.name || "Customer Info") : (customerName ? `${customerName} (New)` : '')}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={{ borderRadius: 18 }}
                    left={<TextInput.Icon icon="account-group" color={theme.colors.primary} />}
                    right={<TextInput.Icon icon="chevron-down" color={theme.colors.onSurfaceVariant} />}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              <View style={styles.statusQuickSection}>
                <Text variant="labelSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>{t('order_detail.quick_update')}</Text>
                <View style={styles.statusChipsRow}>
                  {(['PENDING', 'DELIVERING', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setOrderStatus(status)}
                      style={[
                        styles.statusChip,
                        { borderColor: theme.colors.outline, borderWidth: 1 },
                        orderStatus === status && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                      ]}
                    >
                      <Text style={[
                        styles.statusChipText,
                        { color: theme.colors.onSurfaceVariant },
                        orderStatus === status && { color: '#FFFFFF' }
                      ]}>
                        {status.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                label={t('order_detail.special_instructions')}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, { minHeight: 100 }]}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="note-text-outline" color={theme.colors.primary} />}
              />
            </View>

            {!isNew && customerUser && (
              <View style={styles.customerCardSection}>
                <Divider style={styles.cardDivider} />
                <View style={styles.sectionHeader}>
                  <Icon name="account-details-outline" size={22} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('order_detail.customer_details')}</Text>
                </View>
                <View style={[styles.customerInfoBox, { backgroundColor: theme.colors.primary + '08', borderRadius: 18 }]}>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.full_name')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{customerUser.name || '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('order_detail.phone')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{customerUser.phone || '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.email')}</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{customerUser.email || '---'}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveBtn}
                contentStyle={styles.btnContent}
                labelStyle={styles.btnLabel}
                elevation={4}
              >
                {t('common.save')}
              </Button>

              {!isNew && (
                <View style={styles.bottomActions}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('OrderChat', { id: existingOrder?.id || id, chatSessionId: fetchedOrder?.chat_session || existingOrder?.chat_session })}
                    style={[styles.flexBtn, { marginRight: 8 }]}
                    contentStyle={styles.btnContent}
                    labelStyle={styles.flexBtnLabel}
                    icon="chat-processing-outline"
                    disabled={!fetchedOrder?.chat_session && !existingOrder?.chat_session}
                  >
                    {t('orders.chat') || 'Chat'}
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleDelete}
                    style={[styles.flexBtn, { borderColor: theme.colors.error }]}
                    contentStyle={styles.btnContent}
                    labelStyle={[styles.flexBtnLabel, { color: theme.colors.error }]}
                    textColor={theme.colors.error}
                    icon="delete-outline"
                  >
                    {t('common.delete')}
                  </Button>
                </View>
              )}
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Dialog visible={productDialogVisible} onDismiss={() => setProductDialogVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 24, maxHeight: '80%' }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>Select Product</Dialog.Title>
          <Dialog.Content style={{ paddingBottom: 0 }}>
            <TextInput
              placeholder="Search products..."
              value={productSearchQuery}
              onChangeText={setProductSearchQuery}
              mode="outlined"
              style={{ backgroundColor: 'transparent', marginBottom: 12 }}
              outlineStyle={{ borderRadius: 12 }}
              left={<TextInput.Icon icon="magnify" color={theme.colors.primary} />}
            />
            <ScrollView style={{ maxHeight: 400 }}>
              {products
                .filter(p => (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()))
                .map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }}
                    onPress={() => {
                      setProductId(p.id);
                      setProductDialogVisible(false);
                      setProductSearchQuery('');
                    }}
                  >
                    <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProductDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={newCustomerModalVisible} onDismiss={() => setNewCustomerModalVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 24 }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>Create New Customer</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('order_detail.customer_name', 'Customer Name') + ' *'}
              value={customerName}
              onChangeText={setCustomerName}
              mode="outlined"
              style={[styles.input, { marginBottom: 12 }]}
              outlineStyle={{ borderRadius: 18 }}
              left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
            />
            <TextInput
              label={t('order_detail.phone', 'Phone') + ' *'}
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={[styles.input, { marginBottom: 12 }]}
              outlineStyle={{ borderRadius: 18 }}
              left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
            />
            <TextInput
              label={t('order_detail.customer_email', 'Customer Email')}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              outlineStyle={{ borderRadius: 18 }}
              left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewCustomerModalVisible(false)} textColor={theme.colors.onSurfaceVariant}>Cancel</Button>
            <Button onPress={handleCreateCustomer} mode="contained" style={{ borderRadius: 20 }}>Save</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={chatUserDialogVisible} onDismiss={() => setChatUserDialogVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 24, maxHeight: '80%' }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('order_detail.select_customer', 'Select Customer')}</Dialog.Title>
          <Dialog.Content style={{ paddingBottom: 0 }}>
            <TextInput
              placeholder={t('order_detail.search_customers', 'Search customers...')}
              value={chatUserSearchQuery}
              onChangeText={setChatUserSearchQuery}
              mode="outlined"
              style={{ backgroundColor: 'transparent', marginBottom: 12 }}
              outlineStyle={{ borderRadius: 12 }}
              left={<TextInput.Icon icon="magnify" color={theme.colors.primary} />}
            />
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }}
                onPress={() => {
                  setChatUserDialogVisible(false);
                  setChatUserSearchQuery('');
                  setSelectedChatUserId(null);
                  setCustomerName('');
                  setPhone('');
                  setCustomerEmail('');
                  setNewCustomerModalVisible(true);
                }}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>+ {t('order_detail.create_new_customer', 'Create New Customer')}</Text>
              </TouchableOpacity>
              {chatUsers
                .filter(u => (u.name || '').toLowerCase().includes(chatUserSearchQuery.toLowerCase()) || (u.phone || '').includes(chatUserSearchQuery))
                .map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }}
                    onPress={() => {
                      setSelectedChatUserId(u.id);
                      setCustomerName(u.name || '');
                      setPhone(u.phone || '');
                      setCustomerEmail(u.email || '');
                      setChatUserDialogVisible(false);
                      setChatUserSearchQuery('');
                    }}
                  >
                    <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{u.name}</Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginTop: 2 }}>{u.phone}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChatUserDialogVisible(false)} textColor={theme.colors.onSurfaceVariant}>{t('common.close', 'Close')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <LoadingOverlay visible={isSaving} message={loadingMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 24,
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconSurface: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    transform: [{ rotate: '5deg' }],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
  },
  inputGap: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  menuAnchor: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  menuAnchorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  statusQuickSection: {
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  customerCardSection: {
    marginTop: 24,
  },
  cardDivider: {
    marginBottom: 20,
    opacity: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '900',
    fontSize: 17,
  },
  customerInfoBox: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  saveBtn: {
    borderRadius: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  flexBtn: {
    flex: 1,
    borderRadius: 18,
  },
  flexBtnLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  btnContent: {
    paddingVertical: 10,
  },
  btnLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
