import React from 'react';
import { FlatList, Image, StyleSheet, View, RefreshControl } from 'react-native';
import { Surface, Text, useTheme, FAB, TouchableRipple } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';
import BackButton from '../../components/BackButton';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';

export default function ProductsScreen() {
  const { products, fetchProducts, categories } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(products.length === 0);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setIsLoading(true);
        await fetchProducts();
        setIsLoading(false);
      };
      load();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const renderShimmer = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface, opacity: 0.5 }]}>
          <ShimmerPlaceholder width={80} height={80} borderRadius={12} />
          <View style={styles.info}>
            <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="40%" height={16} style={{ marginBottom: 12 }} />
            <View style={styles.statsRow}>
              <ShimmerPlaceholder width="30%" height={16} />
              <ShimmerPlaceholder width="30%" height={16} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <BackButton onPress={() => navigation.navigate('Home')} />
      
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
            <TouchableRipple onPress={() => navigation.navigate('ProductDetail', { id: item.id })}>
              <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.image} />
                ) : (
                  <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialCommunityIcons name="package-variant" size={40} color={theme.colors.onSurfaceVariant} />
                  </View>
                )}
                <View style={styles.info}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.primary, marginVertical: 4 }}>
                    {item.category.title}
                  </Text>
                <View style={styles.statsRow}>
                    <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                      ₹{parseFloat(item.price).toFixed(2)}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface, opacity: 0.7 }}>
                      स्टक: {item.quantity}
                    </Text>
                    </View>
                </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 60 },
  header: { fontWeight: 'bold', marginBottom: 20, marginLeft: 4 },
  list: { gap: 14, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  image: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#333' },
  info: { flex: 1, justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  fab: { position: 'absolute', right: 24, bottom: 48 },
});
