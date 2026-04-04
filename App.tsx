import { AuthProvider } from '@/context/auth-context';
import { NotificationProvider } from '@/context/notification-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { DarkTheme as NavDarkTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';

export const customPalette = {
  ...MD3DarkTheme,
  roundness: 1,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#09090b',
    surface: '#18181b',
    surfaceVariant: '#27272a',
    primary: '#10b981',
    secondary: '#3b82f6',
    onBackground: '#f8fafc',
    onSurface: '#f8fafc',
    error: '#ef4444',
  },
};

export default function App() {
  return (
    <PaperProvider theme={customPalette}>
      <NavigationContainer theme={NavDarkTheme}>
        <AuthProvider>
          <NotificationProvider>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <RootNavigator />
          </NotificationProvider>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}
