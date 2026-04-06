import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Surface, Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderControls from '../../components/HeaderControls';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = () => {
    register(name.trim(), email.trim(), password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={[styles.headerControls, { top: insets.top + 10 }]}>
          <HeaderControls />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 70 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Surface style={[styles.iconSurface, { backgroundColor: theme.colors.primary + '15' }]} elevation={0}>
                <Icon name="account-plus-outline" size={48} color={theme.colors.primary} />
              </Surface>
              <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                {t('auth.register_title')}
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {t('auth.start_business')}
              </Text>
            </View>

            <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <View style={styles.inputGap}>
                <TextInput
                  mode="outlined"
                  label={t('auth.full_name')}
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="John Doe"
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Icon icon="account-outline" color={theme.colors.primary} />}
                />

                <TextInput
                  mode="outlined"
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="john@example.com"
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                />

                <TextInput
                  mode="outlined"
                  label={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholder="••••••••"
                  outlineStyle={{ borderRadius: 18 }}
                  left={<TextInput.Icon icon="lock-outline" color={theme.colors.primary} />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? "eye-off-outline" : "eye-outline"} 
                      onPress={() => setShowPassword(!showPassword)} 
                      color={theme.colors.onSurfaceVariant}
                    />
                  }
                />
              </View>

              <Button 
                mode="contained" 
                onPress={submit} 
                style={styles.button}
                contentStyle={styles.buttonInner}
                labelStyle={styles.buttonLabel}
                elevation={4}
              >
                {t('auth.register')}
              </Button>
            </Surface>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                {t('auth.already_have_account')}
              </Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Login')}
                labelStyle={{ color: theme.colors.primary, fontWeight: '900', fontSize: 16 }}
              >
                {t('auth.login')}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  headerControls: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconSurface: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    transform: [{ rotate: '8deg' }],
  },
  title: {
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.8,
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
  },
  inputGap: {
    gap: 16,
    marginBottom: 28,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: 20,
  },
  buttonInner: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
});
