import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, Menu, Surface, Text, TextInput, useTheme, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';

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

  const [productMenuVisible, setProductMenuVisible] = useState(false);

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

    const data: any = {
      product: productId,
      quantity: parseInt(qty, 10) || 1,
      total_price: totalPrice || "0",
      location,
      phone,
      special_instructions: specialInstructions,
      order_status: orderStatus,
      chat_user: existingOrder?.chat_user || "",
      chat_session: existingOrder?.chat_session || "",
    };

    let success = false;
    if (isNew) {
      success = await addOrder(data);
    } else {
      success = await editOrder(Number(id), data);
    }

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = () => {
    Alert.alert(t('order_detail.delete_confirm'), t('common.confirm_delete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          const success = await deleteOrder(Number(id));
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
              <Menu
                visible={productMenuVisible}
                onDismiss={() => setProductMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    onPress={() => setProductMenuVisible(true)}
                    style={[styles.menuAnchor, { borderColor: theme.colors.outline, borderWidth: 1 }]}
                  >
                    <View style={styles.menuAnchorLeft}>
                      <Icon name="package-variant" size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                      <Text style={{ color: theme.colors.onSurface, fontWeight: '500' }}>
                        {selectedProduct ? selectedProduct.name : t('order_detail.product')}
                      </Text>
                    </View>
                    <Icon name="chevron-down" size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                }
                contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 18 }}
              >
                {products.map((p) => (
                  <Menu.Item
                    key={p.id}
                    onPress={() => {
                      setProductId(p.id);
                      setProductMenuVisible(false);
                    }}
                    title={p.name}
                  />
                ))}
              </Menu>

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

              <TextInput
                label={t('order_detail.phone')}
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
              />

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

            {!isNew && (existingOrder as any)?.user && (
              <View style={styles.customerCardSection}>
                <Divider style={styles.cardDivider} />
                <View style={styles.sectionHeader}>
                  <Icon name="account-details-outline" size={22} color={theme.colors.primary} />
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{t('order_detail.customer_details')}</Text>
                </View>
                <View style={[styles.customerInfoBox, { backgroundColor: theme.colors.primary + '08', borderRadius: 18 }]}>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.full_name')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{((existingOrder as any).user).name || '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('order_detail.phone')}</Text>
                    <Text variant="bodyLarge" style={{ fontWeight: '700' }}>{((existingOrder as any).user).phone || '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.email')}</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{((existingOrder as any).user).email || '---'}</Text>
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
                    onPress={() => navigation.navigate('OrderChat', { id: item.id })}
                    style={[styles.flexBtn, { marginRight: 8 }]}
                    contentStyle={styles.btnContent}
                    labelStyle={styles.flexBtnLabel}
                    icon="chat-processing-outline"
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
