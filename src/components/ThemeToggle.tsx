import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useThemeContext } from '../context/theme-context';

export default function ThemeToggle() {
  const { isDark, setThemeMode } = useThemeContext();
  const theme = useTheme();

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <IconButton
      icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
      iconColor={theme.colors.primary}
      size={20}
      onPress={toggleTheme}
      style={[styles.button, { backgroundColor: theme.colors.surfaceVariant }]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    margin: 0,
    borderRadius: 12,
    width: 36,
    height: 36,
  },
});
