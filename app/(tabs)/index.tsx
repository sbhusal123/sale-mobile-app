import { Link, Redirect } from 'expo-router';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/app/context/auth-context';

export default function HomeScreen() {
  const { user, orders } = useAuth();
  const theme = useTheme();

  if (!user) {
    return <Redirect href="/login" />;
  }

  const totalOrders = orders.length;
  const totalSales = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  const navItems = [
    { title: 'उत्पादनहरू', description: 'स्टक प्रबन्ध गर्नुहोस्।', href: '/products', icon: 'package-variant-closed' },
    { title: 'वर्गहरू', description: 'वर्ग विवरण हेर्नुहोस्।', href: '/categories', icon: 'view-grid' },
    { title: 'अर्डरहरू', description: 'अर्डर इतिहास हेर्नुहोस्।', href: '/orders', icon: 'cart' },
    { title: 'खाता', description: 'प्रोफाइल र लग आउट गर्नुहोस्।', href: '/account', icon: 'account-circle' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
          स्वागत छ {user?.name ?? 'बिक्रेता'}
        </Text>
      </View>

      {/* DISTINCT UI FOR STATS */}
      <View style={styles.statsContainer}>
        <Surface elevation={4} style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
          <MaterialCommunityIcons name="shopping-outline" size={40} color="#1b263b" style={styles.statIcon} />
          <Text style={styles.statTitle}>आजको कुल अर्डरहरू</Text>
          <Text style={styles.statValue}>{totalOrders}</Text>
        </Surface>

        <Surface elevation={4} style={[styles.statCard, { backgroundColor: '#4ade80' }]}>
          <MaterialCommunityIcons name="cash-multiple" size={40} color="#1b263b" style={styles.statIcon} />
          <Text style={[styles.statTitle, { color: '#0f172a' }]}>आजको कुल बिक्री मूल्य</Text>
          <Text style={[styles.statValue, { color: '#0f172a' }]}>₹ {totalSales.toLocaleString()}</Text>
        </Surface>
      </View>

      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, opacity: 0.8, marginTop: 24, marginBottom: 12 }}>
        द्रुत मेनु
      </Text>

      <View style={styles.grid}>
        {navItems.map((item) => (
          <Link href={item.href as any} asChild key={item.href}>
            <TouchableRipple
              style={[styles.cardRipple, { backgroundColor: theme.colors.surface }]}
              rippleColor="rgba(255, 255, 255, 0.15)"
            >
              <Surface elevation={2} style={[styles.cardSurface, { backgroundColor: theme.colors.surface }]}>
                <MaterialCommunityIcons name={item.icon as any} size={32} color={theme.colors.primary} style={styles.cardIcon} />
                <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginTop: 6, opacity: 0.8 }}>
                  {item.description}
                </Text>
              </Surface>
            </TouchableRipple>
          </Link>
        ))}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statIcon: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardRipple: {
    width: '47%',
    borderRadius: 16,
  },
  cardSurface: {
    padding: 16,
    borderRadius: 16,
    minHeight: 130,
    justifyContent: 'center',
  },
  cardIcon: {
    marginBottom: 12,
  },
});
