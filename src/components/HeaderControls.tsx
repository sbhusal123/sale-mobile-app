import React from 'react';
import { View, StyleSheet } from 'react-native';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export default function HeaderControls() {
  return (
    <View style={styles.container}>
      <LanguageToggle />
      <View style={styles.separator} />
      <ThemeToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  separator: {
    width: 4,
  },
});
