import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView
} from 'react-native';
import { Surface, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    const success = register(name.trim(), email.trim(), password);
    // Success handling via useAuth in RootNavigator
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              नयाँ खाता बनाउनुहोस्
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, opacity: 0.8, marginTop: 8 }}>
              आजै आफ्नो व्यवसाय सुरु गर्नुहोस्
            </Text>
          </View>

          <Surface elevation={2} style={[styles.formSurface, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              mode="outlined"
              label="पूरा नाम"
              value={name}
              onChangeText={setName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

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
            >
              दर्ता गर्नुहोस्
            </Button>
          </Surface>

          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
              पहिले नै खाता छ?
            </Text>
            <Button 
              mode="text" 
              compact 
              onPress={() => navigation.navigate('Login')}
              labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
            >
              लगइन गर्नुहोस्
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
