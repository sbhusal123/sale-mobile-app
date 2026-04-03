import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme, Divider, FAB, TouchableRipple } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function OrdersScreen() {
  const { user, orders, products } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const findProductTitle = (productId: string) => products.find((prod) => prod.id === productId)?.title || 'अज्ञात';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        अर्डरहरू (Orders)
      </Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableRipple onPress={() => router.push(`/order/${item.id}`)}>
            <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                  अर्डर #{item.id}
                </Text>
                <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  ₹{item.totalPrice.toFixed(2)}
                </Text>
              </View>
              <Divider style={{ marginVertical: 8, backgroundColor: theme.colors.surfaceVariant }} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                <Text style={{ fontWeight: 'bold' }}>उत्पादन:</Text> {findProductTitle(item.productId)}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                <Text style={{ fontWeight: 'bold' }}>मात्रा:</Text> {item.qty}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface, opacity: 0.7, marginTop: 8 }}>
                {item.address} • {item.contact}
              </Text>
            </Surface>
          </TouchableRipple>
        )}
      />

      <FAB
        icon="cart-plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/order/new')}
        color="#31241f"
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