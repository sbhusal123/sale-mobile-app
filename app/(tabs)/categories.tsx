import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme, FAB, TouchableRipple } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function CategoriesScreen() {
  const { user, categories } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        वर्गहरू (Categories)
      </Text>
      
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableRipple onPress={() => router.push(`/category/${item.id}`)}>
            <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                {item.title}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, opacity: 0.8, marginTop: 4 }}>
                {item.description}
              </Text>
            </Surface>
          </TouchableRipple>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/category/new')}
        color="#31241f"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: { fontWeight: 'bold', marginBottom: 20, marginLeft: 4 },
  list: { gap: 14, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16, justifyContent: 'center' },
  fab: { position: 'absolute', right: 24, bottom: 48 },
});