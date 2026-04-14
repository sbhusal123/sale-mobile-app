import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Platform, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, FAB, Searchbar, Surface, Text, TouchableRipple, useTheme, Menu, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import ImageViewer from '../../components/ImageViewer';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useAuth } from '../../context/auth-context';
import { getImageUri } from '../../utils/url';

const Icon = MaterialCommunityIcons as any;

const ProductItem = React.memo(({ item, theme, t, onNavigate, onOpenViewer, onLongPress }: any) => (
  <Surface elevation={2} style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
    <TouchableRipple
      onPress={() => onNavigate(item.id)}
      onLongPress={(e) => onLongPress(item, e)}
      delayLongPress={500}
      style={styles.cardRipple}
      rippleColor={theme.colors.primary + '1A'}
    >
      <View style={styles.cardContent}>
        <TouchableOpacity
          onPress={() => item.image && onOpenViewer(item.image)}
          activeOpacity={0.8}
          style={styles.imageContainer}
        >
          {item.image ? (
            <Image source={{ uri: getImageUri(item.image) || '' }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.emptyImage, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Icon name="package-variant" size={32} color={theme.colors.primary} />
            </View>
          )}
          {item.quantity <= 5 && item.quantity > 0 && (
            <View style={[styles.lowStockBadge, { backgroundColor: '#FB7185' }]}>
              <Text style={styles.badgeText}>{t('products.low_stock')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.info}>
          <Text variant="titleMedium" style={[styles.productName, { color: theme.colors.onSurface }]}>
            {item.name}
          </Text>
          <Text variant="labelSmall" style={[styles.categoryName, { color: theme.colors.primary }]}>
            {item.category?.title?.toUpperCase()}
          </Text>

          <View style={styles.priceRow}>
            <Text variant="headlineSmall" style={[styles.priceText, { color: theme.colors.onSurface }]}>
              ₹{parseFloat(item.price).toLocaleString()}
            </Text>
            <View style={[styles.stockBox, { backgroundColor: item.quantity > 0 ? theme.colors.secondary + '15' : theme.colors.error + '15' }]}>
              <Text style={[styles.stockText, { color: item.quantity > 0 ? theme.colors.secondary : theme.colors.error }]}>
                {item.quantity > 0 ? t('products.units_left', { count: item.quantity }) : t('products.out_of_stock')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableRipple>
  </Surface>
));

export default function ProductsScreen() {
  const { t } = useTranslation();
  const { products, fetchProducts, categories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState((products || []).length === 0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);
  const [viewerVisible, setViewerVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  // Menu State
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);

  const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

  const loadProducts = async (search = searchQuery, category = selectedCategoryId) => {
    setIsLoading(true);
    await fetchProducts({ search, category });
    setIsLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
    }, [selectedCategoryId])
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
    loadProducts(searchQuery, id);
  };

  const openViewer = (uri: string) => {
    setViewerVisible(true);
  };

  const handleLongPress = (product: any, event: any) => {
    const { nativeEvent } = event;
    const anchor = { x: nativeEvent.pageX, y: nativeEvent.pageY };
    setSelectedProduct(product);
    setMenuAnchor(anchor);
    setMenuVisible(true);
  };

  const handleCreateOrder = () => {
    setMenuVisible(false);
    if (selectedProduct) {
      navigation.navigate('OrderDetail', { id: 'new', productId: selectedProduct.id });
    }
  };

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ShimmerPlaceholder width={90} height={90} borderRadius={16} />
          <View style={styles.info}>
            <ShimmerPlaceholder width="70%" height={18} style={{ marginBottom: 6 }} />
            <ShimmerPlaceholder width="40%" height={12} style={{ marginBottom: 12 }} />
            <View style={styles.priceRow}>
              <ShimmerPlaceholder width="30%" height={22} />
              <ShimmerPlaceholder width="35%" height={24} borderRadius={8} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderProductItem = React.useCallback(({ item }: any) => (
    <ProductItem 
      item={item} 
      theme={theme} 
      t={t} 
      onNavigate={(id: any) => navigation.navigate('ProductDetail', { id })}
      onOpenViewer={openViewer}
      onLongPress={handleLongPress}
    />
  ), [theme, t, navigation, openViewer]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title={t('products.title')} 
        onMenu={() => navigation.openDrawer()} 
        icon="package-variant-closed"
        onAdd={() => navigation.navigate('ProductDetail', { id: 'new', categoryId: selectedCategoryId })}
      />

      <View style={styles.headerControls}>
        <Searchbar
          placeholder={t('products.search_placeholder')}
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
          inputStyle={[styles.searchInput, { color: theme.colors.onSurface }]}
          elevation={2}
          iconColor={theme.colors.primary}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />

        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            data={[{ id: null, title: t('products.all') }, ...categories]}
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
                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }
                ]}
                textStyle={[
                  styles.chipText,
                  { color: selectedCategoryId === item.id ? '#FFFFFF' : theme.colors.onSurfaceVariant }
                ]}
                mode="flat"
                showSelectedOverlay
              >
                {item.title}
              </Chip>
            )}
            contentContainerStyle={styles.categoryList}
          />
        </View>
      </View>

      {isLoading ? renderShimmer() : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
          }
          renderItem={renderProductItem}
          getItemLayout={(_: any, index: number) => ({
            length: 146, // 128 (card height) + 18 (gap)
            offset: 146 * index,
            index,
          })}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: 32 + insets.bottom }]}
        onPress={() => navigation.navigate('ProductDetail', { id: 'new', categoryId: selectedCategoryId })}
        color="#FFFFFF"
        label={t('common.add') || 'Add'}
      />

      <ImageViewer
        visible={viewerVisible}
        imageUri={selectedImage}
        onClose={() => setViewerVisible(false)}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuAnchor}
        contentStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
      >
        <Menu.Item 
          onPress={handleCreateOrder} 
          title={t('order_detail.create_new_order', 'Create an order')} 
          leadingIcon="cart-plus"
        />
        <Menu.Item 
          onPress={() => { setMenuVisible(false); navigation.navigate('ProductDetail', { id: selectedProduct.id }); }} 
          title={t('common.edit', 'Edit Product')} 
          leadingIcon="pencil-outline"
        />
      </Menu>
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
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 15,
    minHeight: 52,
    fontWeight: '500',
  },
  categoryContainer: { marginBottom: 12 },
  categoryList: { paddingHorizontal: 20, gap: 10 },
  chip: {
    height: 38,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
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
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  info: { flex: 1, justifyContent: 'center' },
  productName: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  categoryName: {
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 12,
    opacity: 0.8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  stockBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 20,
    elevation: 6,
  },
  card: { // For Shimmer matching
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
});
