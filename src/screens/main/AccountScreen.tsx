import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { Config, useAuth } from '../../context/auth-context';

const Icon = MaterialCommunityIcons as any;

export default function AccountScreen() {
  const { t, i18n } = useTranslation();
  const { user, config, fetchConfig, updateConfig, logout } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Config>>(config || {});

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        setLoading(true);
        await fetchConfig();
        setLoading(false);
      };
      init();
    }, [])
  );

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateConfig(formData);
    setSaving(false);
    if (success) {
      Alert.alert(t('common.success'), t('account.settings_saved'));
    } else {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };


  const updateField = (field: keyof Config, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderShimmer = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Surface elevation={1} style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: 'transparent' }]}>
        <ShimmerPlaceholder width={72} height={72} borderRadius={24} />
        <View style={styles.profileInfo}>
          <ShimmerPlaceholder width={120} height={24} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width={180} height={16} />
        </View>
      </Surface>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.section}>
          <ShimmerPlaceholder width={100} height={20} style={{ marginBottom: 12, marginLeft: 4 }} />
          <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: 'transparent' }]}>
            <ShimmerPlaceholder width="100%" height={40} borderRadius={8} style={{ marginBottom: 16 }} />
            <ShimmerPlaceholder width="100%" height={40} borderRadius={8} />
          </Surface>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader
        title={t('account.title')}
        onMenu={() => navigation.openDrawer()}
        icon="account-circle"
      />

      {loading ? renderShimmer() : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Summary */}
            <Surface elevation={1} style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
              <View style={[styles.avatarBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Icon name="account" size={40} color={theme.colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text variant="titleLarge" style={[styles.userName, { color: theme.colors.onSurface }]}>{user?.name}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{user?.email}</Text>
              </View>
            </Surface>

            <Divider style={{ marginVertical: 8, backgroundColor: 'transparent' }} />

            {/* Application Settings */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>{t('account.app_settings')}</Text>
              <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <TextInput
                  label={t('account.google_api_key')}
                  value={formData?.google_api_key || ''}
                  onChangeText={(v) => updateField('google_api_key', v)}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label={t('account.domain')}
                  value={formData?.domain || ''}
                  onChangeText={(v) => updateField('domain', v)}
                  mode="outlined"
                  style={styles.input}
                />
              </Surface>
            </View>

            {/* Whatsapp Settings */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>{t('whatsapp_settings')}</Text>
              <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <TextInput
                  label={t('account.access_token')}
                  value={formData?.whatsapp_access_token || ''}
                  onChangeText={(v) => updateField('whatsapp_access_token', v)}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
                <TextInput
                  label={t('account.verify_token')}
                  value={formData?.whatsapp_verify_token || ''}
                  onChangeText={(v) => updateField('whatsapp_verify_token', v)}
                  mode="outlined"
                  style={styles.input}
                />
              </Surface>
            </View>

            {/* Model Settings */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>{t('account.model_settings')}</Text>
              <Surface elevation={1} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <TextInput
                  label={t('account.system_prompt')}
                  value={formData?.system_prompt || ''}
                  onChangeText={(v) => updateField('system_prompt', v)}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                />
                <TextInput
                  label={t('account.model_name')}
                  value={formData?.model_name || ''}
                  onChangeText={(v) => updateField('model_name', v)}
                  mode="outlined"
                  placeholder="e.g. gpt-4, gemini-pro"
                  style={styles.input}
                />
              </Surface>
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveBtn}
              loading={saving}
              disabled={saving}
              buttonColor={theme.colors.primary}
              textColor="#fff"
            >
              {t('account.save_settings')}
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={() => logout()}
              textColor={theme.colors.error}
              style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
              icon="logout"
            >
              {t('common.logout')}
            </Button>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <LoadingOverlay visible={saving} message={t('common.saving')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '900',
  },
  profileInfo: {
    gap: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '900',
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 4,
    elevation: 4,
  },
  divider: {
    marginVertical: 32,
    opacity: 0.5,
  },
  logoutBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 4,
  },
});
