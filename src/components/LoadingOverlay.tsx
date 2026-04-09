import React from 'react';
import { StyleSheet, View, ActivityIndicator, Modal } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  icon?: string;
};

export default function LoadingOverlay({ visible, message = 'लोड हुँदैछ...', icon }: LoadingOverlayProps) {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <Surface elevation={4} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {icon && (
            <Icon 
              name={icon} 
              size={48} 
              color={theme.colors.primary} 
              style={{ marginBottom: 16 }} 
            />
          )}
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="titleMedium" style={[styles.message, { color: theme.colors.onSurface }]}>
            {message}
          </Text>
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 180,
  },
  message: {
    marginTop: 16,
  },
});
