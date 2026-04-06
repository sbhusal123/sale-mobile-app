import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';

interface LanguageToggleProps {
  compact?: boolean;
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Button
        mode="text"
        onPress={() => changeLanguage('en')}
        style={[
          styles.button,
          i18n.language === 'en' && { backgroundColor: theme.colors.primary }
        ]}
        labelStyle={[
          styles.buttonLabel,
          { color: i18n.language === 'en' ? '#fff' : theme.colors.onSurfaceVariant }
        ]}
        compact
      >
        EN
      </Button>
      <Button
        mode="text"
        onPress={() => changeLanguage('ne')}
        style={[
          styles.button,
          i18n.language === 'ne' && { backgroundColor: theme.colors.primary }
        ]}
        labelStyle={[
          styles.buttonLabel,
          { color: i18n.language === 'ne' ? '#fff' : theme.colors.onSurfaceVariant }
        ]}
        compact
      >
        नेपाली
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    alignSelf: 'center',
  },
  button: {
    borderRadius: 10,
    minWidth: 60,
    height: 32,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginVertical: 0,
    marginHorizontal: 0,
  },
});
