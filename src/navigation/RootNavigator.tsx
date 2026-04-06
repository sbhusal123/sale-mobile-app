import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/auth-context';
import { useThemeContext } from '../context/theme-context';

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

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Alert } from 'react-native';

function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'लग आउट',
      'के तपाईं निश्चित रूपमा लग आउट गर्न चाहनुहुन्छ?',
      [
        { text: 'रद्द गर्नुहोस्', style: 'cancel' },
        { text: 'लग आउट', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 40 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: '900' }}>बिक्री सहायक</Text>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}>स्मार्ट डिजिटल व्यवस्थापन</Text>
      </View>
      <View style={{ height: 1, backgroundColor: theme.colors.outline, opacity: 0.1, marginVertical: 16, marginHorizontal: 20 }} />
      <DrawerItemList {...props} />
      
      <View style={{ height: 1, backgroundColor: theme.colors.outline, opacity: 0.1, marginVertical: 16, marginHorizontal: 20 }} />
      <DrawerItem
        label="लग आउट गर्नुहोस्"
        labelStyle={{ fontWeight: '900', color: theme.colors.error }}
        icon={({ color, size }) => <Icon name="logout" size={size} color={theme.colors.error} />}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}

function MainNavigator() {
  const theme = useTheme();
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
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerLabel: 'गृहपृष्ठ' }} />
      <Drawer.Screen name="Products" component={ProductsScreen} options={{ drawerLabel: 'उत्पादनहरू' }} />
      <Drawer.Screen name="Categories" component={CategoriesScreen} options={{ drawerLabel: 'वर्गहरू' }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ drawerLabel: 'अर्डरहरू' }} />
      <Drawer.Screen name="Conversations" component={ChatSessionsScreen} options={{ drawerLabel: 'कुराकानीहरू' }} />
      <Drawer.Screen name="Account" component={AccountScreen} options={{ drawerLabel: 'खाता र सेटिङहरू' }} />
    </Drawer.Navigator>
  );
}

import { ActivityIndicator } from 'react-native';

export function RootNavigator() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      {!user ? (
        <>
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
