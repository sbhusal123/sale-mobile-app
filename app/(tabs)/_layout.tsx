import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurface,
        drawerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.onBackground,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'गृह',
          title: 'ड्यासबोर्ड',
          drawerIcon: ({ color }) => <MaterialCommunityIcons size={28} name="home" color={color} />,
        }}
      />
      <Drawer.Screen
        name="products"
        options={{
          drawerLabel: 'उत्पादनहरू',
          title: 'उत्पादनहरू',
          drawerIcon: ({ color }) => <MaterialCommunityIcons size={28} name="package-variant-closed" color={color} />,
        }}
      />
      <Drawer.Screen
        name="categories"
        options={{
          drawerLabel: 'वर्गहरू',
          title: 'वर्गहरू',
          drawerIcon: ({ color }) => <MaterialCommunityIcons size={28} name="view-grid" color={color} />,
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          drawerLabel: 'अर्डरहरू',
          title: 'अर्डरहरू',
          drawerIcon: ({ color }) => <MaterialCommunityIcons size={28} name="cart" color={color} />,
        }}
      />
      <Drawer.Screen
        name="account"
        options={{
          drawerLabel: 'खाता',
          title: 'खाता',
          drawerIcon: ({ color }) => <MaterialCommunityIcons size={28} name="account-circle" color={color} />,
        }}
      />
    </Drawer>
  );
}
