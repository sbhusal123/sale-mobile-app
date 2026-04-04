import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { Surface, Text, useTheme, FAB, TouchableRipple } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';
import BackButton from '../../components/BackButton';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

export default function CategoriesScreen() {
  const { categories, fetchCategories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(categories.length === 0);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await fetchCategories();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, []);

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface, opacity: 0.5, height: 80 }]}>
          <ShimmerPlaceholder width="60%" height={24} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="90%" height={16} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BackButton onPress={() => navigation.navigate('Home')} />
      
      <Text variant="headlineMedium" style={[styles.header, { color: theme.colors.onBackground }]}>
        वर्गहरू (Categories)
      </Text>

      {isLoading ? renderShimmer() : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableRipple onPress={() => navigation.navigate('CategoryDetail', { id: item.id })}>
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
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CategoryDetail', { id: 'new' })}
        color="#fff"
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
