import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useThemeContext } from '../context/theme-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, onBack, onMenu }) => {
  const theme = useTheme();
  const { isDark, themeMode, setThemeMode } = useThemeContext();

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline }]}>
      <View style={styles.leftSection}>
        {showBack ? (
          <IconButton
            icon="chevron-left"
            size={28}
            iconColor={theme.colors.onSurface}
            onPress={onBack}
            style={styles.iconBtn}
          />
        ) : (
          <IconButton
            icon="menu"
            size={28}
            iconColor={theme.colors.onSurface}
            onPress={onMenu}
            style={styles.iconBtn}
          />
        )}
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>

      <IconButton
        icon={isDark ? 'weather-sunny' : 'weather-night'}
        size={24}
        iconColor={isDark ? theme.colors.primary : theme.colors.primary}
        onPress={toggleTheme}
        style={[styles.toggleBtn, { backgroundColor: theme.colors.surfaceVariant }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    elevation: 2,
    borderBottomWidth: 0.5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: -8,
    marginLeft: -8,
  },
  title: {
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  toggleBtn: {
    borderRadius: 14,
    marginVertical: 0,
    marginHorizontal: 0,
  },
});

export default AppHeader;
