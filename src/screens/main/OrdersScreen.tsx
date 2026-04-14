import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider, FAB, IconButton, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

const OrderItem = React.memo(({ item, theme, t, products, onNavigate, onChat }: any) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'processing': return '#6366F1';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const status = (item as any).order_status || 'Pending';
  const statusColor = getStatusColor(status);

  return (
    <Surface elevation={2} style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
      <TouchableRipple
        onPress={() => onNavigate(item.id)}
        style={styles.cardRipple}
        rippleColor={theme.colors.primary + '1A'}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={[styles.orderId, { color: theme.colors.onSurface }]}>
                {t('orders.order_id', { id: item.id })}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text variant="labelSmall" style={[styles.statusText, { color: statusColor }]}>
                  {status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text variant="headlineSmall" style={[styles.orderPrice, { color: theme.colors.onSurface }]}>
              ₹{parseFloat(item.total_price).toLocaleString()}
            </Text>
          </View>

          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

          <View style={styles.infoSection}>
            <View style={styles.orderDetailRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                <Icon name="package-variant" size={18} color={theme.colors.primary} />
              </View>
              <Text variant="bodyMedium" style={[styles.productText, { color: theme.colors.onSurface }]}>
                {(() => {
                  const firstItem = item.items?.[0];
                  const otherCount = (item.items?.length || 0) - 1;
                  const prodName = products.find((p: any) => p.id === firstItem?.product)?.name || t('orders.unknown');
                  const totalQty = item.items?.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0) || 0;
                  
                  return (
                    <>
                      {prodName}
                      {otherCount > 0 && <Text style={{ color: theme.colors.primary, fontWeight: '900' }}> +{otherCount} more</Text>}
                      <Text style={{ opacity: 0.5 }}> • </Text>
                      {totalQty} {t('orders.units')}
                    </>
                  );
                })()}
              </Text>
            </View>

            <View style={styles.orderDetailRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.onSurfaceVariant + '10' }]}>
                <Icon name="calendar-range" size={18} color={theme.colors.onSurfaceVariant} />
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
              </Text>
            </View>

            <View style={[styles.orderDetailRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.onSurfaceVariant + '10' }]}>
                  <Icon name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
                </View>
                <Text variant="bodySmall" style={[styles.locationText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              {item.order_count !== undefined && (
                <View style={[styles.orderCountBadgeSmall, { backgroundColor: theme.colors.error + '10' }]}>
                  <Icon name="shopping-outline" size={14} color={theme.colors.error} />
                  <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: '800', marginLeft: 4 }}>
                    {item.order_count}
                  </Text>
                </View>
              )}

              <IconButton
                icon="message-text-outline"
                size={20}
                iconColor={item.chat_session ? theme.colors.primary : theme.colors.onSurfaceVariant}
                disabled={!item.chat_session}
                onPress={() => item.chat_session && onChat()}
                style={[styles.chatBtn, !item.chat_session && { opacity: 0.3 }]}
              />
            </View>
          </View>
        </View>
      </TouchableRipple>
    </Surface>
  );
});

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { orders, products, fetchOrders } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState((orders || []).length === 0);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await fetchOrders();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'processing': return '#6366F1';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <ShimmerPlaceholder width="40%" height={22} style={{ marginBottom: 6 }} />
              <ShimmerPlaceholder width="25%" height={18} borderRadius={8} />
            </View>
            <ShimmerPlaceholder width="30%" height={24} />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.orderDetailRow}>
            <ShimmerPlaceholder width={24} height={24} borderRadius={12} />
            <ShimmerPlaceholder width="60%" height={16} />
          </View>
          <View style={styles.orderDetailRow}>
            <ShimmerPlaceholder width={24} height={24} borderRadius={12} />
            <ShimmerPlaceholder width="80%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );

  console.log("orders", orders)

  const renderOrderItem = React.useCallback(({ item }: any) => (
    <OrderItem
      item={item}
      theme={theme}
      t={t}
      products={products}
      onNavigate={(id: any) => navigation.navigate('OrderDetail', { id })}
      onChat={() => navigation.navigate('OrderChat', { chatSessionId: item.chat_session, id: item.id })}
    />
  ), [theme, t, products, navigation]);


  console.log("Item::", orders)
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={t('orders.title')}
        onMenu={() => navigation.openDrawer()}
        icon="cart"
        onAdd={() => navigation.navigate('OrderDetail', { id: 'new' })}
      />

      {isLoading ? renderShimmer() : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
          }
          renderItem={renderOrderItem}
          getItemLayout={(_: any, index: number) => ({
            length: 226, // card height (~208) + gap (18)
            offset: 226 * index,
            index,
          })}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      <FAB
        icon="cart-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 32 + insets.bottom }]}
        onPress={() => navigation.navigate('OrderDetail', { id: 'new' })}
        color="#FFFFFF"
        label={t('common.add') || 'Add'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 16, gap: 18 },
  cardSurface: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardRipple: {
    width: '100%',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderId: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  orderPrice: {
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    opacity: 0.5,
    marginBottom: 16,
  },
  infoSection: {
    gap: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productText: {
    fontWeight: '800',
    fontSize: 15,
  },
  locationText: {
    fontWeight: '600',
    flex: 1,
  },
  chatBtn: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  orderCountBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 20,
    elevation: 6,
  },
  card: { // For Shimmer matching
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
});
