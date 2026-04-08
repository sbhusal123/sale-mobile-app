import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/auth-context';
import { useThemeContext } from '../context/theme-context';
import { useTranslation } from 'react-i18next';
import HeaderControls from '../components/HeaderControls';
import ShimmerPlaceholder from '../components/ShimmerPlaceholder';

const Icon = MaterialCommunityIcons as any;

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';

import AccountScreen from '../screens/main/AccountScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import HomeScreen from '../screens/main/HomeScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ChatSessionsScreen from '../screens/main/ChatSessionsScreen';

import CategoryDetailScreen from '../screens/details/CategoryDetailScreen';
import OrderDetailScreen from '../screens/details/OrderDetailScreen';
import ProductDetailScreen from '../screens/details/ProductDetailScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import OrderChatScreen from '../screens/details/OrderChatScreen';

import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      t('navigation.logout_confirm_title'),
      t('navigation.logout_confirm_msg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('navigation.logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1, paddingTop: 40 }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900' }}>{t('navigation.app_title')}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}>{t('navigation.app_subtitle')}</Text>
        </View>
        <View style={{ height: 1, backgroundColor: theme.colors.outline, opacity: 0.1, marginVertical: 16, marginHorizontal: 20 }} />
        <DrawerItemList {...props} />
      </View>
      
      <View style={{ paddingBottom: 20 }}>
        <View style={{ height: 1, backgroundColor: theme.colors.outline, opacity: 0.1, marginVertical: 16, marginHorizontal: 20 }} />
        
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <Text variant="labelMedium" style={{ marginBottom: 12, fontWeight: '900', opacity: 0.6 }}>{t('account.settings')}</Text>
          <HeaderControls />
        </View>

        <DrawerItem
          label={t('navigation.logout')}
          labelStyle={{ fontWeight: '900', color: theme.colors.error }}
          icon={({ color, size }) => <Icon name="logout" size={size} color={theme.colors.error} />}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function MainNavigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isDark } = useThemeContext();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      backBehavior="initialRoute"
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Products') iconName = focused ? 'package-variant-closed' : 'package-variant-closed-outline';
          else if (route.name === 'Categories') iconName = focused ? 'view-grid' : 'view-grid-outline';
          else if (route.name === 'Orders') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Conversations') iconName = focused ? 'chat-processing' : 'chat-processing-outline';
          else if (route.name === 'Account') iconName = focused ? 'account' : 'account-outline';

          return <Icon name={iconName} size={24} color={color} />;
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerLabelStyle: {
          marginLeft: 0,
          fontWeight: '900',
        }
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerLabel: t('navigation.home') }} />
      <Drawer.Screen name="Products" component={ProductsScreen} options={{ drawerLabel: t('navigation.products') }} />
      <Drawer.Screen name="Categories" component={CategoriesScreen} options={{ drawerLabel: t('navigation.categories') }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ drawerLabel: t('navigation.orders') }} />
      <Drawer.Screen name="Conversations" component={ChatSessionsScreen} options={{ drawerLabel: t('navigation.conversations') }} />
      <Drawer.Screen name="Account" component={AccountScreen} options={{ drawerLabel: t('navigation.account') }} />
    </Drawer.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ height: 60, backgroundColor: theme.colors.surface, paddingHorizontal: 20, justifyContent: 'center' }}>
          <ShimmerPlaceholder width={120} height={20} />
        </View>
        <ScrollView style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
            <View style={{ flex: 1, height: 80, borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12 }}>
              <ShimmerPlaceholder width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
              <ShimmerPlaceholder width="60%" height={12} />
            </View>
            <View style={{ flex: 1, height: 80, borderRadius: 16, backgroundColor: theme.colors.surface, padding: 12 }}>
              <ShimmerPlaceholder width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
              <ShimmerPlaceholder width="60%" height={12} />
            </View>
          </View>
          <ShimmerPlaceholder width={150} height={24} style={{ marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={{ width: '47%', height: 150, borderRadius: 20, backgroundColor: theme.colors.surface, padding: 20 }}>
                <ShimmerPlaceholder width={40} height={40} borderRadius={10} style={{ marginBottom: 12 }} />
                <ShimmerPlaceholder width="80%" height={16} style={{ marginBottom: 8 }} />
                <ShimmerPlaceholder width="60%" height={12} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="OrderChat" component={OrderChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
