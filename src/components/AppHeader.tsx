import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HeaderControls from './HeaderControls';

const Icon = MaterialCommunityIcons as any;

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
  icon?: string;
  onAdd?: () => void;
  addIcon?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack, onBack, onMenu, icon, onAdd, addIcon }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // If we have a specific icon and no back button, use it instead of the menu icon
  const leftIcon = showBack ? 'chevron-left' : (icon || 'menu-variant');

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
        <IconButton
          icon={leftIcon}
          size={28}
          iconColor={theme.colors.primary}
          onPress={showBack ? onBack : onMenu}
          style={styles.iconBtn}
        />
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {onAdd && (
          <IconButton
            icon={addIcon || 'plus'}
            size={24}
            iconColor={theme.colors.primary}
            onPress={onAdd}
            style={styles.actionBtn}
          />
        )}
        <HeaderControls />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 4,
  },
  controlsGroup: {
    marginRight: 8,
  },
  iconBtn: {
    margin: 0,
  },
  actionBtn: {
    margin: 0,
  },
  title: {
    fontWeight: '900',
    fontSize: 18,
    flex: 1,
    marginLeft: 4,
    letterSpacing: -0.5,
  },
});

export default AppHeader;
