import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useThemeContext } from '../context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
}

import HeaderControls from './HeaderControls';

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, onBack, onMenu }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface, 
        borderBottomColor: theme.colors.outline,
        paddingTop: insets.top,
      }
    ]}>
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
            icon="menu-variant"
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

      <View style={styles.rightSection}>
        <HeaderControls />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    elevation: 4,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  iconBtn: {
    margin: 0,
  },
  title: {
    fontWeight: '900',
    fontSize: 20,
    marginLeft: 4,
    letterSpacing: -0.5,
  },
});

export default AppHeader;
