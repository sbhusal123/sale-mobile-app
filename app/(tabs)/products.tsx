import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme, FAB, TouchableRipple } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function ProductsScreen() {
  const { user, products, categories } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const byCategory = (catId: string) => categories.find((cat) => cat.id === catId)?.title ?? 'अज्ञात';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        उत्पादनहरू (Utpadan)
      </Text>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableRipple onPress={() => router.push(`/product/${item.id}`)}>
            <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View style={styles.info}>
                <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.primary, marginVertical: 4 }}>
                  {byCategory(item.categoryId)}
                </Text>
                <View style={styles.statsRow}>
                  <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                    ₹{item.unitPrice.toFixed(2)}
                  </Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                    स्टक: {item.stockQty}
                  </Text>
                </View>
              </View>
            </Surface>
          </TouchableRipple>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/product/new')}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: { fontWeight: 'bold', marginBottom: 20, marginLeft: 4 },
  list: { gap: 14, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#333' },
  info: { flex: 1, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  fab: { position: 'absolute', right: 24, bottom: 48 },
});