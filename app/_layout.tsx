import 'react-native-gesture-handler';
import { DarkTheme as NavDarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/app/context/auth-context';
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';

export const customPalette = {
  ...MD3DarkTheme,
  roundness: 1, // Brutalist sharp edges for a completely different aesthetic
  colors: {
    ...MD3DarkTheme.colors,
    background: '#09090b',     // Pure Obsidian Black
    surface: '#18181b',        // Dark Zinc
    surfaceVariant: '#27272a', // Zinc Borders
    primary: '#10b981',        // Vibrant Emerald Green for actions
    secondary: '#3b82f6',      // Blue accents
    onBackground: '#f8fafc',
    onSurface: '#f8fafc',
    error: '#ef4444',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <PaperProvider theme={customPalette}>
      <ThemeProvider value={NavDarkTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ presentation: 'card', title: 'उत्पादन विवरण' }} />
            <Stack.Screen name="category/[id]" options={{ presentation: 'card', title: 'वर्ग विवरण' }} />
            <Stack.Screen name="order/[id]" options={{ presentation: 'card', title: 'अर्डर विवरण' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthProvider>
        <StatusBar style="light" />
      </ThemeProvider>
    </PaperProvider>
  );
}
