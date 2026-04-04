import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  color?: string;
}

export default function BackButton({ onPress, label = 'पछाडि (Back)', color }: BackButtonProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name="chevron-left" 
        size={30} 
        color={color || theme.colors.primary} 
      />
      <Text style={[styles.label, { color: color || theme.colors.primary }]}>
        {label}
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
