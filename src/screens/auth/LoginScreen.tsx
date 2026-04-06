import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Button, Surface, Text, TextInput, useTheme, IconButton } from 'react-native-paper';
import { useAuth } from '../../context/auth-context';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderControls from '../../components/HeaderControls';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = MaterialCommunityIcons as any;

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    await login(email.trim(), password);
    setLoading(false);
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
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Surface style={[styles.iconSurface, { backgroundColor: theme.colors.primary + '15' }]} elevation={0}>
                <Icon name="rocket-launch" size={48} color={theme.colors.primary} />
              </Surface>
              <Text variant="displaySmall" style={[styles.title, { color: theme.colors.onSurface }]}>
                {t('auth.welcome_back')}
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                {t('auth.signin_to_manage')}
              </Text>
            </View>

            <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <View style={styles.inputGap}>
                <TextInput
                  mode="outlined"
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="admin@gmail.com"
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
                style={[styles.button, { marginTop: 24 }]}
                contentStyle={styles.buttonInner}
                labelStyle={styles.buttonLabel}
                loading={loading}
                disabled={loading}
                elevation={4}
              >
                {t('auth.login')}
              </Button>
            </Surface>

            <View style={styles.footer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}>
                {t('auth.no_account')}
              </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                labelStyle={{ color: theme.colors.primary, fontWeight: '900', fontSize: 16 }}
              >
                {t('auth.register')}
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
    marginBottom: 40,
  },
  iconSurface: {
    width: 100,
    height: 100,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-10deg' }],
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
  },
  input: {
    backgroundColor: 'transparent',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
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
