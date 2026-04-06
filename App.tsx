import { AuthProvider } from '@/context/auth-context';
import { NotificationProvider } from '@/context/notification-context';
import { ThemeProvider, useThemeContext } from '@/context/theme-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { SafeAreaProvider } from 'react-native-safe-area-context';

const premiumColors = {
  primary: '#6366F1', // Indigo 500
  secondary: '#10B981', // Emerald 500
  tertiary: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
};

const darkTheme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    ...premiumColors,
    background: '#0B0F1A', // Deeper Dark
    surface: '#161B2A', // Slate 900-ish
    surfaceVariant: '#1F2937', // Slate 800-ish
    onSurface: '#F9FAFB', 
    onSurfaceVariant: '#9CA3AF',
    outline: '#374151',
    elevation: {
      level0: 'transparent',
      level1: '#161B2A',
      level2: '#1F2937',
      level3: '#374151',
      level4: '#4B5563',
      level5: '#6B7280',
    },
  },
};

const lightTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    ...premiumColors,
    primary: '#4F46E5', // Indigo 600 for light
    secondary: '#059669', // Emerald 600 for light
    background: '#F9FAFB', // Slate 50
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6', // Gray 100
    onSurface: '#111827', // Gray 900
    onSurfaceVariant: '#4B5563', // Gray 600
    outline: '#E5E7EB',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F9FAFB',
      level3: '#F3F4F6',
      level4: '#E5E7EB',
      level5: '#D1D5DB',
    },
  },
};

import { initI18n } from '@/i18n/i18n';

function MainApp() {
  const { isDark } = useThemeContext();
  const theme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navTheme}>
        <AuthProvider>
          <NotificationProvider>
            <StatusBar
              barStyle={isDark ? "light-content" : "dark-content"}
              backgroundColor={theme.colors.background}
            />
            <RootNavigator />
          </NotificationProvider>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = React.useState(false);

  React.useEffect(() => {
    initI18n().then(() => setIsI18nInitialized(true));
  }, []);

  if (!isI18nInitialized) {
    return null; // Or a very basic splash view
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
