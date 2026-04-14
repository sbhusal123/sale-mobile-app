import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Dialog, Divider, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
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
  const { id, customerId, productId: initialProductId } = route.params || { id: 'new' };
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { orders, products, addOrder, editOrder, deleteOrder, user: merchantUser, fetchProducts } = useAuth();

  const isNew = id === 'new';
  const existingOrder = !isNew ? orders.find(o => o.id === Number(id)) : null;

  const [orderItems, setOrderItems] = useState<any[]>(
    existingOrder?.items ||
    (initialProductId ? [{ product: Number(initialProductId), quantity: 1, price: products.find(p => p.id === Number(initialProductId))?.price || '0' }] : [])
  );
  const [totalPrice, setTotalPrice] = useState(existingOrder?.total_price?.toString() || '0');
  const [location, setLocation] = useState(existingOrder?.location || '');
  const [phone, setPhone] = useState(existingOrder?.phone || (existingOrder as any)?.chat_user?.phone || '');
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
  const [newProductModalVisible, setNewProductModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('1');

  const [customerName, setCustomerName] = useState(existingOrder?.chat_user?.name || (existingOrder as any)?.user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(existingOrder?.chat_user?.email || (existingOrder as any)?.user?.email || '');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(existingOrder?.chat_user?.id ? String(existingOrder.chat_user.id) : (customerId ? String(customerId) : null));

  useEffect(() => {
    if (!isNew && id) {
      apiClient.get(`orders/${id}/`)
        .then(res => setFetchedOrder(res.data))
        .catch(err => console.error("Error fetching single order:", err));
    }
  }, [isNew, id]);

  useEffect(() => {
    apiClient.get('chat-users/')
      .then(res => {
        const users = res.data || [];
        setChatUsers(users);

        // If we have a pre-selected customerId and no existing order info, pre-fill from user details
        if (customerId && isNew && !customerName) {
          const user = users.find((u: any) => String(u.id) === String(customerId));
          if (user) {
            setCustomerName(user.name || '');
            setCustomerEmail(user.email || '');
            setPhone(user.phone || '');
          }
        }
      })
      .catch(err => console.error("Error fetching chat users:", err));
  }, [customerId, isNew]);

  useEffect(() => {
    if (!isNew && !existingOrder) {
      navigation.goBack();
    }
  }, [isNew, existingOrder]);

  // Auto-calculate total price
  useEffect(() => {
    const total = orderItems.reduce((acc, item) => {
      return acc + (parseFloat(item.price || '0') * (item.quantity || 0));
    }, 0).toFixed(2);
    setTotalPrice(total.endsWith('.00') ? total.slice(0, -3) : total);
  }, [orderItems]);

  const addOrderItem = (product: any) => {
    const existing = orderItems.find(item => item.product === product.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.product === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, { product: product.id, quantity: 1, price: product.price }]);
    }
  };

  const removeOrderItem = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.product !== productId));
  };

  const updateItemQuantity = (productId: number, newQty: string) => {
    const q = parseInt(newQty, 10) || 0;
    setOrderItems(orderItems.map(item =>
      item.product === productId ? { ...item, quantity: q } : item
    ));
  };

  const handleSave = async () => {
    if (orderItems.length === 0) {
      Alert.alert(t('common.error'), t('order_detail.select_product', 'Please select at least one product'));
      return;
    }
    if (!selectedChatUserId && (!customerName || !phone)) {
      Alert.alert(t('common.error'), 'Customer Name and Phone are required for new customer');
      return;
    }
    if (!phone) {
      Alert.alert(t('common.error'), (t('order_detail.phone') || 'Phone Number') + ' ' + (t('common.required') || 'is required'));
      return;
    }

    const data: any = {
      items: orderItems.map(item => ({
        product: parseInt(String(item.product), 10),
        quantity: parseInt(String(item.quantity), 10) || 0,
        price: parseFloat(String(item.price || "0.00")) * (parseInt(String(item.quantity), 10) || 0.00)
      })),
      // Top-level fields for backward compatibility/satisfying root-level validators
      product: orderItems[0] ? parseInt(String(orderItems[0].product), 10) : 0,
      quantity: orderItems[0] ? (parseInt(String(orderItems[0].quantity), 10) || 0) : 0,
      price: orderItems[0] ? (parseFloat(String(orderItems[0].price || "0.00")) * (parseInt(String(orderItems[0].quantity), 10) || 0)) : 0,

      total_price: parseFloat(String(totalPrice || "0")),
      location: String(location),
      phone: String(phone),
      special_instructions: specialInstructions ? String(specialInstructions) : null,
      order_status: String(orderStatus),
      user: merchantUser?.id ? parseInt(merchantUser.id, 10) : 0,
      chat_user: selectedChatUserId || null,
      chat_session: existingOrder?.chat_session || null,
    };

    console.log("data", data);


    setLoadingMessage(t('common.saving') || 'Saving...');
    setIsSaving(true);
    let success = false;
    if (isNew) {
      success = await addOrder(data);

      console.log(success, "success")
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

  const handleCreateProduct = async () => {
    if (!newProductName || !newProductPrice) {
      Alert.alert(t('common.error'), 'Product Name and Price are required');
      return;
    }

    setLoadingMessage('Creating product...');
    setIsSaving(true);

    try {
      const payload = {
        name: newProductName,
        price: parseFloat(newProductPrice),
        quantity: parseInt(newProductQuantity, 10) || 0,
        instock: true,
      };
      const response = await apiClient.post('products/', payload);
      const newProd = response.data;
      
      addOrderItem(newProd);
      setNewProductModalVisible(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductQuantity('1');
    } catch (error) {
      console.error('Create product error:', error);
      Alert.alert(t('common.error'), 'Failed to create product');
    } finally {
      setIsSaving(true); 
      // Refresh products list
      await fetchProducts();
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

  const selectedCustomer = chatUsers.find(u => String(u.id) === String(selectedChatUserId));
  const customerUser = selectedCustomer || fetchedOrder?.chat_user || (existingOrder as any)?.user;

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return '#10B981';
      case 'DELIVERING': return '#6366F1';
      case 'CANCELLED': return '#EF4444';
      default: return '#F59E0B';
    }
  };

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
              <View style={styles.itemsSection}>
                <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
                  <Icon name="package-variant-closed" size={20} color={theme.colors.primary} />
                  <Text variant="titleSmall" style={{ fontWeight: '900' }}>{t('home.products', 'Products')}</Text>
                </View>

                {orderItems.map((item, index) => {
                  const product = products.find(p => p.id === item.product);
                  return (
                    <View key={item.product} style={[styles.itemRow, index > 0 && { marginTop: 12 }]}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" style={{ fontWeight: '700' }}>{product?.name || 'Unknown Product'}</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>₹{item.price} x {item.quantity}</Text>
                      </View>
                      <View style={styles.itemActions}>
                        <TextInput
                          value={item.quantity.toString()}
                          onChangeText={(val) => updateItemQuantity(item.product, val)}
                          keyboardType="numeric"
                          mode="outlined"
                          dense
                          style={styles.qtyInput}
                          outlineStyle={{ borderRadius: 12 }}
                        />
                        <TouchableOpacity onPress={() => removeOrderItem(item.product)} style={styles.removeBtn}>
                          <Icon name="close-circle-outline" size={22} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                <Button
                  mode="outlined"
                  onPress={() => setProductDialogVisible(true)}
                  icon="plus"
                  style={styles.addProductBtn}
                  contentStyle={{ height: 48 }}
                >
                  {t('orders.add_order', 'Add Product')}
                </Button>
              </View>

              <Divider style={{ marginVertical: 8 }} />

              <TextInput
                label={t('order_detail.total_price')}
                value={totalPrice}
                onChangeText={setTotalPrice}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Affix text="₹ " />}
              />

              <TextInput
                label={t('order_detail.phone') + ' *'}
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
              />

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

            {(customerUser || customerName) && (
              <View style={styles.customerCardSection}>
                <Divider style={styles.cardDivider} />
                <View style={styles.sectionHeader}>
                  <Icon name="account-details-outline" size={22} color={theme.colors.primary} />
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('order_detail.customer_details')}</Text>
                    {customerUser?.orders_count !== undefined && (
                      <View style={[styles.orderCountBadgeSmall, { backgroundColor: theme.colors.error + '10', marginBottom: 0 }]}>
                        <Icon name="shopping-outline" size={14} color={theme.colors.error} />
                        <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '800', marginLeft: 4 }}>
                          {customerUser.orders_count} {t('home.orders', 'Orders')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.customerInfoBox, { backgroundColor: theme.colors.primary + '08', borderRadius: 18 }]}>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.full_name')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{customerUser?.name || customerName || '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('order_detail.phone')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{customerUser?.phone || phone || '---'}</Text>
                  </View>
                  {(customerUser?.email || customerEmail) ? (
                    <View style={styles.infoRow}>
                      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.email')}</Text>
                      <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{customerUser?.email || customerEmail}</Text>
                    </View>
                  ) : null}
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
              <TouchableOpacity
                style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }}
                onPress={() => {
                  setProductDialogVisible(false);
                  setNewProductModalVisible(true);
                }}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>+ {t('product_detail.add_title', 'Create New Product')}</Text>
              </TouchableOpacity>
              {products
                .filter(p => (p.name || '').toLowerCase().includes(productSearchQuery.toLowerCase()))
                .map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outline + '40' }}
                    onPress={() => {
                      addOrderItem(p);
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
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('order_detail.create_new_customer', 'Create New Customer')}</Dialog.Title>
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
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Button onPress={() => setNewCustomerModalVisible(false)} textColor={theme.colors.onSurfaceVariant}>{t('common.cancel')}</Button>
            <Button onPress={handleCreateCustomer} mode="contained" style={{ borderRadius: 20 }}>{t('common.save')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={newProductModalVisible} onDismiss={() => setNewProductModalVisible(false)} style={{ backgroundColor: theme.colors.surface, borderRadius: 24 }}>
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('product_detail.add_title', 'Create New Product')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('product_detail.name', 'Product Name') + ' *'}
              value={newProductName}
              onChangeText={setNewProductName}
              mode="outlined"
              style={[styles.input, { marginBottom: 12 }]}
              outlineStyle={{ borderRadius: 18 }}
            />
            <TextInput
              label={t('product_detail.price', 'Price') + ' *'}
              value={newProductPrice}
              onChangeText={setNewProductPrice}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, { marginBottom: 12 }]}
              outlineStyle={{ borderRadius: 18 }}
              left={<TextInput.Affix text="₹ " />}
            />
            <TextInput
              label={t('product_detail.quantity', 'Quantity')}
              value={newProductQuantity}
              onChangeText={setNewProductQuantity}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              outlineStyle={{ borderRadius: 18 }}
            />
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Button onPress={() => setNewProductModalVisible(false)} textColor={theme.colors.onSurfaceVariant}>{t('common.cancel')}</Button>
            <Button onPress={handleCreateProduct} mode="contained" style={{ borderRadius: 20 }}>{t('common.save')}</Button>
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
  itemsSection: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 12,
    borderRadius: 16,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyInput: {
    width: 60,
    height: 44,
    backgroundColor: 'transparent',
  },
  removeBtn: {
    padding: 4,
  },
  addProductBtn: {
    marginTop: 16,
    borderRadius: 16,
    borderStyle: 'dashed',
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
  orderCountBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
