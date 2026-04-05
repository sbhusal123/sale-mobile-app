import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function HomeScreen() {
  const { user, logout, orders, fetchCategories, fetchProducts, fetchOrders, fetchConfig } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchOrders(),
      fetchConfig(),
    ]);
    setIsLoading(false);
    setRefreshing(false);
  }, [fetchCategories, fetchProducts, fetchOrders, fetchConfig]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await onRefresh();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const totalOrders = orders?.length || 0;
  const totalSales = orders?.reduce((acc: number, o: any) => acc + parseFloat(o.total_price || 0), 0) || 0;

  const navItems = [
    { title: 'उत्पादनहरू', description: 'स्टक प्रबन्ध गर्नुहोस्।', screen: 'Products', icon: 'package-variant-closed' },
    { title: 'वर्गहरू', description: 'वर्ग विवरण हेर्नुहोस्।', screen: 'Categories', icon: 'view-grid' },
    { title: 'अर्डरहरू', description: 'अर्डर इतिहास हेर्नुहोस्।', screen: 'Orders', icon: 'cart' },
    { title: 'कुराकानीहरू', description: 'सोधपुछका कुराहरू।', screen: 'Conversations', icon: 'chat-processing' },
    { title: 'खाता', description: 'प्रोफाइल र लग आउट गर्नुहोस्।', screen: 'Account', icon: 'account-circle' },
  ];

  const renderShimmer = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={styles.statsContainer}>
        <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <ShimmerPlaceholder width={40} height={40} borderRadius={12} />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder width="40%" height={10} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="60%" height={16} />
          </View>
        </Surface>
        <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <ShimmerPlaceholder width={40} height={40} borderRadius={12} />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder width="40%" height={10} style={{ marginBottom: 4 }} />
            <ShimmerPlaceholder width="60%" height={16} />
          </View>
        </Surface>
      </View>
      <ShimmerPlaceholder width="40%" height={24} style={{ marginTop: 32, marginBottom: 16 }} />
      <View style={styles.grid}>
        {[1, 2, 3, 4].map(i => (
          <Surface key={i} elevation={1} style={[styles.cardSurface, { width: '47%', marginBottom: 12, backgroundColor: theme.colors.surface }]}>
            <ShimmerPlaceholder width={48} height={48} borderRadius={14} style={{ marginBottom: 16 }} />
            <ShimmerPlaceholder width="70%" height={16} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="90%" height={12} />
          </Surface>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title="ड्यासबोर्ड"
        onMenu={() => navigation.openDrawer()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.welcomeSection}>
          <View>
            <Text variant="headlineSmall" style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
              नमस्ते, {user?.name || 'User'}!
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              आजको प्रगति हेर्नुहोस्।
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.bellBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          >
            <Icon name="bell-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? renderShimmer() : (
          <>
            <View style={styles.statsContainer}>
              <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: theme.colors.primary }]}>
                <View style={[styles.statIconBox, { backgroundColor: theme.colors.primary + '1A' }]}>
                  <Icon name="shopping" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>आजको अर्डर</Text>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{totalOrders}</Text>
                </View>
              </Surface>

              <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface, borderLeftWidth: 4, borderLeftColor: theme.colors.secondary }]}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Icon name="currency-inr" size={24} color={theme.colors.secondary} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>कुल बिक्री</Text>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>₹{totalSales.toLocaleString()}</Text>
                </View>
              </Surface>
            </View>

            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '900', marginTop: 32, marginBottom: 16, paddingHorizontal: 20 }}>
              द्रुत मेनु
            </Text>

            <View style={styles.grid}>
              {navItems.map((item) => (
                <TouchableRipple
                  key={item.screen}
                  onPress={() => navigation.navigate(item.screen)}
                  style={styles.cardRipple}
                  rippleColor={theme.colors.primary + '1A'}
                >
                  <Surface elevation={1} style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Icon name={item.icon as any} size={28} color={theme.colors.primary} />
                    </View>
                    <Text variant="titleMedium" style={[styles.navTitle, { color: theme.colors.onSurface }]}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={[styles.navDesc, { color: theme.colors.onSurfaceVariant }]}>
                      {item.description}
                    </Text>
                  </Surface>
                </TouchableRipple>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: '900',
    fontSize: 24,
  },
  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
  },
  cardRipple: {
    width: '47.5%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardSurface: {
    padding: 24,
    borderRadius: 24,
    minHeight: 170,
    justifyContent: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  navTitle: {
    fontWeight: '900',
    fontSize: 16,
  },
  navDesc: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
});
