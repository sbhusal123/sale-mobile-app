import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';
import { Chip, FAB, IconButton, Searchbar, Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImageViewer from '../../components/ImageViewer';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/auth-context';
import { getImageUri } from '../../utils/url';

const Icon = MaterialCommunityIcons as any;

export default function ProductsScreen() {
  const { products, fetchProducts, categories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState((products || []).length === 0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  const loadProducts = async (search = searchQuery, category = selectedCategoryId) => {
    setIsLoading(true);
    await fetchProducts({ search, category });
    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [selectedCategoryId]) // Reload when category changes or when screen focuses
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  }, [searchQuery, selectedCategoryId]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      loadProducts(query, selectedCategoryId);
    }, 500);
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    // loadProducts will be called by useFocusEffect's dependency or manually
    loadProducts(searchQuery, id);
  };

  const openViewer = (uri: string) => {
    setSelectedImage(getImageUri(uri));
    setViewerVisible(true);
  };

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface, opacity: 0.5 }]}>
          <ShimmerPlaceholder width={80} height={80} borderRadius={12} />
          <View style={styles.info}>
            <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: 12 }} />
            <View style={styles.priceRow}>
              <ShimmerPlaceholder width="30%" height={24} />
              <ShimmerPlaceholder width="30%" height={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title="उत्पादनहरू" 
        onMenu={() => navigation.openDrawer()} 
      />
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="सामान खोज्नुहोस्..."
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }]}
          inputStyle={[styles.searchInput, { color: theme.colors.onSurface }]}
          elevation={0}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />
      </View>

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={[{ id: null, title: 'सबै' }, ...categories]}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              selected={selectedCategoryId === item.id}
              onPress={() => handleCategorySelect(item.id)}
              style={[
                styles.chip,
                selectedCategoryId === item.id 
                  ? { backgroundColor: theme.colors.primary } 
                  : { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }
              ]}
              textStyle={[
                styles.chipText,
                selectedCategoryId === item.id 
                  ? { color: '#fff' } 
                  : { color: theme.colors.onSurfaceVariant }
              ]}
              showSelectedOverlay={false}
              mode="flat"
            >
              {item.title}
            </Chip>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {isLoading ? renderShimmer() : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableRipple
              onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
              style={styles.cardWrapper}
              rippleColor={theme.colors.primary + '1A'}
            >
              <Surface elevation={1} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <TouchableRipple
                  onPress={() => item.image && openViewer(item.image)}
                  style={styles.imageWrapper}
                  rippleColor={theme.colors.primary + '33'}
                >
                  <View>
                    {item.image ? (
                      <Image source={{ uri: getImageUri(item.image) || '' }} style={styles.image} resizeMode="cover" />
                    ) : (
                      <View style={[styles.image, styles.emptyImage]}>
                        <Icon name="package-variant" size={32} color={theme.colors.primary + '4D'} />
                      </View>
                    )}
                    {item.quantity <= 5 && item.quantity > 0 && (
                      <View style={styles.lowStockBadge}>
                        <Text style={styles.badgeText}>न्यून स्टक</Text>
                      </View>
                    )}
                  </View>
                </TouchableRipple>

                <View style={styles.info}>
                  <Text variant="titleMedium" style={[styles.productName, { color: theme.colors.onSurface }]}>
                    {item.name}
                  </Text>
                  <Text variant="labelSmall" style={[styles.categoryName, { color: theme.colors.primary }]}>
                    {item.category.title}
                  </Text>

                  <View style={styles.priceRow}>
                    <Text variant="titleLarge" style={[styles.priceText, { color: theme.colors.onSurface }]}>
                      ₹{parseFloat(item.price).toLocaleString()}
                    </Text>
                    <View style={[styles.stockBox, { backgroundColor: item.quantity > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Text style={[styles.stockText, { color: item.quantity > 0 ? theme.colors.secondary : theme.colors.error }]}>
                        {item.quantity > 0 ? `${item.quantity} बाँकी` : 'सकियो'}
                      </Text>
                    </View>
                  </View>
                </View>
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.arrowBtn}
                />
              </Surface>
            </TouchableRipple>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ProductDetail', { id: 'new' })}
        color="#fff"
      />

      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImage}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: 16,
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
    color: '#D4AF37',
    fontSize: 20,
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
  categoryContainer: { marginBottom: 20 },
  categoryList: { paddingHorizontal: 16, gap: 10 },
  chip: {
    height: 36,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: { paddingHorizontal: 16, gap: 16, paddingBottom: 100 },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.05)',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  lowStockBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#FB7185',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    elevation: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  info: { flex: 1, justifyContent: 'center' },
  productName: {
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 2,
  },
  categoryName: {
    opacity: 0.8,
    marginBottom: 8,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priceText: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  stockBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  arrowBtn: {
    margin: 0,
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 48,
    borderRadius: 20,
  },
});
