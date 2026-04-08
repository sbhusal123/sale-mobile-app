import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, orders, fetchCategories, fetchProducts, fetchOrders, fetchConfig } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchOrders(),
        fetchConfig(),
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchCategories, fetchProducts, fetchOrders, fetchConfig]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const totalOrders = orders?.length || 0;
  const totalSales = orders?.reduce((acc: number, o: any) => acc + parseFloat(o.total_price || 0), 0) || 0;

  const navItems = [
    { title: t('home.products'), description: t('home.manage_stock'), screen: 'Products', icon: 'package-variant-closed', color: theme.colors.primary },
    { title: t('home.categories'), description: t('home.view_category'), screen: 'Categories', icon: 'view-grid', color: '#10B981' },
    { title: t('home.orders'), description: t('home.view_orders'), screen: 'Orders', icon: 'cart', color: '#F59E0B' },
    { title: t('home.conversations'), description: t('home.inquiry_chat'), screen: 'Conversations', icon: 'chat-processing', color: '#6366F1' },
    { title: t('home.account'), description: t('account.title'), screen: 'Account', icon: 'account-circle', color: '#EC4899' },
  ];

  const renderShimmer = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={styles.statsContainer}>
        <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface, height: 80 }]}>
          <ShimmerPlaceholder width={44} height={44} borderRadius={14} />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder width="50%" height={10} style={{ marginBottom: 6 }} />
            <ShimmerPlaceholder width="70%" height={20} />
          </View>
        </Surface>
        <Surface elevation={1} style={[styles.statCard, { backgroundColor: theme.colors.surface, height: 80 }]}>
          <ShimmerPlaceholder width={44} height={44} borderRadius={14} />
          <View style={{ flex: 1 }}>
            <ShimmerPlaceholder width="50%" height={10} style={{ marginBottom: 6 }} />
            <ShimmerPlaceholder width="70%" height={20} />
          </View>
        </Surface>
      </View>

      <View style={styles.sectionHeader}>
        <ShimmerPlaceholder width={120} height={24} borderRadius={4} />
      </View>

      <View style={styles.grid}>
        {[1, 2, 3, 4].map(i => (
          <Surface key={i} elevation={1} style={[styles.cardSurface, { width: '47.5%', height: 180, marginBottom: 16, backgroundColor: theme.colors.surface }]}>
            <View style={{ padding: 20 }}>
              <ShimmerPlaceholder width={52} height={52} borderRadius={16} style={{ marginBottom: 20 }} />
              <ShimmerPlaceholder width="80%" height={18} style={{ marginBottom: 10 }} />
              <ShimmerPlaceholder width="60%" height={12} />
            </View>
          </Surface>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={t('home.dashboard')}
        onMenu={() => navigation.openDrawer()}
        icon="home"
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.welcomeSection}>
          <View>
            <Text variant="headlineSmall" style={[styles.welcomeText, { color: theme.colors.onSurface }]}>
              {t('home.hello')}, {user?.name?.split(' ')[0] || 'User'}!
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
              {t('home.today_progress')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={[styles.bellBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline, borderWidth: 1 }]}
          >
            <Icon name="bell-outline" size={24} color={theme.colors.primary} />
            <View style={[styles.badge, { backgroundColor: theme.colors.error }]} />
          </TouchableOpacity>
        </View>

        {isLoading ? renderShimmer() : (
          <>
            <View style={styles.statsContainer}>
              <Surface elevation={2} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Icon name="shopping" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>{t('home.today_orders')}</Text>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{totalOrders}</Text>
                </View>
              </Surface>

              <Surface elevation={2} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIconBox, { backgroundColor: '#10B98115' }]}>
                  <Icon name="currency-inr" size={22} color="#10B981" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statTitle, { color: theme.colors.onSurfaceVariant }]}>{t('home.total_sales')}</Text>
                  <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>₹{totalSales.toLocaleString()}</Text>
                </View>
              </Surface>
            </View>

            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '900' }}>
                {t('home.quick_menu')}
              </Text>
            </View>

            <View style={styles.grid}>
              {navItems.map((item) => (
                <Surface
                  key={item.screen}
                  elevation={1}
                  style={[styles.cardSurface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}
                >
                  <TouchableRipple
                    onPress={() => navigation.navigate(item.screen)}
                    style={styles.cardRipple}
                    rippleColor={item.color + '1A'}
                  >
                    <View style={styles.cardInner}>
                      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                        <Icon name={item.icon as any} size={28} color={item.color} />
                      </View>
                      <Text variant="titleMedium" style={[styles.navTitle, { color: theme.colors.onSurface }]}>
                        {item.title}
                      </Text>
                      <Text variant="bodySmall" numberOfLines={2} style={[styles.navDesc, { color: theme.colors.onSurfaceVariant }]}>
                        {item.description}
                      </Text>
                    </View>
                  </TouchableRipple>
                </Surface>
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
    paddingTop: 24,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 18,
    paddingHorizontal: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
  },
  cardSurface: {
    width: '47.5%',
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardRipple: {
    flex: 1,
  },
  cardInner: {
    padding: 20,
    minHeight: 180,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  navTitle: {
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  navDesc: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});
