import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View, TouchableOpacity } from 'react-native';
import { FAB, IconButton, Searchbar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const { categories, fetchCategories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ShimmerPlaceholder width={52} height={52} borderRadius={16} />
          <View style={styles.cardInfo}>
            <ShimmerPlaceholder width="50%" height={20} style={{ marginBottom: 6 }} />
            <ShimmerPlaceholder width="80%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title={t('categories.title')} 
        onMenu={() => navigation.openDrawer()} 
      />
      
      <View style={styles.headerControls}>
        <Searchbar
          placeholder={t('categories.search_placeholder')}
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          inputStyle={[styles.searchInput, { color: theme.colors.onSurface }]}
          elevation={2}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      {isLoading ? renderShimmer() : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => (
            <Surface elevation={2} style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <TouchableRipple
                onPress={() => navigation.navigate('CategoryDetail', { id: item.id })}
                style={styles.cardRipple}
                rippleColor={theme.colors.primary + '1A'}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Icon name="tag-outline" size={26} color={theme.colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium" style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={[styles.categoryDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                      {item.description || t('categories.no_description') || 'No description provided.'}
                    </Text>
                  </View>
                  <IconButton
                    icon="chevron-right"
                    size={22}
                    iconColor={theme.colors.primary}
                    style={styles.arrowBtn}
                  />
                </View>
              </TouchableRipple>
            </Surface>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 32 + insets.bottom }]}
        onPress={() => navigation.navigate('CategoryDetail', { id: 'new' })}
        color="#FFFFFF"
        label={t('common.add') || 'Add'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerControls: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginHorizontal: 20,
    borderRadius: 18,
    height: 52,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 15,
    minHeight: 52,
    fontWeight: '500',
  },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 18 },
  cardSurface: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },
  cardRipple: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  categoryDesc: {
    lineHeight: 18,
    fontWeight: '600',
    opacity: 0.8,
  },
  arrowBtn: {
    margin: 0,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 20,
    elevation: 6,
  },
  card: { // For Shimmer matching
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
});
