import { AuthProvider } from '@/context/auth-context';
import { NotificationProvider } from '@/context/notification-context';
import { ThemeProvider, useThemeContext } from '@/context/theme-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

const blueColors = {
  primary: '#3B82F6', // Vibrant Blue
  secondary: '#10B981', // Emerald
  tertiary: '#64748B', // Slate
  error: '#FF5252',
};

const darkTheme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    ...blueColors,
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    onSurface: '#F8FAFC', // Slate 50
    onSurfaceVariant: '#94A3B8', // Slate 400
    outline: '#334155',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#5E6D82',
      level5: '#768599',
    },
  },
};

const lightTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    ...blueColors,
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9', // Slate 100
    onSurface: '#1E293B', // Slate 800
    onSurfaceVariant: '#64748B', // Slate 500
    outline: '#E2E8F0',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8FAFC',
      level3: '#F1F5F9',
      level4: '#E2E8F0',
      level5: '#CBD5E1',
    },
  },
};

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
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
