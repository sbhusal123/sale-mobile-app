import React from 'react';
import { StyleSheet, View, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { Surface, Text, TouchableRipple, useTheme, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';
import BackButton from '../../components/BackButton';

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

  const totalOrders = orders.length;
  const totalSales = orders.reduce((acc, o) => acc + parseFloat(o.total_price), 0);

  const navItems = [
    { title: 'उत्पादनहरू', description: 'स्टक प्रबन्ध गर्नुहोस्।', screen: 'Products', icon: 'package-variant-closed' },
    { title: 'वर्गहरू', description: 'वर्ग विवरण हेर्नुहोस्।', screen: 'Categories', icon: 'view-grid' },
    { title: 'अर्डरहरू', description: 'अर्डर इतिहास हेर्नुहोस्।', screen: 'Orders', icon: 'cart' },
    { title: 'खाता', description: 'प्रोफाइल र लग आउट गर्नुहोस्।', screen: 'Account', icon: 'account-circle' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BackButton label="लगआउट (Logout)" onPress={() => logout()} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
               स्वागत छ {user?.name ?? 'बिक्रेता'}
            </Text>
          </View>
          <IconButton 
            icon="bell" 
            size={24} 
            iconColor={theme.colors.primary} 
            onPress={() => navigation.navigate('Notifications')} 
          />
        </View>

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
            <TouchableRipple
              key={item.screen}
              onPress={() => navigation.navigate(item.screen)}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
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
