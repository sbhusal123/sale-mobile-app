import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';

export default function ModalScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface elevation={2} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
          यो एक मोडल हो
        </Text>
        
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          गृह स्क्रिनमा जानुहोस्
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    gap: 24,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    width: '100%',
  },
});
