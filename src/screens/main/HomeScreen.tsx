import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import { useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function HomeScreen() {
  const { user, logout, orders, fetchCategories, fetchProducts, fetchOrders, fetchConfig } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchOrders(),
      fetchConfig(),
    ]);
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    if (user) {
      onRefresh();
    }
  }, []);

  const totalOrders = orders?.length || 0;
  const totalSales = orders?.reduce((acc: number, o: any) => acc + parseFloat(o.total_price || 0), 0) || 0;

  const navItems = [
    { title: 'उत्पादनहरू', description: 'स्टक प्रबन्ध गर्नुहोस्।', screen: 'Products', icon: 'package-variant-closed' },
    { title: 'वर्गहरू', description: 'वर्ग विवरण हेर्नुहोस्।', screen: 'Categories', icon: 'view-grid' },
    { title: 'अर्डरहरू', description: 'अर्डर इतिहास हेर्नुहोस्।', screen: 'Orders', icon: 'cart' },
    { title: 'कुराकानीहरू', description: 'सोधपुछका कुराहरू।', screen: 'Conversations', icon: 'chat-processing' },
    { title: 'खाता', description: 'प्रोफाइल र लग आउट गर्नुहोस्।', screen: 'Account', icon: 'account-circle' },
  ];

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

        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '900', marginTop: 32, marginBottom: 16, paddingHorizontal: 16 }}>
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
    gap: 12,
    paddingHorizontal: 16,
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
    gap: 12,
    paddingHorizontal: 16,
  },
  cardRipple: {
    width: '47%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardSurface: {
    padding: 20,
    borderRadius: 24,
    minHeight: 160,
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
