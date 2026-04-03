import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard
} from 'react-native';
import { Surface, Text, TextInput, Button, useTheme } from 'react-native-paper';

import { useAuth } from '@/app/context/auth-context';

export default function LoginScreen() {
  const { user, login } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const submit = () => {
    const success = login(email.trim(), password);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Surface style={[styles.iconSurface, { backgroundColor: theme.colors.surfaceVariant }]} elevation={4}>
              <Text style={{ fontSize: 48 }}>💼</Text>
            </Surface>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              फेरी स्वागत छ
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, opacity: 0.8, marginTop: 8 }}>
              आफ्नो बिक्री व्यवस्थापन गर्न साइन इन गर्नुहोस्
            </Text>
          </View>

          <Surface elevation={2} style={[styles.formSurface, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              mode="outlined"
              label="इमेल ठेगाना"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              mode="outlined"
              label="पासवर्ड"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
            />

            <Button 
              mode="contained" 
              onPress={submit} 
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonText}
            >
              साइन इन गर्नुहोस्
            </Button>
          </Surface>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
              खाता छैन?
            </Text>
            <Link href="/register" asChild>
              <Button mode="text" compact labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                दर्ता गर्नुहोस्
              </Button>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconSurface: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  formSurface: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});