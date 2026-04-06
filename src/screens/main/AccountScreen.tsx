import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Surface, Text, TextInput, Button, useTheme, Divider, ActivityIndicator, Avatar } from 'react-native-paper';
import { useAuth, Config } from '../../context/auth-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import LoadingOverlay from '../../components/LoadingOverlay';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholder';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons as any;

export default function AccountScreen() {
  const { t } = useTranslation();
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
      <View style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
        <ShimmerPlaceholder width={80} height={80} borderRadius={24} />
        <View style={styles.profileInfo}>
          <ShimmerPlaceholder width={140} height={24} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width={200} height={16} />
        </View>
      </View>
      {[1, 2].map(i => (
        <View key={i} style={styles.section}>
          <ShimmerPlaceholder width={120} height={20} style={{ marginBottom: 12, marginLeft: 4 }} />
          <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
            <ShimmerPlaceholder width="100%" height={56} borderRadius={18} style={{ marginBottom: 16 }} />
            <ShimmerPlaceholder width="100%" height={56} borderRadius={18} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader 
        title={t('account.title')} 
        onMenu={() => navigation.openDrawer()} 
      />

      {loading ? renderShimmer() : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + insets.bottom }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Profile Header */}
          <Surface elevation={2} style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="account-tie" size={42} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onSurface }]}>
                {user?.name || 'User'}
              </Text>
              <View style={styles.emailRow}>
                <Icon name="email-outline" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </Surface>

          {/* App Configuration Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="cog-outline" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('account.app_settings')}
              </Text>
            </View>
            <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <TextInput
                label={t('account.google_api_key')}
                value={formData?.google_api_key || ''}
                onChangeText={(v) => updateField('google_api_key', v)}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="key-variant" color={theme.colors.primary} />}
              />
              <TextInput
                label={t('account.domain')}
                value={formData?.domain || ''}
                onChangeText={(v) => updateField('domain', v)}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="web" color={theme.colors.primary} />}
              />
            </Surface>
          </View>

          {/* WhatsApp Integration */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="whatsapp" size={20} color="#25D366" />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('whatsapp_settings') || 'WhatsApp Settings'}
              </Text>
            </View>
            <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <TextInput
                label={t('account.access_token')}
                value={formData?.whatsapp_access_token || ''}
                onChangeText={(v) => updateField('whatsapp_access_token', v)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={[styles.input, { minHeight: 100 }]}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="shield-check-outline" color={theme.colors.primary} />}
              />
              <TextInput
                label={t('account.verify_token')}
                value={formData?.whatsapp_verify_token || ''}
                onChangeText={(v) => updateField('whatsapp_verify_token', v)}
                mode="outlined"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="lock-check-outline" color={theme.colors.primary} />}
              />
            </Surface>
          </View>

          {/* AI Model Config */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="robot-outline" size={20} color={theme.colors.secondary} />
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('account.model_settings')}
              </Text>
            </View>
            <Surface elevation={2} style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1 }]}>
              <TextInput
                label={t('account.system_prompt')}
                value={formData?.system_prompt || ''}
                onChangeText={(v) => updateField('system_prompt', v)}
                mode="outlined"
                multiline
                numberOfLines={5}
                style={[styles.input, { minHeight: 140 }]}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="text-box-outline" color={theme.colors.primary} />}
              />
              <TextInput
                label={t('account.model_name')}
                value={formData?.model_name || ''}
                onChangeText={(v) => updateField('model_name', v)}
                mode="outlined"
                placeholder="e.g. gpt-4o, gemini-1.5-pro"
                style={styles.input}
                outlineStyle={{ borderRadius: 18 }}
                left={<TextInput.Icon icon="microchip" color={theme.colors.primary} />}
              />
            </Surface>
          </View>

          <Button 
            mode="contained" 
            onPress={handleSave} 
            style={styles.saveBtn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
            loading={saving}
            disabled={saving}
            elevation={4}
          >
            {t('account.save_settings')}
          </Button>

          <Divider style={styles.logoutDivider} />

          <Button 
            mode="outlined" 
            onPress={() => logout()} 
            textColor={theme.colors.error}
            style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
            contentStyle={styles.btnContent}
            labelStyle={[styles.btnLabel, { color: theme.colors.error }]}
            icon="logout-variant"
          >
            {t('common.logout')}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    )}

      <LoadingOverlay visible={saving} message={t('common.saving')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileCard: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 8,
    gap: 10,
  },
  sectionTitle: {
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 13,
    opacity: 0.7,
  },
  formCard: {
    padding: 24,
    borderRadius: 32,
    gap: 18,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveBtn: {
    borderRadius: 20,
    marginTop: 8,
  },
  logoutDivider: {
    marginVertical: 40,
    opacity: 0.3,
  },
  logoutBtn: {
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 40,
  },
  btnContent: {
    paddingVertical: 10,
  },
  btnLabel: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
