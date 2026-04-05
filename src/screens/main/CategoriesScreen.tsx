import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, IconButton, Searchbar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function CategoriesScreen() {
  const { categories, fetchCategories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState((categories || []).length === 0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  const loadCategories = async (search = searchQuery) => {
    setIsLoading(true);
    await fetchCategories(search);
    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      loadCategories(query);
    }, 500);
  };

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: 'transparent', opacity: 0.5, height: 80 }]}>
          <ShimmerPlaceholder width="60%" height={24} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="90%" height={16} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title="वर्गहरू" 
        onMenu={() => navigation.openDrawer()} 
      />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="वर्ग खोज्नुहोस्..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
          inputStyle={[styles.searchInput, { color: theme.colors.onSurface }]}
          elevation={0}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

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
            <TouchableRipple
              onPress={() => navigation.navigate('CategoryDetail', { id: item.id })}
              style={styles.cardWrapper}
              rippleColor={theme.colors.primary + '1A'}
            >
              <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <View style={styles.cardInfo}>
                  <Text variant="titleMedium" style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={[styles.categoryDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={24}
                  iconColor={theme.colors.primary}
                />
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
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20
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
  searchBar: {
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 48,
  },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 100 },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '900',
    fontSize: 18,
  },
  categoryDesc: {
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 48,
    borderRadius: 20,
  },
});
