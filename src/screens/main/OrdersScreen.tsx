import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider, FAB, IconButton, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewer from '../../components/ImageViewer';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function OrdersScreen() {
  const { orders, products, fetchOrders } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();

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
  }, []);

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface, opacity: 0.5, height: 120 }]}>
          <View style={styles.cardHeader}>
            <ShimmerPlaceholder width="40%" height={24} />
            <ShimmerPlaceholder width="20%" height={24} />
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <ShimmerPlaceholder width="70%" height={16} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="30%" height={16} style={{ marginBottom: 12 }} />
          <ShimmerPlaceholder width="60%" height={14} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title="अर्डरहरू" 
        onMenu={() => navigation.openDrawer()} 
      />

      {isLoading ? renderShimmer() : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableRipple
              onPress={() => navigation.navigate('OrderDetail', { id: item.id })}
              style={styles.cardWrapper}
              rippleColor={theme.colors.primary + '1A'}
            >
              <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text variant="titleMedium" style={[styles.orderId, { color: theme.colors.onSurface }]}>
                      अर्डर #{item.id}
                    </Text>
                    <Surface elevation={0} style={[styles.statusChip, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        {(item as any).order_status || 'Pending'}
                      </Text>
                    </Surface>
                  </View>
                  <Text variant="titleLarge" style={styles.orderPrice}>
                    ₹{parseFloat(item.total_price).toLocaleString()}
                  </Text>
                </View>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                <View style={styles.orderDetailRow}>
                  <Icon name="package-variant" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={[styles.orderText, { color: theme.colors.onSurface }]}>
                    {products.find(p => p.id === item.product)?.name || 'अज्ञात'} • {item.quantity} थान
                  </Text>
                </View>
                <View style={[styles.orderDetailRow, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Icon name="map-marker-outline" size={18} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={styles.locationText} numberOfLines={1}>
                      {item.location} • {item.phone}
                    </Text>
                  </View>
                  <IconButton
                    icon="eye"
                    size={20}
                    iconColor={theme.colors.primary}
                    onPress={() => navigation.navigate('OrderChat', { id: item.id })}
                    style={{ margin: 0 }}
                  />
                </View>
              </Surface>
            </TouchableRipple>
          )}
        />
      )}

      <FAB
        icon="cart-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('OrderDetail', { id: 'new' })}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24
  },
  headerTitleContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontWeight: '900',
    color: '#3B82F6',
    fontSize: 22,
  },
  headerSubtitle: {
    color: '#94A3B8',
    opacity: 0.5,
    marginTop: -2,
  },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 100 },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontWeight: '900' },
  orderPrice: { color: '#3B82F6', fontWeight: '900' },
  divider: { marginVertical: 4, height: 1, opacity: 0.5 },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  orderText: { fontWeight: '700' },
  locationText: { color: '#94A3B8' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 48,
    borderRadius: 20,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
