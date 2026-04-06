import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  color?: string;
}

export default function BackButton({ onPress, label, color }: BackButtonProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const displayLabel = label || t('common.back');

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Icon
        name="chevron-left"
        size={30}
        color={color || theme.colors.primary}
      />
      <Text style={[styles.label, { color: color || theme.colors.primary }]}>
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: -4,
  },
});
