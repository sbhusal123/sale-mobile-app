import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Surface, Text, useTheme, Divider, FAB, TouchableRipple } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';
import BackButton from '../../components/BackButton';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

export default function OrdersScreen() {
  const { orders, products, fetchOrders } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(orders.length === 0);

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
      <BackButton onPress={() => navigation.navigate('Home')} />
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        अर्डरहरू (Orders)
      </Text>

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
            <TouchableRipple onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
              <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                    अर्डर #{item.id}
                  </Text>
                  <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    ₹{parseFloat(item.total_price).toFixed(2)}
                  </Text>
                </View>
                <Divider style={{ marginVertical: 8, backgroundColor: theme.colors.surfaceVariant }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  <Text style={{ fontWeight: 'bold' }}>उत्पादन:</Text> {products.find(p => p.id === item.product)?.name || 'अज्ञात'}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  <Text style={{ fontWeight: 'bold' }}>मात्रा:</Text> {item.quantity}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7, marginTop: 8 }}>
                  स्थान: {item.location} • फोन: {item.phone}
                </Text>
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: { fontWeight: 'bold', marginBottom: 20, marginLeft: 4 },
  list: { gap: 14, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fab: { position: 'absolute', right: 24, bottom: 48 },
});
